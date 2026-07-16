import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Laptop, type LaptopProps } from './devices/laptop/laptop'
import { LAPTOP } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedDeviceProps = Pick<
  LaptopProps,
  | 'color'
  | 'screenBackground'
  | 'resolution'
  | 'notch'
  | 'openAngle'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface LaptopMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedDeviceProps {
  /** Screen content — any React node, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the device group (position, rotation, scale…). */
  deviceProps?: Omit<LaptopProps, 'children'>
}

/**
 * Vertical offset that keeps the opened laptop (deck + raised lid) visually
 * centered on the stage origin the camera and shadow are tuned for.
 */
const STAGE_OFFSET_Y = -1.15

/**
 * The one-liner: a complete, interactive 3D MacBook Air-style laptop mockup.
 *
 * ```tsx
 * <LaptopMockup float>
 *   <YourApp />
 * </LaptopMockup>
 * ```
 */
export function LaptopMockup({
  children,
  color,
  screenBackground,
  resolution,
  notch,
  openAngle,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: LaptopMockupProps) {
  const device = (
    <Laptop
      color={color}
      screenBackground={screenBackground}
      resolution={resolution}
      notch={notch}
      openAngle={openAngle}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Laptop>
  )

  // Grounded by default: shadow just under the feet. Floating keeps a hover gap.
  const baseBottom = STAGE_OFFSET_Y - LAPTOP.base.thickness / 2 - 0.024
  const shadowY = canvasProps.shadowY ?? (float ? baseBottom - 0.22 : baseBottom)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.9, 9.6], fov: 40 }}
      shadowY={shadowY}
    >
      <group position={[0, STAGE_OFFSET_Y, 0]}>
        {float ? <FloatGroup intensity={0.7}>{device}</FloatGroup> : device}
      </group>
    </MockupCanvas>
  )
}
