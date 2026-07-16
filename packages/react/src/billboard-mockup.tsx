import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Billboard, type BillboardProps } from './objects/billboard/billboard'
import { BILLBOARD } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  BillboardProps,
  | 'color'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface BillboardMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** The creative — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<BillboardProps, 'children'>
}

/**
 * Vertical offset that keeps the billboard (face + pole) visually centered on
 * the stage origin the camera and shadow are tuned for.
 */
const STAGE_OFFSET_Y = 1.1

/**
 * The one-liner: a complete, interactive 3D highway bulletin mockup with a
 * live 14' x 48' face.
 *
 * ```tsx
 * <BillboardMockup deviceProps={{ rotation: [0, -0.2, 0] }}>
 *   <YourCreative />
 * </BillboardMockup>
 * ```
 */
export function BillboardMockup({
  children,
  color,
  faceBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: BillboardMockupProps) {
  const object = (
    <Billboard
      color={color}
      faceBackground={faceBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Billboard>
  )

  // The pole base defines the ground plane; ground the shadow just under it.
  const groundY = STAGE_OFFSET_Y - BILLBOARD.standHeight
  const shadowY = canvasProps.shadowY ?? (float ? groundY - 0.25 : groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.2, 13.6], fov: 40 }}
      shadowY={shadowY}
    >
      <group position={[0, STAGE_OFFSET_Y, 0]}>
        {float ? <FloatGroup intensity={0.4}>{object}</FloatGroup> : object}
      </group>
    </MockupCanvas>
  )
}
