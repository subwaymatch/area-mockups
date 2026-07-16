import * as React from 'react'
import type * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { PIZZA_BOX } from '@area-mockups/core'
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
  [0.12, 0.24],
  [-0.02, -0.4],
]
/** Lighter melted-cheese pools breaking up the flat cheese disc: [x, z, r]. */
const CHEESE_POOLS: [number, number, number][] = [
  [-0.3, 0.1, 0.24],
  [0.34, -0.3, 0.3],
  [0.1, 0.5, 0.2],
  [-0.5, -0.42, 0.22],
  [0.55, 0.28, 0.18],
  [-0.05, -0.05, 0.26],
]
/** Blistered crust bumps around the rim: [angle rad, radial jitter, scale]. */
const CRUST_BUMPS: [number, number, number][] = [
  [0.2, 0.01, 1.1],
  [0.93, -0.02, 0.9],
  [1.7, 0.02, 1.2],
  [2.4, -0.01, 0.85],
  [3.05, 0.015, 1.05],
  [3.8, -0.02, 0.95],
  [4.5, 0.01, 1.15],
  [5.2, -0.015, 0.9],
  [5.9, 0.02, 1.0],
]

export interface PizzaBoxProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Lid top design — the hero face. Any React node, full bleed. */
  children?: React.ReactNode
  /** Design for the 45° beveled band across the lid's front edge. */
  bevel?: React.ReactNode
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
 * A procedurally built corrugated carryout pizza box in the classic
 * chain-store shape: a hollow tray with a LOW front wall and 45° chamfered
 * front corners, a lid hinged along the back whose front edge folds down as
 * a 45° beveled band before tucking inside the base — plus vent holes.
 * Closed on the counter, or flipped `open` with a procedural pizza inside.
 * The lid top, the beveled band, the front wall and the inside of the lid
 * are live DOM. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function PizzaBox({
  children,
  bevel,
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
  const { body, lid, bevel: bev, chamfer, openLean, pizza: pie, front: frontSpec, bevelFace } = PIZZA_BOX
  const lidRef = React.useRef<THREE.Mesh>(null!)
  const trayRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [lidRef, trayRef], [])

  const kraft = { color, metalness: 0, roughness: 0.85 }
  const kraftInside = { color: '#e4d4b4', metalness: 0, roughness: 0.9 }

  // Side/back walls rise to the hinge; the front wall stops where the lid's
  // beveled band lands, so the band and the wall complete the front together.
  const wallH = body.height - lid.thickness
  const wallTopY = -body.height / 2 + wallH
  const bevelBottomY = wallTopY + lid.thickness - bev.drop
  const frontWallH = bevelBottomY + body.height / 2 + 0.01
  const frontWallCenterY = -body.height / 2 + frontWallH / 2
  const chamferInset = chamfer.width / Math.SQRT2 / 2
  const bevelLength = Math.hypot(bev.drop, bev.run)

  const shared = {
    background: faceBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  return (
    <group {...groupProps}>
      {/* the tray: floor, tall back/side walls, low front wall */}
      <mesh ref={trayRef} position={[0, -body.height / 2 + 0.03, 0]}>
        <boxGeometry args={[body.width - 0.05, 0.06, body.depth - 0.05]} />
        <meshPhysicalMaterial {...kraftInside} />
      </mesh>
      <mesh position={[0, -body.height / 2 + wallH / 2, -body.depth / 2 + 0.02]}>
        <boxGeometry args={[body.width, wallH, 0.04]} />
        <meshPhysicalMaterial {...kraft} />
      </mesh>
      {/* side walls terminate where the corner chamfers begin */}
      {([1, -1] as const).map((s) => (
        <mesh key={`x${s}`} position={[s * (body.width / 2 - 0.02), -body.height / 2 + wallH / 2, -chamferInset]}>
          <boxGeometry args={[0.04, wallH, body.depth - 0.06 - 2 * chamferInset]} />
          <meshPhysicalMaterial {...kraft} />
        </mesh>
      ))}
      <mesh position={[0, frontWallCenterY, body.depth / 2 - 0.02]}>
        <boxGeometry args={[body.width - 2 * chamferInset * 2 + 0.1, frontWallH, 0.04]} />
        <meshPhysicalMaterial {...kraft} />
      </mesh>
      {/* 45° chamfered front corners, up to the beveled band */}
      {([1, -1] as const).map((s) => (
        <mesh
          key={`c${s}`}
          position={[s * (body.width / 2 - chamferInset), frontWallCenterY, body.depth / 2 - chamferInset]}
          rotation-y={s * (Math.PI / 4)}
        >
          <boxGeometry args={[chamfer.width, frontWallH, 0.04]} />
          <meshPhysicalMaterial {...kraft} />
        </mesh>
      ))}

      {/* the pizza — built to read as food, not a toy: a flattened crust ring
          with blistered bumps, a sauce ring peeking past the cheese, melted
          cheese pools, domed pepperoni and leaf-shaped basil */}
      {open && pizza && (
        <group position={[0, -body.height / 2 + 0.06 + pie.height / 2, 0]}>
          <mesh>
            <cylinderGeometry args={[pie.radius, pie.radius - 0.04, pie.height, 48]} />
            <meshPhysicalMaterial color="#e0a95c" metalness={0} roughness={0.8} />
          </mesh>
          {/* crust: flattened torus (a proud full-round ring reads as a pool
              float) plus blister bumps breaking the perfect circle */}
          <mesh rotation-x={Math.PI / 2} scale={[1, 1, 0.6]} position={[0, pie.height / 2 - 0.008, 0]}>
            <torusGeometry args={[pie.radius - pie.crust / 2, pie.crust / 2 + 0.03, 12, 48]} />
            <meshPhysicalMaterial color="#c9863f" metalness={0} roughness={0.75} />
          </mesh>
          {CRUST_BUMPS.map(([a, jr, s], i) => (
            <mesh
              key={i}
              position={[
                Math.cos(a) * (pie.radius - pie.crust / 2 + jr),
                pie.height / 2 + 0.015,
                Math.sin(a) * (pie.radius - pie.crust / 2 + jr),
              ]}
              scale={[s, 0.45, 1]}
              rotation-y={-a}
            >
              <sphereGeometry args={[pie.crust * 0.62, 16, 12]} />
              <meshPhysicalMaterial color={i % 2 ? '#b5732f' : '#d0954c'} metalness={0} roughness={0.78} />
            </mesh>
          ))}
          {/* sauce ring peeking past the cheese edge */}
          <mesh position={[0, pie.height / 2 + 0.002, 0]}>
            <cylinderGeometry args={[pie.radius - pie.crust + 0.06, pie.radius - pie.crust + 0.06, 0.014, 48]} />
            <meshPhysicalMaterial color="#b8432a" metalness={0} roughness={0.6} />
          </mesh>
          {/* cheese */}
          <mesh position={[0, pie.height / 2 + 0.01, 0]}>
            <cylinderGeometry args={[pie.radius - pie.crust, pie.radius - pie.crust, 0.02, 48]} />
            <meshPhysicalMaterial color="#e9b954" metalness={0} roughness={0.62} envMapIntensity={0.5} />
          </mesh>
          {CHEESE_POOLS.map(([x, z, r], i) => (
            <mesh key={i} position={[x * pie.radius, pie.height / 2 + 0.021, z * pie.radius]} scale={[1, 1, 0.8]}>
              <cylinderGeometry args={[r, r, 0.006, 20]} />
              <meshPhysicalMaterial color="#eec25c" metalness={0} roughness={0.55} envMapIntensity={0.5} />
            </mesh>
          ))}
          {/* pepperoni: shallow domes that sink into the cheese */}
          {PEPPERONI.map(([x, z], i) => (
            <mesh key={i} position={[x * pie.radius, pie.height / 2 + 0.018, z * pie.radius]} scale={[1, 0.16, 1]}>
              <sphereGeometry args={[0.17, 20, 12]} />
              <meshPhysicalMaterial color="#9c2a1c" metalness={0} roughness={0.55} envMapIntensity={0.5} />
            </mesh>
          ))}
          {/* basil leaves */}
          {BASIL.map(([x, z], i) => (
            <mesh
              key={i}
              position={[x * pie.radius, pie.height / 2 + 0.026, z * pie.radius]}
              rotation-y={i * 1.2}
              scale={[1, 0.12, 0.66]}
            >
              <sphereGeometry args={[0.09, 12, 8]} />
              <meshPhysicalMaterial color="#46783a" metalness={0} roughness={0.65} />
            </mesh>
          ))}
        </group>
      )}

      {/* the lid, hinged along the back top edge: flat slab, beveled front
          band, and the flap that tucks inside the base */}
      <group position={[0, wallTopY, -body.depth / 2]} rotation-x={open ? -(Math.PI / 2 + openLean) : 0}>
        <mesh ref={lidRef} position={[0, lid.thickness / 2, (body.depth - bev.run) / 2]}>
          <boxGeometry args={[body.width, lid.thickness, body.depth - bev.run]} />
          <meshPhysicalMaterial {...kraft} />
        </mesh>
        <mesh
          position={[0, lid.thickness - bev.drop / 2, body.depth - bev.run / 2]}
          rotation-x={-Math.PI / 4}
        >
          <boxGeometry args={[body.width, bevelLength, 0.04]} />
          <meshPhysicalMaterial {...kraft} />
        </mesh>
        <mesh position={[0, lid.thickness - bev.drop - lid.flap.height / 2 + 0.01, body.depth - 0.062]}>
          <boxGeometry args={[body.width - 2 * chamferInset * 2, lid.flap.height, lid.flap.thickness]} />
          <meshPhysicalMaterial {...kraftInside} />
        </mesh>
        {/* small chamfer facets carrying the corner cut up through the bevel */}
        {([1, -1] as const).map((s) => (
          <mesh
            key={`lc${s}`}
            position={[s * (body.width / 2 - chamferInset), lid.thickness - bev.drop / 2, body.depth - bev.run / 2 - chamferInset / 2]}
            rotation={[-Math.PI / 4, s * (Math.PI / 4), 0]}
          >
            <boxGeometry args={[chamfer.width, bevelLength, 0.035]} />
            <meshPhysicalMaterial {...kraft} />
          </mesh>
        ))}

        {/* live lid top */}
        {children != null && (
          <DeviceScreen
            {...shared}
            width={body.width}
            height={body.depth - bev.run}
            radius={body.radius}
            resolution={resolution}
            position={[0, lid.thickness + 0.004, (body.depth - bev.run) / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {children}
          </DeviceScreen>
        )}

        {/* live beveled band */}
        {bevel != null && (
          <DeviceScreen
            {...shared}
            width={bevelFace.width}
            height={bevelFace.height}
            radius={bevelFace.radius}
            resolution={Math.round(resolution * (bevelFace.width / body.width))}
            position={[0, lid.thickness - bev.drop / 2 + 0.02, body.depth - bev.run / 2 + 0.02]}
            rotation={[-Math.PI / 4, 0, 0]}
          >
            {bevel}
          </DeviceScreen>
        )}

        {/* inside of the lid, only exposed when open */}
        {open && insideLid != null && (
          <DeviceScreen
            {...shared}
            width={body.width - 0.1}
            height={body.depth - bev.run - 0.1}
            radius={body.radius}
            resolution={resolution}
            position={[0, -0.004, (body.depth - bev.run) / 2]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            {insideLid}
          </DeviceScreen>
        )}
      </group>

      {/* live front wall strip — stays put when the lid opens */}
      {front != null && (
        <DeviceScreen
          {...shared}
          width={frontSpec.width}
          height={frontSpec.height}
          radius={frontSpec.radius}
          resolution={Math.round(resolution * (frontSpec.width / body.width))}
          position={[0, frontWallCenterY, body.depth / 2 + 0.004]}
        >
          {front}
        </DeviceScreen>
      )}
    </group>
  )
}
