# Slanted-view screens stay live, and tablets get real machined USB-C ports

**Batch scope.** Two user requests: (D1) rotating a device close to a side
view made the live DOM screen disappear — the display area rendered as bare
glass with a white reflection band instead of the foreshortened content;
(D2) the tablets' USB-C ports read as flat rectangular slots, unlike the
phones' accurate machined ports; fix them referencing the user-supplied
iPad (A16) 3D model.

## D1 — screen hidden at slanted side views

Reproduced exactly as reported: at 87° the tablet showed bare glass with a
white env-reflection band; at 82° the screen still worked. The cause was
the grazing-angle cutoff added with the earlier anti-piercing work: the
core backface culler hid the DOM plane whenever the view direction was
within ~5° of edge-on (`dot < 0.08`). That window is far wider than the
degenerate case it was protecting against, and it swallowed legitimate
slanted views where a real device clearly shows a thin foreshortened
screen.

Since every device now registers true chassis occluders (that was the real
C1 fix — the raycast tester handles genuine blocking per angle), the
grazing cutoff only needs to catch the sub-degree sliver where the CSS3D
matrix becomes numerically degenerate. It is now `dot < 0.015` (~0.9° from
edge-on).

Verified: tablet/flip/monitor at 85°–89° all show the foreshortened live
screen ([images/tablet-slanted-screen-before-after.png](images/tablet-slanted-screen-before-after.png));
the C1 piercing angles (low rear orbits at 96°/112°) stay clean — no
bleed-through returned.

## D2 — tablet USB-C machined like the phones

The tablets drew their port as a shallow `RoundedBox` decal (1.2 mm deep,
near-rectangular). The phones machine a true stadium cavity into the
chassis with CSG and seat a receptacle inside; the tablets now use exactly
that pipeline:

- The body geometry subtracts a **stadium cutter** at the USB edge —
  bottom edge on iPads, portrait-top on the Galaxy Tabs (`usbEdge`) — so
  the opening has a real lip, interior walls and parallax.
- A **`UsbC` receptacle** (stainless shell, dark cavity floor, gold pin
  tongue) sits inside the cavity, aimed down the correct cut direction per
  edge.
- Opening size measured off the user's reference A16 glTF: **~9.9 ×
  3.2 mm** (0.155 × 0.05 world units at 64 mm/unit), one standard
  receptacle across all 7 variants. It fits the thinnest 5.1 mm Pro edge
  exactly like the real device — nearly filling the flat of the rail.
- Bonus: the boolean pass attaches a BVH to the tablet chassis, so the
  screen-occlusion rays now use the fast path on tablets too.

Comparison against the user's reference model at matched angle:
[images/tablet-usbc-vs-reference.png](images/tablet-usbc-vs-reference.png).
Other variants: [images/ipadpro13-usbc-port.png](images/ipadpro13-usbc-port.png),
[images/tabs11-usbc-port.png](images/tabs11-usbc-port.png).

## Verification

- Typecheck (core, react, docs) and the docs production build stay green.
- Playwright angle sweeps: 75/82/85/87/89° on tablet, 84/87° flip and
  monitor, plus the C1 regression poses (96°/112° low rear) — screen
  visible exactly when it should be, hidden only within ~1° of edge-on or
  when genuinely occluded.
- Port close-ups on iPad (A16), iPad Pro 13″ and Galaxy Tab S11 at three
  camera angles.

## Known estimates / flags

- The receptacle shell renders slightly brighter than the reference scan's
  body-colored recess — kept consistent with the phone ports the user
  called accurate.
- Within ~1° of true edge-on the screen still hides (by design — the DOM
  plane is a sub-pixel sliver there).
