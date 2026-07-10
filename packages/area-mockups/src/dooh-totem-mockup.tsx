import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { DOOHTotem, type DOOHTotemProps } from './objects/dooh-totem/dooh-totem'
import { DOOH_TOTEM } from './objects/dooh-totem/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  DOOHTotemProps,
  | 'color'
  | 'screenBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface DOOHTotemMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** The creative — any React node on the portrait display. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<DOOHTotemProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D digital street totem with a live 9:16 display.
 *
 * ```tsx
 * <DOOHTotemMockup deviceProps={{ rotation: [0, -0.2, 0] }}>
 *   <YourCreative />
 * </DOOHTotemMockup>
 * ```
 */
export function DOOHTotemMockup({
  children,
  color,
  screenBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: DOOHTotemMockupProps) {
  const object = (
    <DOOHTotem
      color={color}
      screenBackground={screenBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </DOOHTotem>
  )

  // The plinth defines the pavement; ground the shadow just under it.
  const groundY = -DOOH_TOTEM.standHeight
  const shadowY = canvasProps.shadowY ?? (float ? groundY - 0.25 : groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.4, 9.2], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.4}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
