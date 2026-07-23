import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Book, type BookProps } from './objects/book/book'
import { BOOK, bookSpec } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  BookProps,
  | 'back'
  | 'spine'
  | 'size'
  | 'color'
  | 'pageColor'
  | 'coverBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface BookMockupProps extends Omit<MockupCanvasProps, 'children'>, InheritedObjectProps {
  /** Cover art — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<BookProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D hardcover book mockup with a live
 * full-bleed cover.
 *
 * ```tsx
 * <BookMockup color="#1f3a5f" float>
 *   <YourCoverArt />
 * </BookMockup>
 * ```
 */
export function BookMockup({
  children,
  back,
  spine,
  size,
  color,
  pageColor,
  coverBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: BookMockupProps) {
  const object = (
    <Book
      back={back}
      spine={spine}
      size={size}
      color={color}
      pageColor={pageColor}
      coverBackground={coverBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Book>
  )

  const half = (size ? bookSpec(size) : BOOK).board.height / 2
  const shadowY = canvasProps.shadowY ?? (float ? -(half + 0.3) : -(half + 0.05))

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.5, 8], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.8}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
