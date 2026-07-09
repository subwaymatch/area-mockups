import * as React from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Phone, type PhoneProps } from './devices/phone/phone'
import { PHONE } from './devices/phone/dimensions'

type InheritedDeviceProps = Pick<
  PhoneProps,
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
 * Gentle idle float. Runs its animation at frame priority -2 — before the orbit
 * controls (-1) and before drei's `<Html>` screen sync (0) — so the DOM screen
 * is positioned from this frame's device pose and never trails the WebGL body.
 */
function FloatGroup({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<Group>(null!)
  // Random phase so multiple mockups on one page don't bob in unison.
  const [phase] = React.useState(() => Math.random() * Math.PI * 2)
  useFrame(({ clock }) => {
    const t = phase + clock.elapsedTime * 0.4
    const group = ref.current
    group.rotation.x = Math.cos(t) * 0.025
    group.rotation.y = Math.sin(t) * 0.025
    group.rotation.z = Math.sin(t) * 0.01
    group.position.y = Math.sin(t) * 0.05
  }, -2)
  return <group ref={ref}>{children}</group>
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
  dragToRotate,
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
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Phone>
  )

  // Grounded by default: the shadow plane kisses the bottom edge of the body.
  // A floating device keeps a visible hover gap below its bobbing range.
  const shadowY =
    canvasProps.shadowY ?? (float ? -(PHONE.body.height / 2 + 0.3) : -(PHONE.body.height / 2 + 0.05))

  return (
    <MockupCanvas {...canvasProps} shadowY={shadowY}>
      {float ? <FloatGroup>{device}</FloatGroup> : device}
    </MockupCanvas>
  )
}
