import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Monitor, type MonitorProps } from './devices/monitor/monitor'
import { MONITOR } from '@area-mockups/core'
import { FloatGroup } from './float-group'

type InheritedDeviceProps = Pick<
  MonitorProps,
  'color' | 'screenBackground' | 'resolution' | 'interactive' | 'dragToRotate' | 'occlude' | 'screenStyle'
>

export interface MonitorMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedDeviceProps {
  /** Screen content — any React node, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the device group (position, rotation, scale…). */
  deviceProps?: Omit<MonitorProps, 'children'>
}

/**
 * Vertical offset that keeps the monitor (panel + stand) visually centered on
 * the stage origin the camera and shadow are tuned for.
 */
const STAGE_OFFSET_Y = 0.95

/**
 * The one-liner: a complete, interactive 3D Studio Display-style monitor mockup.
 *
 * ```tsx
 * <MonitorMockup>
 *   <YourApp />
 * </MonitorMockup>
 * ```
 */
export function MonitorMockup({
  children,
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
}: MonitorMockupProps) {
  const device = (
    <Monitor
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
    </Monitor>
  )

  // The stand base defines the desk plane; ground the shadow just under it.
  const deskY = STAGE_OFFSET_Y - MONITOR.standHeight
  const shadowY = canvasProps.shadowY ?? (float ? deskY - 0.25 : deskY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.3, 11.2], fov: 40 }}
      shadowY={shadowY}
    >
      <group position={[0, STAGE_OFFSET_Y, 0]}>
        {float ? <FloatGroup intensity={0.5}>{device}</FloatGroup> : device}
      </group>
    </MockupCanvas>
  )
}
