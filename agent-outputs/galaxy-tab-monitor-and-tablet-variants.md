# Galaxy Tab family, Studio Display monitor & iPad size variants

**Batch scope.** Continue the device lineup with the Galaxy Tab family, a monitor, and
different-sized tablet variations — researching the real products so the 3D models are
accurate "down to the charging ports and curvatures on the buttons."

Four new devices ship in this batch, joining the existing eleven:

| Device | `variant` | Body (mm) | Logical resolution (portrait / landscape) |
| --- | --- | --- | --- |
| Apple iPad Pro 11″ (M5) | `ipadpro11` | 249.7 × 177.5 × 5.3 | 834×1210 / 1210×834 |
| Samsung Galaxy Tab S11 | `tabs11` | 253.8 × 165.3 × 5.5 | 800×1280 / 1280×800 |
| Samsung Galaxy Tab S11 Ultra | `tabs11ultra` | 326.3 × 208.5 × 5.1 | 924×1480 / 1480×924 |
| Apple Studio Display 27″ | `MonitorMockup` | 623 × 478 × 168 (on stand) | — / 2560×1440 |

The iPad Pro 13″ (M5) added last batch became `variant="ipadpro13"` (still the default), so
`<TabletMockup>` now covers both tablet families at true relative sizes on one world scale
(~64 mm per unit).

## Research notes — what the real hardware looks like

### Samsung Galaxy Tab S11 / S11 Ultra (2025)

- **Bodies**: S11 253.8×165.3×5.5 mm (11″, 2560×1600 16:10 AMOLED); Ultra 326.3×208.5×5.1 mm
  (14.6″, 2960×1848). Both are flat aluminum slabs with flat rails and tight corner radii —
  visibly squarer than an iPad's.
- **Front camera**: on the **landscape-top long edge** for both. The base S11 keeps it in the
  bezel (no notch); the Ultra cuts a **small droplet notch** into the display for its single
  12 MP camera — this generation dropped the second front lens, so the notch is much smaller
  than the Tab S9/S10 Ultra's wide cutout. In portrait that notch sits on the **right edge**,
  rotated with the device.
- **Rear cameras**: individual **protruding metal rings** (no camera island) — one 13 MP ring
  + LED flash on the S11; 13 MP wide + 8 MP ultrawide dual rings + flash on the Ultra.
- **S Pen**: the retail-included pen is a new **octagonal, passive** design that clips
  **magnetically to the long sides** — the back-panel charging strip of earlier Tab S
  generations is gone (per GSMArena's design review). The model mounts it on the portrait
  right edge (landscape top), clear of the buttons.
- **Buttons & ports**: power + volume on one long edge (landscape top), USB-C centered on a
  short edge, quad speakers on the short edges, keyboard **pogo pins on the back** near the
  landscape-bottom edge — modeled as the three gold contacts.
- **Logical resolution**: One UI renders the 16:10 panels at a dp grid of ½ panel
  resolution (xhdpi): **800×1280** (S11) and **924×1480** (Ultra). These are the defaults;
  pass `resolution` to override. (Flagged as an estimate — Samsung doesn't publish dp
  grids, and DPI-setting tweaks change them.)

### Apple iPad Pro 11″ (M5, 2025)

- 249.7×177.5×5.3 mm, 11″ 2420×1668 tandem OLED → logical **834×1210 pt @2x**.
- Same design language as the 13″: camera pod with wide lens + LiDAR + flash + mic,
  Apple Pencil charging strip on the portrait-right long edge, front camera moved to the
  **landscape-top bezel** (M4-generation change, unchanged on M5), top button + volume on
  the same corner, USB-C/Thunderbolt centered on the bottom edge.

### Apple Studio Display (2nd generation, 2026)

- The 2022 enclosure carried over: **623×478×168 mm** on the tilt stand, 6.34 kg, 27″ 5K
  (5120×2880) panel → logical **2560×1440 @2x**.
- All-aluminum enclosure ~20 mm thick with a flat back, uniform black bezel, centered
  12 MP Center Stage camera in the top bezel.
- Rear ports in one row: **2× Thunderbolt 5 + 2× USB-C** on the second generation
  (up from 1× TB3 + 3× USB-C), plus the **captive power cord** (a circular inlet — the
  cable is not user-detachable) — and, faithfully, **no power button anywhere**.
- L-shaped tilt stand: a swept aluminum arm and a flat ~178×148 mm base plate.

## What was built

### `<Tablet>` / `<TabletMockup>` — `variant` prop

`packages/area-mockups/src/devices/tablet/dimensions.ts` now exports
`TABLET_VARIANTS: Record<'ipadpro13' | 'ipadpro11' | 'tabs11' | 'tabs11ultra', TabletSpec>`,
with `TabletSpec` extended for per-family hardware:

- `rearCamera`: `{ style: 'pod' }` (iPad rounded-square pod + lens/LiDAR/flash) or
  `{ style: 'rings' }` (Tab floating rings + flash dot, one ring per lens).
- `notch?`: the Ultra's droplet cutout `{ width, height, radius }`, rendered as a DOM
  overlay on the **landscape-top edge** (portrait right edge) with a camera dot inside.
- `stylus`: right-edge mount strip `{ length, offsetY }` — Pencil strip (iPads) or S Pen
  side clip (Tabs, offset below the buttons).
- `pogo?`: three gold keyboard contacts on the Tabs' backs near the landscape-bottom edge.
- Front-camera dot in the bezel glass on the landscape-top edge for every non-notch
  tablet (iPads + base S11).

Buttons follow each family: iPad top button on the top edge + volumes on the right edge;
Tab power + volume together on the right edge (landscape top). USB-C is a slot centered on
the bottom edge on both. Landscape lays the body sideways (`rotation-z = π/2`) while the
screen counter-rotates, and the virtual display swaps to the landscape dp grid — e.g.
`1480×924` on the Ultra.

### `<Monitor>` / `<MonitorMockup>` — Studio Display

New device family (`src/devices/monitor/`, `src/monitor-mockup.tsx`): extruded aluminum
enclosure (~115 mm/unit world scale), uniform-bezel cover glass, centered bezel camera
dot, the 4-port rear row + captive power inlet, and the L-shaped tilt stand with its flat
base. The mockup grounds the stand on a virtual desk plane (`shadowY` at the base) and
frames the 27″ panel with a slightly retreated default camera. `resolution` defaults to
2560 → a **2560×1440** virtual desktop, so real desktop layouts and breakpoints apply.

### Docs & demos

- **Tablet explorer** card (`apps/docs/components/scenes/tablet-explorer.tsx`): all four
  tablet variants + orientation toggle on one canvas, with authentic colorways.
- **Studio Display** card with the macOS-style desktop screen.
- Docs page: tablet/monitor API sections, and the device-specification table now lists
  each tablet variant and the monitor with body mm, panel, logical resolutions and
  measured import cost.
- README: fifteen-device summary, resolution table rows, tablet/monitor sections.

### Import cost (tree-shaken, peers external)

| Entry | min | gzip |
| --- | --- | --- |
| `TabletMockup` (all four variants) | 12.0 KB | 4.0 KB |
| `MonitorMockup` | 7.4 KB | 2.9 KB |
| whole library (15 devices) | 41.7 KB | 10.7 KB |

## Corrections made during the build (research → model)

1. **S Pen mount**: first modeled on the short/top edge; GSMArena's Tab S11 Ultra review
   states the octagonal pen attaches "magnetically to either of the long sides", so the
   mount moved to the portrait-right long edge and the short-edge strip was removed.
2. **Ultra notch**: reshaped from a wide pill (Tab S9/S10-era, dual-camera) to the S11's
   small single-camera droplet (~0.21×0.095 world units, near-semicircular).
3. **Studio Display depth**: enclosure slimmed 0.26 → 0.19 units (~20 mm real) after
   checking the spec sheet; port row updated to the 2nd-gen 2× TB5 + 2× USB-C set.
4. **Pogo pins**: added after the review mentioned the keyboard-cover contacts.
5. **Stand arm**: the first render showed the tilt-stand arm punching through the base
   plate and continuing below it; the arm was re-derived to run from its back-panel
   attachment down to a flush landing on the base (length 1.9 → 1.28 units, re-tilted),
   and the stand material was made less mirror-like so it reads as brushed aluminum.

## Verification

Playwright against the running docs site (Chromium, 1400×900@2x):

- **Virtual resolutions** asserted per variant and orientation by measuring the live
  screen DOM: 1032×1376 / 1376×1032 (13″), 834×1210 / 1210×834 (11″), 800×1280 / 1280×800
  (S11), 924×1480 / 1480×924 (Ultra), 2560×1440 (monitor) — all pass.
- **Orientation screenshots** confirm the Ultra droplet notch rides the correct edge —
  right edge in portrait, top-center in landscape — and content re-lays-out upright.
- **Back views** confirm per-family cameras (pod vs rings), the S Pen side strip, pogo
  contacts, and the monitor's port row + power inlet + stand.
- **Interactivity**: the desktop window's button really clicks through the glass on both
  the monitor and the tablet explorer (counter 0 → 1), and the hero-page drag/click
  regression suite still passes.
- Full-library build (`tsup`), `tsc --noEmit`, and the docs production build stay green.

Renders are in [`images/`](images/) (`tab-*`, `monitor-*`).

## Known estimates / flags

- Galaxy Tab dp grids (800×1280, 924×1480) are xhdpi **estimates**; Samsung doesn't
  publish logical resolutions and they shift with the display-size setting.
- The Tab rear-camera corner (which long edge the rings hug) is modeled phone-style —
  top corner adjacent to the notch edge; review photography is ambiguous at the corner
  level.
- The Studio Display 2nd gen is modeled from its spec sheet (2022 enclosure carried
  over); the port row is drawn as four identical USB-C-shaped slots without engravings.
