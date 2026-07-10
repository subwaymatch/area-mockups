import * as React from 'react'
import type * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { PIZZA_BOX } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

/** Hand-placed toppings: [x, z] on the pizza, in units of the pizza radius. */
const PEPPERONI: [number, number][] = [
  [-0.42, -0.3],
  [0.18, -0.52],
  [0.52, -0.05],
  [-0.12, 0.02],
  [-0.55, 0.32],
  [0.3, 0.42],
  [-0.15, 0.58],
  [0.05, -0.18],
]
const BASIL: [number, number][] = [
  [-0.3, -0.55],
  [0.42, 0.22],
  [-0.48, 0.02],
]

export interface PizzaBoxProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Lid top design — the hero face. Any React node, full bleed. */
  children?: React.ReactNode
  /** Front wall strip design (the rim you see when boxes are stacked). */
  front?: React.ReactNode
  /** Inside-of-lid design (menu, coupon…). Rendered only when `open`. */
  insideLid?: React.ReactNode
  /** Flip the lid back against its hinge. */
  open?: boolean
  /** Serve a procedural margherita-pepperoni inside when open. */
  pizza?: boolean
  /** Corrugated stock color. */
  color?: string
  /** CSS background painted behind each printed face. */
  faceBackground?: string
  /** CSS pixel width of the virtual lid top; other faces share its dpi. */
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
 * A procedurally built corrugated pizza box in the glue-free "Michigan"
 * style: a hollow tray with chamfered front corners and a lid hinged along
 * the back wall, whose front flap tucks INSIDE the base (flush walls, no
 * shoebox overhang) — closed on the counter or flipped open with a pizza
 * inside. The lid top, the front wall and the inside of the lid are live
 * DOM. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function PizzaBox({
  children,
  front,
  insideLid,
  open = false,
  pizza = true,
  color = '#d9c6a2',
  faceBackground = '#ffffff',
  resolution = PIZZA_BOX.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: PizzaBoxProps) {
  const { body, lid, openLean, pizza: pie, front: frontSpec } = PIZZA_BOX
  const lidRef = React.useRef<THREE.Mesh>(null!)
  const trayRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [lidRef, trayRef], [])

  const kraft = { color, metalness: 0, roughness: 0.85 }
  const kraftInside = { color: '#e4d4b4', metalness: 0, roughness: 0.9 }
  const wallH = body.height - lid.thickness
  const wallTopY = -body.height / 2 + wallH

  const shared = {
    background: faceBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  return (
    <group {...groupProps}>
      {/* the tray: floor and four walls, hollow so the open box reads real */}
      <mesh ref={trayRef} position={[0, -body.height / 2 + 0.03, 0]}>
        <boxGeometry args={[body.width - 0.05, 0.06, body.depth - 0.05]} />
        <meshPhysicalMaterial {...kraftInside} />
      </mesh>
      {([1, -1] as const).map((s) => (
        <mesh key={`z${s}`} position={[0, -body.height / 2 + wallH / 2, s * (body.depth / 2 - 0.02)]}>
          <boxGeometry args={[body.width, wallH, 0.04]} />
          <meshPhysicalMaterial {...kraft} />
        </mesh>
      ))}
      {([1, -1] as const).map((s) => (
        <mesh key={`x${s}`} position={[s * (body.width / 2 - 0.02), -body.height / 2 + wallH / 2, 0]}>
          <boxGeometry args={[0.04, wallH, body.depth - 0.06]} />
          <meshPhysicalMaterial {...kraft} />
        </mesh>
      ))}
      {/* 45° chamfered front corners, as on the stock die-cut blank */}
      {([1, -1] as const).map((s) => (
        <mesh
          key={`c${s}`}
          position={[s * (body.width / 2 - 0.17), -body.height / 2 + wallH / 2, body.depth / 2 - 0.17]}
          rotation-y={s * (Math.PI / 4)}
        >
          <boxGeometry args={[0.5, wallH, 0.04]} />
          <meshPhysicalMaterial {...kraft} />
        </mesh>
      ))}

      {/* live front wall strip */}
      {front != null && (
        <DeviceScreen
          {...shared}
          width={frontSpec.width}
          height={frontSpec.height}
          radius={frontSpec.radius}
          resolution={Math.round(resolution * (frontSpec.width / body.width))}
          position={[0, -body.height / 2 + wallH / 2, body.depth / 2 + 0.004]}
        >
          {front}
        </DeviceScreen>
      )}

      {/* the pizza */}
      {open && pizza && (
        <group position={[0, -body.height / 2 + 0.06 + pie.height / 2, 0]}>
          <mesh>
            <cylinderGeometry args={[pie.radius, pie.radius - 0.04, pie.height, 40]} />
            <meshPhysicalMaterial color="#e0a95c" metalness={0} roughness={0.8} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position={[0, pie.height / 2 - 0.015, 0]}>
            <torusGeometry args={[pie.radius - pie.crust / 2, pie.crust / 2 + 0.015, 12, 40]} />
            <meshPhysicalMaterial color="#c9863f" metalness={0} roughness={0.75} />
          </mesh>
          <mesh position={[0, pie.height / 2 + 0.006, 0]}>
            <cylinderGeometry args={[pie.radius - pie.crust, pie.radius - pie.crust, 0.02, 40]} />
            <meshPhysicalMaterial color="#eebd55" metalness={0} roughness={0.7} envMapIntensity={0.5} />
          </mesh>
          {PEPPERONI.map(([x, z], i) => (
            <mesh key={i} position={[x * pie.radius, pie.height / 2 + 0.02, z * pie.radius]}>
              <cylinderGeometry args={[0.16, 0.16, 0.014, 16]} />
              <meshPhysicalMaterial color="#8f231a" metalness={0} roughness={0.7} envMapIntensity={0.5} />
            </mesh>
          ))}
          {BASIL.map(([x, z], i) => (
            <mesh key={i} position={[x * pie.radius, pie.height / 2 + 0.024, z * pie.radius]} rotation-y={i * 1.2}>
              <cylinderGeometry args={[0.08, 0.08, 0.008, 8]} />
              <meshPhysicalMaterial color="#3f6b34" metalness={0} roughness={0.7} />
            </mesh>
          ))}
        </group>
      )}

      {/* the lid, hinged along the back top edge */}
      <group position={[0, wallTopY, -body.depth / 2]} rotation-x={open ? -(Math.PI / 2 + openLean) : 0}>
        <mesh ref={lidRef} position={[0, lid.thickness / 2, body.depth / 2]}>
          <boxGeometry args={[body.width, lid.thickness, body.depth]} />
          <meshPhysicalMaterial {...kraft} />
        </mesh>
        {/* front tuck flap — seats INSIDE the base's front wall (Michigan style) */}
        <mesh position={[0, lid.thickness - lid.flap.height / 2, body.depth - 0.062]}>
          <boxGeometry args={[body.width - 0.12, lid.flap.height, lid.flap.thickness]} />
          <meshPhysicalMaterial {...kraftInside} />
        </mesh>
        {/* vent holes near the hinge */}
        {([1, -1] as const).map((s) => (
          <mesh key={s} position={[s * (body.width / 2 - 0.7), lid.thickness + 0.002, 0.5]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.06, 16]} />
            <meshBasicMaterial color="#4a3d2c" />
          </mesh>
        ))}

        {/* live lid top */}
        {children != null && (
          <DeviceScreen
            {...shared}
            width={body.width}
            height={body.depth}
            radius={body.radius}
            resolution={resolution}
            position={[0, lid.thickness + 0.004, body.depth / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {children}
          </DeviceScreen>
        )}

        {/* inside of the lid, only exposed when open */}
        {open && insideLid != null && (
          <DeviceScreen
            {...shared}
            width={body.width - 0.1}
            height={body.depth - 0.1}
            radius={body.radius}
            resolution={resolution}
            position={[0, -0.004, body.depth / 2]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            {insideLid}
          </DeviceScreen>
        )}
      </group>
    </group>
  )
}
