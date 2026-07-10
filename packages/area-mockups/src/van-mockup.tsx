import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Van, type VanProps } from './objects/van/van'
import { VAN } from './objects/van/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  VanProps,
  | 'streetSide'
  | 'rear'
  | 'color'
  | 'wrapBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface VanMockupProps extends Omit<MockupCanvasProps, 'children'>, InheritedObjectProps {
  /** Livery for the cargo-side wrap panel — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation (the van lifts off the road). */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<VanProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D cargo van mockup with a live
 * vinyl-wrap panel on the cargo side.
 *
 * ```tsx
 * <VanMockup deviceProps={{ rotation: [0, -0.4, 0] }}>
 *   <YourLivery />
 * </VanMockup>
 * ```
 */
export function VanMockup({
  children,
  streetSide,
  rear,
  color,
  wrapBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: VanMockupProps) {
  const object = (
    <Van
      streetSide={streetSide}
      rear={rear}
      color={color}
      wrapBackground={wrapBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Van>
  )

  // The wheels define the road plane; ground the shadow just under them.
  const shadowY = canvasProps.shadowY ?? (float ? VAN.groundY - 0.3 : VAN.groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.4, 10.6], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.5}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
