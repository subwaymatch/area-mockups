# E-batch: verified-from-every-angle fixes — hinges, TV carve, hook compositing, piercing, van rear

Fifth session on `claude/3d-models-led-text-lrcgbn`, addressing E1–E7. Per
the request, every fix was verified against a ~75-shot matrix (angles ×
cameras) captured BEFORE and AFTER (`scratchpad` sweeps; curated evidence
in `images/2026-07-23-e-*`).

## E1 — Fold/Flip near zero, root causes this time

The D-round sealed the closed spines but the matrix exposed three more
mechanisms:

- The **closed fold's crevice** (scan-true 1.3 mm + edge bevels) rendered
  as a deep V canyon from the open edge. The gap is now a hairline
  (`0.012`) — the retail device reads closed-flush.
- The **closed spines read as featureless pills** hinge-on; both now
  carry hairline seams along the roll-to-face tangency lines.
- In the **flex rig the spine was shorter than the panels** (fold −0.16,
  flip −0.2), so at shallow angles the eye looked past its end caps into
  the V interior — the "detached pill + floating parts" in the E1
  screenshots. Both spines (and the fold's end caps) now run edge to
  edge, which the squared fold-side panel corners make seamless.

Verified at 0/16/20/25/30° × front/three-quarter/both-edges/low/above
per device: no detachment, no light leaks, no floating hardware.

## E2 — TV feet + genuinely carved ports

- Feet: pads slimmed to flat shoes (h 0.022, narrower than before) and
  the strut tips stop just under the shoe's top surface — the bulbous
  tip junction is gone from every low angle.
- Ports: the bay floor is now an extrusion with every port **punched
  through it** (real side walls), dark receptacle cavities behind each
  opening and connector blades inside (HDMI gold, USB blue); the coax
  barrel passes through a drilled hole. Referenced against the LG
  UT8000-class rear-panel photography from the C round: ports read as
  openings INTO the panel, not blocks on it.

## E3 — pierced hook vs the live face

The compositor draws the DOM faces above WebGL, so the hook vanished
wherever its projection crossed the card — from oblique angles it read
as "behind" the card. The ID card now defaults to `occlude='blending'`
(per-pixel depth compositing): the hook's front arm correctly crosses in
front of the printed face at every angle in a ±90° sweep. Raycast mode
stays available via `occlude={true}`.

## E4 — shelter roof piercing + audit

The shelter registered only its lightbox as an occluder, so the arrivals
board (and poster) composited straight through the roof from above. The
roof and the board housing are now registered occluders — the LED text
correctly hides under the roof in top-down views. Audited all 31 mockups'
`useScreenOccluders` registrations: every other object already registers
the shell(s) standing between its screens and the camera.

## E5+E6+E7 — van/bus rear

- **Coverage (E5)**: `rearFull` grows to 1.9×1.81 — door edge to door
  edge, plate recess to just under the roofline. The lamp columns are
  wrapped now, each lamp carved to a 6-thousandths margin; the third
  brake light and hinge knuckles get their own tight carves.
- **Proud lamps (E6)**: van taillights, the van's third brake light and
  the bus's round tail lamps now stand ~20 mm proud of their wrap
  planes, so they read as hardware the installer cut around, not sunken
  prints. (Hinge knuckles were already proud; now carved.)
- **Shut line (E7)**: the barn-door center crevice runs the full door
  height as a mesh strip, and BOTH rear coverages ('panel' and 'full')
  carve a slit over it — the door split stays visible through any wrap.

## Verification

`build:pkg`, all typechecks and the docs production build green. The
E matrix re-captured after the fixes: fold/flip (50 shots), TV
feet/bay (6), ID card ±90° sweep (7 + blending front/back), shelter
top-down with a live arrivals board, van rear straight/three-quarter and
panel mode, bus rear.

## Known estimates / flags

- `occlude='blending'` relies on drei's per-pixel blending path; it's
  the ID card's default only — other objects keep raycast occlusion.
- The van's grab handle stays intentionally under the wrap (unlike the
  lamps) — real wraps cover handles routinely.
- The fold's scan measured a 1.3 mm closed crevice; the model now draws
  a hairline instead, trading scan fidelity for the closed-flush read
  the retail photography shows.
