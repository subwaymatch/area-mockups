# area-mockups

Interactive, GPU-accelerated **3D device mockups for React** — drop any content onto the
screen of a 3D phone and it stays fully live: buttons click, videos play, iframes scroll.

Built on [three.js](https://threejs.org) and
[react-three-fiber](https://github.com/pmndrs/react-three-fiber). The starter device is a
procedurally generated Galaxy-style phone — no 3D asset files to load. Beyond devices,
the same live-surface API covers everyday objects: a hardcover book, magazine, tri-fold
brochure, business card, poster frame, billboard, and a wrap-ready cargo van. 2D
(CSS/SVG) mockups sharing the same API are on the roadmap.

```tsx
'use client'

import { PhoneMockup } from 'area-mockups'

export function Hero() {
  return (
    <PhoneMockup autoRotate float>
      <YourApp /> {/* any React node, iframe, video… */}
    </PhoneMockup>
  )
}
```

## Monorepo layout

| Path | What it is |
| --- | --- |
| [`packages/area-mockups`](packages/area-mockups) | The publishable npm package |
| [`apps/docs`](apps/docs) | Next.js docs & live demos site |

## Development

Uses npm workspaces. Node 18.18+ required.

```bash
npm install        # installs all workspaces + builds the package (prepare hook)
npm run dev        # package in watch mode + docs at http://localhost:3000
npm run build      # builds the package, then the docs site
npm run typecheck  # typechecks both workspaces
```

## Publishing the package

```bash
cd packages/area-mockups
npm publish
```

The `prepare` script builds `dist/` automatically before publish.

## License

[MIT](LICENSE) © subwaymatch
