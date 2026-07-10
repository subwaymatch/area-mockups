import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { PizzaBox, type PizzaBoxProps } from './objects/pizza-box/pizza-box'
import { PIZZA_BOX } from './objects/pizza-box/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  PizzaBoxProps,
  | 'bevel'
  | 'front'
  | 'insideLid'
  | 'open'
  | 'pizza'
  | 'color'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface PizzaBoxMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Lid top design — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<PizzaBoxProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D pizza box mockup — closed on
 * the counter, or `open` with a pizza inside and the inside of the lid as
 * a third live surface.
 *
 * ```tsx
 * <PizzaBoxMockup front={<YourFrontStrip />}>
 *   <YourLidArt />
 * </PizzaBoxMockup>
 * ```
 */
export function PizzaBoxMockup({
  children,
  bevel,
  front,
  insideLid,
  open = false,
  pizza,
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
}: PizzaBoxMockupProps) {
  const object = (
    <PizzaBox
      bevel={bevel}
      front={front}
      insideLid={insideLid}
      open={open}
      pizza={pizza}
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
    </PizzaBox>
  )

  // The box sits on the counter; ground the shadow just under it. The open
  // lid stands tall, so the default camera pulls back and down a little.
  const groundY = -PIZZA_BOX.body.height / 2
  const shadowY = canvasProps.shadowY ?? (float ? groundY - 0.3 : groundY - 0.02)
  const camera = canvasProps.camera ?? (open ? { position: [0, 2.4, 9.2] as [number, number, number], fov: 40 } : { position: [0, 2.6, 7.2] as [number, number, number], fov: 40 })

  return (
    <MockupCanvas {...canvasProps} camera={camera} shadowY={shadowY}>
      {float ? <FloatGroup intensity={0.6}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
