# D-batch: near-zero fold angles, TV feet/port carving, full-card ID face

Fourth session on `claude/3d-models-led-text-lrcgbn`, addressing D1–D3.

## D1 — Fold/Flip artifacts near openAngle 0

Reproduced both reported states before touching geometry
(`images/2026-07-23-d-*-before.png`):

- **Closed pose (0°)**: both closed spines were capsules of the scanned
  hinge-band width — much thinner than the folded stack — so they read as
  a separate rod laid on the hinge edge (fold) or floating below the
  stack's bottom V (flip), with slab corners and the crevice showing past
  the domes.
- **Flex pose below ~15°**: the panels pivot on the display's neutral
  plane, so nearly shut they render as two detached slabs — the spine
  hides behind them and the background leaks through the fold line.

Fixes, per the user's sanction to clip the bad range:

- Both closed spines are now capsules whose radius spans the WHOLE folded
  stack (fold: `closed.body.depth / 2`; flip: `half.depth + gap / 2`),
  tangent to the front and back faces (inset 0.002 so the near-tangent
  surfaces never coincide) — the smooth book spine / rolled bottom of the
  retail devices, sealing the hinge edge. Crown positions keep the scan's
  overhang; the SAMSUNG emboss rides the new crowns.
- `openAngle` below **15° snaps to the folded pose** on both devices
  (thresholds were ≤3°); JSDoc + docs tables note it. The real hinges
  spring shut from there, so the clip reads natural.
- Flex panels got **near-square fold-side corners** (new
  `mixedRoundedRectShape` helper in `devices/details.tsx`) so the crease
  stays tight at every remaining flex angle instead of opening
  rounded-corner gaps.

## D2 — TV feet cutoff + carved-in rear ports

- **Feet**: the struts previously overshot through floor pads that also
  tilted with the leaned ankle frame — reading as detached bars. Strut
  length/rake now derive from the pad geometry so each tip lands buried
  mid-pad, and the pads sit level on the stand plane outside the leaned
  group (their x compensates for the lean's drift). No overshoot, no
  floating bars.
- **Ports**: the input bay is now punched THROUGH the electronics bulge —
  the bulge became an extrusion with the bay as a real hole (beveled lip,
  interior walls from the extrusion), closed by a floor plate 0.06 in. All
  connectors mount on that floor and stay below the bulge surface: stamped
  socket bezels + dark openings for HDMI/USB/LAN/optical, a protruding
  coax barrel with a drilled tip. Carved inputs, not stuck-on blocks.

## D3 — whole ID card mockup-able + pierced J-hook

- `ID_CARD.face` is now the **entire CR80 card** (was: card minus the top
  punch strip). The live DOM faces carry a `clip-path` built from the
  shared core clip helpers: face outline traced one way, the 14×3 mm slot
  stadium the other, so the nonzero fill rule carves the real punch out of
  the live area — front and back.
- The stamped J-hook (+ spring gate + stem) rotated 90°: its flat plane
  now pierces the card through the slot like a real hanging badge — lower
  band inside the punched opening just clear of resting on its bottom
  edge, ring window swallowing the punch strip, stem edge-on up to the
  swivel (the barrel is exactly where the plane change happens on real
  hardware). Straps and crimp stay in the card plane.
- Docs badge art gained a Dept/Access panel + barcode so the demo design
  fills the taller full-bleed face; id-card page copy rewritten; harness
  gained `device=idcard` (`back=1` mounts the back face).

## Verification

`build:pkg`, all three typechecks and the docs production build are green.
Playwright before/after sweeps (`images/2026-07-23-d-*.png`): fold/flip
side + hinge close-ups at 0°, 5° and 10° (5°/10° now snap closed), TV feet
and rear-bay three-quarters, ID card front/back/three-quarter/slot
close-up and the docs hero.

## Known estimates / flags

- Angles in (3°, 15°) previously rendered the detached-slab flex rig;
  they now render the folded pose. Anyone animating `openAngle` 0→180
  gets a snap at 15°, matching the real hinge's spring-shut behavior.
- The bay hole's extrusion bevel slightly tapers the opening (portBay
  minus ~0.024 at the surface); the floor plate hides the taper seam.
- From straight-on front views the pierced hook's strip is composited
  behind the live face where it crosses the printed punch strip (DOM
  always wins) — it reads as the hook passing behind the print, and the
  band stays visible inside the carved slot; side/three-quarter views show
  the true piercing.
