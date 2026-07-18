# Screen piercing & drag fixes, per-demo prop controls, and the iPad A16 rebuilt against a reference model

**Batch scope.** Four user requests: (C1) the Studio Display's DOM screen
pierced through the stand from some angles; (C2) dragging on parts of a
device's body — notably the backs — did not rotate it; (C3) every docs demo
should carry controls for the device props; (C4) improve the iPad (A16)
model against a user-supplied 3D reference model plus fresh product
photography, with side-by-side previews.

## C1 — screen piercing (all devices, worst on the monitor)

Two compounding causes:

- The browser composites the CSS3D screen above WebGL, so any chassis part
  that is not a REGISTERED occluder can never hide it. The monitor
  registered only its enclosure — the stand blade and foot were missing, so
  from low rear angles the screen painted straight through them. Both stand
  meshes now register with the scene occluder store.
- Within a few degrees of edge-on, the plane is a degenerate sliver that
  still passes the `dot > 0` backface test. The core backface culler now
  hides the plane below a small grazing threshold (`dot < 0.08` on the
  normalized view vector) — every device benefits.

Verified from the reported angles (low rear orbit sweeps): no sliver, no
bleed-through ([images/monitor-rear-angle-no-pierce.png](images/monitor-rear-angle-no-pierce.png)).

## C2 — undraggable body regions

drei's `<Html transform>` inner div defaults to `pointer-events: auto`, and
it spans the screen rect even when the content div hides itself on back
views — an invisible DOM pane silently eating every drag that started over
the device's back. The screen bridge now passes `pointerEvents="none"` to
the Html layer and keeps pointer handling solely on the content div
(visible + interactive → auto, hidden → none). Playwright regression: a
drag starting dead-center on a tablet's back now orbits the device.

## C3 — prop controls under every demo

The docs' single `PreviewControls` injection point (which already wrapped
all ~130 demos) now renders a control bar beneath each canvas, wired to the
library's real public props:

- **all demos**: 360° free-rotation, auto-spin, zoom + fullscreen (as before)
- **device demos**: variant picker (all 7 tablets, 4 iPhones, 2 Galaxy
  phones, 2 MacBooks, 2 watches), retail-colorway picker scoped to the
  selected variant, custom body-color picker, float toggle
- **phones/tablets/foldables**: portrait/landscape toggle
- **foldables + laptop**: `openAngle` slider (0–180° fold, 40–130° lid)
- **watch**: band-color picker

Initial control state honors each demo's hardcoded props (a closed-fold
demo starts at 0°). Screenshot: [images/docs-demo-prop-controls.png](images/docs-demo-prop-controls.png).

## C4 — iPad (A16) against the supplied reference model

The user-supplied glTF was measured programmatically (world-space part
bounding boxes at 1 m = 1000 mm scale, validated against the 248.6 ×
179.5 mm spec body) and rendered from matched angles for visual diffing:

- **Camera**: center 15 mm from the top and side edges (was 12.8), ring
  rebuilt as the **body-colored anodized boss** around a large black window
  (it was a darkened polished ring; Apple's own close-up photography shows
  a blue ring on the blue iPad), Ø ~12 mm, with the pinhole mic 15 mm
  directly below the lens center.
- **Touch ID button**: recentered to ~24 mm from the right edge at its
  measured 17 mm length; **volume pills** tightened to the measured span
  (~23–45 mm from the top corner).
- **Apple logo**: reduced to the measured ~29 mm width and recentered
  ~3 mm above body center.
- **Smart Connector**: the left-rail contacts now sit in their slim 13 mm
  stadium plate, at the measured 5.3 mm pitch.
- **Speakers**: drill rows lengthened to nine holes per cluster, matching
  the reference model's bottom edge.

Side-by-side sheets (library model vs uploaded model vs product photos)
were rendered for the back, camera corner and front; model renders in
[`images/`](images/) (`tablet-ipad11-*-v2`).

## Verification

- Full typecheck (core, react, docs) and the docs production build stay
  green after all four changes.
- Playwright: back-drag rotation regression, low-angle monitor sweeps, demo
  control interactions (variant → Tab S11 Ultra swap re-renders live with
  the colorway catalog following the variant).

## Known estimates / flags

- The A16 ring diameter is taken from the reference model (~12 mm visible
  boss); published teardown figures do not exist.
- At partial fold angles the two-plane screen instantiates content once per
  half (documented caveat, unchanged).
