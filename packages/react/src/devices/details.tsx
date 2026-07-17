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
 * The USB-C interior drawn once as a crisp decal: stadium cutout with a
 * hairline seam, depth-shaded cavity, receptacle shield outline and the gold
 * pin row — matching macro photography of the real ports without any visible
 * geometry stacking.
 */
function createUsbCTexture(aspect: number): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  const H = 192
  const W = Math.round(H * aspect)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const stadium = (x: number, y: number, w: number, h: number) => {
    const r = h / 2
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2)
    ctx.lineTo(x + r, y + h)
    ctx.arc(x + r, y + r, r, Math.PI / 2, (3 * Math.PI) / 2)
    ctx.closePath()
  }

  // Hairline seam where the cutout meets the rail.
  stadium(2, 2, W - 4, H - 4)
  ctx.fillStyle = '#3c4046'
  ctx.fill()

  // The opening: depth-shaded cavity (darkest just inside the top wall, a
  // faint light catch on the lower inner wall).
  const inset = H * 0.055
  stadium(inset, inset, W - inset * 2, H - inset * 2)
  const g = ctx.createLinearGradient(0, inset, 0, H - inset)
  g.addColorStop(0, '#08090c')
  g.addColorStop(0.22, '#050609')
  g.addColorStop(0.75, '#0b0d11')
  g.addColorStop(1, '#181b20')
  ctx.fillStyle = g
  ctx.fill()

  // Receptacle shield: a thin metal outline floating inside the opening.
  const sx = W * 0.115
  const sy = H * 0.26
  stadium(sx, sy, W - sx * 2, H - sy * 2)
  ctx.strokeStyle = '#43474e'
  ctx.lineWidth = H * 0.05
  ctx.stroke()

  // Gold pin-row tongue, centered, with a darker root line under it.
  const tw = W * 0.5
  const th = H * 0.15
  stadium((W - tw) / 2, H * 0.45, tw, th)
  ctx.fillStyle = '#8f7a4e'
  ctx.fill()
  stadium((W - tw) / 2 + th * 0.4, H * 0.47, tw - th * 0.8, th * 0.55)
  ctx.fillStyle = '#b9a066'
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * A USB-C opening on a bottom edge (xz plane): a single flush decal of the
 * cutout — no stacked slabs, under 1/10 mm of relief.
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
  const w = width + 0.012
  const h = height + 0.012
  const texture = React.useMemo(() => createUsbCTexture(w / h), [w, h])
  React.useEffect(() => () => texture?.dispose(), [texture])
  if (!texture) return null
  return (
    <mesh position={[x, y + (up ? 0.002 : -0.002), 0]} rotation-x={up ? -Math.PI / 2 : Math.PI / 2}>
      <planeGeometry args={[w, h]} />
      <meshPhysicalMaterial
        map={texture}
        transparent
        alphaTest={0.4}
        metalness={0.3}
        roughness={0.55}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  )
}
