import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Watch, type WatchProps } from './devices/watch/watch'
import { WATCH_VARIANTS } from './devices/watch/dimensions'
import { FloatGroup } from './float-group'

type InheritedDeviceProps = Pick<
  WatchProps,
  | 'variant'
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
 * The one-liner: a complete, interactive 3D smartwatch mockup — Apple Watch
 * Series 11 or Galaxy Watch 8, wearing a full wristband.
 *
 * ```tsx
 * <WatchMockup variant="watch8" float>
 *   <YourWatchFace />
 * </WatchMockup>
 * ```
 */
export function WatchMockup({
  children,
  variant = 'series11',
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
      variant={variant}
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

  // Grounded under the bottom of the band loop; floating keeps a hover gap.
  const spec = WATCH_VARIANTS[variant]
  const loop = spec.band.loop
  const extent = (loop.ryFront + loop.ryBack) / 2 + spec.band.thickness / 2
  const shadowY = canvasProps.shadowY ?? (float ? -(extent + 0.25) : -(extent + 0.05))

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.4, 6.9], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.6}>{device}</FloatGroup> : device}
    </MockupCanvas>
  )
}
