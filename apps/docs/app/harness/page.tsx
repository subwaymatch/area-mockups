'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  BusMockup,
  BusShelterMockup,
  FlipMockup,
  FoldMockup,
  Laptop,
  type LaptopVariant,
  MockupCanvas,
  MonitorMockup,
  Tablet,
  type TabletVariant,
  VanMockup,
  Watch,
  type WatchVariant,
} from 'area-mockups'

/**
 * Screenshot harness: renders one device, posed from URL params, on a plain
 * stage — no float, no controls — so Playwright can capture deterministic
 * high-resolution frames for model-vs-photo comparisons.
 *
 * Params:
 *   device      tablet | monitor | flip | fold | watch | laptop
 *               | bus | van | shelter              (default tablet)
 *   variant     device variant id                  (tablet only)
 *   colorway    retail colorway id                 | color=#hex overrides
 *   orientation portrait | landscape               (tablet)
 *   open        1 | 0                              (flip)
 *   coverage    panel | full                       (bus, van)
 *   sign        LED text; '|' splits pages         (bus destination sign)
 *   arrivals    LED text; '|' splits board rows    (shelter)
 *   rx, ry      device rotation in degrees         (default 0, 0)
 *   dist        camera distance in world units     (default per device)
 *   cy          camera height                      (default 0)
 *   screen      dark | gradient                    (default gradient)
 *   shadows     1 | 0                              (default 0 — clean poses)
 *   controls    1 | 0                              (default 0 — drag tests)
 */
function HarnessScene() {
  const params = useSearchParams()
  const device = params.get('device') ?? 'tablet'
  const variant = (params.get('variant') ?? 'ipadpro13') as TabletVariant
  const colorway = params.get('colorway') ?? undefined
  const color = params.get('color') ?? undefined
  const orientation = params.get('orientation') === 'landscape' ? 'landscape' : 'portrait'
  const rx = (Number(params.get('rx') ?? 0) * Math.PI) / 180
  const ry = (Number(params.get('ry') ?? 0) * Math.PI) / 180
  const cy = Number(params.get('cy') ?? 0)
  const shadows = params.get('shadows') === '1'
  const controls = params.get('controls') === '1'
  const screen =
    params.get('screen') === 'dark' ? (
      <div style={{ width: '100%', height: '100%', background: '#000' }} />
    ) : (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(120% 90% at 30% 20%, #3d6bb0 0%, #24406e 42%, #101d38 78%, #0a1226 100%)',
        }}
      />
    )

  if (device === 'bus') {
    const dist = Number(params.get('dist') ?? 11.8)
    const sign = params.get('sign')
    return (
      <BusMockup
        coverage={params.get('coverage') === 'full' ? 'full' : 'panel'}
        color={color}
        destinationSign={sign ? (sign.includes('|') ? sign.split('|') : sign) : undefined}
        streetSideAd={screen}
        rearAd={screen}
        interactive={false}
        dragToRotate={false}
        controls={controls}
        camera={{ position: [0, cy, dist], fov: 40 }}
        shadows={shadows}
        deviceProps={{ rotation: [rx, ry, 0] }}
      >
        {screen}
      </BusMockup>
    )
  }

  if (device === 'van') {
    const dist = Number(params.get('dist') ?? 10.6)
    return (
      <VanMockup
        coverage={params.get('coverage') === 'full' ? 'full' : 'panel'}
        color={color}
        streetSide={screen}
        rear={screen}
        interactive={false}
        dragToRotate={false}
        controls={controls}
        camera={{ position: [0, cy, dist], fov: 40 }}
        shadows={shadows}
        deviceProps={{ rotation: [rx, ry, 0] }}
      >
        {screen}
      </VanMockup>
    )
  }

  if (device === 'shelter') {
    const dist = Number(params.get('dist') ?? 11)
    const arrivals = params.get('arrivals')
    return (
      <BusShelterMockup
        arrivals={arrivals ? (arrivals.includes('|') ? arrivals.split('|') : arrivals) : undefined}
        interactive={false}
        dragToRotate={false}
        controls={controls}
        camera={{ position: [0, cy, dist], fov: 40 }}
        shadows={shadows}
        deviceProps={{ rotation: [rx, ry, 0] }}
      >
        {screen}
      </BusShelterMockup>
    )
  }

  if (device === 'monitor') {
    const dist = Number(params.get('dist') ?? 9.4)
    return (
      <MonitorMockup
        controls={controls}
        camera={{ position: [0, cy, dist], fov: 40 }}
        shadows={shadows}
        deviceProps={{ rotation: [rx, ry, 0] }}
      >
        {screen}
      </MonitorMockup>
    )
  }

  if (device === 'flip') {
    const dist = Number(params.get('dist') ?? 7.4)
    return (
      <FlipMockup
        open={params.get('open') !== '0'}
        openAngle={params.get('openAngle') ? Number(params.get('openAngle')) : undefined}
        colorway={colorway}
        color={color}
        controls={controls}
        camera={{ position: [0, cy, dist], fov: 40 }}
        shadows={shadows}
        deviceProps={{ rotation: [rx, ry, 0] }}
      >
        {screen}
      </FlipMockup>
    )
  }

  if (device === 'fold') {
    const dist = Number(params.get('dist') ?? 8.4)
    return (
      <FoldMockup
        open={params.get('open') !== '0'}
        openAngle={params.get('openAngle') ? Number(params.get('openAngle')) : undefined}
        colorway={colorway}
        color={color}
        controls={controls}
        camera={{ position: [0, cy, dist], fov: 40 }}
        shadows={shadows}
        deviceProps={{ rotation: [rx, ry, 0] }}
      >
        {screen}
      </FoldMockup>
    )
  }

  if (device === 'watch') {
    const dist = Number(params.get('dist') ?? 6.4)
    return (
      <MockupCanvas controls={controls} camera={{ position: [0, cy, dist], fov: 40 }} shadows={shadows}>
        <Watch
          variant={(params.get('wvariant') ?? 'series11') as WatchVariant}
          colorway={colorway}
          color={color}
          bandColor={params.get('bandColor') ?? undefined}
          rotation={[rx, ry, 0]}
          interactive={false}
          dragToRotate={false}
        >
          {screen}
        </Watch>
      </MockupCanvas>
    )
  }

  if (device === 'laptop') {
    const dist = Number(params.get('dist') ?? 7.6)
    return (
      <MockupCanvas controls={controls} camera={{ position: [0, cy, dist], fov: 40 }} shadows={shadows}>
        <Laptop
          variant={(params.get('lvariant') ?? 'pro14') as LaptopVariant}
          colorway={colorway}
          color={color}
          openAngle={params.get('openAngle') ? Number(params.get('openAngle')) : undefined}
          rotation={[rx, ry, 0]}
          interactive={false}
          dragToRotate={false}
        >
          {screen}
        </Laptop>
      </MockupCanvas>
    )
  }

  const dist = Number(params.get('dist') ?? (variant === 'tabs11ultra' ? 9.6 : 8.6))
  return (
    <MockupCanvas
      controls={controls}
      camera={{ position: [0, cy, dist], fov: 40 }}
      shadows={shadows}
    >
      <Tablet
        variant={variant}
        colorway={colorway}
        color={color}
        orientation={orientation}
        rotation={[rx, ry, 0]}
        interactive={false}
        dragToRotate={false}
      >
        {screen}
      </Tablet>
    </MockupCanvas>
  )
}

export default function HarnessPage() {
  return (
    <div id="harness-stage" style={{ width: '100vw', height: '100vh', background: '#f4f5f7' }}>
      <Suspense>
        <HarnessScene />
      </Suspense>
    </div>
  )
}
