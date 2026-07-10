import * as React from 'react'
import type * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { WHEATPASTE_WALL } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface WheatpasteWallProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Poster for the first (left) paste-up slot — any React node, full bleed. */
  children?: React.ReactNode
  /** Posters for the middle and right slots (the middle one overlaps its neighbors). */
  posters?: [React.ReactNode?, React.ReactNode?, React.ReactNode?]
  /** Brick color. */
  color?: string
  /** Mortar course color. */
  mortarColor?: string
  /** CSS background painted behind each poster. */
  posterBackground?: string
  /** CSS pixel width of one virtual poster. Height follows the one-sheet. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your poster content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How poster content hides when the wall faces away from the camera.
   * `true` raycasts against the wall (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each poster wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built city brick wall with up to three wheatpasted
 * one-sheet posters — each slightly tilted, overlapping, and flush against
 * the brick the way paste lays them. Every poster is live DOM. No 3D asset
 * files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function WheatpasteWall({
  children,
  posters,
  color = '#96543f',
  mortarColor = '#9a9186',
  posterBackground = '#f4f1ea',
  resolution = WHEATPASTE_WALL.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: WheatpasteWallProps) {
  const { wall, course, poster, slots } = WHEATPASTE_WALL
  const wallRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [wallRef], [])

  const courseCount = Math.floor(wall.height / course)
  const content = [posters?.[0] ?? children, posters?.[1], posters?.[2]]

  const screenProps = {
    width: poster.width,
    height: poster.height,
    radius: poster.radius,
    resolution,
    background: posterBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  // paste sheen: pasted paper picks up ripples and a wet-paste darkening at
  // the edges — a cheap gradient sells it
  const pasteOverlay = (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2147483647,
        background:
          'linear-gradient(8deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 12%), linear-gradient(172deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0) 10%), linear-gradient(115deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 40%)',
      }}
    />
  )

  return (
    <group {...groupProps}>
      {/* brick wall with mortar courses */}
      <mesh ref={wallRef}>
        <boxGeometry args={[wall.width, wall.height, wall.depth]} />
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.95} />
      </mesh>
      {Array.from({ length: courseCount }, (_, i) => (
        <mesh
          key={i}
          position={[0, -wall.height / 2 + (i + 1) * course, wall.depth / 2 + 0.001]}
        >
          <planeGeometry args={[wall.width, 0.02]} />
          <meshBasicMaterial color={mortarColor} />
        </mesh>
      ))}

      {/* older layers: ghost rectangles and torn filler paper under the hero posters */}
      {(
        [
          { x: -0.75, y: 0.35, w: 1.1, h: 1.5, tilt: -0.05, c: '#d9d2c0' },
          { x: 1.35, y: -0.35, w: 0.9, h: 1.25, tilt: 0.06, c: '#cfc6b2' },
          { x: -2.75, y: -0.6, w: 0.8, h: 1.05, tilt: 0.02, c: '#b9ab94' },
        ] as const
      ).map(({ x, y, w, h, tilt, c }, i) => (
        <mesh key={i} position={[x, y, wall.depth / 2 + 0.002]} rotation-z={tilt}>
          <planeGeometry args={[w, h]} />
          <meshPhysicalMaterial color={c} metalness={0} roughness={0.95} />
        </mesh>
      ))}

      {/* pasted posters: paper backing + live DOM, middle slot on top */}
      {slots.map(({ x, y, tilt }, i) =>
        content[i] != null ? (
          <group
            key={i}
            position={[x, y, wall.depth / 2 + 0.004 + (i === 1 ? 0.004 : 0.001)]}
            rotation-z={tilt}
          >
            <mesh position-z={-0.002}>
              <planeGeometry args={[poster.width + 0.02, poster.height + 0.02]} />
              <meshPhysicalMaterial color="#ded9cc" metalness={0} roughness={0.95} />
            </mesh>
            <DeviceScreen {...screenProps} position={[0, 0, 0.001]} overlay={pasteOverlay}>
              {content[i]}
            </DeviceScreen>
          </group>
        ) : null
      )}
    </group>
  )
}
