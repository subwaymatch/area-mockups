import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Tablet, type TabletProps } from './devices/tablet/tablet'
import { TABLET_VARIANTS } from './devices/tablet/dimensions'
import { FloatGroup } from './float-group'

type InheritedDeviceProps = Pick<
  TabletProps,
  | 'variant'
  | 'orientation'
  | 'color'
  | 'screenBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface TabletMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedDeviceProps {
  /** Screen content — any React node, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the device group (position, rotation, scale…). */
  deviceProps?: Omit<TabletProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D iPad Pro-style tablet mockup.
 *
 * ```tsx
 * <TabletMockup orientation="landscape" float>
 *   <YourApp />
 * </TabletMockup>
 * ```
 */
export function TabletMockup({
  children,
  variant = 'ipadpro13',
  orientation = 'portrait',
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
}: TabletMockupProps) {
  const device = (
    <Tablet
      variant={variant}
      orientation={orientation}
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
    </Tablet>
  )

  // Grounded by default; the wider landscape pose gets a further camera below.
  const body = TABLET_VARIANTS[variant].body
  const extent = orientation === 'landscape' ? body.width : body.height
  const shadowY = canvasProps.shadowY ?? (float ? -(extent / 2 + 0.3) : -(extent / 2 + 0.05))
  // The 14.6" Ultra needs a bit more room than the iPads.
  const distance = variant === 'tabs11ultra' ? 9.6 : 8.6

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.5, distance], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.8}>{device}</FloatGroup> : device}
    </MockupCanvas>
  )
}
