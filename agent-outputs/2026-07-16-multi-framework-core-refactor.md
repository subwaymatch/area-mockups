# Multi-framework restructure: @area-mockups/core + React binding

**Date:** 2026-07-16
**Scope:** whole repo — new `packages/core`, `packages/area-mockups` → `packages/react`, docs

## Goal

Restructure the repository so support for other frameworks (Svelte, Vue) can be added
later without forking the library per framework — the headless-core pattern used by
multi-framework libraries: one framework-agnostic core, thin per-framework bindings.

## What changed

### New `packages/core` → `@area-mockups/core`

Framework-agnostic; depends on `three` only:

- **Specs moved verbatim** (git-mv, history preserved): all 30 `dimensions.ts` device
  and object spec modules, plus `roundedRectShape` (now `src/geometry/rounded-rect.ts`).
- **Screen behaviors extracted** from `device-screen.tsx` (`src/screen/`):
  `screenSurfaceStyle` and the CSS-px math (`screenCssHeight`, `screenCornerRadiusCss`,
  `screenDistanceFactor`), the compositor-layer CSS (`SCREEN_LAYER_CSS`), the
  tap-vs-drag orbit handoff (`createScreenDragHandoff`) and DOM backface culling
  (`createBackfaceCuller`).
- **Stage extracted** from `mockup-canvas.tsx` / `float-group.tsx` (`src/stage/`):
  camera + orbit + contact-shadow defaults, `orbitDistanceRange`, `canvasTouchAction`,
  `orbitZoomBy`, fullscreen helpers, the procedural light rig (`STUDIO_LIGHTFORMERS`),
  the idle float animation (`floatPose`) and overlay-button chrome.

### `packages/area-mockups` → `packages/react` (npm name unchanged: `area-mockups`)

- `device-screen.tsx`, `mockup-canvas.tsx`, `float-group.tsx` rewritten as thin React
  wiring over the core behaviors. All 31 scene components + 31 wrappers now import
  specs/geometry from `@area-mockups/core`.
- `index.ts` re-exports the whole core (`export * from '@area-mockups/core'`) — the
  public API is a strict superset of before; every existing name is unchanged.
- The build **bundles the core from source** (esbuild alias in `tsup.config.ts`,
  `paths` in `tsconfig.json`): `npm install area-mockups` stays a single
  self-contained install, no workspace build-order dependency, publish workflow
  unchanged.

### Docs & meta

- `ARCHITECTURE.md` (new): the layering rule, the binding contract, a drei → Threlte
  / TresJS mapping, and a step-by-step guide for adding `@area-mockups/svelte` /
  `@area-mockups/vue`.
- Root `README.md`: new layout table + architecture pointer; root `package.json`
  scripts build/typecheck the core workspace.
- `apps/docs` content: fixed the `measure-size.mjs` path and refreshed the import-cost
  table (it was measured at an older commit — e.g. `PhoneMockup` was listed at 4.5 KB
  gzip but measured 5.0 KB on `main` before this refactor).

## Verification

- `npm run typecheck` (core + react + docs) and `npm run build` (all three) pass.
- Published API checked: all 44 spot-checked pre-refactor exports still present in
  `dist`; runtime bundles contain no `@area-mockups/core` specifier (fully inlined);
  the 185 KB `dist/index.d.ts` inlines core types.
- Tree-shaking intact: `PhoneMockup` import 5.0 → 5.3 KB gzip (delta = the now-shared
  screen/stage helpers), whole library 36.6 → 37.8 KB gzip.
- Visual check via Playwright screenshots of the docs home, demos and hero-phone pages
  before/after — see PR description.

## Not in scope (documented as direction in ARCHITECTURE.md)

- Converting per-device R3F scene components into imperative core geometry builders.
  Deliberate: it would rewrite ~10 kLOC of visually-tuned JSX with high regression
  risk and no consumer until a second binding exists. The extraction rule is written
  down: when the Svelte/Vue binding lands, whatever it would copy from the React scene
  layer is what moves into core.
- Actual `packages/svelte` / `packages/vue` implementations.
