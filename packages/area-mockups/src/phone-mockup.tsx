import * as React from 'react'
import { Float } from '@react-three/drei'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Phone, type PhoneProps } from './devices/phone/phone'

type InheritedDeviceProps = Pick<
  PhoneProps,
  | 'color'
  | 'frameColor'
  | 'screenBackground'
  | 'resolution'
  | 'punchHole'
  | 'interactive'
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
  color,
  frameColor,
  screenBackground,
  resolution,
  punchHole,
  interactive,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: PhoneMockupProps) {
  const device = (
    <Phone
      color={color}
      frameColor={frameColor}
      screenBackground={screenBackground}
      resolution={resolution}
      punchHole={punchHole}
      interactive={interactive}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Phone>
  )

  return (
    <MockupCanvas {...canvasProps}>
      {float ? (
        <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.5}>
          {device}
        </Float>
      ) : (
        device
      )}
    </MockupCanvas>
  )
}
