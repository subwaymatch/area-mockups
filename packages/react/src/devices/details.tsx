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
 * A machined camera lens ring, modeled on the reference scans: slightly
 * tapered body-color wall, polished chamfer, a wide charcoal barrel funnel
 * sinking to a black aperture, and a glossy domed lens element bulging at its
 * throat (its specular highlight comes free from the environment map). Mount
 * it in a group at the ring's center on the mounting surface; it builds
 * toward -z (the device back's outward direction).
 */
export function LensRing({
  r,
  proud,
  seat = 0.02,
  frameColor,
  element = '#1c2a66',
}: {
  r: number
  /** How far the ring wall stands proud of its mounting surface. */
  proud: number
  /** How deep the wall sinks into the mount. */
  seat?: number
  frameColor: string
  /** Tint of the domed lens element. */
  element?: string
}) {
  // The funnel lives entirely within the ring's protrusion so it never sinks
  // behind the mounting surface (the mount is solid geometry).
  const funnelDepth = Math.max(0.014, proud - 0.014)
  const throatZ = -proud + 0.01 + funnelDepth
  return (
    <group>
      {/* tapered outer wall — an open tube so the bore stays visible; the
          chamfer shell below closes its face */}
      <mesh rotation-x={Math.PI / 2} position-z={-(proud - seat) / 2}>
        <cylinderGeometry args={[r, r * 0.97, proud + seat, 48, 1, true]} />
        <meshPhysicalMaterial
          color={frameColor}
          metalness={0.92}
          roughness={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* polished chamfer stepping down from the wall's face (open cone shell) */}
      <mesh rotation-x={Math.PI / 2} position-z={-proud + 0.005}>
        <cylinderGeometry args={[r * 0.86, r * 0.97, 0.01, 48, 1, true]} />
        <meshPhysicalMaterial
          color={frameColor}
          metalness={0.94}
          roughness={0.18}
          envMapIntensity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* charcoal barrel funnel, wide at the face, sinking to the aperture */}
      <mesh rotation-x={Math.PI / 2} position-z={-proud + 0.01 + funnelDepth / 2}>
        <cylinderGeometry args={[r * 0.3, r * 0.86, funnelDepth, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#4a4e55"
          metalness={0.05}
          roughness={0.6}
          envMapIntensity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* black aperture plate at the funnel throat */}
      <mesh rotation-x={Math.PI / 2} position-z={throatZ - 0.002}>
        <cylinderGeometry args={[r * 0.33, r * 0.33, 0.006, 40]} />
        <meshPhysicalMaterial color="#0a0b0d" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* glossy domed lens element, its cap emerging from the aperture — kept
          fully in front of the (solid) mounting surface so it never gets
          swallowed by the mount's own faces */}
      <mesh position-z={throatZ - r * 0.05} scale={[1, 1, 0.6]}>
        <sphereGeometry args={[r * 0.17, 32, 20]} />
        <meshPhysicalMaterial
          color={element}
          metalness={0.15}
          roughness={0.03}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={1.6}
        />
      </mesh>
    </group>
  )
}

/**
 * A USB-C opening on a bottom edge (xz plane), matching the reference scans:
 * a flat dark stadium hole with a hairline seam, the receptacle shield just
 * visible inside, and the thin gold pin row deeper still. Reads as a cutout
 * rather than a fixture — total relief is under 0.2 mm.
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
  const pill = (w: number, h: number) => Math.min(0.03, h / 2 - 0.001)
  return (
    <group position={[x, y, 0]}>
      {/* hairline seam where the cutout meets the rail */}
      <RoundedBox args={[width + 0.008, 0.003, height + 0.008]} radius={pill(width, height + 0.008)}>
        <meshStandardMaterial color="#31343a" roughness={0.5} />
      </RoundedBox>
      {/* the opening itself */}
      <RoundedBox args={[width, 0.0045, height]} radius={pill(width, height)} position-y={dir * 0.001}>
        <meshPhysicalMaterial color="#0a0b0e" metalness={0.3} roughness={0.5} />
      </RoundedBox>
      {/* receptacle shield, faintly visible inside the opening */}
      <RoundedBox
        args={[width * 0.8, 0.0055, height * 0.5]}
        radius={pill(width * 0.8, height * 0.5)}
        position-y={dir * 0.0018}
      >
        <meshPhysicalMaterial color="#2b2e34" metalness={0.6} roughness={0.4} />
      </RoundedBox>
      {/* cavity around the tongue */}
      <RoundedBox
        args={[width * 0.72, 0.0065, height * 0.34]}
        radius={pill(width * 0.72, height * 0.34)}
        position-y={dir * 0.0026}
      >
        <meshPhysicalMaterial color="#050608" metalness={0.2} roughness={0.5} />
      </RoundedBox>
      {/* gold pin row on the connector tongue */}
      <mesh position-y={dir * 0.0034}>
        <boxGeometry args={[width * 0.52, 0.0065, height * 0.13]} />
        <meshPhysicalMaterial color="#a08850" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  )
}
