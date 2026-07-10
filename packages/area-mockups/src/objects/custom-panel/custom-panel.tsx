import * as React from 'react'
import type * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { CUSTOM_PANEL, customPanelScale, type CustomSizeMm } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface CustomPanelProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Front face design — any React node, full bleed. */
  children?: React.ReactNode
  /** Panel size in real millimeters: `{ width, height, thickness? }`. */
  size: CustomSizeMm
  /** Back face design. */
  back?: React.ReactNode
  /** Stock color (edges, and the back when no `back` content is set). */
  color?: string
  /** Corner rounding in millimeters. */
  cornerRadius?: number
  /** CSS background painted behind each printed face. */
  faceBackground?: string
  /** CSS pixel width of the virtual front face. Height follows the panel. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your face content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How face content hides when that face turns away from the camera.
   * `true` raycasts against the panel (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each face wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A flat rectangular panel at ANY size you specify in millimeters — foam
 * board, acrylic sign, art print, table card. The longest edge normalizes
 * to the stage, so every size fills the default camera; the mm dimensions
 * set the aspect ratio and relative thickness. Front and back are live DOM.
 * No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function CustomPanel({
  children,
  size,
  back,
  color = '#f2f1ed',
  cornerRadius = 2,
  faceBackground = '#ffffff',
  resolution = CUSTOM_PANEL.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: CustomPanelProps) {
  const scale = customPanelScale(size)
  const w = size.width * scale
  const h = size.height * scale
  const t = Math.max(0.012, (size.thickness ?? CUSTOM_PANEL.thickness) * scale)
  const radius = Math.min(cornerRadius * scale, t / 2 - 0.001, 0.2)

  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  const faceProps = {
    width: w,
    height: h,
    radius: Math.max(radius, 0),
    resolution,
    background: faceBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  return (
    <group {...groupProps}>
      <RoundedBox ref={bodyRef} args={[w, h, t]} radius={Math.max(radius, 0.004)}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.65} />
      </RoundedBox>

      <DeviceScreen {...faceProps} position={[0, 0, t / 2 + 0.003]}>
        {children}
      </DeviceScreen>
      {back != null && (
        <DeviceScreen {...faceProps} position={[0, 0, -t / 2 - 0.003]} rotation={[0, Math.PI, 0]}>
          {back}
        </DeviceScreen>
      )}
    </group>
  )
}
