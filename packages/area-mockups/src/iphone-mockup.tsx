import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { IPhone, type IPhoneProps } from './devices/iphone/iphone'
import { IPHONE } from './devices/iphone/dimensions'
import { FloatGroup } from './float-group'

type InheritedDeviceProps = Pick<
  IPhoneProps,
  | 'color'
  | 'frameColor'
  | 'screenBackground'
  | 'resolution'
  | 'dynamicIsland'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface IPhoneMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedDeviceProps {
  /** Screen content — any React node, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the device group (position, rotation, scale…). */
  deviceProps?: Omit<IPhoneProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D iPhone mockup.
 *
 * ```tsx
 * <IPhoneMockup autoRotate float>
 *   <YourApp />
 * </IPhoneMockup>
 * ```
 */
export function IPhoneMockup({
  children,
  color,
  frameColor,
  screenBackground,
  resolution,
  dynamicIsland,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: IPhoneMockupProps) {
  const device = (
    <IPhone
      color={color}
      frameColor={frameColor}
      screenBackground={screenBackground}
      resolution={resolution}
      dynamicIsland={dynamicIsland}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </IPhone>
  )

  // Grounded by default: the shadow plane kisses the bottom edge of the body.
  // A floating device keeps a visible hover gap below its bobbing range.
  const shadowY =
    canvasProps.shadowY ??
    (float ? -(IPHONE.body.height / 2 + 0.3) : -(IPHONE.body.height / 2 + 0.05))

  return (
    <MockupCanvas {...canvasProps} shadowY={shadowY}>
      {float ? <FloatGroup>{device}</FloatGroup> : device}
    </MockupCanvas>
  )
}
