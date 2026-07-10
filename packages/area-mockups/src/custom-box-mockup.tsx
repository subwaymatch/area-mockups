import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { CustomBox, type CustomBoxProps } from './objects/custom-box/custom-box'
import { customBoxScale } from './objects/custom-box/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  CustomBoxProps,
  | 'size'
  | 'back'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'color'
  | 'faceBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface CustomBoxMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Front face design — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<CustomBoxProps, 'children' | 'size'>
}

/**
 * The one-liner: a rectangular box mockup at any size you specify in
 * millimeters, with all six faces printable.
 *
 * ```tsx
 * <CustomBoxMockup size={{ width: 250, height: 90, depth: 160 }} top={<YourLid />}>
 *   <YourFront />
 * </CustomBoxMockup>
 * ```
 */
export function CustomBoxMockup({
  children,
  size,
  back,
  left,
  right,
  top,
  bottom,
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
}: CustomBoxMockupProps) {
  const object = (
    <CustomBox
      size={size}
      back={back}
      left={left}
      right={right}
      top={top}
      bottom={bottom}
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
    </CustomBox>
  )

  // The box sits on the ground; shadow just under it.
  const groundY = (-size.height * customBoxScale(size)) / 2
  const shadowY = canvasProps.shadowY ?? (float ? groundY - 0.3 : groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 1.0, 7.8], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.5}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
