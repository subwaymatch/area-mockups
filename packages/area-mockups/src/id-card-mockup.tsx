import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { IDCard, type IDCardProps } from './objects/id-card/id-card'
import { ID_CARD } from './objects/id-card/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  IDCardProps,
  | 'back'
  | 'color'
  | 'lanyardColor'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface IDCardMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Front face design — any React node. */
  children?: React.ReactNode
  /** Gentle hanging sway idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<IDCardProps, 'children'>
}

/**
 * Vertical offset that centers the badge (card + hook, with the straps
 * running out of the top of the frame) on the stage origin.
 */
const STAGE_OFFSET_Y = -0.35

/**
 * The one-liner: a complete, interactive 3D ID badge mockup hanging from its
 * lanyard, with live front (and optionally back) faces.
 *
 * ```tsx
 * <IDCardMockup lanyardColor="#1d4ed8" back={<BadgeBack />} float>
 *   <BadgeFront />
 * </IDCardMockup>
 * ```
 */
export function IDCardMockup({
  children,
  back,
  color,
  lanyardColor,
  faceBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: IDCardMockupProps) {
  const object = (
    <IDCard
      back={back}
      color={color}
      lanyardColor={lanyardColor}
      faceBackground={faceBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </IDCard>
  )

  const cardBottom = STAGE_OFFSET_Y - ID_CARD.body.height / 2
  const shadowY = canvasProps.shadowY ?? (float ? cardBottom - 0.3 : cardBottom - 0.05)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.35, 6.2], fov: 40 }}
      shadowY={shadowY}
    >
      <group position={[0, STAGE_OFFSET_Y, 0]}>
        {float ? <FloatGroup intensity={0.6}>{object}</FloatGroup> : object}
      </group>
    </MockupCanvas>
  )
}
