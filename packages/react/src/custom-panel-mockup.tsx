import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { CustomPanel, type CustomPanelProps } from './objects/custom-panel/custom-panel'
import { customPanelScale } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  CustomPanelProps,
  | 'size'
  | 'back'
  | 'color'
  | 'cornerRadius'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface CustomPanelMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Front face design — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<CustomPanelProps, 'children' | 'size'>
}

/**
 * The one-liner: a flat rectangular panel mockup at any size you specify
 * in millimeters.
 *
 * ```tsx
 * <CustomPanelMockup size={{ width: 600, height: 900, thickness: 5 }}>
 *   <YourArtwork />
 * </CustomPanelMockup>
 * ```
 */
export function CustomPanelMockup({
  children,
  size,
  back,
  color,
  cornerRadius,
  faceBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: CustomPanelMockupProps) {
  const object = (
    <CustomPanel
      size={size}
      back={back}
      color={color}
      cornerRadius={cornerRadius}
      faceBackground={faceBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </CustomPanel>
  )

  // The panel stands on its bottom edge; ground the shadow just under it.
  const groundY = (-size.height * customPanelScale(size)) / 2
  const shadowY = canvasProps.shadowY ?? (float ? groundY - 0.3 : groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.5, 7.4], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.5}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
