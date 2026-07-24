import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { SemiTrailer, type SemiTrailerProps } from './objects/semi-trailer/semi-trailer'
import { SEMI_TRAILER } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  SemiTrailerProps,
  | 'streetSide'
  | 'rear'
  | 'color'
  | 'skirtColor'
  | 'wrapBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface SemiTrailerMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Wrap for the curb-side panel — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation (the trailer lifts off the road). */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<SemiTrailerProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D semi-trailer mockup with live
 * wrap panels on both sides and the rear doors.
 *
 * ```tsx
 * <SemiTrailerMockup deviceProps={{ rotation: [0, -0.35, 0] }}>
 *   <YourWrap />
 * </SemiTrailerMockup>
 * ```
 */
export function SemiTrailerMockup({
  children,
  streetSide,
  rear,
  color,
  skirtColor,
  wrapBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: SemiTrailerMockupProps) {
  const object = (
    <SemiTrailer
      streetSide={streetSide}
      rear={rear}
      color={color}
      skirtColor={skirtColor}
      wrapBackground={wrapBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </SemiTrailer>
  )

  // The wheels and landing gear define the road; ground the shadow under them.
  const shadowY = canvasProps.shadowY ?? (float ? SEMI_TRAILER.groundY - 0.3 : SEMI_TRAILER.groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.3, 11.8], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.5}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
