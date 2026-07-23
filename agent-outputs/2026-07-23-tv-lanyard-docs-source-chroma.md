# C-batch: TV rework + inch sizing, lanyard hardware, docs source panels, chroma maps, van polish

Third session on `claude/3d-models-led-text-lrcgbn`, addressing C1–C6.

## C1/C2 — TV rework + size in inches

- **Feet** rebuilt from LG UT8000-class product photos (media.us.lg.com
  gallery): the blade + floor-runner construction is gone; each foot is now
  an ankle block with two slim wide-splayed struts running fore and aft to
  small pads — the shallow Λ stance of current retail stands, with a slight
  outward lean seen from the front.
- **Rear input bay**: recessed panel on the electronics bulge (right side
  viewed from the back) with the entry-class loadout — HDMI ×3, USB ×2,
  LAN, optical audio, antenna coax (metal barrel).
- **`size` prop in inches**, clamped to `TV_MIN_INCHES`..`TV_MAX_INCHES`
  (32–98) via a `tvSpec(inches)` builder. Real product ratios, not uniform
  scaling: the 16:9 panel derives from the diagonal; bezel (7.6 mm), chin
  (14.6 mm), cabinet depth and ports stay physical; the feet keep a
  near-constant inset from the panel ends (they bolt into the corner
  structure) and grow only mildly (height 55→75 mm, span 230→330 mm across
  the range). Docs page retitled "TV (32–98 inch)"; harness gained
  `device=tv` with an `inches` param.

## C3 — full TSX source under every demo

- `scripts/extract-demo-sources.mjs` parses the ObjectDemo registry and
  the screens/art files, extracting each demo's JSX plus the complete
  source of every component it renders (transitively, jsdoc included) into
  `lib/demo-sources.generated.ts` (122 demos, 57 components). Runs before
  `next dev`/`next build`; output committed.
- `ObjectDemo` renders a collapsible "View the full TSX behind this demo"
  panel under every demo, highlighted with fumadocs' `DynamicCodeBlock`.

## C4 — lanyard hardware rework

The stretched-torus wire hook read wrong because the ubiquitous retail
clip is FLAT stamped steel. New chain, referenced from swivel J-hook
product photography: a flat stamped J (annular-arc extrusion) hanging
coplanar with the card, its bottom bar resting inside the slot; a thin
spring gate closing the mouth; stem → swivel barrel with collar → crimp
that swallows the strap fold (the floating fold rectangle and fake D-eye
are gone). Docs wording updated.

## C5 — chroma-key surface maps

`ChromaSurface` (broadcast green `#00b140` + the prop name) fills every
mockup-able area in a new "Mockup-able areas" section on all 31 model API
pages — 31 new `chroma-*` demos covering every content prop per object
(multi-face objects auto-rotate).

## C6 — van production polish

- Carve-outs cut tight (outline inset 0.015→0.01; handle/mirror/track
  margins halved), matching the bus's install-margin look.
- Rear taillights carved **per lamp** (six rounded rects) instead of two
  cluster blocks.
- `curbSide` named prop (children alias), `wrapOverWindows` per side
  (default `false` — cab glass is operational; `true` gives the
  perforated-film full-print look and recesses the glass under the wrap
  plane), bus-parity API.
- **`licensePlate`**: string → built-in plate face (plate type on the
  white blank, container-query sized); node → rendered as-is. Live on both
  the front recess and the rear plate.

## Verification

Typecheck (core/react/docs) and the docs production build green.
Playwright: TV front/back/43"/85" poses (feet ratios, port bay), ID-card
docs hero (new hardware), chroma map on the bus page, the open source
panel on the book page (highlighted TSX; title contrast holds), van front
plate. Evidence: `agent-outputs/images/2026-07-23-c-*.png`.

## Known estimates / flags

- TV feet/inset growth curves are fitted to the LG UT8000/Samsung DU7200
  class by eye from product photos and spec sheets, not measured drawings.
- The demo-source extractor assumes top-level components close with a
  column-0 `}` and balanced braces inside template CSS — true for the
  docs art today; a lint note in the script covers it.
- ~190 KB of demo source strings join the docs' client bundle (docs-only).
- The chroma demos label surfaces with prop names; storefront's fascia
  (`children`) plus `windowPoster` are its two live areas — other props on
  that page remain hardware colors.
