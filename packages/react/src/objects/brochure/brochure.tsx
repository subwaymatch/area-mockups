import * as React from 'react'
import type * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { BROCHURE } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface BrochureProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Shorthand for the first (left) panel's content. */
  children?: React.ReactNode
  /**
   * Content per panel, left to right. Takes precedence over `children` where
   * provided; panels left undefined show `panelBackground`.
   */
  panels?: [React.ReactNode?, React.ReactNode?, React.ReactNode?]
  /**
   * Content for the reverse side of each panel, left to right as seen from
   * the BACK. A real tri-fold is printed on all six faces; panels left
   * undefined show bare `paperColor` stock.
   */
  backPanels?: [React.ReactNode?, React.ReactNode?, React.ReactNode?]
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
  backPanels,
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
  const occludeRefs = useScreenOccluders(...refs)

  // Zig-zag accordion: panel yaws alternate +a, -a, +a, hinged edge to edge.
  // Chaining the hinges keeps every panel center on z = 0, so the brochure
  // rotates about its own visual center.
  const a = (foldAngle * Math.PI) / 180
  const yaws = [a, -a, a]
  const layout: { x: number; z: number; yaw: number }[] = []
  const creases: { x: number; z: number }[] = []
  let hinge = { x: (-3 * panel.width * Math.cos(a)) / 2, z: (panel.width * Math.sin(a)) / 2 }
  yaws.forEach((yaw, i) => {
    // each interior hinge (a panel's shared left edge) gets a fold crease
    if (i > 0) creases.push(hinge)
    const dir = { x: Math.cos(yaw), z: -Math.sin(yaw) }
    layout.push({ x: hinge.x + (dir.x * panel.width) / 2, z: hinge.z + (dir.z * panel.width) / 2, yaw })
    hinge = { x: hinge.x + dir.x * panel.width, z: hinge.z + dir.z * panel.width }
  })

  const content = [panels?.[0] ?? children, panels?.[1], panels?.[2]]
  // back faces, indexed so backPanels reads left-to-right when viewed from behind
  const backContent = [backPanels?.[2], backPanels?.[1], backPanels?.[0]]

  const screenProps = {
    width: panel.width,
    height: panel.height,
    radius: panel.radius,
    resolution,
    background: panelBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  /**
   * Fake the paper's gentle bow with shading: each panel darkens toward its
   * receding hinge (a valley crease as seen from the front). Dead-flat evenly
   * lit facets are the giveaway of a CG fold.
   */
  const foldShade = (yaw: number): React.ReactNode =>
    foldAngle > 2 ? (
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 2147483647,
          background: `linear-gradient(${yaw > 0 ? 90 : 270}deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.13) 100%)`,
        }}
      />
    ) : undefined

  return (
    <group {...groupProps}>
      {/* fold creases: a thin paper-colored cylinder down each hinge line, so
          the folds read as continuous paper rather than butted boxes. The
          hinge positions come from the same chained layout as the panels, so
          they stay correct for any foldAngle. */}
      {creases.map(({ x, z }, i) => (
        <mesh key={`crease-${i}`} position={[x, 0, z]}>
          <cylinderGeometry args={[panel.thickness * 0.8, panel.thickness * 0.8, panel.height, 16]} />
          <meshPhysicalMaterial color={paperColor} metalness={0} roughness={0.85} />
        </mesh>
      ))}

      {layout.map(({ x, z, yaw }, i) => (
        <group key={i} position={[x, 0, z]} rotation-y={yaw}>
          {/* heavy paper stock — bare stock shows wherever a face is unprinted */}
          <mesh ref={refs[i]}>
            <boxGeometry args={[panel.width, panel.height, panel.thickness]} />
            <meshPhysicalMaterial color={paperColor} metalness={0} roughness={0.85} />
          </mesh>

          {/* the live panel: real DOM, CSS3D-transformed onto the front face */}
          <DeviceScreen
            {...screenProps}
            position={[0, 0, panel.thickness / 2 + 0.003]}
            overlay={foldShade(yaw)}
          >
            {content[i]}
          </DeviceScreen>

          {/* reverse side — only mounted when there's a design for it */}
          {backContent[i] != null && (
            <DeviceScreen
              {...screenProps}
              position={[0, 0, -panel.thickness / 2 - 0.003]}
              rotation={[0, Math.PI, 0]}
              overlay={foldShade(-yaw)}
            >
              {backContent[i]}
            </DeviceScreen>
          )}
        </group>
      ))}
    </group>
  )
}
