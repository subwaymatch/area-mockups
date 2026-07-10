import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { BUS_SHELTER } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface BusShelterProps extends Omit<GroupProps, 'children' | 'color'> {
  /** 6-sheet creative on the outward lightbox face — any React node, full bleed. */
  children?: React.ReactNode
  /** Creative on the inward (waiting-area) lightbox face. */
  inner?: React.ReactNode
  /** Street-furniture steel color (roof, posts, frames, bench). */
  color?: string
  /** CSS background painted behind the poster content (backlit white). */
  posterBackground?: string
  /** CSS pixel width of the virtual poster. Height follows the 6-sheet. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your poster content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How poster content hides when its face turns away from the camera.
   * `true` raycasts against the lightbox (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each poster wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built glass transit shelter with a backlit 6-sheet
 * advertising lightbox as its end panel: flat roof slab on slim posts, glass
 * back wall, bench — and the 1185 x 1750 mm poster live on both faces of
 * the lightbox. No 3D asset files are loaded.
 *
 * The origin is the envelope center; the pavement sits
 * `BUS_SHELTER.standHeight` below it. The lightbox faces ±X (along the
 * sidewalk) — pose the shelter in three-quarter view to feature it. Must be
 * rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function BusShelter({
  children,
  inner,
  color = '#2f333a',
  posterBackground = '#ffffff',
  resolution = BUS_SHELTER.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: BusShelterProps) {
  const { body, roof, backGlass, post, bench, lightbox, poster, standHeight } = BUS_SHELTER
  const boxRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [boxRef], [])

  const glassMaterial = (
    <meshPhysicalMaterial
      color="#b8c8d4"
      metalness={0.1}
      roughness={0.05}
      transmission={0.85}
      transparent
      opacity={0.4}
      clearcoat={1}
    />
  )
  const steel = { color, metalness: 0.65, roughness: 0.4 }

  const roofY = body.height / 2 - roof.thickness / 2
  const floorY = -standHeight

  const posterProps = {
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

  return (
    <group {...groupProps}>
      {/* flat roof slab */}
      <RoundedBox args={[roof.width, roof.thickness, roof.depth]} radius={0.03} position={[0, roofY, 0]}>
        <meshPhysicalMaterial {...steel} />
      </RoundedBox>

      {/* glass back wall in a slim bottom rail */}
      <mesh position={[-0.35, -0.08, -body.depth / 2 + 0.05]}>
        <boxGeometry args={[backGlass.width - lightbox.width, backGlass.height, backGlass.thickness]} />
        {glassMaterial}
      </mesh>
      <RoundedBox args={[backGlass.width - lightbox.width, 0.1, 0.08]} radius={0.02} position={[-0.35, floorY + 0.07, -body.depth / 2 + 0.05]}>
        <meshPhysicalMaterial {...steel} />
      </RoundedBox>

      {/* two slim posts on the back-wall line — the roof cantilevers forward,
          and the lightbox cabinet is structural at its end */}
      {([
        [-body.width / 2 + 0.9, -body.depth / 2 + 0.1],
        [1.3, -body.depth / 2 + 0.1],
      ] as const).map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, -0.05, z]}>
          <cylinderGeometry args={[post.radius, post.radius, body.height - roof.thickness, 14]} />
          <meshPhysicalMaterial {...steel} />
        </mesh>
      ))}

      {/* bench on two supports along the back wall */}
      <group position={[bench.x, 0, -body.depth / 2 + bench.depth / 2 + 0.16]}>
        <RoundedBox args={[bench.width, bench.thickness, bench.depth]} radius={0.02} position={[0, floorY + bench.height, 0]}>
          <meshPhysicalMaterial color="#6e614d" metalness={0.1} roughness={0.7} />
        </RoundedBox>
        {([1, -1] as const).map((s) => (
          <mesh key={s} position={[s * (bench.width / 2 - 0.3), floorY + bench.height / 2, 0]}>
            <boxGeometry args={[0.08, bench.height, bench.depth - 0.1]} />
            <meshPhysicalMaterial {...steel} />
          </mesh>
        ))}
      </group>

      {/* the 6-sheet lightbox standing as the end panel */}
      <group position={[lightbox.x, -0.05, 0]}>
        <RoundedBox ref={boxRef} args={[lightbox.depth, lightbox.height, lightbox.width]} radius={0.04}>
          <meshPhysicalMaterial {...steel} />
        </RoundedBox>
        {/* backlit white diffusers behind each poster */}
        {([1, -1] as const).map((s) => (
          <mesh key={s} rotation-y={s === 1 ? Math.PI / 2 : -Math.PI / 2} position-x={s * (lightbox.depth / 2 + 0.002)}>
            <planeGeometry args={[poster.width + 0.08, poster.height + 0.08]} />
            <meshPhysicalMaterial color="#f4f6f8" emissive="#eef2f6" emissiveIntensity={0.55} roughness={0.6} />
          </mesh>
        ))}

        {/* live 6-sheet posters, outward (+X) and inward (−X) */}
        <DeviceScreen {...posterProps} position={[lightbox.depth / 2 + 0.006, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          {children}
        </DeviceScreen>
        {inner != null && (
          <DeviceScreen {...posterProps} position={[-lightbox.depth / 2 - 0.006, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
            {inner}
          </DeviceScreen>
        )}
      </group>
    </group>
  )
}
