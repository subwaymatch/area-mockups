import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { ProductBox, type ProductBoxProps } from './objects/product-box/product-box'
import { productBoxLayout } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  ProductBoxProps,
  | 'side'
  | 'top'
  | 'back'
  | 'size'
  | 'color'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface ProductBoxMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Front panel design — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<ProductBoxProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D product carton mockup with live
 * front, side, top and back panels.
 *
 * ```tsx
 * <ProductBoxMockup side={<SidePanel />} top={<TopPanel />} deviceProps={{ rotation: [0, -0.5, 0] }}>
 *   <FrontPanel />
 * </ProductBoxMockup>
 * ```
 */
export function ProductBoxMockup({
  children,
  side,
  top,
  back,
  size,
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
}: ProductBoxMockupProps) {
  const object = (
    <ProductBox
      side={side}
      top={top}
      back={back}
      size={size}
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
    </ProductBox>
  )

  const half = productBoxLayout(size).body.height / 2
  const shadowY = canvasProps.shadowY ?? (float ? -(half + 0.3) : -(half + 0.02))

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.6, 8.2], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.7}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
