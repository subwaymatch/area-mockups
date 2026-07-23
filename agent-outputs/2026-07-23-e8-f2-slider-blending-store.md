# E8+F2: the slider transition bug, blending polish, and the brick-less store

Seventh session on `claude/3d-models-led-text-lrcgbn`.

## The real E1 culprit: pose-transition state, not geometry

Driving the docs demos' REAL angle slider with Playwright (as requested)
reproduced the "detached parts" render at 0° on the current build — while
fresh page loads at the same angle were clean. Root cause: when the
slider crosses from the flex rig (>15°) into the folded pose, react-
three-fiber matches the two JSX trees positionally and REUSES mesh/group
instances; transform props the new pose doesn't set (the flex halves'
`rotation-x`, the spine group's position) simply persist — r3f never
resets omitted props. The closed pose then rendered with the flex pose's
leftover transforms: halves tilted apart, hinge capsule stranded below,
edge hardware floating. Fix: each pose's root group is `key`ed
(`flex`/`open`/`closed`), so a mode switch unmounts the old rig entirely.
Verified by slider-dragging 180→0 (fast sweep + settle, twice) on both
device pages: clean folded renders every time.

## E8 — hook cut-off + dead background drag

- The blending occluder drei creates is a bare full-rect plane: it wrote
  depth over the slot's punched opening, clipping the ring where it
  should show through. `DeviceScreen` now accepts `occluderGeometry`
  (forwarded to drei's `geometry` slot), and the ID card passes the card
  outline WITH the slot hole — the ring reads continuous at every angle.
- drei's blending mode also sets the CANVAS to `pointer-events: none`
  (so DOM under it stays clickable), which silently killed orbit drags
  on the empty background — drags on the card only worked through our
  drag-handoff replay. `DeviceScreen` now restores the canvas's pointer
  events when a blending screen mounts: orbit works everywhere; content
  behind a blending screen is display-only (fine for a printed badge).
  Verified with a scripted background drag: the scene rotates.

## F2 — the store loses its bricks

Per review: no masonry anywhere. The building's height drops to 2.85
units (parapet just above the cornice), the front keeps the full
shopfront with the door, and the other three elevations are the same
composition WITHOUT the door — windows only — each with its own live
fascia sign. Props are now `leftSign` (+X as you face the shop),
`rightSign` (−X) and `rearSign` (−Z); `wallColor` and the wall murals
are gone. One shared `windowedElevation` builder renders the three
door-less elevations rotated onto their faces. Docs, chroma map
(five labeled surfaces), walk-around example and the harness updated.

Evidence: `images/2026-07-23-e8-*` and `2026-07-23-f2-*`.
