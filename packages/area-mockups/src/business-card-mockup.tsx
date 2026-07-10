import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { BusinessCard, type BusinessCardProps } from './objects/business-card/business-card'
import { BUSINESS_CARD } from './objects/business-card/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  BusinessCardProps,
  | 'back'
  | 'color'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface BusinessCardMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Front face design — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<BusinessCardProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D business card mockup with live
 * front (and optionally back) faces.
 *
 * ```tsx
 * <BusinessCardMockup back={<CardBack />} float>
 *   <CardFront />
 * </BusinessCardMockup>
 * ```
 */
export function BusinessCardMockup({
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
}: BusinessCardMockupProps) {
  const object = (
    <BusinessCard
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
    </BusinessCard>
  )

  const half = BUSINESS_CARD.body.height / 2
  const shadowY = canvasProps.shadowY ?? (float ? -(half + 0.25) : -(half + 0.05))

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.3, 5.6], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.6}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
