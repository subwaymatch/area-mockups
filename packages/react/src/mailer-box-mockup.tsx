import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { MailerBox, type MailerBoxProps } from './objects/mailer-box/mailer-box'
import { MAILER_BOX } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  MailerBoxProps,
  | 'front'
  | 'side'
  | 'color'
  | 'tapeColor'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface MailerBoxMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Top panel design — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<MailerBoxProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D shipping-box mockup with live
 * printed panels under real-feeling packing tape.
 *
 * ```tsx
 * <MailerBoxMockup front={<YourSidePanel />}>
 *   <YourTopPanel />
 * </MailerBoxMockup>
 * ```
 */
export function MailerBoxMockup({
  children,
  front,
  side,
  color,
  tapeColor,
  faceBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: MailerBoxMockupProps) {
  const object = (
    <MailerBox
      front={front}
      side={side}
      color={color}
      tapeColor={tapeColor}
      faceBackground={faceBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </MailerBox>
  )

  // The box sits on the table; ground the shadow just under it.
  const groundY = -MAILER_BOX.body.height / 2
  const shadowY = canvasProps.shadowY ?? (float ? groundY - 0.3 : groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.8, 7.6], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.6}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
