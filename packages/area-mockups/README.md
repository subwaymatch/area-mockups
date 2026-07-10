# area-mockups

Interactive, GPU-accelerated **3D device mockups for React**. Put any content on the screen
of a 3D device — real DOM, projected onto WebGL glass, so it stays fully live: buttons click,
videos play, iframes scroll.

- **Nine devices** — the full Galaxy S25 family (S25, S25+, S25 Ultra, S25 Edge), the full
  iPhone 17 family (17, 17 Air, 17 Pro, 17 Pro Max) and a MacBook Air 13" (M5) laptop, all
  procedurally generated at runtime. No GLB files, no hosting, no pop-in — importing one
  device family costs 3.7–4.7 KB gzipped (whole library: 7.8 KB), peers excluded.
- **True-to-device screens** — each virtual display matches the real device's logical
  resolution in portrait *and* landscape (table below), so your layouts and breakpoints
  behave exactly like on the hardware.
- **Real GPU rendering** — three.js + react-three-fiber, physically-based materials, studio
  lighting, soft shadows, clamped DPR.
- **Any content on screen** — pass React components, an `<iframe>` or a `<video>` as
  children. Pointer events, state and scrolling keep working.
- **Composable** — use the one-liners `<PhoneMockup>` / `<IPhoneMockup>` / `<LaptopMockup>`,
  or drop `<Phone>` / `<IPhone>` / `<Laptop>` into your own react-three-fiber scene.

## Install

```bash
npm install area-mockups three @react-three/fiber @react-three/drei
```

React 18+ (19 recommended). `three`, `@react-three/fiber` and `@react-three/drei` are peer
dependencies.

## Quick start

```tsx
'use client'

import { PhoneMockup } from 'area-mockups'

export function Hero() {
  return (
    <div style={{ height: 560 }}>
      <PhoneMockup autoRotate float>
        <YourApp />
      </PhoneMockup>
    </div>
  )
}
```

Drag anywhere — body, background, or the screen itself — to orbit; taps and clicks on the
screen still go to your content. In Next.js, load it client-side only
(`dynamic(() => import('./mockup'), { ssr: false })`).

## Components

### `<PhoneMockup>` / `<IPhoneMockup>` / `<LaptopMockup>` — all-in-one

Every `<MockupCanvas>` prop + every corresponding device appearance prop, plus `float` (idle
floating animation) and `deviceProps` (position/rotation/scale forwarded to the device).

### `<MockupCanvas>` — the stage

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `controls` | `boolean` | `true` | Drag-to-orbit controls |
| `autoRotate` | `boolean` | `false` | Slowly orbit the camera |
| `autoRotateSpeed` | `number` | `1` | Orbit speed |
| `zoom` | `boolean` | `false` | Scroll/pinch zoom (off so pages don't lose scroll) |
| `shadows` | `boolean` | `true` | Soft contact shadow |
| `shadowY` | `number` | `-2.05` | Y of the shadow plane (grounds the device) |
| `environment` | `boolean` | `true` | Procedural studio lighting (no HDR downloads) |
| `background` | `string` | — | CSS background of the canvas |
| `camera` | r3f camera | `[0, 0.5, 7.4]`, fov 40 | Camera override |
| `dpr` | `number \| [min, max]` | `[1, 2]` | Device-pixel-ratio clamp |

### `<Phone>` — the device

Render inside any r3f `<Canvas>`. Accepts all group props (`position`, `rotation`, `scale`…).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Screen content |
| `color` | `string` | `'#101216'` | Back-panel colorway |
| `frameColor` | `string` | `'#4a4f59'` | Frame, buttons, camera rings |
| `screenBackground` | `string` | `'#000000'` | CSS background behind your content |
| `variant` | `'s25' \| 's25plus' \| 's25ultra' \| 's25edge'` | `'s25'` | Which Galaxy S25-family device (true relative sizes + per-model cameras) |
| `orientation` | `'portrait' \| 'landscape'` | `'portrait'` | Landscape lays the device sideways and swaps the virtual display |
| `resolution` | `number` | per variant | Virtual display width in CSS px (see resolution table) |
| `punchHole` | `boolean` | `true` | Front-camera punch hole overlay |
| `interactive` | `boolean` | `true` | Let pointer events reach the screen |
| `dragToRotate` | `boolean` | `true` | Drags starting on the screen spin the device (taps still click) |
| `occlude` | `boolean \| 'blending'` | `true` | Hide content when the device faces away |
| `screenStyle` | `CSSProperties` | — | Extra styles for the screen wrapper |

### `<IPhone>` — iPhone 17 family

Same API as `<Phone>`, except: `variant` is `'17' | 'air' | 'pro' | 'promax'`,
`dynamicIsland` replaces `punchHole`, and `resolution` defaults to the variant's logical
point grid (see resolution table). Camera architecture follows the real devices: two-lens
pill (17), ultra-thin single-lens bar (Air), full-width triple-lens plateau with flash +
LiDAR (Pro / Pro Max).

### `<Laptop>` — MacBook Air (M5)-style

Same screen/interaction API (`interactive`, `dragToRotate`, `occlude`, `screenStyle`), plus
`notch` (camera notch overlay), `openAngle` (lid angle, default `110`), and `resolution`
defaulting to `1280` (→ 1280×832, the Air's default scaled resolution — desktop breakpoints
apply). `color` sets the aluminum finish (Sky Blue `#aec6d9`, Starlight `#e8e0d4`,
Midnight `#2e3642`).

## Virtual screen resolutions

Every variant's screen defaults to the real device's logical resolution (CSS px):

| Device | `variant` | Portrait | Landscape | Basis |
| --- | --- | --- | --- | --- |
| Galaxy S25 | `s25` | 360×780 | 780×360 | 2340×1080 panel at ⅓ (3x) |
| Galaxy S25+ | `s25plus` | 384×832 | 832×384 | One UI default FHD+ render @ 450 dpi |
| Galaxy S25 Ultra | `s25ultra` | 384×832 | 832×384 | One UI default FHD+ render @ 450 dpi |
| Galaxy S25 Edge | `s25edge` | 384×832 | 832×384 | One UI default FHD+ render @ 450 dpi |
| iPhone 17 | `17` | 402×874 | 874×402 | 2622×1206 @ 3x point grid |
| iPhone 17 Air | `air` | 420×912 | 912×420 | 2736×1260 @ 3x point grid |
| iPhone 17 Pro | `pro` | 402×874 | 874×402 | 2622×1206 @ 3x point grid |
| iPhone 17 Pro Max | `promax` | 440×956 | 956×440 | 2868×1320 @ 3x point grid |
| MacBook Air 13" (M5) | — | — | 1280×832 | 2560×1664 @ 2x default scaled |

Renderer-agnostic device specs are exported as `GALAXY_VARIANTS`, `IPHONE_VARIANTS`,
`PHONE`, `IPHONE` and `LAPTOP` — the same data will drive the planned 2D (CSS/SVG)
renderers.

## Docs & demos

Full documentation and live demos: [github.com/subwaymatch/area-mockups](https://github.com/subwaymatch/area-mockups)

## License

MIT © subwaymatch
