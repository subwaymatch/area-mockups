# G-batch: product-true Fold keys + continuous small-angle poses

Eighth session on `claude/3d-models-led-text-lrcgbn`.

## G1 — Fold side buttons at product proportions

The keys were 0.082 units (~3 mm) thick — filling most of the folded
rail. GSMArena's Z Fold 7 edge photography shows slim strips with clear
frame above and below them, so `buttonProfile` drops to 0.05 (~1.8 mm)
with 0.01 protrusion. Side-by-side sheet (product photo vs before vs
after at the same pose): `images/2026-07-23-g1-fold-button-comparison.png`.

## G2 — small angles render a true slightly-open pose again

The D-round's ≤15° snap-to-closed was a stopgap: the flex rig pivoted
0.012–0.015 INSIDE the display, so near zero the two half-screens (flat
DOM planes, painter-ordered, not z-buffered) crossed each other and the
rig fell apart visually. The pivot now sits ON the display surface: the
half-screens meet exactly at the crease at every angle, the bodies never
interpenetrate (their front faces part by a hair behind the display),
and the spine radius lands within 2% of the closed capsule's — so the
flex rig is continuous from nearly shut to nearly flat. The snap
threshold drops from 15° to 0.5°: sliding toward zero now closes the
book gradually, and only ~0° switches to the dedicated folded pose.
Verified by driving the docs sliders down to 2° and via harness sweeps
at 3/6/10° (both devices, front/side/below cameras) plus 90–100°
sanity checks — no floating hardware, no crease glitches.
