# Visitor Wall 部署与运维

项目从纯展示页面升级为 Next.js API + Supabase PostgreSQL / Auth / Realtime 应用。首页 `/#guestbook`；管理后台 `/admin/guestbook`，不出现在公共导航中。没有凭据时服务返回 503，页面真实显示离线，不生成模拟留言或统计。

## 连接数据库

1. 将 `.env.example` 复制为 `.env.local`，填写 Supabase URL、anon key、service role key。
2. 生成 `GUESTBOOK_HASH_SECRET`（至少 32 字符）：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`。用于签名 HttpOnly 访客 cookie 和不可逆的 IP/访客标识；不要在运行期间频繁更换。
3. 在 Supabase Auth 控制台创建管理员，填写其 UUID 到 `SUPABASE_ADMIN_USER_IDS`。可用逗号分隔多个 UUID。建议关闭公开注册；即使允许注册，未进入服务器白名单的账户也无法管理。
4. 安装/使用 Supabase CLI：`npx supabase login`，`npx supabase link --project-ref YOUR_PROJECT_REF`，`npx supabase db push`。项目已提供 `supabase/config.toml` 和完整迁移。没有 CLI 时，在 SQL Editor 一次执行 `supabase/migrations/202609210001_guestbook.sql`。迁移无 seed 数据。
5. Realtime publication 已由 migration 加入 messages 和 events。Supabase Realtime 必须启用，允许公共 channel（公开的 Presence + Postgres Changes，内容读取仍受 RLS 限制）。
6. 设置生产 `APP_ORIGIN` 为完整 HTTPS 域名（不带尾部斜杠）；本机可留空，默认以请求 URL origin 验证。配置公开变量后需要重新 `npm run build`。
7. `npm run dev` 或 `npm run build` 后 `npm start`。两个浏览器打开首页验证实时同步。

也可安装 Docker Desktop 后运行 `npx supabase start`、`npx supabase db reset` 启动独立本地 Supabase。不要对已有生产库使用 reset。

## 代理与防刷

`GUESTBOOK_TRUSTED_IP_HEADER` 只接受部署代理覆盖的单一 IP 地址。Vercel 使用 `x-real-ip`；Cloudflare 可使用 `cf-connecting-ip`，前提是源站仅接受 Cloudflare 请求。自行部署时让反向代理覆盖这个 header，并禁止绕过代理直连。应用不会盲目信任任意 `X-Forwarded-For`。未配置时使用站点共享安全桶（整个网站 3 条/分钟），上线前应配置真实可信代理。

留言按网络与签名访客 cookie 双重限流，60 秒最多 3 条，前端另有 20 秒 cooldown。点赞每 IP 每分钟 30 次；管理员登录每 IP 每 5 分钟 5 次。数据库的冲突更新为限流桶加锁，多实例共享限制，不依赖进程内 Map。相同网络的多人可能共享额度，这是无需额外服务的基础风控取舍；不替代针对分布式攻击的 WAF。

同一请求 ID 的重试采用事务 advisory lock，最多创建一条留言。重试记录保留 7 天；该时段内相同 key 返回原结果。点赞 `(message_id, visitor_hash)` 唯一约束 + 原子 `likes_count + 1`，客户端 localStorage 仅用于体验，无法决定数据库权限。清除 cookie 会成为新访客；IP 限流仍适用。访客身份不用于证明真实自然人。

## 接口

统一响应 `{ success, message, data }`，错误不会包含数据库内部信息。所有响应 no-store。写接口校验 Origin；登录 session 使用 HttpOnly、SameSite cookie（生产 Secure）。

| 接口 | 作用 |
| --- | --- |
| GET /api/guestbook?cursor=… | 可见留言，每页 20，三字段稳定游标 |
| GET /api/guestbook?ids=UUID,… | 断线后的可见性核对，最多 200 个 ID |
| POST /api/guestbook | nickname、content、requestId（UUID） |
| GET /api/guestbook/stats | 数据库聚合的公开统计 |
| POST /api/guestbook/:id/like | 原子点赞、服务端去重 |
| POST /api/admin/session | 邮箱、密码登录，服务端白名单校验 |
| GET /api/admin/session | getUser 验证当前身份 |
| DELETE /api/admin/session | 退出登录 |
| GET /api/admin/guestbook | 所有状态留言、搜索、状态筛选、游标分页、后台统计 |
| PATCH /api/admin/guestbook/:id | visibility / pin / reply，严格 Zod discriminated union |
| DELETE /api/admin/guestbook/:id | 永久删除 |

昵称 1–20 Unicode 码点；留言 1–300；站长回复 1–600。自动 trim，拒绝 HTML、脚本 URL 与异常控制字符。正文最多 4096 字节（回复接口 8192），流式读取实际字节数，不能用缺失/伪造 Content-Length 绕过。全部纯文本渲染，查询采用参数化 API / RPC。

## 权限与实时一致性

五张表均启用 RLS。anon / authenticated 只有可见 messages 与无内容 events 的 SELECT；没有 INSERT、UPDATE、DELETE。所有业务 RPC 从 PUBLIC、anon、authenticated 撤销 EXECUTE，仅 service_role 可以调用。私有限流、点赞和幂等记录完全不公开。service role 模块使用 `server-only`，只被服务器路由导入。

管理员 API 每次使用 Supabase `auth.getUser()` 在线验证 cookie，然后检查服务器 UUID allowlist。搜索、统计也需要认证；没有仅靠前端隐藏按钮的权限设计。管理员不使用浏览器服务密钥，也不开放客户端更新策略。

公开 messages INSERT / UPDATE 用 Postgres Changes 同步。隐藏的 UPDATE 无法通过 RLS 到达公开订阅者，因此数据库 trigger 另写 **仅含留言 ID、事件 ID、时间** 的 tombstone 事件；隐藏和删除即时从其他设备移除。默认 replica identity，避免 old row 泄漏正文。恢复、置顶、回复和点赞走可见 UPDATE；按 UUID 去重、按 updated_at 拒绝旧版本覆盖。正常 POST 不重新请求列表，等待 INSERT 事件；4 秒后仍缺失才读取该 ID 补偿。

连接订阅成功、标签页恢复和每 60 秒会核对已加载 ID（每批 100）并补取最新页。重新连接后不会清空已加载列表。实时置顶/取消置顶会移动游标边界，可能在后续页重复出现，客户端去重；最新页核对补偿置顶变化。在线人数是公共墙 channel 中的连接数（每个标签页一个会话），不是去重自然人数，也不是数据库记录。Presence 是短暂状态，突然断网需等待心跳超时才能移除。匿名 Presence 属公开协作信号，不能作为安全或审计计数。

公开统计只计可见留言及其点赞，后台统计包含隐藏留言。永久删除不再计数。今日和近七天统一为 Asia/Shanghai；显示完整时间包含 UTC+8。统计使用数据库聚合，客户端不下载所有留言计数。

## 清理与部署

在 Supabase SQL Editor 使用项目已有调度系统每天执行 `select public.guestbook_cleanup();`，或启用 Supabase Cron 后创建每天的这个 SQL 任务。函数清理超过 1 天的限流桶和 tombstone，及超过 7 天的幂等记录，不删除留言和点赞。调度需具有该函数执行权限；不用额外开放公开清理接口。

部署需要 Next.js Node.js runtime（不是静态 export）。环境变量放在托管平台的 Secret 设置中，不提交 `.env.local`，不把 service role 或 hash secret 命名为 NEXT_PUBLIC_*。同源 API + HTTPS；建议部署平台启用 WAF / 请求大小与超时限制。服务不可用不会影响作品集其他区域。

## 验证

- `npm run test:guestbook`：实际执行迁移的嵌入式 PostgreSQL 测试，检查 RLS/权限、分页、限流、幂等、点赞和 tombstone；以及输入/事件合并测试。
- `npm run test:guestbook:http`：运行中的网站 API 边界与离线 UI 检查，默认 localhost:3000。
- `npm run test:guestbook:ui`：未配置项目时验证真实离线 UI、360/390/820/1440 响应式、弹窗焦点、axe 无障碍；另外仅在测试浏览器拦截响应注入视觉 fixture，检查有留言时的排版和纯文本渲染。这些 fixture 不进入数据库或产品，不能证明 Realtime 可用。
- `npm run test:guestbook:live`：连接真实 Supabase 的双浏览器流程，需 `.env.local`、管理员测试邮箱密码 `GUESTBOOK_TEST_ADMIN_EMAIL` / `GUESTBOOK_TEST_ADMIN_PASSWORD`，以及 `GUESTBOOK_E2E_ALLOW_WRITES=1`；创建并最终清理唯一测试留言。不在生产繁忙时运行，建议独立测试项目。
- `npm run typecheck`、`npm run lint`、`npm run build`。

真实双浏览器脚本会验证 A 提交 → B 无刷新收到 → B 点赞 → A 更新 → 管理员回复 → A/B 收到 → 隐藏 → A/B 移除 → 恢复 → A/B 再现 → 删除。未配置真实项目时明确跳过，不能把数据库逻辑测试或前端测试当成 Supabase WebSocket 验收。

## 本次本地验收记录（2026-09-21）

- 生产 `npm run build`、TypeScript、ESLint 均通过。
- 嵌入式 PostgreSQL + 输入/事件合并测试：12 项通过。嵌入式 PostgreSQL 会串行调度查询；测试验证唯一约束、原子 SQL 和最终计数，不等同于跨进程并发压力测试。
- 实际运行 Next.js 生产服务器的 HTTP 测试：13 项通过，涵盖验证、413/415、Origin、未登录管理接口及作品集可访问性。
- 浏览器布局、焦点、无障碍与纯文本测试通过；截图位于被 gitignore 排除的 `qa/guestbook/`，`fixture-*` 文件为测试输入的视觉检查。
- `npm audit` 零漏洞；修复原有 PostCSS 依赖漏洞。客户端产物中未发现服务角色变量或 hash secret 引用；留言组件没有 HTML 注入渲染。
- 原有作品集 `check:data` 通过：17 份证据条目、原件哈希、预览与链接。
- **尚未完成：远端 migration 应用、真实 Supabase Auth / Presence / Postgres Changes 双客户端联调。** 工作区没有 Supabase 凭据或已启动的 Docker Supabase，live 脚本明确报告 SKIPPED。提供环境配置并应用迁移后执行真实联调脚本。
