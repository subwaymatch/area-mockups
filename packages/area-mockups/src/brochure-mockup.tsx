import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Brochure, type BrochureProps } from './objects/brochure/brochure'
import { BROCHURE } from './objects/brochure/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  BrochureProps,
  | 'panels'
  | 'backPanels'
  | 'foldAngle'
  | 'paperColor'
  | 'panelBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface BrochureMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Shorthand for the first (left) panel's content. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<BrochureProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D standing tri-fold brochure mockup
 * with three live panels.
 *
 * ```tsx
 * <BrochureMockup panels={[<Front />, <Middle />, <Back />]} />
 * ```
 */
export function BrochureMockup({
  children,
  panels,
  backPanels,
  foldAngle,
  paperColor,
  panelBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: BrochureMockupProps) {
  const object = (
    <Brochure
      panels={panels}
      backPanels={backPanels}
      foldAngle={foldAngle}
      paperColor={paperColor}
      panelBackground={panelBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Brochure>
  )

  const half = BROCHURE.panel.height / 2
  const shadowY = canvasProps.shadowY ?? (float ? -(half + 0.3) : -(half + 0.02))

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.5, 8.4], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.7}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
