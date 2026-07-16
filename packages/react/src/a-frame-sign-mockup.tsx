import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { AFrameSign, type AFrameSignProps } from './objects/a-frame-sign/a-frame-sign'
import { A_FRAME_SIGN } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  AFrameSignProps,
  | 'back'
  | 'color'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface AFrameSignMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Front panel design — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<AFrameSignProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D sidewalk A-frame sign with two live panels.
 *
 * ```tsx
 * <AFrameSignMockup back={<HoursBoard />}>
 *   <MenuBoard />
 * </AFrameSignMockup>
 * ```
 */
export function AFrameSignMockup({
  children,
  back,
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
}: AFrameSignMockupProps) {
  const object = (
    <AFrameSign
      back={back}
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
    </AFrameSign>
  )

  // The splayed legs define the pavement; ground the shadow under them.
  const tilt = (A_FRAME_SIGN.splayAngle * Math.PI) / 180
  const legY = (A_FRAME_SIGN.panel.height / 2) * Math.cos(tilt)
  const shadowY = canvasProps.shadowY ?? (float ? -(legY + 0.3) : -(legY + 0.02))

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.5, 7.8], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.5}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
