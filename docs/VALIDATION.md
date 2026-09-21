# 最终验证记录

验证对象：本地 Next.js 生产构建，http://localhost:3000 。Lighthouse 为模拟环境分数，实际部署后的域名、网络与设备会影响结果。

| 检查 | 结果 |
| --- | --- |
| npm run build | 通过；首页静态生成；首载 JS 约 120 kB |
| npm run lint | 通过，0 错误、0 警告 |
| npm run check:data | 17 条证据资源、原件 SHA-256、6 个验证链接、3 个项目资源、时间线关联全部通过 |
| 桌面 Lighthouse | Performance 100 / Accessibility 100 / Best Practices 100 / SEO 100 |
| 移动 Lighthouse | Performance 98 / Accessibility 100 / Best Practices 100 / SEO 100 |
| 桌面 LCP / TBT / CLS | 0.5 s / 0 ms / 0 |
| 移动 LCP / TBT / CLS | 2.2 s / 80 ms / 0.001 |
| axe WCAG A/AA | 1440 与 390 宽度的正文及证据弹窗均为 0 条问题 |
| JavaScript 页面异常 | 未发现 |

浏览器检查覆盖 1440×1000、1920×1080、2560×1440、820×1180、390×844、360×800。所有尺寸无横向溢出。视觉复核覆盖 12 个叙事章节、证据查看器及分享图。

交互核验包括证据打开、关闭、原生 modal、Tab/Shift+Tab 焦点循环、关闭后恢复触发按钮焦点、左右键切换、放大/缩小/重置、分类筛选、编号搜索、空结果恢复、移动菜单、真实外链及 noreferrer/noopener 属性、减少动态效果偏好。

一次增强键盘检查发现原生 dialog 在 Shift+Tab 边界可能将焦点交还浏览器，现已增加显式边界循环并修正原触发按钮的引用，复测通过。

审计报告与截图保存在忽略提交的 qa/ 目录；可使用 scripts/visual-qa.cjs、scripts/accessibility-qa.cjs、scripts/lighthouse-qa.mjs 复现。当前脚本默认使用本机 Edge 无头浏览器。

事实限制：成绩单、137 小时志愿服务记录、CVE 署名与实名关联及项目职责/技术栈仍待补充；网站已有对应说明。未将课程认证写成学位、国家平台成果写成竞赛一等奖，或将未收到的证书订单写成已获得荣誉。
