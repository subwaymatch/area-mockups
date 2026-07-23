import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Storefront, type StorefrontProps } from './objects/storefront/storefront'
import { STOREFRONT } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  StorefrontProps,
  | 'windowPoster'
  | 'leftSign'
  | 'rightSign'
  | 'rearSign'
  | 'color'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface StorefrontMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Fascia sign design — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<StorefrontProps, 'children'>
}

/**
 * The one-liner: a complete, interactive free-standing 3D shop mockup with
 * live fascia signs on all four glazed elevations plus the window poster.
 *
 * ```tsx
 * <StorefrontMockup windowPoster={<YourPoster />} rearSign={<YourSign />}>
 *   <YourSign />
 * </StorefrontMockup>
 * ```
 */
export function StorefrontMockup({
  children,
  windowPoster,
  leftSign,
  rightSign,
  rearSign,
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
}: StorefrontMockupProps) {
  const object = (
    <Storefront
      windowPoster={windowPoster}
      leftSign={leftSign}
      rightSign={rightSign}
      rearSign={rearSign}
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
    </Storefront>
  )

  // The façade stands on the pavement; ground the shadow just under it.
  const groundY = -STOREFRONT.standHeight
  const shadowY = canvasProps.shadowY ?? (float ? groundY - 0.25 : groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.4, 10.6], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.35}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
