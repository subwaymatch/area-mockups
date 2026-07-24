import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { RollupBanner, type RollupBannerProps } from './objects/rollup-banner/rollup-banner'
import { ROLLUP_BANNER, rollupBannerSpec } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  RollupBannerProps,
  | 'size'
  | 'color'
  | 'graphicBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface RollupBannerMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Banner graphic — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<RollupBannerProps, 'children'>
}

/**
 * Vertical offset that keeps the banner (graphic + cassette) visually
 * centered on the stage origin.
 */
const STAGE_OFFSET_Y = 0.14

/**
 * The one-liner: a complete, interactive 3D roll-up banner stand mockup with
 * a live 850x2000 graphic.
 *
 * ```tsx
 * <RollupBannerMockup deviceProps={{ rotation: [0, 0.2, 0] }}>
 *   <YourBannerArt />
 * </RollupBannerMockup>
 * ```
 */
export function RollupBannerMockup({
  children,
  size,
  color,
  graphicBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: RollupBannerMockupProps) {
  const object = (
    <RollupBanner
      size={size}
      color={color}
      graphicBackground={graphicBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </RollupBanner>
  )

  // The cassette defines the floor; ground the shadow just under it.
  const floorY = STAGE_OFFSET_Y - (size ? rollupBannerSpec(size) : ROLLUP_BANNER).standHeight
  const shadowY = canvasProps.shadowY ?? (float ? floorY - 0.25 : floorY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.4, 8.6], fov: 40 }}
      shadowY={shadowY}
    >
      <group position={[0, STAGE_OFFSET_Y, 0]}>
        {float ? <FloatGroup intensity={0.5}>{object}</FloatGroup> : object}
      </group>
    </MockupCanvas>
  )
}
