import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { BUS_SHELTER } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { useScreenOccluders } from '../../screen/occluders'
import { LEDText, isLedText } from '../../led-text'

type GroupProps = ThreeElements['group']

export interface BusShelterProps extends Omit<GroupProps, 'children' | 'color'> {
  /** 6-sheet creative on the outward lightbox face — any React node, full bleed. */
  children?: React.ReactNode
  /** Creative on the inward (waiting-area) lightbox face. */
  inner?: React.ReactNode
  /**
   * Live RTPI arrivals display hanging under the roof — bus times, service
   * alerts, anything. Renders on a dark board facing the street. Pass an
   * array of strings for the built-in dot-matrix LED board (one row per
   * arrival, rows scroll when they overflow), a single string for a one-line
   * message — or any React node for full custom control.
   */
  arrivals?: React.ReactNode | string | string[]
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
  arrivals,
  color = '#2f333a',
  posterBackground = '#ffffff',
  resolution = BUS_SHELTER.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: BusShelterProps) {
  const { body, roof, backGlass, post, bench, lightbox, poster, flag, display, standHeight } = BUS_SHELTER
  const boxRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(boxRef)

  // Plain strings become the built-in LED arrivals board — an array is one
  // row per arrival; custom nodes pass straight through.
  const board = isLedText(arrivals) ? (
    <LEDText
      text={arrivals}
      mode={typeof arrivals === 'string' ? 'auto' : 'rows'}
      align="left"
      background="#0b0c0e"
      dotSize={3}
    />
  ) : (
    arrivals
  )

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

      {/* glass back wall: floats ~120 mm above the pavement in a slim clamp
          rail, and stops ~80 mm short of the roof */}
      <mesh position={[-0.35, floorY + 0.171 + backGlass.height / 2, -body.depth / 2 + 0.05]}>
        <boxGeometry args={[backGlass.width - lightbox.width, backGlass.height, backGlass.thickness]} />
        {glassMaterial}
      </mesh>
      <RoundedBox args={[backGlass.width - lightbox.width, 0.1, 0.08]} radius={0.02} position={[-0.35, floorY + 0.171, -body.depth / 2 + 0.05]}>
        <meshPhysicalMaterial {...steel} />
      </RoundedBox>
      {/* manifestation frit bands (~60 mm) at ~900 and ~1500 mm above ground */}
      {[1.286, 2.143].map((h) => (
        <mesh key={h} position={[-0.35, floorY + h, -body.depth / 2 + 0.05 + backGlass.thickness / 2 + 0.002]}>
          <planeGeometry args={[backGlass.width - lightbox.width - 0.1, 0.086]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.4} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}

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

      {/* bus-stop flag on a short post rising above the roof, by the lightbox end */}
      <group position={[flag.x, 0, 0]}>
        <mesh position={[0, roofY + 0.36, 0]}>
          <cylinderGeometry args={[flag.postRadius, flag.postRadius, 0.8, 14]} />
          <meshPhysicalMaterial {...steel} />
        </mesh>
        {/* double-sided sign panel facing along the sidewalk, like the lightbox */}
        <RoundedBox args={[0.045, flag.height, flag.width]} radius={0.02} position={[0, roofY + 0.51, 0]}>
          <meshPhysicalMaterial color="#e9edf2" metalness={0.1} roughness={0.5} />
        </RoundedBox>
      </group>

      {/* RTPI arrivals display hanging under the roof near the front edge */}
      {board != null && (
        <group position={[display.x, roofY - roof.thickness / 2 - display.drop - display.height / 2 - 0.05, body.depth / 2 - 0.3]}>
          {([1, -1] as const).map((s) => (
            <mesh key={s} position={[s * (display.width / 2 - 0.12), display.height / 2 + 0.05 + display.drop / 2, 0]}>
              <boxGeometry args={[0.035, display.drop + 0.1, 0.035]} />
              <meshPhysicalMaterial {...steel} />
            </mesh>
          ))}
          <RoundedBox args={[display.width + 0.09, display.height + 0.09, 0.09]} radius={0.02}>
            <meshPhysicalMaterial color="#1c1e22" metalness={0.4} roughness={0.5} />
          </RoundedBox>
          <DeviceScreen
            width={display.width}
            height={display.height}
            radius={0.01}
            resolution={display.resolution}
            position={[0, 0, 0.049]}
            background="#0b0c0e"
            interactive={interactive}
            dragToRotate={dragToRotate}
            occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
            screenStyle={screenStyle}
          >
            {board}
          </DeviceScreen>
        </group>
      )}

      {/* the 6-sheet lightbox as the end panel: pedestal to the pavement and
          header to the roof keep it structural, the cabinet a near-uniform
          ~70 mm frame around the poster */}
      <group position={[lightbox.x, -0.05, 0]}>
        <RoundedBox args={[0.3, 0.4, 0.9]} radius={0.02} position={[0, floorY + 0.05 + 0.2, 0]}>
          <meshPhysicalMaterial {...steel} />
        </RoundedBox>
        <RoundedBox args={[0.3, 0.36, 0.9]} radius={0.02} position={[0, roofY - roof.thickness / 2 + 0.05 - 0.18, 0]}>
          <meshPhysicalMaterial {...steel} />
        </RoundedBox>
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
