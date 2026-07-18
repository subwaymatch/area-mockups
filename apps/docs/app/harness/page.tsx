'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  FlipMockup,
  FoldMockup,
  MockupCanvas,
  MonitorMockup,
  Tablet,
  type TabletVariant,
} from 'area-mockups'

/**
 * Screenshot harness: renders one device, posed from URL params, on a plain
 * stage — no float, no controls — so Playwright can capture deterministic
 * high-resolution frames for model-vs-photo comparisons.
 *
 * Params:
 *   device      tablet | monitor | flip            (default tablet)
 *   variant     device variant id                  (tablet only)
 *   colorway    retail colorway id                 | color=#hex overrides
 *   orientation portrait | landscape               (tablet)
 *   open        1 | 0                              (flip)
 *   rx, ry      device rotation in degrees         (default 0, 0)
 *   dist        camera distance in world units     (default per device)
 *   cy          camera height                      (default 0)
 *   screen      dark | gradient                    (default gradient)
 *   shadows     1 | 0                              (default 0 — clean poses)
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

  if (device === 'monitor') {
    const dist = Number(params.get('dist') ?? 9.4)
    return (
      <MonitorMockup
        controls={false}
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
        controls={false}
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
        controls={false}
        camera={{ position: [0, cy, dist], fov: 40 }}
        shadows={shadows}
        deviceProps={{ rotation: [rx, ry, 0] }}
      >
        {screen}
      </FoldMockup>
    )
  }

  const dist = Number(params.get('dist') ?? (variant === 'tabs11ultra' ? 9.6 : 8.6))
  return (
    <MockupCanvas
      controls={false}
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
