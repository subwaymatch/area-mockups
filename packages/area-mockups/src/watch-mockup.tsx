import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Watch, type WatchProps } from './devices/watch/watch'
import { WATCH } from './devices/watch/dimensions'
import { FloatGroup } from './float-group'

type InheritedDeviceProps = Pick<
  WatchProps,
  | 'color'
  | 'bandColor'
  | 'screenBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface WatchMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedDeviceProps {
  /** Screen content — any React node, a <video>… */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the device group (position, rotation, scale…). */
  deviceProps?: Omit<WatchProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D Apple Watch-style mockup.
 *
 * ```tsx
 * <WatchMockup float>
 *   <YourWatchFace />
 * </WatchMockup>
 * ```
 */
export function WatchMockup({
  children,
  color,
  bandColor,
  screenBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: WatchMockupProps) {
  const device = (
    <Watch
      color={color}
      bandColor={bandColor}
      screenBackground={screenBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Watch>
  )

  // Grounded under the lower strap tip; floating keeps a hover gap.
  const extent = WATCH.body.height / 2 + WATCH.band.length + 0.4
  const shadowY = canvasProps.shadowY ?? (float ? -(extent + 0.25) : -extent)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.4, 6.6], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.6}>{device}</FloatGroup> : device}
    </MockupCanvas>
  )
}
