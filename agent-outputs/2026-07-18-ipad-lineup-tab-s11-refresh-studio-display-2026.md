# The full iPad lineup, a scan-accurate Tab S11 refresh, the 2026 Studio Display & the Flip 7 camera fix

**Batch scope.** Research the current Apple iPads (iPad Pro 11"/13" M5, iPad Air
11"/13" M4, standard iPad A16) and Samsung Galaxy Tab S11 / S11 Ultra from
official spec sheets and product photography; extend and refine the tablet
family to cover all seven variants with per-variant hardware and brand marks;
bring the Studio Display model up to the March 2026 second generation; and fix
the Galaxy Z Flip 7's rear cameras (the retail device has no plate joining the
two lenses). Verified throughout with side-by-side model-vs-photo comparisons
at matching angles and colors.

Three new tablet variants join the four existing ones:

| Device | `variant` | Body (mm) | Logical resolution (portrait / landscape) |
| --- | --- | --- | --- |
| Apple iPad Air 13″ (M4, 2026) | `ipadair13` | 280.6 × 214.9 × 6.1 | 1024×1366 / 1366×1024 |
| Apple iPad Air 11″ (M4, 2026) | `ipadair11` | 247.6 × 178.5 × 6.1 | 820×1180 / 1180×820 |
| Apple iPad (11th gen, A16, 2025) | `ipad11` | 248.6 × 179.5 × 7.0 | 820×1180 / 1180×820 |

## Research notes — what the real hardware looks like

### Apple iPad Air 11"/13" (M4, March 2026)

- Chassis carries over from the M2/M3 Airs (confirmed by MacRumors and Apple's
  own store renders); internals move to M4 / 12 GB / N1 / C1X.
- **Rear camera**: a bare single 12 MP lens — a ~13.5 mm polished ring rising
  straight out of the aluminum, no pod, **no flash** — at the back's top-left
  (portrait), with the pinhole mic just below it.
- **Buttons**: Touch ID top button on the top edge's right corner; **two
  separate volume pills on the right long edge** just below the camera corner.
- **Smart Connector**: three dots on the back, bottom center (portrait) —
  clearly visible in the product photography, along with the small "iPad Air"
  print above them.
- Bezels computed from ppi + chassis: ~8.9 mm (13"), ~10.3 mm (11") — the 13"
  is visibly slimmer. Colorways: Space Gray, Starlight, Purple, Blue (all
  near-pastel anodized tones).

### Apple iPad (11th generation, A16, March 2025)

- The 10th-gen chassis: 7.0 mm, crisper chamfered rails, ~10.8 mm bezels.
- Bare single lens (no flash), ~17 mm Touch ID top button, volumes on the
  right edge, and — unlike every other current iPad — the **Smart Connector
  sunk into the LEFT rail** (Magic Keyboard Folio) and **no Pencil charging
  strip** on the long edge.
- Colorways: Silver, Blue, Pink, Yellow (genuinely punchy, not pastel).

### Apple iPad Pro 11"/13" (M5, October 2025) — refinements

- M4 chassis carried over; specs already matched. The camera pod was rebuilt
  from the official close-up photography: **~32 mm pod** (was modeled ~27 mm)
  with the wide lens top-left and **near-lens-sized LiDAR window bottom-left**
  (back view), large frosted True Tone flash mid-right, ambient sensor dot
  top-right, pinhole mic lower-right.
- Two separate volume pills replace the previous single long pill; the top
  button is now its measured ~12 mm.
- Space Black sampled at ≈ #282629–#3c3a3d (a warm charcoal, not black);
  Silver ≈ #d6d8da. **The Pro's back carries no model wordmark** (removed).

### Samsung Galaxy Tab S11 / S11 Ultra — measured corrections

Samsung's orthographic press renders were pixel-measured (scale validated
against the published 326.3/253.8 mm widths to within 0.3 mm):

- **Rear rings**: Ultra Ø ≈ 14.8 mm, centers 16.9 mm below the landscape-top
  edge at 16.5 / 35.7 mm in from the corner, flash at 49.5 mm; S11 Ø ≈ 13.3 mm
  at 16.5 / 15.9 mm, flash at 28.9 mm. Ring walls are dark gunmetal — clearly
  darker than the body on both colorways.
- **Buttons** (from Samsung's user-guide layout diagram): the volume rocker
  (20.2 mm) sits CLOSER to the camera corner, spanning 46.8–66.7 mm, with the
  13.4 mm power key beyond it at 76.8–90.0 mm — the previous model had the
  order and sizes wrong.
- **USB-C** centers on the short edge adjacent to the camera corner — the
  **portrait-TOP edge** in our portrait-first coordinates (landscape left),
  not the bottom.
- **Speakers**: two ~40 mm milled slots per short edge (not drilled holes).
- **Pogo contacts**: three dots ~11 mm in from the landscape-bottom edge,
  centered, silver-white (previously gold).
- **SAMSUNG wordmark**: ~31 mm wide, in the corner diagonal from the cameras
  (~31 mm from the landscape-left edge, ~16 mm below the top), reading
  horizontally in landscape — rotated along the edge in portrait.
- **S Pen**: officially **hexagonal** (Samsung product page; the earlier
  "octagonal" note came from one review) and attaches to a visually clean
  edge — the protruding mount strip was removed; iPads keep a flush Pencil
  charging window instead of the old proud strip.
- **Notch**: refined to the measured ~12.4 mm width, dipping only ~2 mm past
  the bezel line. Bodies use the measured ~8.7 mm corner radius (squarer than
  an iPad) and ~3 mm display corners. Gray sampled at #55575B, Silver #D3D4D8.

### Apple Studio Display (2nd generation, March 2026)

Shipped March 11, 2026 (announced March 3 alongside the Studio Display XDR):
A19 chip, 12 MP Center Stage + Desk View camera, 2× Thunderbolt 5 + 2× USB-C,
six speakers — **in the physically unchanged 2022 enclosure** ("impossible to
identify from the original just by looking", AppleInsider). The model was
already the 2026 port configuration; refinements from the measured rear
photography:

- Slab thinned to the real ~19.5 mm; logo corrected to ~64 mm wide with its
  glyph center ~125 mm below the top edge (was ~97 mm wide, lower).
- Port cluster rebuilt as four **vertical** ~3.5 × 8.8 mm pills, centers
  ~14.5 mm apart, ~29 mm above the bottom edge, left of center seen from
  behind.
- The **captive power cord's ~31 mm circular recess** added, centered low on
  the back (the previous model had no external inlet), and the stand's cable
  hole resized to ~30 mm and moved fully above the enclosure's bottom edge —
  the full dark circle the rear photography shows on the column, framing the
  power recess behind it.

## What was built

### `<Tablet>` — seven variants, spec-driven details

`TabletSpec` gained per-variant hardware: a third rear-camera style
(`'single'` — bare ring + mic), `topButton` / `sideButtons` (measured pills),
`usbEdge` (the Tabs' top-edge port), `pogo` with surface/axis (back row, back
column, or edge-sunk), `logo` (Apple glyph or edge-aligned SAMSUNG wordmark as
real SVG vector geometry, tone-on-tone gloss), `backText` (the Airs' "iPad
Air" print), and `speakers` (drilled hole clusters vs milled slots). The
back-panel material was recalibrated (metalness 0.15) so the researched
anodized albedos read true under the studio rig, and colorways were updated
for every variant from sampled swatches.

### `<Monitor>` — 2026 Studio Display geometry

Spec-level `ports` and `power` blocks (the component was previously
hard-coded), the measured logo, slab depth, and cable-hole placement.

### `<Flip>` — separate lens rings

The `island` field is gone from `FlipSpec`: each ring now rises straight from
the cover glass (`raise` ~2 mm), and the closed pose's DOM overlay draws two
circles + flash with no pill behind them — matching the official photography
the user supplied.

### Docs & demos

Tablet API page rewritten around the seven variants with new Air and iPad
demos; devices spec table + READMEs extended; monitor and flip pages updated.
A new chrome-less `/harness` route renders any device/variant/colorway/angle
from URL params for the Playwright screenshot tooling.

## Verification

Playwright against the docs site (Chromium, up to 3500×2800 @2x), with
side-by-side comparison sheets built against official product photography at
matching angles and colors (Apple store/newsroom renders, Samsung orthographic
press renders, GSMArena review photos):

- **iPad Pro 13″ back (Space Black)**: pod position/size, centered logo and
  bottom-center Smart Connector dots all align; pod close-up matches the
  retail element layout (lens top-left, LiDAR bottom-left, sensor/flash/mic
  column inboard).
- **iPad Air 13″ back (Purple)**: single ring + mic, centered logo, "iPad
  Air" print and connector dots match the GSMArena orthographic photo.
- **iPad (A16) front (Silver)** and **Air 11″ front (Blue)**: bezel
  proportions and landscape-edge camera dot match the Apple renders.
- **Tab S11 / S11 Ultra backs (Gray)**: wordmark position and reading
  direction, ring stack + inboard flash, top-edge buttons, and bottom-center
  pins all match Samsung's renders (antenna cutlines are the one detail left
  unmodeled).
- **Studio Display back**: logo scale/position, the four-slot port cluster,
  and the full cable-hole circle on the column match the official rear image.
- **Flip 7 back + closed cover**: two individually protruding rings, bare
  glass between flash and lenses.
- `npm run typecheck` (all three workspaces) and the docs production build
  stay green; virtual resolutions confirmed per variant via the harness.

Model renders are in [`images/`](images/) (`tablet-*`, `monitor-2026-back`,
`flip7-back-separate-lenses`).

## Known estimates / flags

- Rendered tones sit ~20–25% darker than vendor studio photography — the
  library's shared stage exposure (consistent across every device family);
  relative tones between colorways are calibrated.
- Galaxy Tab dp grids (800×1280, 924×1480) remain xhdpi estimates.
- Tab antenna cutlines and the microSD tray seam are not modeled.
- iPad bezel widths and button offsets are computed/photo-measured, not
  vendor-published; the A16 iPad's edge Smart Connector position is placed
  from review photography.
