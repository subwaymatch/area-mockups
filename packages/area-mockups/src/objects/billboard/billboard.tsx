import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { BILLBOARD } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface BillboardProps extends Omit<GroupProps, 'children' | 'color'> {
  /** The creative — any React node. It fills the whole face, full bleed. */
  children?: React.ReactNode
  /** Steel color (panel, pole, catwalk, light fixtures). */
  color?: string
  /** CSS background painted behind your face content. */
  faceBackground?: string
  /** CSS pixel width of the virtual face. Height follows the 14:48 bulletin. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your face content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How face content hides when the billboard faces away from the camera.
   * `true` raycasts against the panel (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the face wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built highway bulletin: a 14' x 48' live face on a steel
 * panel, monopole column with foundation collar, maintenance catwalk with a
 * railing, and gooseneck floodlights along the top edge. No 3D asset files
 * are loaded.
 *
 * The group origin is the face center; the ground sits
 * `BILLBOARD.standHeight` below it. Must be rendered inside a
 * react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Billboard({
  children,
  color = '#2c313a',
  faceBackground = '#ffffff',
  resolution = BILLBOARD.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: BillboardProps) {
  const { face, panel, standHeight, pole, catwalk, lights } = BILLBOARD
  const panelRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [panelRef], [])

  const panelTop = panel.height / 2
  const steel = { color, metalness: 0.6, roughness: 0.45 }

  return (
    <group {...groupProps}>
      {/* steel face panel with trim lip */}
      <RoundedBox ref={panelRef} args={[panel.width, panel.height, panel.depth]} radius={panel.radius}>
        <meshPhysicalMaterial {...steel} />
      </RoundedBox>

      {/* monopole, torsion struts and foundation collar */}
      <mesh position={[0, (0.3 - standHeight) / 2, -pole.radius - panel.depth / 2 - 0.02]}>
        <cylinderGeometry args={[pole.radius, pole.radius, standHeight + 0.3, 24]} />
        <meshPhysicalMaterial {...steel} />
      </mesh>
      {[0.4, -0.4].map((y) => (
        <mesh key={y} position={[0, y, -panel.depth / 2 - pole.radius / 2]}>
          <boxGeometry args={[0.09, 0.09, pole.radius + 0.06]} />
          <meshPhysicalMaterial {...steel} />
        </mesh>
      ))}
      <mesh position={[0, -standHeight + pole.collarHeight / 2, -pole.radius - panel.depth / 2 - 0.02]}>
        <cylinderGeometry args={[pole.collarRadius, pole.collarRadius, pole.collarHeight, 24]} />
        <meshPhysicalMaterial {...steel} roughness={0.7} />
      </mesh>

      {/* maintenance catwalk + railing along the bottom edge */}
      <group position={[0, -panelTop - catwalk.drop, panel.depth / 2 + catwalk.depth / 2]}>
        <mesh>
          <boxGeometry args={[catwalk.width, catwalk.thickness, catwalk.depth]} />
          <meshPhysicalMaterial {...steel} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.3, catwalk.depth / 2 - 0.02]}>
          <boxGeometry args={[catwalk.width, 0.025, 0.025]} />
          <meshPhysicalMaterial {...steel} />
        </mesh>
        {[1, -1].map((side) => (
          <mesh key={side} position={[side * (catwalk.width / 2 - 0.05), 0.15, catwalk.depth / 2 - 0.02]}>
            <boxGeometry args={[0.025, 0.3, 0.025]} />
            <meshPhysicalMaterial {...steel} />
          </mesh>
        ))}
      </group>

      {/* gooseneck floodlights over the top edge */}
      {Array.from({ length: lights.count }, (_, i) => {
        const x = (i - (lights.count - 1) / 2) * (face.width / lights.count) * 0.82
        return (
          <group key={i} position={[x, panelTop, 0]}>
            <mesh position={[0, lights.rise / 2, -0.02]}>
              <boxGeometry args={[0.03, lights.rise + 0.06, 0.03]} />
              <meshPhysicalMaterial {...steel} />
            </mesh>
            <mesh position={[0, lights.rise, lights.reach / 2 - 0.02]}>
              <boxGeometry args={[0.03, 0.03, lights.reach + 0.04]} />
              <meshPhysicalMaterial {...steel} />
            </mesh>
            <group position={[0, lights.rise - 0.04, lights.reach]} rotation-x={-2.5}>
              <mesh>
                <cylinderGeometry args={[lights.radius, lights.radius * 0.72, 0.15, 16]} />
                <meshPhysicalMaterial {...steel} roughness={0.35} />
              </mesh>
              <mesh position-y={0.078}>
                <cylinderGeometry args={[lights.radius * 0.8, lights.radius * 0.8, 0.01, 16]} />
                <meshPhysicalMaterial color="#fdf6dd" emissive="#ffedb8" emissiveIntensity={0.9} />
              </mesh>
            </group>
          </group>
        )
      })}

      {/* the live face: real DOM, CSS3D-transformed onto the vinyl */}
      <DeviceScreen
        width={face.width}
        height={face.height}
        radius={face.radius}
        resolution={resolution}
        position={[0, 0, panel.depth / 2 + 0.006]}
        background={faceBackground}
        interactive={interactive}
        dragToRotate={dragToRotate}
        occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
        screenStyle={screenStyle}
      >
        {children}
      </DeviceScreen>
    </group>
  )
}
