# Foldable `openAngle` control & the Studio Display stand corrected

**Batch scope.** Follow-up to the lineup batch, on user request: (B1/B2) let
users control the degree of openness on the Galaxy Z Flip 7 and Z Fold 7 —
which meant researching how the Armor FlexHinge actually looks at partial
angles — and (B3) fix the Studio Display's broken rear port slots and bring
the stand in line with the 2026 product imagery.

## Research notes — the Armor FlexHinge at partial angles

### Galaxy Z Flip 7

- Samsung's **Armor FlexHinge**: teardrop fold, flush gapless close
  (166.7 × 75.2 × 6.5 mm open; 85.5 × 75.2 × 13.7 mm closed). Flex Mode's
  software range is 75°–115°; the free-stop hinge holds wider.
- **The spine is a separate rigid body**: a gently convex cylindrical band
  (exterior radius ≈ 6.85 mm — half the closed thickness, ~10.1 mm wide,
  photo-measured) that neither half rotates with. The halves' back shells
  sweep around it, exposing more band as the fold closes; at 180° it
  retracts fully, leaving only the ~2–3 mm parting seam. Finish: frame
  color but glossier than the satin rails, with a tone-on-tone **SAMSUNG
  engraving centered on the band face** and **dark neutral end-cap wedges**
  between the converging rails.
- **Rotation axis**: no physical pin — the halves pivot about a virtual
  axis at/just inside the main display surface (the panel's neutral plane),
  so the screens meet flush shut and lie coplanar flat.

### Galaxy Z Fold 7

- Armor FlexHinge again (4.2 mm open / 8.9 mm closed, gapless). Flat-open
  spec is 178.5°–181.5°.
- At partial angles the exposed spine is a **flat satin band ≈ 10 mm wide
  bisecting the fold**, edged by thin polished rails, with the **SAMSUNG
  engraving running lengthwise** and small near-black wedges filling the V
  at the top and bottom edges. At 180° it tucks between the panels (two
  narrow seam lines); at 0° it wraps the fold edge as the ~4.5 mm-radius
  spine cap.
- Crease: a soft dished channel ~8–12 mm wide, shallower than prior
  generations.

### Studio Display stand (2026 = 2022 carryover, measured)

- The 2026 stand is **identical to 2022** (AppleInsider: "impossible to
  identify … right down to the stand"). Photo-measured against the 623 mm
  enclosure: blade **148 mm wide**, ~7 mm sheet, leaning **13.2°**, top edge
  curling over a **~21 mm hinge barrel** with polished caps (~23 mm) — the
  hinge axis ~87 mm above the panel's bottom edge.
- The "round hole + oval below" in the imagery is **one vertical stadium
  cutout (~42 × 62 mm)** through the blade: the panel's **round Ø35 mm power
  inlet** (center ~32 mm above the panel's bottom edge) shows through its
  upper half; the lower half is open air the captive cord drops through.
- Ports re-measured: four vertical ~9 × 3 mm slots on a **14.8 mm pitch**,
  centers ~100–144 mm from the rear-view left edge, ~28 mm above the bottom
  edge. Logo confirmed at 64.6 × 80.5 mm, center 129 mm below the top edge.

## What was built

### `openAngle` on `<Flip>` / `<Fold>` (and their mockups)

Both foldables accept `openAngle` (0–180°), overriding the `open` boolean;
the extremes snap to the existing flat-open/folded paths so default renders
are unchanged. Intermediate angles build the flex pose:

- The body splits into its two real halves, each pivoting around the shared
  virtual axis at the display's neutral plane; per-half slabs re-machine
  their own edge openings (USB-C, speakers, mics) on whichever half carries
  them, and buttons, cameras, cover glass, seams and rails ride their half.
- **The hinge renders per family**: the Flip's cylindrical spine housing
  (radius ≈ the real 6.85 mm curve) rolls into the wedge between the
  halves, glossier than the rails, with the SAMSUNG engraving on the band
  face and dark end caps; the Fold's flat spine band bisects the fold,
  growing wider as the book closes, with its polished edge rails, lengthwise
  engraving and dark V-filling wedges.
- **The display bends across the fold**: at intermediate angles the active
  display is composited from two coplanar-per-half DOM planes, each showing
  its half of one shared virtual viewport (content lays out at the full
  logical resolution), with soft crease shadows falling into the fold and
  the punch hole riding its half. Landscape composes with the fold for
  laptop-style poses. Caveat documented: content renders once per plane, so
  stateful screen content is best kept simple at partial angles.
- Mockup wrappers ground the shadow under the folded extent
  (`extent · cos((180°−θ)/2)`).

### Studio Display fixes

- **Broken ports**: the four rear slots rendered as self-intersecting
  bowties — the pill corner radius exceeded half the slot width. Fixed, and
  the cluster re-laid to the measured 14.8 mm pitch and offsets.
- **Stand**: blade narrowed to 148 mm and leaned 13.2°, the circular hole
  replaced by the real vertical stadium cutout with the Ø35 mm power inlet
  aligned behind its upper half, hinge barrel slimmed to ~21 mm with caps a
  touch larger, foot depth corrected, stand height set so the panel floats
  ~120 mm above the desk, and the logo moved to its measured position.

### Docs & demos

`openAngle` documented on the flip/fold API pages with new `flip-flex` /
`fold-flex` live demos; the monitor page describes the real stand cutout;
the `/harness` route accepts `openAngle` and a `fold` device for the
screenshot tooling.

## Verification

- Playwright renders at 100°/110°/45°/70°/135° for both foldables, front,
  back and side: the split screens stay continuous across the fold, the
  Flip's spine + engraving and the Fold's band + rails + engraving match the
  research photography, and end caps close the hinge from the sides.
- Flat-open and folded-shut renders confirmed pixel-identical paths (no
  regression to existing mockups).
- Studio Display rear re-rendered against the official image: four clean
  vertical slots, stadium cutout with the inlet showing through.
- `npm run typecheck` (all workspaces) and the docs production build stay
  green.

Renders in [`images/`](images/): `flip7-flex-100-hero`, `flip7-flex-100-back`,
`fold7-flex-110-front`, `fold7-flex-110-back`, `monitor-2026-back`.

## Known estimates / flags

- Spine band widths, end-cap recesses and crease depth are photo-derived
  (Samsung publishes no hinge dimensions).
- The real hinges' free-stop range is narrower than 0–180°; the props accept
  the full range for creative freedom.
- At partial angles, interactive screen content is instantiated once per
  half-plane; shared-state content diverges if manipulated (documented).
