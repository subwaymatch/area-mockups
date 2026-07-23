import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { PosterFrame, type PosterFrameProps } from './objects/poster-frame/poster-frame'
import { POSTER_FRAME, posterFrameSpec } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  PosterFrameProps,
  | 'size'
  | 'color'
  | 'mat'
  | 'matColor'
  | 'glazing'
  | 'posterBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface PosterFrameMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Poster art — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<PosterFrameProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D gallery poster frame mockup with
 * a live 18" x 24" sheet.
 *
 * ```tsx
 * <PosterFrameMockup color="#22262e">
 *   <YourPosterArt />
 * </PosterFrameMockup>
 * ```
 */
export function PosterFrameMockup({
  children,
  size,
  color,
  mat,
  matColor,
  glazing,
  posterBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: PosterFrameMockupProps) {
  const object = (
    <PosterFrame
      size={size}
      color={color}
      mat={mat}
      matColor={matColor}
      glazing={glazing}
      posterBackground={posterBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </PosterFrame>
  )

  const spec = size ? posterFrameSpec(size) : POSTER_FRAME
  const half = (spec.poster.height + spec.frame.width * 2) / 2
  const shadowY = canvasProps.shadowY ?? (float ? -(half + 0.3) : -(half + 0.05))

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.5, 8.8], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.7}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
