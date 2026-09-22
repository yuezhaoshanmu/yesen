# ART DIRECTION V2 / MOTION DIRECTION V2

本轮保留现有明亮视觉、成果事实和原件链路，把章节改为有明确主动作的场景。没有接入 Lenis：当前项目原本使用原生滚动，继续保留原生输入响应。

## 构图先行

当前会话没有可调用的 Figma 接口。编码前制作并浏览器渲染了六张 1440×900 构图稿：Hero、EDUSRC、国家、国际、99.34、Full Stack。文件：`qa/direction-v2/boards.html`，总览：`qa/direction-v2/board-contact.png`。这些是本地构图稿，不声称已创建或更新 Figma 文件。

## 场景语言

| 场景 | 唯一主要动作 | 节奏 |
| --- | --- | --- |
| Hero | 900ms 网格 → 轨道 → 人物 → 姓名启动；无操作遮挡 | 高潮 |
| Honor Index | 四类档案在同一 sticky 舞台滚动翻页；分类链接支持直接选择 | 安静 |
| Google | 700ms 纸张从 rotateX(2deg) / rotateY(-2deg) 回正，滚动位差 ±5px | 安静 |
| EDUSRC | 850ms 确定性节点汇聚成 24 后停止；原榜单行 300ms 扫描一次 | 高潮 |
| 国家 | 拓扑渐次连向 CNNVD/CNVD，双原件各沿滚动分离 24px | 庄重高潮 |
| 国际 | Three.js 透视相机、三层深度节点、距离雾化、90秒一圈的抽象网络；评分弧 500ms | 高潮 |
| 睿抗 | 金线 → 一等奖 → 证书上浮，总计 700ms | 中高潮 |
| 其他档案 | 不等宽、不等高的编辑式档案；137h 独立社会责任区 | 安静 |
| 学业 | 99.34 直接呈现，10 个满分节点 600ms 点亮 | 高潮 |
| Full Stack | 单数据包沿实际 SVG 路径 1600ms 抵达 LIVE，节点保留 active | 高潮 |
| Projects | 三个项目在同一 sticky 舞台切换，真实桌面＋手机页面分层 | 沉浸 |
| Realtime | 成功提交或订阅事件触发 800ms SVG 路径反馈 | 技术展示 |
| Ending | 安静排版收尾 | 安静 |

统一控制器：`components/atelier/SceneMotion.tsx`。静态 SSR 内容默认可见，增强模式才把档案和项目变为固定舞台。隐藏面板设为 inert 并从可访问性树中移除，分类/项目链接保持可操作。减少动态效果偏好变化会恢复全部内容的普通文档流。原件弹窗、详情和外部验证未重写。

WebGL 网络：`components/atelier/DigitalField.tsx`。Hero 只有五个轨道节点、三个固定轨道及间歇数据包；CVE 使用确定性近邻图，不使用地球贴图或预制 wireframe。节点透明度 Hero ≤0.2，EDUSRC ≤0.2，国家 ≤0.15，CVE ≤0.35。不存在随机背景粒子。离屏、隐藏页面、打开原件弹窗时暂停渲染；EDUSRC 和国家动画完成后停止循环；手机绘制 DPR ≤1.25。

## 内容与功能边界

- `data/` 和证书原件内容没有修改；`check:data` 核验所有原件哈希、预览与官方链接。
- 不确定 100 的原始字段含义，因此删除额外的 `100 RANK` 装饰标注；原截图完全保留，第 24 名无歧义。
- 17 门课程、10 门满分来自本次用户明确提供的信息；99.34 和 137h 继续使用现有 profile 数据并保留本人提供说明。
- 时间和 CVE 评分仍取现有数据，未套用需求中的示例日期。国家时间轴按各原始记录的实际月份降序切换。
- 三个外部项目仅进行只读页面截图，未登录或发送内容。桌面和移动端六张 WebP 位于 `public/projects/`，来源记录在 `qa/direction-v2/project-captures.json`。
- 留言 API、Supabase 订阅、去重、限流、回补流程保留。仅改变面向访客的状态文案与事件驱动的展示层。发送动画不会触发实际请求。

## 两轮视觉迭代

1. `qa/direction-v2/round-1/`：1920×1080、1440×900、1366×768、390×844，共 83 张场景/切换截图。检查接缝、唯一焦点、证书尺度和手机顺序。发现并修正学业/全栈容器边距不一致、CVE 仪表底色偏黄、手机档案沿用旧网格布局的问题。
2. `qa/direction-v2/round-2/`：同四种尺寸、83 张生产截图。逐项复核之后进一步减少 CVE 图的连线密度，加入距离衰减及圆形节点；修复国家档案被整体透明度削弱的文字对比度；修复实时连接状态变化打断数据包动画的问题。
3. `qa/direction-v2/final/`：最终生产构建重新截图，增加安全研究档案、固定年份时间轴、社会责任区视图；共 95 张截图，每个尺寸保留单屏和 contact.png 总览；最终细校另修正手机社会荣誉标题孤字，并将国家时间轴按实际日期降序排列。

## 验证

- Next.js production build、TypeScript、ESLint 通过。主页 First Load JS 269 kB，Three.js 按需加载。
- 4 项成果数据测试、12 项留言数据库/业务测试通过。
- `qa/direction-v2/functional-results.json`：四级档案/三个项目切换、隐藏面板焦点、原件放大和关闭/焦点返回、档案搜索、证书滚动分离、月份切换、有限动画停机、管线不重播、移动端原件点击、项目 CTA 不被裁切、减少动态效果静态回退。
- axe 扫描修复后为零违规（限本次扫描状态，不代表全面可访问性认证）。
- `qa/direction-v2/submission-results.json`：浏览器层拦截提交请求，验证成功回调、沿线移动、800ms 收尾、目标消息回补和发送冷却。没有向公开留言墙提交测试消息。
- 当前环境服务器端留言 API 返回 503，而浏览器 Realtime 订阅可以连接。因此本轮不声称已验证公开数据库写入和跨客户端广播；UI 如实展示独立连接状态，服务不可用时仍禁用发送。
- 性能采样为本机 headless Edge；手机只模拟视口、DPR 3 和 4 倍 CPU 减速，不代表真实手机。

复现：启动网站后设置 `QA_BASE_URL`，运行 `node qa/direction-v2/capture.cjs review`、`node qa/direction-v2/functional.cjs`、`node qa/direction-v2/performance.cjs`。本地提交隔离测试为 `node qa/direction-v2/submission.cjs`，默认使用 3020 开发预览。
