import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { ShoppingBag, type ShoppingBagProps } from './objects/shopping-bag/shopping-bag'
import { SHOPPING_BAG } from './objects/shopping-bag/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  ShoppingBagProps,
  | 'back'
  | 'color'
  | 'handleColor'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface ShoppingBagMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Front face design — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<ShoppingBagProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D shopping-bag mockup with live
 * printed front and back faces.
 *
 * ```tsx
 * <ShoppingBagMockup deviceProps={{ rotation: [0, 0.35, 0] }}>
 *   <YourBagFace />
 * </ShoppingBagMockup>
 * ```
 */
export function ShoppingBagMockup({
  children,
  back,
  color,
  handleColor,
  faceBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: ShoppingBagMockupProps) {
  const object = (
    <ShoppingBag
      back={back}
      color={color}
      handleColor={handleColor}
      faceBackground={faceBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </ShoppingBag>
  )

  // The bag stands on the floor; ground the shadow just under it.
  const groundY = -SHOPPING_BAG.body.height / 2
  const shadowY = canvasProps.shadowY ?? (float ? groundY - 0.3 : groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.5, 8.6], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.5}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
