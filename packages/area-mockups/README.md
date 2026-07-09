# area-mockups

Interactive, GPU-accelerated **3D device mockups for React**. Put any content on the screen
of a 3D phone — real DOM, projected onto WebGL glass, so it stays fully live: buttons click,
videos play, iframes scroll.

- **Real GPU rendering** — three.js + react-three-fiber, physically-based materials, studio
  lighting, soft shadows, clamped DPR.
- **Any content on screen** — pass React components, an `<iframe>` or a `<video>` as
  children. Pointer events, state and scrolling keep working.
- **Procedural device** — the Galaxy-style phone is generated from geometry at runtime. No
  GLB files, no hosting, no pop-in; tree-shakes to a few kilobytes.
- **Composable** — use the one-liner `<PhoneMockup>`, or drop `<Phone>` into your own
  react-three-fiber scene.

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

### `<PhoneMockup>` — all-in-one

Every `<MockupCanvas>` prop + every `<Phone>` appearance prop, plus `float` (idle floating
animation) and `deviceProps` (position/rotation/scale forwarded to the device).

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
| `resolution` | `number` | `360` | Virtual display width in CSS px (360 → 360×780) |
| `punchHole` | `boolean` | `true` | Front-camera punch hole overlay |
| `interactive` | `boolean` | `true` | Let pointer events reach the screen |
| `dragToRotate` | `boolean` | `true` | Drags starting on the screen spin the device (taps still click) |
| `occlude` | `boolean \| 'blending'` | `true` | Hide content when the device faces away |
| `screenStyle` | `CSSProperties` | — | Extra styles for the screen wrapper |

Renderer-agnostic device dimensions are exported as `PHONE` — the same data will drive the
planned 2D (CSS/SVG) renderers.

## Docs & demos

Full documentation and live demos: [github.com/subwaymatch/area-mockups](https://github.com/subwaymatch/area-mockups)

## License

MIT © subwaymatch
