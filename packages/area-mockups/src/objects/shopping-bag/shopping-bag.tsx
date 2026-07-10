import * as React from 'react'
import type * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { SHOPPING_BAG } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface ShoppingBagProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Front face design — any React node, full bleed below the cuff. */
  children?: React.ReactNode
  /** Back face design. */
  back?: React.ReactNode
  /** Bag stock color. Kraft by default; try gloss white or a brand dip. */
  color?: string
  /** Rope handle color. */
  handleColor?: string
  /** CSS background painted behind each printed face. */
  faceBackground?: string
  /** CSS pixel width of the virtual front face. Height follows the bag. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your face content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How face content hides when that face turns away from the camera.
   * `true` raycasts against the bag (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each face wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built kraft shopping bag: standing carrier with gusseted
 * sides (center crease), a fold-over cuff at the opening, twisted-rope
 * handles arcing over the top — and live DOM on the front and back faces.
 * No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function ShoppingBag({
  children,
  back,
  color = '#c19a6b',
  handleColor = '#7d6142',
  faceBackground = '#ffffff',
  resolution = SHOPPING_BAG.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: ShoppingBagProps) {
  const { body, cuff, handle } = SHOPPING_BAG
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  const faceHeight = body.height - cuff.height
  const faceY = -cuff.height / 2

  const faceProps = {
    width: body.width,
    height: faceHeight,
    radius: body.radius,
    resolution,
    background: faceBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  return (
    <group {...groupProps}>
      {/* the bag */}
      <RoundedBox ref={bodyRef} args={[body.width, body.height, body.depth]} radius={body.radius}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.82} />
      </RoundedBox>

      {/* fold-over cuff at the opening */}
      <RoundedBox args={[body.width + 0.02, cuff.height, body.depth + 0.02]} radius={body.radius} position={[0, body.height / 2 - cuff.height / 2, 0]}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.75} />
      </RoundedBox>

      {/* gusset creases: a vertical fold line down each side face */}
      {([1, -1] as const).map((s) => (
        <mesh key={s} position={[s * (body.width / 2 + 0.002), -cuff.height / 2, 0]} rotation-y={s * (Math.PI / 2)}>
          <planeGeometry args={[0.02, body.height - cuff.height - 0.1]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.15} />
        </mesh>
      ))}

      {/* twisted-paper handles: tall flat-topped U arcs anchored ~1/4 in
          from each edge, one over the front face and one over the back */}
      {([1, -1] as const).map((s) => (
        <group key={s} position={[0, body.height / 2, s * (body.depth / 2 - 0.16)]}>
          <mesh scale={[1, handle.rise, 1]}>
            <torusGeometry args={[handle.radius, handle.tube, 10, 40, Math.PI]} />
            <meshPhysicalMaterial color={handleColor} metalness={0} roughness={0.8} />
          </mesh>
          {([1, -1] as const).map((x) => (
            <mesh key={x} position={[x * handle.radius, -0.14, 0]}>
              <cylinderGeometry args={[handle.tube, handle.tube, 0.28, 10]} />
              <meshPhysicalMaterial color={handleColor} metalness={0} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* open mouth: dark kraft interior visible at the top */}
      <mesh rotation-x={-Math.PI / 2} position={[0, body.height / 2 + 0.002, 0]}>
        <planeGeometry args={[body.width - 0.12, body.depth - 0.12]} />
        <meshPhysicalMaterial color="#6f5636" metalness={0} roughness={0.95} />
      </mesh>

      {/* live front face, below the cuff */}
      <DeviceScreen {...faceProps} position={[0, faceY, body.depth / 2 + 0.004]}>
        {children}
      </DeviceScreen>

      {/* live back face */}
      {back != null && (
        <DeviceScreen {...faceProps} position={[0, faceY, -body.depth / 2 - 0.004]} rotation={[0, Math.PI, 0]}>
          {back}
        </DeviceScreen>
      )}
    </group>
  )
}
