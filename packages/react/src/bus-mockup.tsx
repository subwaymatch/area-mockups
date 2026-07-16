import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Bus, type BusProps } from './objects/bus/bus'
import { BUS } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  BusProps,
  | 'streetSideAd'
  | 'rearAd'
  | 'destinationSign'
  | 'color'
  | 'adBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface BusMockupProps extends Omit<MockupCanvasProps, 'children'>, InheritedObjectProps {
  /** Creative for the king-size curb-side ad panel — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation (the bus lifts off the road). */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<BusProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D city transit bus mockup with a
 * live king-size ad panel (and optionally a live LED destination sign).
 *
 * ```tsx
 * <BusMockup destinationSign={<Route />} deviceProps={{ rotation: [0, -0.4, 0] }}>
 *   <YourCreative />
 * </BusMockup>
 * ```
 */
export function BusMockup({
  children,
  streetSideAd,
  rearAd,
  destinationSign,
  color,
  adBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: BusMockupProps) {
  const object = (
    <Bus
      streetSideAd={streetSideAd}
      rearAd={rearAd}
      destinationSign={destinationSign}
      color={color}
      adBackground={adBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Bus>
  )

  // The wheels define the road plane; ground the shadow just under them.
  const shadowY = canvasProps.shadowY ?? (float ? BUS.groundY - 0.3 : BUS.groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.3, 11.8], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.4}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
