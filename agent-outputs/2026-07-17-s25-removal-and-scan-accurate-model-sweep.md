# S25 removal + scan-accurate model sweep (S26 line, Z Flip 7, Z Fold 7, iPhone 17 trio, MacBook Pro 14)

**Date:** 2026-07-17
**Branch:** `claude/s25-removal-s26-ultra-model-jew64b`

The library now models only the **latest lines**, and every reworked device's
detail geometry — button pills, hole positions, camera islands, port cutouts,
antenna seams, badges — was measured from reference 3D scans (Sketchfab GLTF
files supplied by the maintainer) rather than eyeballed from photos.

## What changed

### Galaxy S family (`PhoneMockup`)
- **Removed** `s25`, `s25plus`, `s25ultra`, `s25edge`. `GALAXY_VARIANTS` is now
  `{ s26, s26ultra }` and the default variant is `s26`.
- **Galaxy S26** corrected to the official 149.6 × 71.7 × 7.2 mm body
  (6.3" 2340×1080, 360×780 logical) with scan-measured detail: pill island
  14.8 × 46.2 mm with three 14.4 mm rings, flash inboard at +6.2 mm, volume
  20.8 mm / power 13.7 mm keys, SIM–mic–USB–mic–speaker bottom drilling.
- **Galaxy S26 Ultra (new)** — official 163.6 × 78.1 × 7.9 mm, 6.9" 3120×1440
  (384×832 logical). From the scan: stadium pill 21.4 × 57.7 mm with three
  16.9 mm rings standing 3.3 mm proud, tele column (two 9.4 mm rings + laser AF
  dot + flash) on the flat back, volume/power pills at +40.8/+14.6 mm, S Pen
  cap + speaker + USB-C + mic + SIM bottom edge, antenna seams, SAMSUNG
  wordmark (canvas-drawn texture).
- `GalaxyPhoneSpec` gained `buttons`, `buttonProfile`, `bottomEdge`,
  `antennaLines`, `logo`, `island.raise`, and per-ring `h` protrusion.

### Galaxy Z Flip 7 (`FlipMockup` — new device)
Clamshell foldable with both poses from one spec (`FLIP_VARIANTS.flip7`):
- Open: 166.7 × 75.2 × 6.5 mm slab, 6.85" main display (360×838), centered
  punch, cover-glass upper back with the dual-lens island (27.1 × 13 mm pill,
  13.4 mm rings, flush fresnel flash), hinge seam + end-band seams.
- Closed: two 83.4 mm halves with the scan's 0.7 mm air gap, hinge band
  (10.4 mm across, 2.1 mm overhang) with engraved SAMSUNG, cover display
  316×353 with the camera island rendered as a DOM overlay so live content
  wraps around it like the real FlexWindow. USB/speaker/mic kit lands on the
  top edge when folded, exactly like the hardware.

### Galaxy Z Fold 7 (`FoldMockup` — rebuilt)
- Inner punch hole moved to its true spot (+34.9 mm into the right half; was
  +56.8), cover panel now shows (dark) on the open pose's back-left half.
- Camera rebuilt as light plateau (19.8 × 52.1 mm) + dark pill (15.2 × 48.6 mm)
  + three 15.7 mm collars; scan-true buttons (volume 18.6 mm at +28.4, power
  13.0 mm at +6.5); recessed hinge spine with vertical SAMSUNG emboss (open)
  and the 1.1 mm-proud edge band (closed); USB/speaker/mic bottom kit; antenna
  seams. Cover resolution corrected to 360×835, inner to 820×910.

### iPhone 17 family (`IPhoneMockup` — buttons and details corrected)
`IPhoneSpec` gained `buttons` (per-edge, with `flush` for Camera Control),
`buttonProfile`, `bottomEdge`, `antennaLines`, `topWindow`, `logo`, plateau
`radius`/`raise`, per-lens `h`, and flash `r`. All four variants now place the
Action/volume/side keys at scan positions with the true ~0.3–0.45 mm
protrusion, and the Camera Control sits flush in the rail:
- **17 Pro / Pro Max**: full-width plateau at measured size/raise, lens
  triangle at scan coordinates (16–16.3 mm rings), flash + mic + LiDAR column,
  flush Ceramic Shield back window (the Pro's was kept — its scan omitted it),
  USB-C + screws + 6-per-side drilled speaker holes, rail antenna strips, and
  the Pro Max's top-edge RF window. Apple badge drawn procedurally.
- **17 Air**: perfect-stadium bar (64.6 × 22.8 mm, 3 mm proud) with the single
  lens tower and flash/mic on the opposite half; near-flush buttons.
- Dynamic Island offsets tightened per scan (islands sat ~3 mm too low before).

### MacBook Pro 14" M5 (`LaptopMockup variant="pro14"` — new)
`LAPTOP_VARIANTS = { air13, pro14 }` (LAPTOP stays = air13). The Pro 14 is
built from a full scan survey: 312.6 × 221.2 mm footprint, 10.7 mm base +
3.9 mm lid, MagSafe/2×TB/jack left + HDMI/TB/SDXC right at measured z
positions, 19.1 mm feet, perforated speaker strips flanking the keyboard,
deeper 36.8 mm notch, 1512×982 default desktop, glossy lid badge and embossed
"MacBook Pro" underside wordmark. The Air also gained the lid badge.

## Verification
- Full typecheck + `npm run build` (core, react, docs) green.
- Every device screenshotted from 7 angle sets in a headless-Chromium harness
  and compared against renders of the reference GLTFs (front/back/side/bottom,
  button rails, port rows, hinge details).
- Tree-shaken import costs re-measured (`measure-size.mjs`); tables updated —
  the detail pass costs ~1–1.5 KB gzip per family (accepted trade-off per the
  maintainer's request for accuracy over size).

## Sources
- Official dimensions: Samsung/GSMArena for Galaxy S26 (149.6×71.7×7.2) and
  S26 Ultra (163.6×78.1×7.9); Apple for the iPhone 17 family and MacBook
  Pro 14; Samsung for Z Flip 7 / Z Fold 7.
- Detail geometry: maintainer-supplied Sketchfab scans (CC-licensed), measured
  with a purpose-built GLTF analysis toolkit (world-space bounding boxes,
  connected-component lens/button clustering, corner-radius circle fits).

## Follow-up pass (same day)

Maintainer feedback after reviewing against pressroom photography:

1. **Free orbit.** The shared `ORBIT` stage config no longer clamps the polar
   angle (was 0.5..π−0.5), so every mockup can be tipped fully to inspect
   bottom edges — USB-C, speaker drilling, S Pen cap — with the target still
   centered.
2. **True pill side keys.** All devices now share a `SideKey` component: an
   extruded stadium profile (semicircular ends along the key's length) with a
   crowned outer face, matching the machined keys in Samsung's S26 Ultra
   pressroom shots. Replaces the old rounded-box approximation on the Galaxy
   phones, both foldables, and all four iPhones (Camera Control stays flush).
3. **Machined lens rings.** A shared `LensRing` replaces the flat-disc stacks:
   tapered outer wall, polished chamfer shell, dark bezel funnel and truly
   recessed optics (barrel floor, coated element, glint) — used by the Galaxy
   S line, Z Fold, Z Flip and the iPhone trio.
4. **Real USB-C ports.** A shared `UsbC` renders rim ring + dark pill cavity +
   gold connector tongue on every phone/foldable bottom edge (and the folded
   Flip's top edge).
5. **SVG brand marks.** The canvas-drawn SAMSUNG text and hand-drawn apple
   are gone; the maintainer-supplied Samsung wordmark and Apple logo SVGs are
   parsed once (inlined path data, `SVGLoader`) into crisp vector geometry on
   the Galaxy backs, the foldables' hinge embosses, the iPhone backs and the
   MacBook lids (contrast-aware tone so the badge reads in every colorway).

Import costs re-measured after the detail pass: Galaxy 8.7 KB gz, iPhone
9.3 KB gz, Fold 8.7 / Flip 8.9 / Laptop 9.2 KB gz; whole library 45.3 KB gz.

## Follow-up pass 2 (same day)

Maintainer review against the reference scans' own renders:

- **USB-C rebuilt.** The proud rim-puck look is gone; ports now render as the
  scans do — a flat dark stadium cutout with a hairline seam, the receptacle
  shield faintly visible inside and the thin gold pin row deeper still
  (total relief < 0.2 mm). Shared `UsbC` used by every phone/foldable edge.
- **Lens rings rebuilt (and a real bug fixed).** The ring wall was a capped
  cylinder, so its end face silently covered the entire bore — every "recessed
  optic" was hidden behind body-colored metal. The wall is now an open tube
  closed by the chamfer shell, revealing the new interior modeled on the scans:
  charcoal barrel funnel sinking to a black aperture plate, with a glossy domed
  navy element bulging through it (its specular highlight comes free from the
  environment map). Verified with an isolated three.js harness, then across
  the Air, both Galaxy phones, both foldables and the Pro/Pro Max.

## Follow-up pass 3 (same day)

- **Full 360° tumble controls.** OrbitControls' spherical model clamps at the
  poles, so vertical rotation could never go over the top. New `TumbleOrbit`
  (core) + `TumbleControls` (react) replace it in `MockupCanvas`: horizontal
  drags spin the turntable about the world's vertical, vertical drags tumble
  the camera straight over the poles carrying its up vector along — unclamped
  360° in every direction, axis fixed at the stage center. Damping, pointer
  pinch/wheel zoom, the +/- overlay buttons and autoRotate all carry over.
  Verified with scripted Playwright drags: 90° (looking straight down at the
  bottom edge), 180° (upside-down back), 360° (returns home), yaw spin, and
  the screen drag-handoff path.
- **USB-C rebuilt as a decal.** The stacked-slab port read as onion layers up
  close; it's now a single crisp canvas-drawn decal (hairline seam,
  depth-shaded cavity, receptacle shield outline, gold pin row) flush on the
  edge — indistinguishable from the scan reference in zoomed renders.
