import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { VAN } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

/**
 * Full-coverage side wrap: the whole flat side elevation, rockers to
 * roofline, tail to nose. The extruded shell makes the entire side face
 * coplanar, so one DOM plane can cover it; the outline and the hardware
 * cutouts below are carved out of that plane with a CSS `clip-path`.
 */
const FULL_WRAP = {
  width: VAN.profile.noseX - VAN.profile.tailX,
  height: VAN.profile.roofY - VAN.rockerY,
  x: (VAN.profile.noseX + VAN.profile.tailX) / 2,
  y: (VAN.profile.roofY + VAN.rockerY) / 2,
} as const

/** Default CSS px width of the full-side wrap — same dpi as the panel wrap. */
const FULL_WRAP_RESOLUTION = Math.round(VAN.resolution * (FULL_WRAP.width / VAN.wrap.width))

/**
 * Regions carved out of the full-coverage wrap, in world units on the side
 * elevation. Each matches a physical feature rendered by the meshes below
 * (with a little trim margin, like a real wrap install): the cab door glass,
 * the door handle, the mirror arms + head, and the curb-side door track.
 */
const SIDE_CUTOUTS = {
  /** Mirrors doorGlassGeometry (shape-local coords + its [1.52, 0.24] mount). */
  doorGlass: { x: 1.52, y: 0.24, halfW: 0.5, h: 0.56, rake: 0.486 },
  /** Door handle RoundedBox [0.162 × 0.029] at (1.2, −0.26). */
  handle: { minX: 1.099, minY: -0.295, maxX: 1.301, maxY: -0.225, r: 0.035 },
  /** Mirror arms + head footprint beside the A-pillar. */
  mirror: { minX: 1.975, minY: 0.365, maxX: 2.115, maxY: 0.675, r: 0.045 },
  /** Curb-side sliding-door track groove [3.4 × 0.038] at (−0.8, 1.14). */
  track: { minX: -2.52, minY: 1.114, maxX: 0.92, maxY: 1.166, r: 0.026 },
} as const

/** Rounded-rect cutout subpath, traced world-clockwise so the nonzero fill
    rule reads it as a hole against the world-counterclockwise outline. */
function holeRect(
  P: (x: number, y: number) => string,
  R: (u: number) => string,
  sw: number,
  { minX, minY, maxX, maxY, r }: { minX: number; minY: number; maxX: number; maxY: number; r: number }
): string {
  return (
    `M ${P(minX + r, maxY)} L ${P(maxX - r, maxY)} A ${R(r)} ${R(r)} 0 0 ${sw} ${P(maxX, maxY - r)} ` +
    `L ${P(maxX, minY + r)} A ${R(r)} ${R(r)} 0 0 ${sw} ${P(maxX - r, minY)} ` +
    `L ${P(minX + r, minY)} A ${R(r)} ${R(r)} 0 0 ${sw} ${P(minX, minY + r)} ` +
    `L ${P(minX, maxY - r)} A ${R(r)} ${R(r)} 0 0 ${sw} ${P(minX + r, maxY)} Z `
  )
}

/**
 * SVG path (CSS px, y-down) clipping the full-coverage wrap: the shell's own
 * side profile — including the wheel-arch arcs — as the outer boundary, with
 * the hardware cutouts as opposite-winding holes. `mirrored` builds the
 * street-side (−Z) variant, whose CSS x axis runs nose→tail; mirroring also
 * flips every arc's sweep flag so the geometry stays identical.
 */
function buildFullWrapClip(pxPerUnit: number, mirrored: boolean): string {
  const { rockerY, wheels, profile } = VAN
  // Keep the wrap just inside the shell's beveled edge (bevelSize 0.015).
  const inset = 0.015
  const X = (x: number) => ((mirrored ? profile.noseX - x : x - profile.tailX) * pxPerUnit).toFixed(1)
  const Y = (y: number) => ((profile.roofY - y) * pxPerUnit).toFixed(1)
  const P = (x: number, y: number) => `${X(x)} ${Y(y)}`
  const R = (u: number) => (u * pxPerUnit).toFixed(1)
  // World-ccw curves render css-cw (the y axis flips): sweep 1 — and the
  // street-side mirror flips orientation once more.
  const swOut = mirrored ? 0 : 1
  const swHole = mirrored ? 1 : 0

  const bottom = rockerY + inset
  const top = profile.roofY - inset
  const tail = profile.tailX + inset
  const nose = profile.noseX - inset
  const arch = wheels.archRadius

  // The same trace as shellGeometry's profile shape, world-counterclockwise.
  const outline =
    `M ${P(tail + 0.06, bottom)} ` +
    `L ${P(wheels.rearX - arch, bottom)} ` +
    `A ${R(arch)} ${R(arch)} 0 0 ${swOut} ${P(wheels.rearX + arch, bottom)} ` +
    `L ${P(wheels.frontX - arch, bottom)} ` +
    `A ${R(arch)} ${R(arch)} 0 0 ${swOut} ${P(wheels.frontX + arch, bottom)} ` +
    `L ${P(nose - 0.09, bottom)} Q ${P(nose, bottom)} ${P(nose, bottom + 0.09)} ` +
    `L ${P(nose, profile.bumperTopY)} ` +
    `L ${P(profile.hoodX - inset, profile.hoodY - inset)} ` +
    `L ${P(profile.cowlX - inset, profile.cowlY)} ` +
    `L ${P(profile.windshieldTopX - inset, profile.windshieldTopY)} ` +
    `Q ${P(profile.windshieldTopX - inset - 0.12, top)} ${P(profile.roofStartX, top)} ` +
    `L ${P(tail + 0.09, top)} Q ${P(tail, top)} ${P(tail, top - 0.09)} ` +
    `L ${P(tail, bottom + 0.06)} Q ${P(tail, bottom)} ${P(tail + 0.06, bottom)} Z `

  // Door glass trapezoid, traced world-clockwise (reverse of the mesh shape).
  const g = SIDE_CUTOUTS.doorGlass
  const gx0 = g.x - g.halfW
  const gx1 = g.x + g.halfW
  const gy0 = g.y
  const gy1 = g.y + g.h
  const gCx = g.x + g.halfW - g.rake * g.h // raked top-front corner
  const gDx = g.x + 0.34 - g.rake * g.h
  const gEx = g.x - 0.42
  const glass =
    `M ${P(gx0, gy0)} L ${P(gx0, gy1 - 0.08)} Q ${P(gx0, gy1)} ${P(gEx, gy1)} ` +
    `L ${P(gDx, gy1)} Q ${P(gCx - 0.1, gy1)} ${P(gCx, gy1)} L ${P(gx1, gy0)} Z `

  return (
    outline +
    glass +
    holeRect(P, R, swHole, SIDE_CUTOUTS.handle) +
    holeRect(P, R, swHole, SIDE_CUTOUTS.mirror) +
    (mirrored ? '' : holeRect(P, R, swHole, SIDE_CUTOUTS.track))
  ).trim()
}

export interface VanProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Livery for the curb-side (+Z) wrap panel — any React node, full bleed. */
  children?: React.ReactNode
  /** Livery for the street-side (−Z) wrap panel. */
  streetSide?: React.ReactNode
  /** Livery for the rear-door panel, between the taillight clusters. */
  rear?: React.ReactNode
  /** Body paint. Wrap fleets are usually white. */
  color?: string
  /** CSS background painted behind your wrap content. */
  wrapBackground?: string
  /** CSS pixel width of the virtual wrap panel. Height follows the panel aspect. */
  resolution?: number
  /**
   * How much of the cargo side the live wraps cover. `'panel'` (default) is
   * the classic rectangular mid-panel, clear of the arches and glass.
   * `'full'` covers the entire side elevation — rockers to roofline, tail to
   * nose — with the wheel arches, door glass, door handle, mirror mount and
   * curb-side door track carved out of the wrap (CSS `clip-path`), so the 3D
   * wheels, windows and hardware show through your livery.
   */
  coverage?: 'panel' | 'full'
  /** Let pointer events (clicks, scrolling, typing) reach your wrap content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How wrap content hides when the van faces away from the camera.
   * `true` raycasts against the shell (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the wrap wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built cargo van (generic Transit/Sprinter-style silhouette,
 * no brand): the shell is the side profile — clamshell hood, cowl break,
 * raked windshield, high roof, wheel-arch cutouts — extruded across the
 * width, with wheels, glass, lights, mirrors and bumpers added on. The flat
 * cargo side carries a live vinyl-wrap panel for your livery. No 3D asset
 * files are loaded.
 *
 * The origin is the body center; the road sits `VAN.groundY` below it. The
 * wrap panel faces +Z. Must be rendered inside a react-three-fiber `<Canvas>`
 * (or `<MockupCanvas>`).
 */
export function Van({
  children,
  streetSide,
  rear,
  color = '#eef0f2',
  wrapBackground = '#ffffff',
  resolution,
  coverage = 'panel',
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: VanProps) {
  const { body, rockerY, wheels, profile, wrap, rear: rearSpec } = VAN
  const shellRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(shellRef)

  // The side rect the DeviceScreens cover: the classic mid-panel, or the
  // whole side elevation with the hardware carved out via clip-path.
  const fullWrap = coverage === 'full'
  const side = fullWrap
    ? { width: FULL_WRAP.width, height: FULL_WRAP.height, x: FULL_WRAP.x, y: FULL_WRAP.y, radius: 0 }
    : { width: wrap.width, height: wrap.height, x: wrap.x, y: wrap.y, radius: wrap.radius }
  const sideResolution = resolution ?? (fullWrap ? FULL_WRAP_RESOLUTION : VAN.resolution)
  // The rear panel shares the side wrap's dpi.
  const rearResolution = Math.round(rearSpec.width * (sideResolution / side.width))
  const sideClip = React.useMemo(() => {
    if (!fullWrap) return null
    const pxPerUnit = sideResolution / FULL_WRAP.width
    return {
      curb: `path("${buildFullWrapClip(pxPerUnit, false)}")`,
      street: `path("${buildFullWrapClip(pxPerUnit, true)}")`,
    }
  }, [fullWrap, sideResolution])
  const curbStyle = sideClip ? { clipPath: sideClip.curb, ...screenStyle } : screenStyle
  const streetStyle = sideClip ? { clipPath: sideClip.street, ...screenStyle } : screenStyle

  const shellGeometry = React.useMemo(() => {
    const { noseX, tailX, bumperTopY, hoodX, hoodY, cowlX, cowlY, windshieldTopX, windshieldTopY, roofStartX, roofY } = profile
    const arch = wheels.archRadius
    const s = new THREE.Shape()
    // counterclockwise from the rear rocker, arcs cut the wheel arches
    s.moveTo(tailX + 0.06, rockerY)
    s.lineTo(wheels.rearX - arch, rockerY)
    s.absarc(wheels.rearX, rockerY, arch, Math.PI, 0, true)
    s.lineTo(wheels.frontX - arch, rockerY)
    s.absarc(wheels.frontX, rockerY, arch, Math.PI, 0, true)
    s.lineTo(noseX - 0.09, rockerY)
    s.quadraticCurveTo(noseX, rockerY, noseX, rockerY + 0.09)
    s.lineTo(noseX, bumperTopY)
    // clamshell hood: short nose face up to the near-horizontal hood top,
    // back to the cowl crease where the windshield starts
    s.lineTo(hoodX, hoodY)
    s.lineTo(cowlX, cowlY)
    // raked windshield to the header, then the high-roof cap ramps back
    s.lineTo(windshieldTopX, windshieldTopY)
    s.quadraticCurveTo(windshieldTopX - 0.12, roofY, roofStartX, roofY)
    s.lineTo(tailX + 0.09, roofY)
    s.quadraticCurveTo(tailX, roofY, tailX, roofY - 0.09)
    s.lineTo(tailX, rockerY + 0.06)
    s.quadraticCurveTo(tailX, rockerY, tailX + 0.06, rockerY)

    const depth = body.width - body.bevel * 2
    const geometry = new THREE.ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelThickness: body.bevel,
      // a small in-plane bevel keeps the profile within ~15mm of its nominal
      // outline, so glass planes and lamps placed on it stay visible
      bevelSize: 0.015,
      bevelSegments: 3,
      curveSegments: 24,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body, rockerY, wheels, profile])

  // Windshield plane, laid on the cowl-to-header segment of the profile.
  const windshield = React.useMemo(() => {
    const dx = profile.windshieldTopX - profile.cowlX
    const dy = profile.windshieldTopY - profile.cowlY
    const length = Math.hypot(dx, dy)
    return {
      tilt: Math.atan2(-dx / length, dy / length),
      length,
      mid: [
        (profile.cowlX + profile.windshieldTopX) / 2 + (dy / length) * 0.035,
        (profile.cowlY + profile.windshieldTopY) / 2 + (-dx / length) * 0.035,
      ] as const,
    }
  }, [profile])

  // Cab door glass: trapezoid with the leading edge slanted parallel to the
  // A-pillar and a blacked-out sail area, like the references.
  const doorGlassGeometry = React.useMemo(() => {
    const rake = 0.486 // dx per unit dy of the windshield slope
    const h = 0.56
    const shape = new THREE.Shape()
    shape.moveTo(-0.5, 0)
    shape.lineTo(0.5, 0)
    shape.lineTo(0.5 - rake * h, h)
    shape.quadraticCurveTo(0.5 - rake * h - 0.1, h, 0.34 - rake * h, h)
    shape.lineTo(-0.42, h)
    shape.quadraticCurveTo(-0.5, h, -0.5, h - 0.08)
    shape.closePath()
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false })
    return geometry
  }, [])

  React.useEffect(() => {
    return () => {
      shellGeometry.dispose()
      doorGlassGeometry.dispose()
    }
  }, [shellGeometry, doorGlassGeometry])

  const glassMaterial = (
    <meshPhysicalMaterial color="#10161f" metalness={0.2} roughness={0.12} clearcoat={1} />
  )
  const trimMaterial = <meshPhysicalMaterial color="#23262b" metalness={0.1} roughness={0.7} />

  return (
    <group {...groupProps}>
      {/* painted shell */}
      <mesh ref={shellRef} geometry={shellGeometry}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.4}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.15}
        />
      </mesh>

      {/* windshield on the cowl-to-header segment */}
      <group position={[windshield.mid[0], windshield.mid[1], 0]} rotation-z={windshield.tilt}>
        <mesh rotation-y={Math.PI / 2}>
          <planeGeometry args={[body.width - 0.28, windshield.length - 0.1]} />
          {glassMaterial}
        </mesh>
      </group>

      {/* cab door glass, both sides — trapezoid following the A-pillar. The
          0.02 extrusion runs +z from its base, so each side gets its own base
          z that leaves the outer face ~10mm proud of the shell. */}
      {[1, -1].map((side) => (
        <mesh
          key={side}
          geometry={doorGlassGeometry}
          position={[1.52, 0.24, side === 1 ? body.width / 2 - 0.01 : -body.width / 2 - 0.01]}
        >
          {glassMaterial}
        </mesh>
      ))}

      {/* cab door handles, ~1 m above the ground on both sides */}
      {[1, -1].map((side) => (
        <RoundedBox key={side} args={[0.162, 0.029, 0.022]} radius={0.01} position={[1.2, -0.26, side * 0.982]}>
          {trimMaterial}
        </RoundedBox>
      ))}

      {/* curb-side sliding-door track groove, from behind the door to the
          rear quarter — held above the wrap panel's top edge (y 1.10) so it
          never cuts through the live DeviceScreen */}
      <mesh position={[-0.8, 1.14, body.width / 2 + 0.005]}>
        <boxGeometry args={[3.4, 0.038, 0.012]} />
        <meshPhysicalMaterial color="#191b1f" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* running gear: dark wheel-well liners fill the arch openings, axles
          tie each wheel pair together, and an underbody pan closes the gap
          between the rockers — so the wheels read as attached, not floating */}
      {([wheels.frontX, wheels.rearX] as const).map((x) => (
        <group key={x}>
          <mesh position={[x, rockerY + (wheels.archRadius + 0.02) / 2, 0]}>
            <boxGeometry args={[wheels.archRadius * 2 - 0.04, wheels.archRadius + 0.02, body.width - 0.08]} />
            <meshPhysicalMaterial color="#0c0d10" metalness={0} roughness={1} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position={[x, wheels.centerY, 0]}>
            <cylinderGeometry args={[0.055, 0.055, body.width - 0.34, 12]} />
            <meshPhysicalMaterial color="#191b1f" metalness={0.5} roughness={0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, rockerY - 0.075, 0]}>
        <boxGeometry args={[body.length - 0.9, 0.15, body.width - 0.4]} />
        <meshPhysicalMaterial color="#0d0e11" metalness={0.1} roughness={0.95} />
      </mesh>

      {/* wheels: tire, rim, hub — four corners */}
      {([wheels.frontX, wheels.rearX] as const).map((x) =>
        [1, -1].map((side) => (
          <group key={`${x}${side}`} position={[x, wheels.centerY, side * (body.width / 2 - 0.145)]}>
            <mesh rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[wheels.radius, wheels.radius, wheels.width, 28]} />
              <meshPhysicalMaterial color="#15161a" metalness={0} roughness={0.95} />
            </mesh>
            <mesh rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.19, 0.19, wheels.width + 0.006, 24]} />
              <meshPhysicalMaterial color="#c6cad1" metalness={0.85} roughness={0.35} />
            </mesh>
            <mesh rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.06, 0.06, wheels.width + 0.012, 16]} />
              <meshPhysicalMaterial color="#3c4046" metalness={0.7} roughness={0.4} />
            </mesh>
          </group>
        ))
      )}

      {/* wide slatted grille spanning the nose between the headlights, just
          under the hood's front edge (the modern Transit/Sprinter face) */}
      <RoundedBox args={[0.05, 0.28, 1.12]} radius={0.03} position={[2.81, -0.11, 0]}>
        <meshPhysicalMaterial color="#15171b" metalness={0.3} roughness={0.6} />
      </RoundedBox>
      {[-0.045, -0.125, -0.205].map((y) => (
        <RoundedBox key={y} args={[0.055, 0.036, 1.06]} radius={0.015} position={[2.815, y, 0]}>
          <meshPhysicalMaterial color="#2c3037" metalness={0.5} roughness={0.45} />
        </RoundedBox>
      ))}
      {/* slim lower intake in the bumper band */}
      <RoundedBox args={[0.05, 0.12, 1.2]} radius={0.02} position={[2.86, -0.72, 0]}>
        <meshPhysicalMaterial color="#141619" metalness={0.3} roughness={0.65} />
      </RoundedBox>
      {/* license-plate recess between grille and bumper */}
      <RoundedBox args={[0.03, 0.13, 0.52]} radius={0.012} position={[2.82, -0.42, 0]}>
        <meshPhysicalMaterial color="#dfe2e6" metalness={0.1} roughness={0.5} />
      </RoundedBox>
      {/* headlight units flanking the grille, tops kissing the hood line,
          reaching out to the corners with the amber segment wrapping the end */}
      {[1, -1].map((side) => (
        <group key={side}>
          <RoundedBox args={[0.06, 0.22, 0.44]} radius={0.03} position={[2.81, -0.07, side * 0.72]}>
            <meshPhysicalMaterial
              color="#e8edf4"
              emissive="#dfe9f5"
              emissiveIntensity={0.25}
              metalness={0.3}
              roughness={0.2}
              clearcoat={1}
            />
          </RoundedBox>
          <RoundedBox args={[0.055, 0.16, 0.09]} radius={0.025} position={[2.8, -0.09, side * 0.93]}>
            <meshPhysicalMaterial
              color="#f2a33c"
              emissive="#ffb340"
              emissiveIntensity={0.4}
              roughness={0.25}
              clearcoat={1}
            />
          </RoundedBox>
        </group>
      ))}

      {/* black plastic bumper band low on the nose, wrapping the corners —
          a slim skid band, not a half-height mass */}
      <RoundedBox args={[0.14, 0.3, body.width + 0.02]} radius={0.05} position={[2.8, -0.73, 0]}>
        {trimMaterial}
      </RoundedBox>
      <RoundedBox args={[0.1, 0.16, body.width + 0.02]} radius={0.04} position={[-2.77, -0.82, 0]}>
        {trimMaterial}
      </RoundedBox>
      {/* taillight clusters: brake (red) / turn (amber) / reverse (white),
          stacked at hand height on the rear corners like real van lamps */}
      {[1, -1].map((side) => (
        <group key={side} position={[-2.8, 0, side * 0.84]}>
          <RoundedBox args={[0.05, 0.2, 0.12]} radius={0.02} position={[0, 0.08, 0]}>
            <meshPhysicalMaterial color="#8c1524" emissive="#c11a30" emissiveIntensity={0.45} roughness={0.25} clearcoat={1} />
          </RoundedBox>
          <RoundedBox args={[0.05, 0.13, 0.12]} radius={0.02} position={[0, -0.11, 0]}>
            <meshPhysicalMaterial color="#f2a33c" emissive="#ffb340" emissiveIntensity={0.4} roughness={0.25} clearcoat={1} />
          </RoundedBox>
          <RoundedBox args={[0.05, 0.11, 0.12]} radius={0.02} position={[0, -0.25, 0]}>
            <meshPhysicalMaterial color="#e9ecef" emissive="#f2f5f8" emissiveIntensity={0.2} roughness={0.25} clearcoat={1} />
          </RoundedBox>
        </group>
      ))}

      {/* rear barn-door center seam — segments only above and below the rear
          wrap DeviceScreen rect (y -0.67..0.95), which covers the middle */}
      {(
        [
          { y: -0.77, height: 0.18 },
          { y: 0.99, height: 0.08 },
        ] as const
      ).map(({ y, height }) => (
        <mesh key={y} position={[-2.822, y, 0]}>
          <boxGeometry args={[0.01, height, 0.014]} />
          <meshPhysicalMaterial color="#191b1f" metalness={0.2} roughness={0.8} />
        </mesh>
      ))}
      {/* high-mount third brake light strip above the doors */}
      <RoundedBox args={[0.025, 0.035, 0.55]} radius={0.01} position={[-2.822, 1.05, 0]}>
        <meshPhysicalMaterial color="#8c1524" emissive="#c11a30" emissiveIntensity={0.45} roughness={0.25} clearcoat={1} />
      </RoundedBox>
      {/* vertical grab handle on the right rear door leaf, kept just behind
          the rear wrap plane so a live rear panel covers it cleanly */}
      <RoundedBox args={[0.024, 0.162, 0.03]} radius={0.008} position={[-2.82, -0.26, -0.12]}>
        {trimMaterial}
      </RoundedBox>

      {/* door mirrors: heads reach only ~165 mm beyond the body per side,
          each hung from two short arms off the door at beltline */}
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh position={[2.08, 0.62, side * 1.0]}>
            <boxGeometry args={[0.03, 0.025, 0.09]} />
            {trimMaterial}
          </mesh>
          <mesh position={[2.08, 0.44, side * 1.0]}>
            <boxGeometry args={[0.03, 0.025, 0.09]} />
            {trimMaterial}
          </mesh>
          <RoundedBox args={[0.07, 0.26, 0.15]} radius={0.02} position={[2.03, 0.52, side * 1.055]}>
            {trimMaterial}
          </RoundedBox>
        </group>
      ))}

      {/* the live wraps: real DOM on the curb side, street side and rear doors */}
      <DeviceScreen
        width={side.width}
        height={side.height}
        radius={side.radius}
        resolution={sideResolution}
        position={[side.x, side.y, body.width / 2 + 0.008]}
        background={wrapBackground}
        interactive={interactive}
        dragToRotate={dragToRotate}
        occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
        screenStyle={curbStyle}
      >
        {children}
      </DeviceScreen>
      {streetSide != null && (
        <DeviceScreen
          width={side.width}
          height={side.height}
          radius={side.radius}
          resolution={sideResolution}
          position={[side.x, side.y, -body.width / 2 - 0.008]}
          rotation={[0, Math.PI, 0]}
          background={wrapBackground}
          interactive={interactive}
          dragToRotate={dragToRotate}
          occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
          screenStyle={streetStyle}
        >
          {streetSide}
        </DeviceScreen>
      )}
      {rear != null && (
        <DeviceScreen
          width={rearSpec.width}
          height={rearSpec.height}
          radius={rearSpec.radius}
          resolution={rearResolution}
          position={[-body.length / 2 - 0.026, rearSpec.y, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          background={wrapBackground}
          interactive={interactive}
          dragToRotate={dragToRotate}
          occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
          screenStyle={screenStyle}
        >
          {rear}
        </DeviceScreen>
      )}
    </group>
  )
}
