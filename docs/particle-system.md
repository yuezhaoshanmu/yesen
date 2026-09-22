# Digital Network

The light exhibition uses a single viewport-sized Canvas 2D, without WebGL or an additional runtime dependency. `GlobalParticleField` owns one animation clock, a deterministic node pool and a shared visible-screen budget. `SectionParticleEffect` supplies layout anchors, not separate canvases. Canvas coordinates follow the actual DOM layout; ResizeObserver and passive scroll listeners invalidate measurements.

## Visual meaning

| Section | Behavior |
| --- | --- |
| Hero | Low-opacity infrastructure graph; 150px mouse influence, at most 5px displacement; outer silhouette nodes leave the portrait and copy clear. |
| EDUSRC | Nodes converge around 24 once, then settle into a slowly moving network. Re-entering the viewport does not restart convergence. |
| CNNVD / CNVD | Layered, connected security topology forms before the title reaches full emphasis. |
| CVE | Fibonacci sphere projected in Canvas 2D; depth controls opacity and size. Link distance adapts when the node budget shrinks. |
| Google | Four brand points outside the certificate mount. |
| Projects | Frontend → Backend → Database → Deployment communication diagram, explicitly marked as an engineering illustration. |
| Guestbook | Only a new visible Supabase `INSERT` emits a delivery event. Reconciliation, duplicate inserts and like/reply updates do not. Presence growth emits a separate small node feedback. |
| Architecture dialog | Browser → Next.js → API → Supabase → Realtime → Connected Clients; outbound and return packets illustrate communication, not measured traffic. |

## Budgets and lifecycle

- Desktop: 96 nodes / 30fps; tablet: 60 / 30fps; phone: 36 / 24fps; low-resource device: 24 / 18fps.
- `hardwareConcurrency <= 4`, reported memory <= 4GB, or data-saver mode select the low tier. DPR is capped at 1.5, or 1 on the low tier.
- After 90 rendered frames, sustained render cost above 7ms or frequent missed frame targets permanently lowers the tier for the mounted session. This is a heuristic, not a guarantee about physical battery temperature or every mobile browser.
- Spatial buckets limit network neighbor comparisons. Global backgrounds and section effects share the node budget, including during section transitions.
- Packets are intermittent. Realtime feedback allows at most three simultaneous delivery/edge packets; tap feedback has a bounded, short-lived DOM pool.
- Only visible section anchors are drawn. Hidden documents and open dialogs stop the background RAF and clear the Canvas. Diagram CSS animations pause out of view and in hidden documents.
- Reduced motion draws a static frame only when geometry changes, disables interaction bursts and CSS packet motion, and responds to live OS preference changes.
- Touch feedback requires a primary-pointer tap with less than 10px movement and no scroll; swipe scrolling cannot emit ripples or portrait bursts. Links are never prevented or delayed.
- Canvas and feedback overlays have `pointer-events: none`; editorial content is above the background Canvas. Evidence uses the browser dialog top layer. Text and portrait regions are additionally clipped out of the Hero/aggregation field.

## Verification

```sh
npm run build
npm run lint
npm run test:particles
npm run test:guestbook
npm run test:achievements
```

Run the built app on port 3012, then:

```sh
npm run start -- --port 3012
npm run test:particles:ui
npm run test:particles:realtime
npm run test:particles:performance
```

`QA_BASE_URL` overrides the UI test URL. UI checks cover 1440/820/390/320px viewports, chapter preservation, touch, no horizontal overflow, once-only convergence, dialog suspension, reduced-motion changes and low-end DPR. Screenshots are written to ignored `qa/particles/`.

Realtime QA intercepts the Supabase WebSocket protocol and API reads in Playwright. It exercises the actual subscription callbacks and React commit-to-packet path without writing test content to a remote guestbook. Public Supabase client configuration must be present for this fixture. Physical-device battery and thermal testing remains separate from browser emulation.

Production Edge measurements on this workstation: approximately 30 rendered Canvas frames/s on desktop, and 20 frames/s at 390px with 4× CPU slowdown. Total main-thread task time was 98–101ms/s on desktop and 140–171ms/s in the throttled sample (whole page, not Canvas-only). Hidden-document suspension and automatic fallback to 24 nodes under sustained injected drawing load were verified.

Local environment: the missing `GUESTBOOK_HASH_SECRET` was generated in ignored `.env.local`. Direct Node requests to Supabase currently fail with `ECONNRESET`; an isolated read-only connection probe through the existing Windows proxy succeeded. Automatic approval blocked starting the preview with that proxy configuration, returning only `blocked by policy`. The preview therefore runs normally without proxy overrides, and its real guestbook API still returns 503. The Realtime integration was verified with the isolated wire fixture; a real end-to-end write was not performed. Do not commit local secrets or a workstation proxy address.
