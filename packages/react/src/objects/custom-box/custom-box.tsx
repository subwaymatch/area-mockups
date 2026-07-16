import * as React from 'react'
import type * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { CUSTOM_BOX, customBoxScale, type CustomBoxSizeMm } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface CustomBoxProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Front face design — any React node, full bleed. */
  children?: React.ReactNode
  /** Box size in real millimeters: `{ width, height, depth }`. */
  size: CustomBoxSizeMm
  /** Back face design. */
  back?: React.ReactNode
  /** Left (−x) face design. */
  left?: React.ReactNode
  /** Right (+x) face design. */
  right?: React.ReactNode
  /** Top face design. */
  top?: React.ReactNode
  /** Bottom face design. */
  bottom?: React.ReactNode
  /** Stock color for unprinted faces. */
  color?: string
  /** CSS background painted behind each printed face. */
  faceBackground?: string
  /** CSS pixel width of the virtual front face; all faces share its dpi. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your face content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How face content hides when that face turns away from the camera.
   * `true` raycasts against the box (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each face wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A rectangular box at ANY size you specify in millimeters, with all six
 * faces printable as live DOM at one shared dpi. The longest edge
 * normalizes to the stage, so every size fills the default camera while
 * the mm dimensions set the true proportions. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function CustomBox({
  children,
  size,
  back,
  left,
  right,
  top,
  bottom,
  color = '#e8e5df',
  faceBackground = '#ffffff',
  resolution = CUSTOM_BOX.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: CustomBoxProps) {
  const scale = customBoxScale(size)
  const w = size.width * scale
  const h = size.height * scale
  const d = size.depth * scale
  const radius = Math.min(0.02, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)

  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])
  const pxPerUnit = resolution / w

  const shared = {
    radius,
    background: faceBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  const lift = 0.004
  const faces: {
    node: React.ReactNode
    width: number
    height: number
    position: [number, number, number]
    rotation: [number, number, number]
  }[] = [
    { node: children, width: w, height: h, position: [0, 0, d / 2 + lift], rotation: [0, 0, 0] },
    { node: back, width: w, height: h, position: [0, 0, -d / 2 - lift], rotation: [0, Math.PI, 0] },
    { node: left, width: d, height: h, position: [-w / 2 - lift, 0, 0], rotation: [0, -Math.PI / 2, 0] },
    { node: right, width: d, height: h, position: [w / 2 + lift, 0, 0], rotation: [0, Math.PI / 2, 0] },
    { node: top, width: w, height: d, position: [0, h / 2 + lift, 0], rotation: [-Math.PI / 2, 0, 0] },
    { node: bottom, width: w, height: d, position: [0, -h / 2 - lift, 0], rotation: [Math.PI / 2, 0, 0] },
  ]

  return (
    <group {...groupProps}>
      <RoundedBox ref={bodyRef} args={[w, h, d]} radius={Math.max(radius, 0.004)}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.7} />
      </RoundedBox>

      {faces.map(
        (face, i) =>
          face.node != null && (
            <DeviceScreen
              key={i}
              {...shared}
              width={face.width}
              height={face.height}
              resolution={Math.round(face.width * pxPerUnit)}
              position={face.position}
              rotation={face.rotation}
            >
              {face.node}
            </DeviceScreen>
          )
      )}
    </group>
  )
}
