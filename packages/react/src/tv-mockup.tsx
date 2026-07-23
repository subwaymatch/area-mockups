import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { TVSet, type TVProps } from './objects/tv/tv'
import { TV, tvSpec } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  TVProps,
  | 'size'
  | 'color'
  | 'screenBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface TVSetMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Screen content — any React node, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<TVProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D 65-inch TV mockup with a live 1920x1080 screen.
 *
 * ```tsx
 * <TVSetMockup>
 *   <YourShowreel />
 * </TVSetMockup>
 * ```
 */
export function TVSetMockup({
  children,
  size,
  color,
  screenBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: TVSetMockupProps) {
  const object = (
    <TVSet
      size={size}
      color={color}
      screenBackground={screenBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </TVSet>
  )

  // The feet define the media-stand plane; ground the shadow under them.
  const spec = size === undefined ? TV : tvSpec(size)
  const standY = 0.5 - spec.standHeight
  const shadowY = canvasProps.shadowY ?? (float ? standY - 0.25 : standY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.3, 11.6 * Math.max(1, spec.body.width / TV.body.width)], fov: 40 }}
      shadowY={shadowY}
    >
      <group position={[0, 0.5, 0]}>
        {float ? <FloatGroup intensity={0.5}>{object}</FloatGroup> : object}
      </group>
    </MockupCanvas>
  )
}
