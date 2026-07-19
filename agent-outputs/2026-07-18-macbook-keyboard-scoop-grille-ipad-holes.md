# MacBook keyboard rebuilt in full detail, machined lift-lid scoop, perforated speaker grilles, and exact A16 hole counts

**Batch scope.** Four user requests: (E1) the MacBook keyboards lacked
detail — replicate them from the Air M5 keyboard screenshots, the supplied
MacBook Pro 14" (M5) 3D scan, and product photography; (E2) the lift-lid
"paved portion" at the deck's front-center was inaccurate; (E3) the Pro's
speaker strips rendered as a flat gray patch instead of many drilled
holes; (E4) the iPad (A16) bottom-edge hole counts didn't match the
reference model.

## Scan measurements (ground truth for E1–E3)

The supplied Pro 14 scan was measured programmatically (world-space part
boxes + per-part vertex clustering at 1 unit = 1 m):

- **Key grid**: six FULL-height rows (the function row matches the others),
  18.8 mm x-pitch / 18.5 mm row pitch, 15.9 mm-deep caps, 2.5 mm gaps,
  3–3.3 mm well margins; cap tops sit flush with the deck (+0.3 mm).
- **Arrows**: half-height inverted-T (◀ ▼ ▶ on the bottom half, ▲ above ▼).
- **Lift-lid scoop**: 54.5 mm wide crescent, biting 2.5 mm into the front
  face at deck level and fading out 3.9 mm down, rounded ends.
- **Speaker grille**: two full-length strips (15.4 x 106.4 mm) whose tile
  texture resolves to a ~1.0 x 0.93 mm grid of ~0.63 mm holes.

## E1 — the keyboard

Rebuilt `buildKeyboardLayout` + the legends painter from scratch:

- Standard 14.5u US layout at the measured pitches; instanced caps (one
  draw call) with tighter corner radius per the scan.
- **Legends** painted into one 2048px canvas layer: centered letters,
  stacked shift-symbol pairs on the number/punctuation keys, corner words
  (`esc`, `delete`, `tab`, `caps lock` with its indicator dot, `return`,
  `shift`), modifier keys with symbol-over-word (^ control, ⌥ option,
  ⌘ command), globe + fn, F1–F12 with hand-drawn media icons (brightness,
  Mission Control, Spotlight, dictation, Focus, transport, volume) over
  the F-number, home-row nubs under F and J, solid-triangle arrows.
- All non-ASCII glyphs (⌘ ⌥ ⇧ ⇪ ⇥ ⌫ ⏎, globe, media icons) are drawn as
  canvas paths — no font-fallback roulette.
- **Per-variant legend style**: the Pro 14 prints words (matching the
  scan); the Air M5 prints the glyph style seen in the user's screenshots
  (⇥ tab, ⇪ caps, ⇧ shifts, ⌫ delete, ⏎ return) via
  `keyboard.legends: 'text' | 'icons'` in the core spec.
- Touch ID is a recessed glossy disc + hairline ring on the full-height
  top-right key.

Side-by-side: [images/macbook-kbd-pro14-vs-scan.png](images/macbook-kbd-pro14-vs-scan.png),
[images/macbook-kbd-air13-icons.png](images/macbook-kbd-air13-icons.png).

## E2 — lift-lid scoop

The old model faked the scoop with a floating gray cylinder lying on the
front edge. It is now a true machined cut: a horizontal capsule half-buried
at deck level is CSG-subtracted from the base in the same boolean pass as
the ports, producing the scan's crescent — deepest (2.5 mm) at the deck
surface, fading to nothing 3.9 mm down the front face, rounded ends,
aluminum interior. Spec'd per variant (`scoop: { width, radius, bite }`).
Render: [images/macbook-scoop.png](images/macbook-scoop.png).

## E3 — perforated speaker grilles

The flat dark planes are replaced by a transparent canvas texture painted
with the scan's hole grid (~1.0 x 0.93 mm pitch, 0.63 mm holes, with a
faint lower-edge glint per hole for the countersink). The aluminum deck
shows through between holes, so the strips read as drilled metal rather
than a decal — in both space black and the light finishes.
Comparison: [images/macbook-grille-vs-scan.png](images/macbook-grille-vs-scan.png).

## E4 — iPad (A16) speaker hole counts

Counted programmatically from straight-on edge renders of the reference
model: **bottom edge 12 + 12 holes** (2.76 mm pitch, runs spanning
33.4–65.6 mm from center), **top edge 12 + 9** — the top-right run stops
three holes short where the top button interrupts it. The spec previously
drew 14 per run at a slightly tighter pitch on both edges symmetrically.
Now: `count: 12, spacing: 0.0431, xs: ±0.773, topTrim: 3` with the
renderer dropping trimmed holes from the outer (button) end only.
Verified side-by-side: [images/ipad11-bottom-holes-vs-reference.png](images/ipad11-bottom-holes-vs-reference.png),
[images/ipad11-top-holes-vs-reference.png](images/ipad11-top-holes-vs-reference.png).

## Other improvements

- Keycaps now sit flush with the deck (they floated ~2 mm proud before).
- The screenshot harness gained a `device=laptop` mode (variant, colorway,
  openAngle, rotation) for reproducible MacBook captures.

## Verification

- Typecheck (core, react, docs) and the docs production build stay green.
- Playwright captures at matched angles against the scan: top-down
  keyboard, deck 3/4, front edge, grille close-up, both iPad edges.
- Hole-count assertion on the rendered model edges: 12/12 bottom, 12/9 top.

## Known estimates / flags

- Media-icon shapes (moon, mute, Mission Control) are hand-drawn
  approximations of Apple's glyphs — recognizable at render sizes, not
  glyph-exact.
- The Air M5 keyboard uses the Pro-measured pitches scaled into its
  slightly narrower well (no Air scan was provided).
- The scan's grille perforation stops ~40 mm short of the well's front on
  the internal speaker meshes, but its visible deck texture runs the full
  well depth, which is what the model reproduces.
