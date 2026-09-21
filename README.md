# YESEN 数字荣誉展厅

叶森的个人技术成果与荣誉档案。基于原始证书与截图构建，面向国家奖学金评审的清晰阅读与材料核对体验。

## 本地运行

需要 Node.js 20.9 或更高版本。

```sh
npm install
npm run dev
```

访问 http://localhost:3000 。生产验证：

```sh
npm run check:data
npm run lint
npm run build
npm start
```

## 架构

- Next.js 15 App Router、React 19、TypeScript、Lucide。
- 主体成果内容服务端静态生成；证据弹窗按需加载。公开浏览无需登录；留言墙使用 Supabase 数据库，管理工作台需登录。
- Google 优先的浅色展览，CSS 动效与 IntersectionObserver 滚动揭示，避免引入重型 3D 与滚动库。
- 系统本地字体、WebP 缩略图、Next Image、减少动态效果支持。
- 原件永不裁切或修改；证书缩略图与高清预览完整显示，照片只校正阅读方向。
- 原生 dialog 提供焦点约束与 Escape 退出；左右方向键切换；图片支持双指缩放及放大后拖动，移动端提供全屏查看器。

## 内容维护

- `data/profile.ts`：基本信息与未核实指标。
- `data/google-certification.ts`：依据原始 Google 证书核对的九门课程。
- `app/exhibition.css`：浅色展览主题、核心成果视觉与响应式布局。
- `data/achievements.ts`：成果编排、统计及时间线。
- `data/projects.ts`：项目真实网址与来源说明；未知技术栈保持为空。
- `data/evidence.ts`：所有成果的来源、机构、日期、编号、证据状态和验证链接。
- `data/assets.json`：证据资源路径、尺寸及原件 SHA-256。
- `docs/MATERIALS_AUDIT.md`：识别清单、事实边界与待补材料。
- `public/evidence/`：轻量缩略图与高清预览；`originals/` 为未经修改的原件。

新增证明时，保留原件、生成完整预览与缩略图，将准确字段及来源添加到证据表。统计由数据派生，不应把待补材料计为获奖成果。

## 待补材料

99.34 的成绩单/统计学年，137 小时的服务记录，CVE 署名 Missa 与本人实名关联，以及项目职责和技术栈。界面已明确这些事实边界。CNNVD 按文件标题显示“提交证明”；EDUSRC 限定为 2026 年 5 月月榜；“挑战杯”限定为校级决赛。

## 发布

可部署到支持 Next.js 的 Node.js 平台。发布前在环境变量设置 `NEXT_PUBLIC_SITE_URL` 为最终域名，以生成绝对分享图片 URL。默认不伪造个人域名。分享图为 `/og-image.jpg`。未配置域名时本地预览正常。

当前工作不包含购买域名或发布到外部平台。
# 实时留言墙

已新增 Supabase 留言墙、Next.js 服务端 API、数据库 RLS、Presence 在线人数及 `/admin/guestbook` 管理工作台。环境变量、数据库迁移、权限设计和真实双客户端验收方法见 [部署文档](docs/GUESTBOOK.md)。未配置数据库时显示真实离线状态，作品集保持可访问。

## 移动端阅读验收

`node scripts/reading-ui-qa.cjs` 检查 390 / 360 / 412 / 1440px 布局、触摸缩放、44px 触摸目标、动画单次播放及减少动态效果。通过 `QA_BASE_URL` 指定测试地址，默认 http://localhost:3011。

本地开发服务运行期间，可用独立目录验证生产构建，避免争用缓存（PowerShell）：

```powershell
$env:NEXT_BUILD_DIR='.next-production'
npm run build
npm run start -- --port 3011
```
