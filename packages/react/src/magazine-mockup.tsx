import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Magazine, type MagazineProps } from './objects/magazine/magazine'
import { MAGAZINE, magazineSpec } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  MagazineProps,
  | 'back'
  | 'size'
  | 'pageColor'
  | 'backColor'
  | 'glossy'
  | 'coverBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface MagazineMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Cover art — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<MagazineProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D glossy magazine mockup with a
 * live full-bleed cover.
 *
 * ```tsx
 * <MagazineMockup float>
 *   <YourCoverArt />
 * </MagazineMockup>
 * ```
 */
export function MagazineMockup({
  children,
  back,
  size,
  pageColor,
  backColor,
  glossy,
  coverBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: MagazineMockupProps) {
  const object = (
    <Magazine
      back={back}
      size={size}
      pageColor={pageColor}
      backColor={backColor}
      glossy={glossy}
      coverBackground={coverBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Magazine>
  )

  const half = (size ? magazineSpec(size) : MAGAZINE).body.height / 2
  const shadowY = canvasProps.shadowY ?? (float ? -(half + 0.3) : -(half + 0.05))

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.5, 8.2], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.8}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
