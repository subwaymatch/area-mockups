# H-batch: seamless 0° swap, door to the pavement, every pane live

Ninth session on `claude/3d-models-led-text-lrcgbn`.

## H1 — no more jump between 1° and 0°

The flex rig and the dedicated folded pose placed the closed device in
different world frames (the rig folds symmetrically about the hinge line
where it sits in the open layout; the folded pose is upright, centered,
cover out), so the mode swap teleported the phone. Each flex rig now
carries a convergence chain, weighted by a smoothstep of the angle that
is identity above 26°: the flip folds forward around its hinge line,
half-turns upright in-plane around the folding compact's center and
re-centers; the fold quarter-turns around its vertical hinge line and
re-centers onto the spine edge. At 0° the chain lands exactly where the
folded pose renders (spine on the correct edge, free edges the correct
way up), so slider frames at 1° and 0° are pixel-aligned — the only
change at the swap is the cover display turning on. Verified with
slider-driven captures at 3/2/1/0° on both device pages.

Known residue: at the swap the flip's camera rings move from the cover
glass's left to the closed overlay's right — the model's open-pose ring
side and closed-pose ring side are mirror-inconsistent (scan-era
styling), which no rigid motion can reconcile. Position and orientation,
the reported issue, are continuous.

## H2 — the door reaches the pavement

The front stall riser previously ran across the door bay, cutting the
glazed door at knee height. It now stops either side of the bay, the
door leaf runs to the ground over a low steel threshold, and the door
glass keeps a ~320 mm kick rail like a real glazed shop door.

## H3 — every pane is a mockup surface

`windowPoster` is gone. A new `windows` object prop drives live DOM on
every big pane: `frontLeft` / `frontRight` (the display bays either side
of the front mullion), `door` (the glazed leaf), and `left` / `right` /
`rear` (the wide center pane of each other elevation) — ten live
surfaces with the four fascia signs. The left/right sign naming was also
corrected to match "as you face the shop" (left = −X). Docs, chroma map
(ten labeled surfaces), walk-around demo and harness updated.
