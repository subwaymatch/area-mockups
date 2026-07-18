import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Flip, type FlipProps } from './devices/flip/flip'
import { FLIP_VARIANTS } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedDeviceProps = Pick<
  FlipProps,
  | 'variant'
  | 'colorway'
  | 'open'
  | 'openAngle'
  | 'orientation'
  | 'color'
  | 'frameColor'
  | 'screenBackground'
  | 'resolution'
  | 'punchHole'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface FlipMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedDeviceProps {
  /** Screen content — any React node, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the device group (position, rotation, scale…). */
  deviceProps?: Omit<FlipProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D Galaxy Z Flip mockup. Open by
 * default — your content fills the tall main display.
 *
 * ```tsx
 * <FlipMockup autoRotate float>
 *   <YourApp />
 * </FlipMockup>
 *
 * <FlipMockup open={false}>
 *   <CoverWidget /> {/* folded: content on the square cover screen *\/}
 * </FlipMockup>
 * ```
 */
export function FlipMockup({
  children,
  variant = 'flip7',
  colorway,
  open = true,
  openAngle,
  orientation = 'portrait',
  color,
  frameColor,
  screenBackground,
  resolution,
  punchHole,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: FlipMockupProps) {
  const device = (
    <Flip
      variant={variant}
      colorway={colorway}
      open={open}
      openAngle={openAngle}
      orientation={orientation}
      color={color}
      frameColor={frameColor}
      screenBackground={screenBackground}
      resolution={resolution}
      punchHole={punchHole}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Flip>
  )

  // Grounded by default: the shadow plane kisses the bottom of the body — the
  // hinge band when folded, the halves' folded extent at partial angles.
  const spec = FLIP_VARIANTS[variant]
  const angle = openAngle === undefined ? (open ? 180 : 0) : Math.max(0, Math.min(180, openAngle))
  const foldCos = Math.cos((((180 - angle) / 2) * Math.PI) / 180)
  const extent =
    orientation === 'landscape'
      ? (angle > 3 ? spec.open.body.width : spec.closed.body.width)
      : angle >= 177
        ? spec.open.body.height
        : angle <= 3
          ? spec.closed.body.height + spec.hinge.overhang * 2
          : spec.closed.body.height * 2 * foldCos
  const shadowY = canvasProps.shadowY ?? (float ? -(extent / 2 + 0.3) : -(extent / 2 + 0.05))

  return (
    <MockupCanvas {...canvasProps} shadowY={shadowY}>
      {float ? <FloatGroup>{device}</FloatGroup> : device}
    </MockupCanvas>
  )
}
