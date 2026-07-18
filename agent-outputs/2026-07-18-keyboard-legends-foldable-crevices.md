# Keyboard legends corrected per-glyph against the scan, and foldable open-state details

**Batch scope.** Four follow-ups: (F1) the keyboard legends weren't
accurate — delete must be a word label and the modifier symbols sit in the
top-left, verified per key against the re-attached MacBook Pro 14" (M5)
scan; (F2) the fully-open Galaxy Z Flip 7 needs the hinge crevice across
the back's vertical middle; (F3) the fully-open Galaxy Z Fold 7 must show
only a thin crevice — not the wide SAMSUNG spine stripe; (F4) the Fold 7's
three-lens housing should be body-colored, not black.

## F1 — legends measured glyph-by-glyph

The scan's legends are separate geometry, so every glyph was clustered and
measured (position + size inside its key, in mm):

- **Editing keys are words** on both variants: esc / tab / caps lock /
  shift bottom-LEFT (3.1 mm inset), delete / return / shift bottom-RIGHT
  (2.7 mm), baseline 2.85 mm up, ~3.5 mm font. The Air spec flips from the
  glyph style to `legends: 'text'`.
- **Modifier symbols sit in the top-OUTER corner**: center 5.2 mm in,
  4.6 mm down — top-left on left-hand control/option/command, mirrored
  top-right on the right-hand command/option. Words run along the bottom.
- ⌘ is 3.4 mm, ⌥ 3.7 mm, the caps-lock dot Ø1.25 mm at top-left
  (3.2/2.9 mm), globe Ø3.9 mm bottom-left with `fn` bottom-right.
- Number/punctuation pairs: shifted symbol centered 4.5 mm from the cap
  top, base glyph LARGER (5.2 mm font) at 11.1 mm — the digit dominates.
- Letters 4 mm cap height centered; F-row icons ~3.3 mm at 5.6 mm with
  the F-label at 12.2 mm; arrows shrunk to the measured ~1.9 mm triangles.

Note: [9to5Mac reported](https://9to5mac.com/2026/03/10/apples-new-macbooks-have-keyboard-change-you-might-notice-instantly/)
the M5 generation moving these keys TO glyphs; the user's direction and
their supplied scan both show word labels, which is what ships. The glyph
style remains one spec flag away (`keyboard.legends: 'icons'`).

Sheets: [images/macbook-kbd-corrected-vs-scan.png](images/macbook-kbd-corrected-vs-scan.png),
[images/macbook-kbd-modifier-row.png](images/macbook-kbd-modifier-row.png).

## F2 — Flip 7 open-state hinge crevice

Fully open, the two back panels don't meet: the retail photos show a dark
seam across the vertical middle. The open pose now draws it — a near-black
core line (~1 mm) with soft shadowed shoulders, rail to rail, slightly
proud of the glass so it reads with parallax.
Render: [images/flip7-open-crevice.png](images/flip7-open-crevice.png).

## F3 — Fold 7 open-state crevice (no more SAMSUNG stripe)

The open pose was rendering the flex-mode spine plate — a wide engraved
band down the back. On the real device the spine retracts flush at 180°,
leaving only a thin seam. The stripe and its wordmark are gone from the
open path (they still appear at partial fold angles, where the spine is
genuinely exposed); a thin crevice now separates the back panel from the
cover display. Render: [images/fold7-open-back-crevice.png](images/fold7-open-back-crevice.png).

## F4 — Fold 7 camera housing color

The vertical three-lens housing was a dark plate; the product photos show
an anodized boss in the body color, with only the lens glass dark inside
thin metallic rings. The island now uses the body color with the same
finish as the plateau under it.
Render: [images/fold7-camera-housing.png](images/fold7-camera-housing.png).

## Verification

- Typecheck (core, react, docs) and the docs production build stay green.
- Per-key measurement script re-run against the painter constants; full
  keyboard and bottom-row sheets rendered at matched angles to the scan.
- Fold/Flip open-state backs and camera close-ups rendered on light and
  dark colorways (the crevice reads on both).
