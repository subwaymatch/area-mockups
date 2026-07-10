import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { WheatpasteWall, type WheatpasteWallProps } from './objects/wheatpaste-wall/wheatpaste-wall'
import { WHEATPASTE_WALL } from './objects/wheatpaste-wall/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  WheatpasteWallProps,
  | 'posters'
  | 'color'
  | 'mortarColor'
  | 'posterBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface WheatpasteWallMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Poster for the first paste-up slot — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<WheatpasteWallProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D brick-wall mockup with up to
 * three wheatpasted live posters.
 *
 * ```tsx
 * <WheatpasteWallMockup posters={[<PosterA />, <PosterB />, <PosterC />]} />
 * ```
 */
export function WheatpasteWallMockup({
  children,
  posters,
  color,
  mortarColor,
  posterBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: WheatpasteWallMockupProps) {
  const object = (
    <WheatpasteWall
      posters={posters}
      color={color}
      mortarColor={mortarColor}
      posterBackground={posterBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </WheatpasteWall>
  )

  // The wall meets the sidewalk at its base; ground the shadow just under it.
  const groundY = -WHEATPASTE_WALL.wall.height / 2
  const shadowY = canvasProps.shadowY ?? (float ? groundY - 0.25 : groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.3, 11.0], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.35}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
