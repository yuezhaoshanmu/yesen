# YESEN Art Direction — 2026-09-22

## Reference research (live browser, before implementation)
- Lusion https://lusion.co : observed mobile hero and scroll; 3D objects retain depth as type exits. Oryzo AI project studied as an example of premium object storytelling. Translate to scroll-controlled geometry, not DOM reveal presets.
- Active Theory https://activetheory.net : single restrained metallic object in a deep field, minimal navigation; adopt technical visual causality, not its dark palette.
- Linear https://linear.app : large left-aligned type, disciplined horizontal rules and generous empty space before product. Adopt hierarchy and spacing, not dashboard components.
- Apple https://apple.com : a single product and one headline dominate each panel; foreground product overlaps giant typography. Adopt that scale and one-message rhythm.
- Vercel https://vercel.com : single engineering symbol and a clear three-part grid; limit utility UI to navigation and real system states.

## Five Awwwards cases actually opened
1. The Watch — https://www.awwwards.com/sites/the-watch ; live https://thewatch.60fps.fr/ . Silver watch in front of enormous black lettering, instrument arcs behind it. Learn physical evidence and depth. WebGL / Three.js.
2. Cynx — https://www.awwwards.com/sites/cynx-portfolio-2026 ; live https://cynx.io . Large central project, cropped neighbors, quiet metadata; study scroll gallery and cursor response. GSAP / GLSL.
3. XOX — https://www.awwwards.com/sites/xox ; live https://xox.makemepulse.com/ . Interaction makes a character respond; learn consequence-driven feedback, not decorative particles.
4. /zeroz — https://www.awwwards.com/sites/zeroz-brand-site ; live https://otsuka-air.jp/ . Product placed in a lit room, typography in front and behind, chapters unfold through WebGL. Learn scene changes with a consistent signature color.
5. Luca Nardi — https://www.awwwards.com/sites/luca-nardi-portfolio-2 ; live https://www.aboutluca.com/ . Case contains craft/vision/awards sequences, desktop and mobile references; live loader/entry observed, post-entry capture failed. No claim of having verified the whole animation.

## Baseline
Screenshots: qa/art-direction/before. Repeated pale card containers flatten authority; 10 navigation items compete; metadata below readable size; repeated 2-column formulas; little distinction between project scale and award scale; random global particles lack semantic purpose.

## Direction: A living technical museum
Paper + dark ink + deep emerald. 1520px content width, 12-column editorial grid, 64–72px navigation. Chinese is the visual lead. Neutral whitespace between three climaxes: rank, national authority, project systems.

## Six compositions (Figma board before app code)
- Hero: giant split Chinese name, real portrait in foreground, topological core behind; compact side notes; no metric card row.
- Honor index: four typographic levels, dated editorial ledger. Focus advances on scroll, full searchable source archive preserved.
- EDUSRC: emerald #24 (240px), horizontal ranking evidence at large scale, converging abstract network; no map.
- National: navy 国家, two physically layered source certificates; slow separation driven by scroll, ledger below.
- CVE: globe made solely of points/lines, oversized international heading and 8.7 instrument arc, four open security record rows.
- Projects: one case at a time, screenshot occupies most width, vertical metadata rail; full-stack flow is explanatory, not fabricated telemetry.

## Type and motion contract
Name 145–250px desktop / 116px mobile; giant words 120–200px; headings 48–72px; primary desktop body 18px; metadata 14px with smaller nonessential English annotations. Microsoft YaHei/Segoe UI locally; Noto Sans SC in Figma where YaHei is unavailable. #087F73 signature, #066B61 for small emerald text to meet contrast, #17202A ink, #F4F7F6 paper, #E5EFEE ice, #123F48 navy.
GSAP ScrollTrigger owns scroll transforms. Three.js owns a reusable WebGL field instantiated only near each of the four visual scenes with structural NODE, directed PACKET, sparse AMBIENT. DPR <=1.5, lower mobile vertex count, reduced-motion static presentation, pause offscreen/hidden/modal. No artificial loading gate. Native scroll for immediate response.

## Truthfulness
Dates and scores come from data/achievements.ts. CNNVD submission proof is not relabeled as published acceptance. Ranking stays May 2026. Project stack is not supplied; do not invent per-project frameworks. Database/realtime/online status must reflect real connection state. Local mock QA must be labeled and isolated.

## Delivered Figma board
https://www.figma.com/design/IY8bksuOkUuQocXBpSY23g
Six 1440×900 compositions, shared paper/ink/emerald/ice/navy variables, original portrait and evidence imagery. Design contexts read before implementation. The board defines composition; responsive layout and live geometry are implemented in the app.

## Reference comparison after implementation
| Reference ability | Applied decision | Deliberate scope |
|---|---|---|
| Lusion: scroll controls a scene | Google object approaches; national originals separate; background changes from ice to paper; topology scale follows section progress | Native scroll with GSAP scrub, no delayed scroll input |
| Active Theory: realtime spatial craft | Custom Three.js geometry, explicit nodes/routes/packets, pointer depth, viewport-aware rendering | No particle preset or full-page random cloud |
| Linear: hierarchy and precision | Five primary navigation links, 1520px grid, open ruled ledgers, readable dark ink | No dashboard statistic-card grid |
| Apple: one visual focus | #24, 国家, 国际, 一等奖 each own a scene; enlarged original evidence | Mobile moves evidence below its one headline |
| Vercel: engineering as visual language | Scroll-driven full-stack path, actual subscription/database statuses | LIVE in the project flow is a delivery illustration, not telemetry |
| The Watch / zeroz | Physical layering, evidence shadows, foreground/background type | Original certificates retained without altered content |
| Cynx / XOX / Luca Nardi | Large case presentation, causal feedback, quiet archive intervals | Luca live post-entry animation was not verified |

## Two visual iteration rounds
1. `qa/art-direction/round-1`: 1440×900 and 390×844, all 11 sections plus all 3 projects. Found a retired CSS stacking rule placing the EDUSRC visual in document flow, an orphaned mobile headline, and project screens arriving too late. Fixed layer ownership, mobile headline, product-first order, and separate aggregation/topology geometry. Removed duplicate touch effects.
2. `qa/art-direction/round-2`: 1920×1080, 1440×900, 1366×768, 390×844, 430×932, 70 screenshots. Reviewed key scenes individually and cross-size contact sheets. Added short-desktop composition sizing, resized the Google exhibit to the viewport, and corrected small emerald text contrast.
3. `qa/art-direction/final`: production recapture of the same five sizes and 14 views each. Full-size screenshots and a contact sheet are retained per viewport.

## Verification and limits
- `npm run build`: passed (Next.js production build; isolated output directory to preserve the running dev server). Home first-load JS: 267 kB as reported by Next. Three.js is a separate lazy import.
- `npm run lint`, `npm run typecheck`, `npm run check:data`: passed.
- Achievement tests: 4 passed. Guestbook tests: 12 passed, including local PostgreSQL migration/RLS/RPC behavior.
- Browser checks: menu/Escape, certificate zoom/close/focus, archive search/empty results, scroll-driven separation, mobile navigation, reduced motion, synthetic acknowledged-write packet. No public test message was submitted.
- Automated accessibility scan: zero axe violations on the tested main page state. This is not an exhaustive accessibility certification.
- Local headless Edge WebGL samples: desktop 59.4 / 60.0 / 59.6 FPS (Hero / EDUSRC / CVE); mobile viewport with DPR 3 and 4× CPU slowdown 59.0 / 60.2 / 58.2 FPS. Mobile drawing DPR capped at 1.25. Offscreen, document-hidden and reduced-motion pause checks passed. These are local samples, not a physical-device guarantee.
- Current environment limitation: server-side Supabase requests fail with `ECONNRESET`, while the browser's realtime channel connects. GET `/api/guestbook/stats` returns 503. The UI reports Database Unavailable, keeps the independent realtime status, and disables submission. End-to-end public write/broadcast could not be verified; it is not claimed as working.

## Reproduce visual QA
Run the app, then `node qa/art-direction/capture.cjs review --all` (defaults to port 3000). Set `QA_BASE_URL` for another port. `functional.cjs` checks interaction and accessibility; `performance.cjs` defaults to the production preview on port 3015.
