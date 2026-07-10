import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { BusShelter, type BusShelterProps } from './objects/bus-shelter/bus-shelter'
import { BUS_SHELTER } from './objects/bus-shelter/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  BusShelterProps,
  | 'inner'
  | 'arrivals'
  | 'color'
  | 'posterBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface BusShelterMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** 6-sheet creative on the outward lightbox face — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<BusShelterProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D transit shelter mockup with a backlit live 6-sheet.
 *
 * ```tsx
 * <BusShelterMockup deviceProps={{ rotation: [0, 0.6, 0] }}>
 *   <YourPoster />
 * </BusShelterMockup>
 * ```
 */
export function BusShelterMockup({
  children,
  inner,
  arrivals,
  color,
  posterBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: BusShelterMockupProps) {
  const object = (
    <BusShelter
      inner={inner}
      arrivals={arrivals}
      color={color}
      posterBackground={posterBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </BusShelter>
  )

  // The posts define the pavement; ground the shadow just under them.
  const groundY = -BUS_SHELTER.standHeight
  const shadowY = canvasProps.shadowY ?? (float ? groundY - 0.25 : groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.4, 11.4], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.35}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
