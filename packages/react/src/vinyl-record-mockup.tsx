import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { VinylRecord, type VinylRecordProps } from './objects/vinyl-record/vinyl-record'
import { VINYL_RECORD } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  VinylRecordProps,
  | 'back'
  | 'label'
  | 'backLabel'
  | 'vinylColor'
  | 'color'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface VinylRecordMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Album cover art — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<VinylRecordProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D vinyl LP mockup: live cover, back and disc label.
 *
 * ```tsx
 * <VinylRecordMockup label={<Label />} float>
 *   <CoverArt />
 * </VinylRecordMockup>
 * ```
 */
export function VinylRecordMockup({
  children,
  back,
  label,
  backLabel,
  vinylColor,
  color,
  faceBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: VinylRecordMockupProps) {
  const object = (
    <VinylRecord
      back={back}
      label={label}
      backLabel={backLabel}
      vinylColor={vinylColor}
      color={color}
      faceBackground={faceBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </VinylRecord>
  )

  const half = VINYL_RECORD.sleeve.size / 2
  const shadowY = canvasProps.shadowY ?? (float ? -(half + 0.3) : -(half + 0.05))

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.4, 8.4], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.7}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
