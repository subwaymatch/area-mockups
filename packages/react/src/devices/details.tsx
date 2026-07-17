import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { roundedRectShape } from '@area-mockups/core'

/**
 * Shared machined hardware details used across the device models: side keys,
 * camera lens rings and USB-C ports. Everything is procedural geometry.
 */

/**
 * A side key as a true stadium pill: semicircular ends along its length and a
 * softly crowned outer face — like the machined keys on the retail hardware.
 * Sits on the `side` rail (`1` right, `-1` left), seated `seat` deep into the
 * frame and protruding `protrusion` beyond it.
 */
export function SideKey({
  side,
  railX,
  y,
  z = 0,
  length,
  thickness,
  protrusion,
  color,
  flush = false,
}: {
  side: 1 | -1
  /** Rail face |x| (usually body.width / 2). */
  railX: number
  y: number
  z?: number
  length: number
  thickness: number
  protrusion: number
  color: string
  /** Flush keys (Camera Control) sit in the rail with a glossier face. */
  flush?: boolean
}) {
  const crown = 0.01
  const seat = 0.05
  const geometry = React.useMemo(() => {
    // Long axis along shape-y so the extrusion (+z) can be rotated onto +x.
    const shape = roundedRectShape(thickness, length, thickness / 2 - 0.002)
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: seat,
      bevelEnabled: true,
      bevelThickness: crown,
      bevelSize: Math.min(0.012, thickness / 2 - 0.006),
      bevelSegments: 3,
      curveSegments: 24,
    })
    g.rotateY(Math.PI / 2)
    // Outer (crowned) face at local x = 0, body extending toward -x.
    g.translate(-(seat + crown), 0, 0)
    return g
  }, [length, thickness])
  React.useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh
      geometry={geometry}
      position={[side * (railX + (flush ? 0.002 : protrusion)), y, z]}
      rotation-y={side === 1 ? 0 : Math.PI}
    >
      <meshPhysicalMaterial
        color={color}
        metalness={flush ? 0.94 : 0.9}
        roughness={flush ? 0.16 : 0.24}
      />
    </mesh>
  )
}

/**
 * A machined camera lens ring: slightly tapered outer wall, polished chamfer
 * lip, flat black bezel ring and truly recessed optics (dark barrel floor,
 * coated lens element, glint) behind a faint glass cover. Mount it in a group
 * at the ring's center on the mounting surface; it builds toward -z (the
 * device back's outward direction).
 */
export function LensRing({
  r,
  proud,
  seat = 0.02,
  frameColor,
  glass = '#0e1a36',
  element = '#1b2f5e',
}: {
  r: number
  /** How far the ring wall stands proud of its mounting surface. */
  proud: number
  /** How deep the wall sinks into the mount. */
  seat?: number
  frameColor: string
  glass?: string
  element?: string
}) {
  return (
    <group>
      {/* tapered outer wall, a touch narrower at the top like a machined boss */}
      <mesh rotation-x={Math.PI / 2} position-z={-(proud - seat) / 2}>
        <cylinderGeometry args={[r * 0.97, r, proud + seat, 48]} />
        <meshPhysicalMaterial color={frameColor} metalness={0.92} roughness={0.22} />
      </mesh>
      {/* polished chamfer stepping down from the wall's face (open cone shell) */}
      <mesh rotation-x={Math.PI / 2} position-z={-proud + 0.005}>
        <cylinderGeometry args={[r * 0.88, r * 0.97, 0.01, 48, 1, true]} />
        <meshPhysicalMaterial
          color={frameColor}
          metalness={0.94}
          roughness={0.18}
          envMapIntensity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* dark bezel funnel from the chamfer down into the barrel */}
      <mesh rotation-x={Math.PI / 2} position-z={-proud + 0.012}>
        <cylinderGeometry args={[r * 0.61, r * 0.88, 0.008, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#07090e"
          metalness={0.35}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* recessed barrel: dark floor sunk below the bezel */}
      <mesh rotation-x={Math.PI / 2} position-z={-proud + 0.014}>
        <cylinderGeometry args={[r * 0.61, r * 0.61, 0.012, 40]} />
        <meshPhysicalMaterial color="#04050a" metalness={0.25} roughness={0.4} />
      </mesh>
      {/* coated lens element on the barrel floor */}
      <mesh rotation-x={Math.PI / 2} position-z={-proud + 0.011}>
        <cylinderGeometry args={[r * 0.42, r * 0.42, 0.006, 36]} />
        <meshPhysicalMaterial
          color={glass}
          metalness={0.5}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={0.8}
        />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-z={-proud + 0.007}>
        <cylinderGeometry args={[r * 0.2, r * 0.2, 0.005, 24]} />
        <meshPhysicalMaterial color={element} metalness={0.6} roughness={0.1} clearcoat={1} />
      </mesh>
      {/* AR-coating glint */}
      <mesh rotation-x={Math.PI / 2} position={[-r * 0.24, r * 0.24, -proud + 0.009]}>
        <cylinderGeometry args={[r * 0.08, r * 0.08, 0.003, 16]} />
        <meshPhysicalMaterial color="#8fb0dc" metalness={0.4} roughness={0.1} clearcoat={1} />
      </mesh>
    </group>
  )
}

/**
 * A USB-C opening on a bottom edge (xz plane): brushed rim ring, dark pill
 * cavity and the gold connector tongue peeking out of it.
 */
export function UsbC({
  x,
  y,
  width,
  height,
  up = false,
}: {
  x: number
  /** The edge face's y (bottom edge: -body.height / 2 - small offset). */
  y: number
  width: number
  height: number
  /** Set when the port lives on a top edge (the folded Flip). */
  up?: boolean
}) {
  const dir = up ? 1 : -1
  return (
    <group position={[x, y, 0]}>
      <RoundedBox
        args={[width + 0.02, 0.01, height + 0.02]}
        radius={Math.min(0.032, (height + 0.02) / 2 - 0.002)}
      >
        <meshPhysicalMaterial color="#5a5e66" metalness={0.9} roughness={0.35} />
      </RoundedBox>
      <RoundedBox
        args={[width, 0.016, height]}
        radius={Math.min(0.028, height / 2 - 0.003)}
        position-y={dir * 0.002}
      >
        <meshPhysicalMaterial color="#050609" metalness={0.4} roughness={0.45} />
      </RoundedBox>
      {/* connector tongue */}
      <mesh position-y={dir * 0.0105}>
        <boxGeometry args={[width * 0.52, 0.004, height * 0.24]} />
        <meshPhysicalMaterial color="#b59b62" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  )
}
