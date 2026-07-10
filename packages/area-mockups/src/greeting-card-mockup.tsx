import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { GreetingCard, type GreetingCardProps } from './objects/greeting-card/greeting-card'
import { GREETING_CARD } from './objects/greeting-card/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  GreetingCardProps,
  | 'backCover'
  | 'insideLeft'
  | 'insideRight'
  | 'openAngle'
  | 'color'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface GreetingCardMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Front cover design — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<GreetingCardProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D standing greeting card with four live faces.
 *
 * ```tsx
 * <GreetingCardMockup insideLeft={<Note />} insideRight={<Art />}>
 *   <Cover />
 * </GreetingCardMockup>
 * ```
 */
export function GreetingCardMockup({
  children,
  backCover,
  insideLeft,
  insideRight,
  openAngle,
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
}: GreetingCardMockupProps) {
  const object = (
    <GreetingCard
      backCover={backCover}
      insideLeft={insideLeft}
      insideRight={insideRight}
      openAngle={openAngle}
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
    </GreetingCard>
  )

  const half = GREETING_CARD.panel.height / 2
  const shadowY = canvasProps.shadowY ?? (float ? -(half + 0.3) : -(half + 0.02))

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.5, 7.6], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.6}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
