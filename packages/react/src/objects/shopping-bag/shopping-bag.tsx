import * as React from 'react'
import type * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { SHOPPING_BAG } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface ShoppingBagProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Front face design — any React node, full bleed edge to edge. */
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
   * `true` raycasts against the bag walls (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each face wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built kraft shopping bag, hollow like the real thing: four
 * walls and a floor around an open rectangular mouth, side gussets
 * creasing inward down their centerline, and twisted-rope handles
 * arcing over the rim to glued reinforcement patches inside. The front and
 * back faces are live DOM, full bleed to the top edge. No 3D asset files
 * are loaded.
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
  const { body, wall, gusset, handle } = SHOPPING_BAG
  const frontRef = React.useRef<THREE.Mesh>(null!)
  const backRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(frontRef, backRef)

  const paper = { color, metalness: 0, roughness: 0.82 }
  const paperInside = { color: '#b08a5e', metalness: 0, roughness: 0.9 }

  // Each side gusset is two panels meeting at an inward crease down the
  // vertical centerline — the fold a standing paper bag actually has.
  const panelLength = Math.hypot(body.depth / 2, gusset)
  const panelAngle = Math.atan2(gusset, body.depth / 2)

  const faceProps = {
    width: body.width,
    height: body.height,
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
      {/* front and back walls */}
      <mesh ref={frontRef} position={[0, 0, body.depth / 2 - wall / 2]}>
        <boxGeometry args={[body.width, body.height, wall]} />
        <meshPhysicalMaterial {...paper} />
      </mesh>
      <mesh ref={backRef} position={[0, 0, -body.depth / 2 + wall / 2]}>
        <boxGeometry args={[body.width, body.height, wall]} />
        <meshPhysicalMaterial {...paper} />
      </mesh>

      {/* side gussets: two panels per side, creased inward at the centerline */}
      {([1, -1] as const).map((sx) =>
        ([1, -1] as const).map((sz) => (
          <mesh
            key={`${sx}${sz}`}
            position={[sx * (body.width / 2 - wall / 2 - gusset / 2), 0, (sz * body.depth) / 4]}
            rotation-y={sx * sz * panelAngle}
          >
            <boxGeometry args={[wall, body.height, panelLength]} />
            <meshPhysicalMaterial {...paper} />
          </mesh>
        ))
      )}

      {/* floor */}
      <mesh position={[0, -body.height / 2 + 0.03, 0]}>
        <boxGeometry args={[body.width - 0.06, 0.05, body.depth - 0.06]} />
        <meshPhysicalMaterial {...paperInside} />
      </mesh>

      {/* twisted-rope handles over the rim, with glued patches inside */}
      {([1, -1] as const).map((s) => (
        <group key={s} position={[0, body.height / 2, s * (body.depth / 2 - wall - 0.03)]}>
          <mesh scale={[1, handle.rise, 1]}>
            <torusGeometry args={[handle.radius, handle.tube, 10, 40, Math.PI]} />
            <meshPhysicalMaterial color={handleColor} metalness={0} roughness={0.8} />
          </mesh>
          {([1, -1] as const).map((x) => (
            <mesh key={x} position={[x * handle.radius, -0.17, 0]}>
              <cylinderGeometry args={[handle.tube, handle.tube, 0.34, 10]} />
              <meshPhysicalMaterial color={handleColor} metalness={0} roughness={0.8} />
            </mesh>
          ))}
          {([1, -1] as const).map((x) => (
            <mesh key={`p${x}`} position={[x * handle.radius, -0.26, -s * 0.012]} rotation-y={s === 1 ? Math.PI : 0}>
              <planeGeometry args={[handle.patch.width, handle.patch.height]} />
              <meshPhysicalMaterial color="#a67f52" metalness={0} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* live front face — full bleed to the top edge */}
      <DeviceScreen {...faceProps} position={[0, 0, body.depth / 2 + 0.004]}>
        {children}
      </DeviceScreen>

      {/* live back face */}
      {back != null && (
        <DeviceScreen {...faceProps} position={[0, 0, -body.depth / 2 - 0.004]} rotation={[0, Math.PI, 0]}>
          {back}
        </DeviceScreen>
      )}
    </group>
  )
}
