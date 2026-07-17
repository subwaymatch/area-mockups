import * as React from 'react'
import * as THREE from 'three'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'
import { MeshBVH } from 'three-mesh-bvh'
import { roundedRectShape } from '@area-mockups/core'

/**
 * Shared machined hardware details used across the device models: side keys,
 * camera lens rings, and real machined cavities (USB-C ports, speaker slots,
 * mic drillings) cut straight into the chassis geometry with CSG. Everything
 * is procedural geometry.
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
 * tapered body-color wall, polished chamfer, a near-black barrel funnel
 * sinking to a black aperture, a glossy domed lens element at its throat —
 * and a smoked cover-glass disc sealing the bore, so the whole interior reads
 * dark with one soft window reflection, like the retail cameras. Mount it in
 * a group at the ring's center on the mounting surface; it builds toward -z
 * (the device back's outward direction).
 */
export function LensRing({
  r,
  proud,
  seat = 0.02,
  frameColor,
  element = '#101c3a',
}: {
  r: number
  /** How far the ring wall stands proud of its mounting surface. */
  proud: number
  /** How deep the wall sinks into the mount. */
  seat?: number
  frameColor: string
  /** Tint of the domed lens element (read through the smoked cover glass). */
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
      {/* near-black barrel funnel, wide at the face, sinking to the aperture —
          the real barrels are matte black, not silver */}
      <mesh rotation-x={Math.PI / 2} position-z={-proud + 0.01 + funnelDepth / 2}>
        <cylinderGeometry args={[r * 0.3, r * 0.86, funnelDepth, 48, 1, true]} />
        <meshPhysicalMaterial
          color="#131417"
          metalness={0.08}
          roughness={0.5}
          envMapIntensity={0.45}
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
      {/* smoked cover glass sealing the bore just under the chamfer: darkens
          the whole interior and carries one soft, glossy window reflection */}
      <mesh rotation-x={Math.PI / 2} position-z={-proud + 0.007}>
        <cylinderGeometry args={[r * 0.87, r * 0.87, 0.003, 48]} />
        <meshPhysicalMaterial
          color="#05070c"
          transparent
          opacity={0.62}
          metalness={0.1}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.06}
          envMapIntensity={1.15}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------------------------
 * Real cutouts: ports and holes are machined into the chassis with CSG, so
 * every opening is a true cavity with a lip, interior walls and parallax —
 * not a decal painted on a flat edge.
 * ---------------------------------------------------------------------- */

/** How deep the USB-C cavity is machined into an edge (~5.5 mm at phone scale). */
export const USB_CUT_DEPTH = 0.15

let evaluator: Evaluator | null = null

/**
 * Concatenate disjoint solids into one geometry (position + normal only) so a
 * whole edge's cutters cost a single boolean pass. Consumes the inputs.
 */
function mergeSolids(solids: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const parts = solids.map((solid) => (solid.index ? solid.toNonIndexed() : solid))
  let total = 0
  for (const part of parts) total += part.attributes.position!.count
  const position = new Float32Array(total * 3)
  const normal = new Float32Array(total * 3)
  let offset = 0
  for (const part of parts) {
    position.set(part.attributes.position!.array as Float32Array, offset)
    normal.set(part.attributes.normal!.array as Float32Array, offset)
    offset += part.attributes.position!.count * 3
  }
  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(position, 3))
  merged.setAttribute('normal', new THREE.BufferAttribute(normal, 3))
  for (const part of parts) part.dispose()
  for (const solid of solids) solid.dispose()
  return merged
}

/**
 * Machine real openings into a chassis: subtracts the cutter solids from
 * `base` in one boolean pass. Consumes `base` and the cutters and returns the
 * cut geometry — or the untouched base if the boolean op fails, so a render
 * never goes blank over a decorative cavity.
 */
export function cutGeometry(
  base: THREE.BufferGeometry,
  cutters: THREE.BufferGeometry[]
): THREE.BufferGeometry {
  if (cutters.length === 0) return base
  try {
    if (!evaluator) {
      evaluator = new Evaluator()
      evaluator.useGroups = false
      evaluator.attributes = ['position', 'normal']
    }
    const bodyBrush = new Brush(base)
    const cutterBrush = new Brush(mergeSolids(cutters))
    bodyBrush.updateMatrixWorld()
    cutterBrush.updateMatrixWorld()
    const result = evaluator.evaluate(bodyBrush, cutterBrush, SUBTRACTION).geometry
    cutterBrush.geometry.dispose()
    base.dispose()
    // A BVH on the machined chassis makes the screens' occlusion rays cost
    // microseconds (the BVH library is already here for the boolean op).
    // Untyped assignment: two hoisted copies of three-mesh-bvh's typings
    // otherwise collide on the BufferGeometry `boundsTree` augmentation.
    ;(result as unknown as { boundsTree: unknown }).boundsTree = new MeshBVH(result)
    return result
  } catch {
    return base
  }
}

/**
 * Aim a +z-built cavity part (cutter, socket liner, receptacle) down its cut
 * axis. `inward` is the cut direction's sign on that axis — +1 for a bottom
 * edge (cutting up, +y) or a left wall (+x), -1 for a top edge or right wall.
 * Cavity profiles map width → x and height → z on a y cut, width → z and
 * height → y on an x cut.
 */
function orientCavity(g: THREE.BufferGeometry, axis: 'x' | 'y', inward: 1 | -1): THREE.BufferGeometry {
  if (axis === 'y') g.rotateX(-inward * (Math.PI / 2))
  else g.rotateY(inward * (Math.PI / 2))
  return g
}

/**
 * A stadium-profile cutting prism for `cutGeometry`, centered on the origin
 * and running 2×`depth` along `axis`: drop its center on the edge face it
 * pierces (`.translate(...)`) and it machines `depth` into the body. `width`
 * is the opening's long dimension along the edge, `height` the short one;
 * ends are fully rounded unless `radius` narrows them.
 */
export function stadiumCutter(
  width: number,
  height: number,
  depth: number,
  axis: 'x' | 'y' = 'y',
  radius = Math.min(width, height) / 2 - 0.0005
): THREE.BufferGeometry {
  const geometry = new THREE.ExtrudeGeometry(roundedRectShape(width, height, radius), {
    depth: depth * 2,
    bevelEnabled: false,
    curveSegments: 12,
  })
  geometry.translate(0, 0, -depth)
  return orientCavity(geometry, axis, 1)
}

/** A drilled-hole cutter (mics, speaker holes, screws, round jacks), centered like `stadiumCutter`. */
export function holeCutter(r: number, depth: number, axis: 'x' | 'y' = 'y'): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(r, r, depth * 2, 20)
  geometry.rotateX(Math.PI / 2)
  return orientCavity(geometry, axis, 1)
}

/**
 * The dark interior of a machined opening. Stadium slots get a sleeve: thin
 * dark walls hugging the cavity (recessed `lip` past the machined chassis
 * lip) sinking to a floor at the cavity's far end — real visible depth, not a
 * painted face. Drilled holes (`r`) get a recessed dark plug.
 */
export function EdgeSocket({
  position,
  width = 0,
  height = 0,
  r,
  depth = 0.06,
  lip = 0.012,
  axis = 'y',
  inward = 1,
  color = '#0a0b0e',
}: {
  /** The opening's center on the edge face. */
  position: [number, number, number]
  width?: number
  height?: number
  /** Radius for drilled round holes (overrides width/height). */
  r?: number
  /** How deep the cavity was cut. */
  depth?: number
  /** How far past the surface the machined chassis wall stays visible. */
  lip?: number
  axis?: 'x' | 'y'
  inward?: 1 | -1
  color?: string
}) {
  const geometry = React.useMemo(() => {
    if (r !== undefined) {
      const length = depth - lip
      const plug = new THREE.CylinderGeometry(r - 0.0015, r - 0.0015, length, 16)
      plug.rotateX(Math.PI / 2)
      plug.translate(0, 0, lip + length / 2)
      return orientCavity(plug, axis, inward)
    }
    const inset = Math.min(0.008, height * 0.14)
    const w = width - inset
    const h = height - inset
    const wall = Math.max(0.006, h * 0.1)
    const floorT = 0.018
    const sleeveLength = Math.max(0.01, depth - lip - floorT)
    const ring = roundedRectShape(w, h, h / 2 - 0.0005)
    ring.holes.push(roundedRectShape(w - wall * 2, h - wall * 2, (h - wall * 2) / 2 - 0.0005))
    const sleeve = new THREE.ExtrudeGeometry(ring, {
      depth: sleeveLength,
      bevelEnabled: false,
      curveSegments: 10,
    })
    const floor = new THREE.ExtrudeGeometry(roundedRectShape(w, h, h / 2 - 0.0005), {
      depth: floorT,
      bevelEnabled: false,
      curveSegments: 10,
    })
    floor.translate(0, 0, sleeveLength)
    const merged = mergeSolids([sleeve, floor])
    merged.translate(0, 0, lip)
    return orientCavity(merged, axis, inward)
  }, [width, height, r, depth, lip, axis, inward])
  React.useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} position={position}>
      <meshPhysicalMaterial color={color} metalness={0.12} roughness={0.65} envMapIntensity={0.3} />
    </mesh>
  )
}

/**
 * The inside of a machined USB-C cavity (cut the cavity itself with
 * `cutGeometry` + `stadiumCutter` first): the stainless receptacle shell
 * seated just past the machined lip, the dark cavity floor behind it and the
 * gold pin tongue in the middle — real geometry at real depths, so the port
 * shows parallax from every angle like the reference scans.
 */
export function UsbC({
  x = 0,
  y = 0,
  z = 0,
  width,
  height,
  depth = USB_CUT_DEPTH,
  axis = 'y',
  inward = 1,
}: {
  x?: number
  y?: number
  z?: number
  /** The machined opening's size (same values passed to `stadiumCutter`). */
  width: number
  height: number
  /** How deep the cavity was cut. */
  depth?: number
  axis?: 'x' | 'y'
  inward?: 1 | -1
}) {
  const parts = React.useMemo(() => {
    // Everything is built extruding +z from the opening, then aimed down the cut.
    const lip = Math.min(0.008, depth * 0.06)
    const gap = Math.min(0.008, height * 0.1)
    const shellW = width - gap
    const shellH = height - gap
    const wall = Math.min(0.012, shellH * 0.16)
    const ring = roundedRectShape(shellW, shellH, shellH / 2 - 0.0005)
    ring.holes.push(
      roundedRectShape(shellW - wall * 2, shellH - wall * 2, (shellH - wall * 2) / 2 - 0.0005)
    )
    const shell = new THREE.ExtrudeGeometry(ring, {
      depth: depth * 0.6,
      bevelEnabled: false,
      curveSegments: 10,
    })
    shell.translate(0, 0, lip)
    orientCavity(shell, axis, inward)

    const floorLength = depth * 0.35
    const floor = new THREE.ExtrudeGeometry(
      roundedRectShape(width - gap * 1.5, height - gap * 1.5, (height - gap * 1.5) / 2 - 0.0005),
      { depth: floorLength, bevelEnabled: false, curveSegments: 10 }
    )
    floor.translate(0, 0, depth - floorLength - 0.005)
    orientCavity(floor, axis, inward)

    const tongueT = Math.min(0.024, height * 0.28)
    const tongue = new THREE.ExtrudeGeometry(
      roundedRectShape(width * 0.6, tongueT, tongueT / 2 - 0.0008),
      { depth: depth * 0.45, bevelEnabled: false, curveSegments: 8 }
    )
    tongue.translate(0, 0, depth * 0.3)
    orientCavity(tongue, axis, inward)

    return { shell, floor, tongue }
  }, [width, height, depth, axis, inward])
  React.useEffect(
    () => () => {
      parts.shell.dispose()
      parts.floor.dispose()
      parts.tongue.dispose()
    },
    [parts]
  )

  return (
    <group position={[x, y, z]}>
      {/* stainless receptacle shell — its rim ring catches light just inside the
          lip; kept dim so the inner walls stay in shadow like the real ports */}
      <mesh geometry={parts.shell}>
        <meshPhysicalMaterial color="#43464c" metalness={0.7} roughness={0.5} envMapIntensity={0.35} />
      </mesh>
      {/* matte-black cavity floor behind everything */}
      <mesh geometry={parts.floor}>
        <meshPhysicalMaterial color="#050608" metalness={0.05} roughness={0.75} envMapIntensity={0.15} />
      </mesh>
      {/* the gold pin tongue, rooted in the floor */}
      <mesh geometry={parts.tongue}>
        <meshPhysicalMaterial color="#b18e4c" metalness={0.7} roughness={0.4} envMapIntensity={1.1} />
      </mesh>
    </group>
  )
}
