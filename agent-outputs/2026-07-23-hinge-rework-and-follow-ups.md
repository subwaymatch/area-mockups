# Foldable hinge rework (B1/B2) + follow-up batch (B3–B11)

Second session on the `claude/3d-models-led-text-lrcgbn` branch, addressing
eleven follow-up requests (B1–B11) from the maintainer's live review.

## B1/B2 — Galaxy Z Fold 7 & Z Flip 7 hinge rework

**The bug:** near `openAngle` 0 the hinge rendered as a separate floating
part — the Fold's flat spine "band + rails + wedges" construction became a
detached blade, and the Flip's fixed-radius (0.175) over-wrapped
(`2α + 0.5` rad) cylinder poked past the back shells. Both hinges also read
flat compared with the real teardrop hardware.

**The fix (both devices):** the flex-pose panels pivot on the display's
neutral plane, so each half's BACK face stays a constant distance
`r = pz + depth/2` from the axis at every angle. The spine is now a
cylinder segment of exactly that radius spanning exactly the fold arc
(`thetaStart = π − α`, `thetaLength = 2α`): tangent to both back shells
from nearly-shut to nearly-flat, meeting each half at its back corner with
no seam. Sector end caps (the exact V cross-section) close the fold's top
and bottom; the SAMSUNG engraving renders only while the exposed band is
wider than the wordmark. The closed poses swap the flat RoundedBox hinge
caps for smooth capsule spines (cylinder + domed ends) sized from the scan
(`hinge.width`, `overhang`), tucked between the halves' curved edges like
the retail device.

References: GSMArena Z Fold 7 / Z Flip 7 review photography (closed spine
profiles, flex poses) — the maintainer's own Samsung 360-view screenshots
anchor the closed look. Chromium could not reach samsung.com through the
egress (TLS reset), so stills were pulled via curl from GSMArena instead.
Side-by-side sheets: `images/2026-07-23-{fold,flip}-hinge-comparison.png`.

## B3 — book title contrast + dynamic print sizes

- The docs site's global heading styles were overriding the inherited cover
  color on `<h1>`/`<h2>` inside screen content, rendering "The Atlas of
  Quiet Places" near-black on navy. Explicit colors fixed (book jacket +
  brochure front).
- New core spec builders with mm-based `size` props on the components and
  wrappers: `bookSpec` (width/height/thickness), `magazineSpec`,
  `posterFrameSpec`, `rollupBannerSpec` (cassette follows the graphic),
  `brochureSpec` (per-panel), and `doohTotemSpec` (B11 — glass/display
  scale with the cabinet). Constants (`BOOK`, `MAGAZINE`, …) are now the
  builders' defaults — same numbers, same renders. Mockup wrappers compute
  their shadow/floor framing from the sized spec.

## B4 — two-sided shelter arrivals board

`BusShelter`/`BusShelterMockup` gained `arrivalsBack`
(`ReactNode | string | string[]`): the waiting-area face of the RTPI board
is now live, mirroring the front by default and overridable independently.

## B5–B9 — bus refinements

- **B5**: driver's window resized to the passenger band's height and sill
  (`BUS.driverWindow` now `y 0.079, height 0.66`).
- **B6**: full-wrap carve-outs cut tight: door/driver-window margins
  0.015 → 0.004, outline inset 0.015 → 0.01, mirror pocket shrunk — the
  thin body-color gaps around hardware are gone.
- **B7**: the rear wrap widened to the corner bevels (`rearFull` 1.32 wide)
  and each taillight lamp is carved individually (`clipCircle`, r 0.058
  vs lamp r 0.05) — the tail graphic runs right up to the light collars
  instead of leaving two big rectangles.
- **B8**: `curbSideAd` prop added (named symmetric alternative to
  `children`; wins when both set).
- **B9**: `wrapOverWindows?: boolean | { curbSide?, streetSide?, rear? }`
  (default `true`). `false` layers the graphic UNDER the glass: the
  passenger band / rear window are carved out of the clip-path and their
  meshes render through the holes. Operational glass (doors, driver's
  window) always stays clear. New `bus-full-clear` demo + docs.

## B10 — brochure six surfaces

The component and wrapper already supported `backPanels`; the docs did not
show it. Added the "All six surfaces printed" docs section +
`brochure-both-sides` auto-rotating demo, and clarified the props table.

## B11 — DOOH totem sizing

`size?: { width?, height? }` (mm) via `doohTotemSpec`; bezels, louvres and
plinth keep hardware dimensions, display aspect follows the cabinet.

## Infrastructure

- Core `clip-path` module: new `clipCircle` (round holes) — and the bus
  rear clip now uses `clipRoundedRectOutline` correctly (same-winding
  outline+holes had swallowed the rear holes; fixed in the first session's
  follow-up here).
- Harness: bus `over` param (wrapOverWindows), shelter `arrivalsBack`.

## Verification

Typecheck (core/react/docs) and both builds green. Playwright sweeps:
14-pose before/after hinge captures for fold + flip (comparison sheets in
images/), bus full/clear/rear/panel poses, shelter front/back boards
(mirrored + custom), the book docs page (title legible), and the brochure
six-surface demo. Fresh-browser-per-shot needed for two flaky shelter
captures (renderer flake, not app errors — verified clean console).

## Known estimates / flags

- Flex-pose spine radius equals the pivot-to-back distance, so at angle→0
  the flex stack is ~0.02 units thinner than the dedicated closed pose
  (which uses the scan's stack depth + crevice); the ≤3° snap hides the
  transition.
- The spine engraving is flat geometry tangent to the curved spine — its
  side edges float ~0.15 real-mm above the surface at the default sizes.
- Print-object `size` is unclamped; extreme ratios (e.g. 10:1 books) will
  look odd but render.
