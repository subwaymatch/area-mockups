# I round — hardware over full wraps, door crevices, slim lamps, matte magazine

Seven requests (I1–I7) on the bus, van and magazine, all verified with
Playwright captures against the built docs site. Evidence in
`images/2026-07-24-i*.png`.

## I1 — bus: mirror-rod livery dot removed

The full-side wrap clip carved a "hole" for the mirror mount at the
windshield edge — outside the outer boundary, where the nonzero fill rule
renders an escaped hole subpath as an isolated FILLED patch: the floating
speck of livery on the mirror arm. Removed the carve (the mount is proud 3D
hardware and now draws over the wrap anyway).
Evidence: `2026-07-24-i1-bus-no-mirror-dot.png` — wrap runs clean to the
windshield edge, no speck.

## I2 + I4 — van: full-side mockup with the mirror ON TOP

- `SIDE_CUTOUTS` reduced to the door glass only; `buildFullWrapClip` no
  longer carves the handle/mirror/track. The whole side elevation is one
  live region.
- New `vanProfileShape()` + `doorGlassHolePath()` build a ShapeGeometry
  depth occluder matching the wrap clip exactly (shared trace with
  `shellGeometry`), passed to the side `DeviceScreen`s as
  `occlude='blending'` + `occluderGeometry` whenever `coverage="full"`.
- Result: per-pixel compositing — the mirror arms/heads, door handles and
  the sliding-door track (pulled proud to z ±0.987) draw over the livery;
  the wrap can no longer pierce the mirror at any angle.

## I3 — van: realistic cab-door crevices, visible through a full wrap

The two floating shut lines became a full door-gap outline per door:
A-pillar seam, B-pillar seam and a sill seam joining them along the door
bottom (rear-crevice styling: `#191b1f`, 12 mm gap). Held proud of the
wrap plane (z ±0.986, 18 mm deep) so blending draws the crevice over any
full livery.
Evidence: `2026-07-24-i3-van-door-crevices*.png`.

## I5 — bus: slimmer rear lamps

Lens pucks reduced from r 0.05 × 0.06 long at x −3.245 (jutting 30 mm past
the wrap plane, ~79 mm past the tail) to r 0.045 × 0.045 at x −3.227 —
rooted in the tail face, ending ~5 mm proud of the full-wrap plane. The
full-rear clip's lamp carves tightened to r 0.053 to match.
Evidence: `2026-07-24-i5-bus-slim-rear-lamps.png`.

## I6 — bus: side wraps no longer pierce the mirrors

Same treatment as the van: extracted `busProfileShape()` (shared with
`shellGeometry`), added per-side blending occluders with holes matching the
clip carves (door leaves on the curb side, driver's window on the street
side, passenger band when `wrapOverWindows` is false).
Evidence: `2026-07-24-i6-bus-mirrors-over-wrap.png` — swan-neck mirrors
drawn over the wrap at shallow angles.

## I7 — magazine: matte paper by default

`glossy` now defaults to `false`: no diagonal sheen overlay, and the spine
and back cover drop their clearcoat for a rough matte stock
(`roughness 0.72`). `glossy` opts back into the coated look (sheen +
clearcoat), now consistently across DOM and 3D materials. Docs updated.
Evidence: `2026-07-24-i7-magazine-{matte,glossy-opt-in}.png` at the
glancing angle from the report.

## Root-cause fix: drei blending canvas-config stomp

The van/bus mix occlusion modes per screen (sides `'blending'`, rear/plate
raycast). drei's `<Html>` configures GLOBAL canvas style per instance: a
blending instance raises the canvas so its DOM slides under it, but every
NON-blending instance resets `zIndex` to null — whichever mounts last wins.
The rear screen mounted after the sides and silently broke the per-pixel
compositing (all proud hardware vanished under the wrap DOM; the all-blending
ID card never hit this). `DeviceScreen` now re-asserts the blending canvas
config from the frame loop, so it always wins regardless of mount order.

## Bonus fix: overlapping wrap carves cancelled to filled

With `wrapOverWindows={false}` the bus mid-door carve (running to the band
top) overlapped the band carve — two same-direction holes cancel back to
FILLED under nonzero, leaving a stray strip of livery over the door glass.
Door carves now stop at the band's bottom edge when the band is carved
(clip and occluder both).
Evidence: `2026-07-24-i-bus-band-door-carves.png`.

## Harness additions

`device=magazine` (with `glossy`/`back` params) and `screen=light` (solid
light content — dark hardware over a livery is invisible against the
default gradient's dark corners; several "missing" parts in early captures
were just dark-on-dark).
