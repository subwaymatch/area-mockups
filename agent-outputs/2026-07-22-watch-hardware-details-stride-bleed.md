# Watch hardware rebuilt from product photography, and the Stride hero un-clipped

**Batch scope.** Three user requests: (W1) the Apple Watch had a ring
popping out of its Digital Crown, both watches' buttons sat in the wrong
places with the wrong 3D shapes, and both were missing their holes
(speaker/mic); (W2) the Apple crown should be shaped like a gear, with
its machined crevices; (W3) the Stride example page's hero phone was cut
off by its container regardless of zoom/position.

## References (fetched during research)

- Apple's Series 11 product photography: the hardware-right hero
  (`activity_hero_hw_right`, silver) and the jet-black finish macro from
  apple.com — crown knurling, mic position, side-button proportions.
- Apple Watch Series 11 back photo (Notebookcheck review) — band-slot
  channels in the flat top/bottom edges.
- GSMArena's Galaxy Watch8-series review photos (silver 44 mm): straight
  right-edge macro (two keys + mic), straight left-edge macro (two
  speaker slots), 3/4 and back shots.
- Tech specs: Series 11 46 mm = 46 x 39 x 9.7 mm; Watch 8 44 mm =
  46 x 43.7 x 8.6 mm cushion.

## W1+W2 — the fixes, both watches

**The crown-ring bug.** The old crown drew a `torusGeometry` with
`rotation-z`, which does not reorient a torus (its axis is z before and
after) — so the ring lay in the case plane, poking out of the crown
top/bottom. Exactly the artifact in the user's screenshot.

**Digital Crown rebuilt as a real gear.** New core geometry helper
`gearShape(radius, teeth, toothDepth)` (trapezoidal-wave radius: crest,
flank, groove, flank), extruded along the crown axis so the knurling
crevices run down the barrel like the machining. Spec'd at 30 teeth,
0.28 mm deep on a 7.3 mm barrel protruding ~2 mm, plus a flat end cap
slightly proud of the teeth and a dark seam ring where cap meets
knurling — matching the jet-black macro.

**Machined openings, not decals.** The watch now uses the same CSG
pipeline as the phones (`cutGeometry` + `stadiumCutter`/`holeCutter`):

- Apple: mic hole drilled between crown and side button (y=+0.10), one
  slim speaker slot machined into the left edge (16.3 x 1.1 mm), a
  shallow stadium recess for the side button, and real band-slot
  channels cut into the flat top/bottom edges (offset toward the case
  back) that the Sport Band now visibly slides into, with dark liners
  kept below the corner roll.
- Galaxy: mic hole at the right edge's center, two short speaker slots
  (6.5 x 0.9 mm) in a vertical run on the left edge, and shallow
  recesses under both keys.

**Buttons.** Both watches now use the shared `SideKey` (stadium pill,
crowned face) seated in those recesses. Apple: single near-flush button
(10.3 x 2.8 mm, 0.2 mm proud) centered ~62% down the edge — it reads as
a pill outline in its recess, as in the photos. Galaxy: two raised
chamfered keys (10 x 3.3 mm, 0.7 mm proud) straddling the mic dot; where
the cushion wall curves away the keys and recesses fade out naturally,
like the real arc-hugging keys. The Galaxy dial puck also gained its
polished rim ring.

Comparisons:
[images/watch-s11-crown-vs-macro.jpg](images/watch-s11-crown-vs-macro.jpg),
[images/watch-s11-right-vs-photo.jpg](images/watch-s11-right-vs-photo.jpg),
[images/watch-gw8-keys-vs-photo.jpg](images/watch-gw8-keys-vs-photo.jpg),
[images/watch-gw8-speaker-vs-photo.jpg](images/watch-gw8-speaker-vs-photo.jpg);
before/after:
[images/watch-s11-before-after.jpg](images/watch-s11-before-after.jpg),
[images/watch-gw8-before-after.jpg](images/watch-gw8-before-after.jpg).

## W3 — Stride hero canvas bleed

The hero phone was clipped by its own canvas edge when floated/dragged/
zoomed (the layout box is barely wider than the device). The canvas now
lives in `.xh-phone-bleed`, absolutely positioned at `inset: -16vh
-170px` inside the unchanged layout box, so the WebGL viewport extends
far past every visible edge — all visible cropping comes from the page's
`overflow: clip`, never the canvas. The camera moved back (z 6.6 → 8.25)
to compensate for the ~25% taller canvas, keeping the device's on-screen
size identical. Render:
[images/stride-hero-full-model.png](images/stride-hero-full-model.png).

## Spec/API changes

- `WatchSpec.crown` gained `proud`, `teeth`, `toothDepth`; `buttons`
  gained `width`/`proud`; new `mic`, `speaker[]`, `bandSlot` fields.
- New core export: `gearShape` (geometry).
- Screenshot harness gained `device=watch` (`wvariant`, `colorway`,
  `color`, `bandColor`, rotation, `dist`).

## Verification

- Typecheck (core, react, docs) and the docs production build are green.
- Playwright captures at reference-matched angles: straight-on left/right
  edges and 3/4 views of both variants, silver + jet black/graphite
  colorways, plus the Stride hero at 1400x950.

## Known estimates / flags

- Speaker-slot and band-slot dimensions are measured off photography, not
  scans — good to ~0.3 mm.
- The Apple band slot's dark liner sits below the case's corner roll, so
  at extreme grazing angles the channel's far interior reads aluminum
  before falling to dark (real slots do show machined walls at the
  mouth).
- Galaxy keys are straight pills that sink into the curved wall at their
  tips rather than bending with the arc — visually equivalent at mockup
  scale.
