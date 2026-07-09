import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Phone, type PhoneProps } from './devices/phone/phone'
import { GALAXY_VARIANTS } from './devices/phone/dimensions'
import { FloatGroup } from './float-group'

type InheritedDeviceProps = Pick<
  PhoneProps,
  | 'variant'
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

export interface PhoneMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedDeviceProps {
  /** Screen content — any React node, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the device group (position, rotation, scale…). */
  deviceProps?: Omit<PhoneProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D Phone mockup.
 *
 * ```tsx
 * <PhoneMockup autoRotate float>
 *   <YourApp />
 * </PhoneMockup>
 * ```
 */
export function PhoneMockup({
  children,
  variant = 's25',
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
}: PhoneMockupProps) {
  const device = (
    <Phone
      variant={variant}
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
    </Phone>
  )

  // Grounded by default: the shadow plane kisses the bottom edge of the body
  // (its width when lying in landscape). Floating keeps a visible hover gap.
  const body = GALAXY_VARIANTS[variant].body
  const extent = orientation === 'landscape' ? body.width : body.height
  const shadowY = canvasProps.shadowY ?? (float ? -(extent / 2 + 0.3) : -(extent / 2 + 0.05))

  return (
    <MockupCanvas {...canvasProps} shadowY={shadowY}>
      {float ? <FloatGroup>{device}</FloatGroup> : device}
    </MockupCanvas>
  )
}
