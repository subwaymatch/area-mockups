import * as React from 'react'
import type * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { BROCHURE } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface BrochureProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Shorthand for the first (left) panel's content. */
  children?: React.ReactNode
  /**
   * Content per panel, left to right. Takes precedence over `children` where
   * provided; panels left undefined show `panelBackground`.
   */
  panels?: [React.ReactNode?, React.ReactNode?, React.ReactNode?]
  /** Zig-zag fold angle in degrees. `0` lays the sheet out flat. */
  foldAngle?: number
  /** Paper color of the panel backs and edges. */
  paperColor?: string
  /** CSS background painted behind each panel's content. */
  panelBackground?: string
  /** CSS pixel width of one virtual panel. Height follows the panel aspect. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your panel content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How panel content hides when the brochure faces away from the camera.
   * `true` raycasts against the panels (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each panel wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built standing tri-fold brochure: three letter-fold panels in
 * a zig-zag accordion, each one a live full-bleed DOM surface. Pass one node
 * as `children` for the front panel, or an array of three via `panels`.
 * No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Brochure({
  children,
  panels,
  foldAngle = BROCHURE.foldAngle,
  paperColor = '#f5f4f0',
  panelBackground = '#ffffff',
  resolution = BROCHURE.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: BrochureProps) {
  const { panel } = BROCHURE
  const refs = [
    React.useRef<THREE.Mesh>(null!),
    React.useRef<THREE.Mesh>(null!),
    React.useRef<THREE.Mesh>(null!),
  ]
  const occludeRefs = React.useMemo(() => refs, refs)

  // Zig-zag accordion: panel yaws alternate +a, -a, +a, hinged edge to edge.
  // Chaining the hinges keeps every panel center on z = 0, so the brochure
  // rotates about its own visual center.
  const a = (foldAngle * Math.PI) / 180
  const yaws = [a, -a, a]
  const layout: { x: number; z: number; yaw: number }[] = []
  let hinge = { x: (-3 * panel.width * Math.cos(a)) / 2, z: (panel.width * Math.sin(a)) / 2 }
  for (const yaw of yaws) {
    const dir = { x: Math.cos(yaw), z: -Math.sin(yaw) }
    layout.push({ x: hinge.x + (dir.x * panel.width) / 2, z: hinge.z + (dir.z * panel.width) / 2, yaw })
    hinge = { x: hinge.x + dir.x * panel.width, z: hinge.z + dir.z * panel.width }
  }

  const content = [panels?.[0] ?? children, panels?.[1], panels?.[2]]

  return (
    <group {...groupProps}>
      {layout.map(({ x, z, yaw }, i) => (
        <group key={i} position={[x, 0, z]} rotation-y={yaw}>
          {/* heavy paper stock — the back face is what shows through the folds */}
          <mesh ref={refs[i]}>
            <boxGeometry args={[panel.width, panel.height, panel.thickness]} />
            <meshPhysicalMaterial color={paperColor} metalness={0} roughness={0.85} />
          </mesh>

          {/* the live panel: real DOM, CSS3D-transformed onto the front face */}
          <DeviceScreen
            width={panel.width}
            height={panel.height}
            radius={panel.radius}
            resolution={resolution}
            position={[0, 0, panel.thickness / 2 + 0.003]}
            background={panelBackground}
            interactive={interactive}
            dragToRotate={dragToRotate}
            occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
            screenStyle={screenStyle}
          >
            {content[i]}
          </DeviceScreen>
        </group>
      ))}
    </group>
  )
}
