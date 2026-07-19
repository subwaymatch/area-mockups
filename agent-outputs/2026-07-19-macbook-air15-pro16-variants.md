# MacBook Air 15" (M5) and MacBook Pro 16" variants

**Batch scope.** (H1) Add the two larger MacBooks as laptop variants, at
true relative scale, researched from current product listings.

## Specs (researched)

- **MacBook Air 15" (M5, 2026)** — 340.4 x 237.6 x 11.5 mm closed, 15.3"
  2880x1864 Liquid Retina (224 ppi), MagSafe + two Thunderbolt on the
  left, headphone jack right, four-speaker system hidden in the hinge
  (clean deck, no grilles), Sky Blue / Silver / Starlight / Midnight.
  Default scaled desktop 1440x932.
  Sources: Apple tech specs (support.apple.com/126321), EveryMac.
- **MacBook Pro 16" (M5 Pro / M5 Max, 2026)** — 355.7 x 248.1 x 16.8 mm
  closed, 16.2" 3456x2234 Liquid Retina XDR (254 ppi), same port kit as
  the 14" (MagSafe, 3x Thunderbolt 5, HDMI, SDXC, jack), wider perforated
  speaker strips, larger feet and trackpad, Space Black / Silver. Default
  scaled desktop 1728x1117.
  Sources: Apple tech specs (support.apple.com/126319), EveryMac.

## Implementation

- `air15` and `pro16` join `LAPTOP_VARIANTS` with full specs: footprint,
  display, notch, ports at the chassis-correct distances from the back
  edge, feet, logo, trackpad (~136 x 82.5 mm Air / ~160 x 99.5 mm Pro),
  and the Pro's wider (23 mm) grille strips with the same measured hole
  grid. Both reuse the scan-measured Magic Keyboard, lift-lid scoop and
  legend set — the physical keyboard is identical across the lineup.
- Colorway catalogs shared per family (`MACBOOK_AIR_COLORS`,
  `MACBOOK_PRO_COLORS`).
- Per-variant default `resolution` now maps all four real scaled
  desktops (1280 / 1440 / 1512 / 1728).
- Docs: variant picker in every laptop demo control bar, spec-table rows,
  `laptop.mdx` prop table + two new demos (Air 15 Sky Blue, Pro 16 Space
  Black).

## Renders

[images/macbook-air15-skyblue.png](images/macbook-air15-skyblue.png),
[images/macbook-air15-topdown.png](images/macbook-air15-topdown.png),
[images/macbook-pro16-spaceblack.png](images/macbook-pro16-spaceblack.png),
[images/macbook-pro16-topdown.png](images/macbook-pro16-topdown.png),
[images/macbook-pro16-ports.png](images/macbook-pro16-ports.png).

## Verification

- Typecheck (core, react, docs) and the docs production build stay green.
- Rendered hero, top-down and port-rail poses for both variants; keyboard,
  scoop, grilles and machined ports all correct at the new scales.

## Known estimates / flags

- The 16"'s grille strip width (~23 mm) and both trackpad sizes are from
  photo-derived estimates, not teardown figures.
- Keyboard well position relative to the hinge assumed constant across
  the lineup (true for the shared Magic Keyboard part).
