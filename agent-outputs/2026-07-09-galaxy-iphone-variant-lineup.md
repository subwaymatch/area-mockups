# Full Galaxy S25 + iPhone 17 variant lineup, with per-device resolutions

**Date:** 2026-07-09
**Branch:** `claude/galaxy-s25-mobile-ui-yv12c9`

The mockup library now models **eight phones** — the complete Galaxy S25 and iPhone 17
families — as `variant` props on the existing `Phone` and `IPhone` components, plus a new
`orientation` prop (portrait/landscape) on both. Every spec below was researched against
product sources (GSMArena, Apple/Samsung spec pages, Wikipedia, teardowns) before modeling.

## Input resolutions per device (the user-facing contract)

The virtual screen — the embeddable DOM region — defaults to each device's **logical
resolution** so real app layouts and breakpoints behave correctly. `resolution` overrides
the width; aspect always stays true to the panel.

| Device | `variant` | Portrait (CSS px) | Landscape (CSS px) | Basis |
| --- | --- | --- | --- | --- |
| Galaxy S25 | `s25` | **360×780** | **780×360** | 2340×1080 panel at ⅓ (clean 3x, 480 dpi) |
| Galaxy S25+ | `s25plus` | **384×832** | **832×384** | One UI default FHD+ render @ 450 dpi (inferred from Ultra) |
| Galaxy S25 Ultra | `s25ultra` | **384×832** | **832×384** | One UI default FHD+ render @ 450 dpi (confirmed via build.prop) |
| Galaxy S25 Edge | `s25edge` | **384×832** | **832×384** | One UI default FHD+ render @ 450 dpi (inferred) |
| iPhone 17 | `17` | **402×874** | **874×402** | 2622×1206 @ 3x point grid |
| iPhone 17 Air | `air` | **420×912** | **912×420** | 2736×1260 @ 3x point grid |
| iPhone 17 Pro | `pro` | **402×874** | **874×402** | 2622×1206 @ 3x point grid |
| iPhone 17 Pro Max | `promax` | **440×956** | **956×440** | 2868×1320 @ 3x point grid |
| MacBook Air 13″ (M5) | — | — | **1280×832** | 2560×1664 @ 2x default scaled resolution |

Notes:
- Samsung ships the QHD+ models (S25+/Ultra/Edge) rendering at FHD+ by default; the Ultra's
  450 dpi density was confirmed from device build.prop data (1080×2340 ÷ 2.8125 = exactly
  384×832). Users who model the optional QHD+ mode can pass `resolution={411}` (≈411×891).
- iPhone logical grids are exact: every default rounds to the device's true point
  resolution (verified at runtime: 402×874, 420×912, 440×956 measured in-browser).
- `orientation="landscape"` lays the device on its side (camera-left pose), swaps the
  virtual viewport to the landscape numbers above, and keeps content upright — verified
  in-browser at 780×360 (S25) and 956×440 (17 Pro Max).

## Researched design data → model geometry

All variants share per-family world scales (Galaxy ~36.66 mm/unit, iPhone ~37.15 mm/unit),
so relative device sizes are true.

### Galaxy S25 family

| | S25 | S25+ | S25 Ultra | S25 Edge |
|---|---|---|---|---|
| Body (mm) | 146.9×70.5×7.2 | 158.4×75.8×7.3 | 162.8×77.6×8.2 | 158.2×75.6×5.8 |
| Display | 6.2″ 2340×1080 | 6.7″ 3120×1440 | 6.9″ 3120×1440 | 6.7″ 3120×1440 |
| Frame | aluminum | aluminum | titanium, **boxier corners** | titanium, thinnest Galaxy S |
| Rear camera | 3 floating rings + flash | 3 floating rings + flash | **5-element "Elevated Floating"**: spine of 3 large rings (UW/main/periscope), small 3× tele ring + laser AF beside it, flash at cluster bottom | **2 lenses in a pill island** with the flash flush-mounted inside it |

Modeled accordingly: the Ultra gets a visibly smaller corner radius (0.16 units vs 0.26–0.27)
and the four-ring + laser + flash array; the Edge gets the raised pill island containing
both lenses and the flash, on a 5.8 mm-equivalent body.

### iPhone 17 family

| | 17 | 17 Air | 17 Pro | 17 Pro Max |
|---|---|---|---|---|
| Body (mm) | 149.6×71.5×7.95 | 156.2×74.7×**5.64** | 150.0×71.9×8.75 | 163.4×78.0×8.75 |
| Display | 6.3″ 2622×1206 | 6.5″ 2736×1260 | 6.3″ 2622×1206 | 6.9″ 2868×1320 |
| Frame | aluminum | **titanium** | **aluminum unibody** | aluminum unibody |
| Rear camera | vertical 2-lens pill | **single 48MP lens in a full-width bar** | **full-width plateau**: triangular 3-lens cluster left, flash + LiDAR + mic right | same as Pro, scaled |
| Back | glass | full glass | aluminum + **Ceramic Shield window** (rounded-rect glass for MagSafe, lower back) | same as Pro |

Modeled accordingly: the Air is the thinnest device in the library with its horizontal
single-lens bar; the Pros get the full-width plateau with the triangle cluster
(main top-left, ultrawide bottom-left, tele mid-right viewed from the back), flash/LiDAR/mic
on the right, and the part-glass MagSafe window on the lower back. Dynamic Island is the
same physical size across the family (it's the same hardware module).

## Architecture

- `GALAXY_VARIANTS` / `IPHONE_VARIANTS` — exported, renderer-agnostic spec maps
  (body/glass/display/punch-hole-or-island/camera layout/logical resolution per variant).
  The device components render entirely from spec data; new variants are data additions.
- `orientation` — the body group rotates 90° while the screen plane counter-rotates with
  swapped dimensions, so the DOM viewport really is landscape (not rotated portrait
  content). Punch hole / Dynamic Island overlays reposition to the physical top edge
  (content-left in landscape).
- Docs: the demos page gained a **variant explorer** card (all 8 phones + orientation
  toggle on one canvas); the docs page and package README carry the resolution table.

## Verification (Playwright, headless Chromium)

```
PASS  17 portrait: 402×874        PASS  17 Air portrait: 420×912
PASS  S25 portrait: 360×780*      PASS  17 Pro portrait: 402×874
PASS  S25+ portrait: 384×832      PASS  17 Pro Max portrait: 440×956
PASS  S25 Ultra portrait: 384×832 PASS  S25 landscape: 780×360
PASS  S25 Edge portrait: 384×832  PASS  17 Pro Max landscape: 956×440
```
*first sweep hit a canvas-remount race when switching family; a targeted re-check passed.

Back-view renders reviewed against product reference for every new camera architecture
(Ultra 5-element array, Edge pill island, Air bar, Pro plateau) — images in
`agent-outputs/images/`. Interaction regressions (tap vs drag handoff, content clicks)
re-run after the refactor. `npm run typecheck` and the package build pass.

## Research flags (carried from sources)

- S25+/Edge default dp (384×832) is inferred from the Ultra's confirmed build.prop values —
  same panel class and One UI behavior, but not independently device-verified.
- The Ultra's exact ring center-to-center spacing and the Air's in-bar flash/mic order are
  synthesized from textual descriptions + our reference photos, not engineering drawings.
- Camera bump protrusion heights (all variants) come from secondary/teardown sources.
