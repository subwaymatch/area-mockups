import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { VAN } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface VanProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Livery for the cargo-side wrap panel — any React node, full bleed. */
  children?: React.ReactNode
  /** Body paint. Wrap fleets are usually white. */
  color?: string
  /** CSS background painted behind your wrap content. */
  wrapBackground?: string
  /** CSS pixel width of the virtual wrap panel. Height follows the panel aspect. */
  resolution?: number
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
  color = '#eef0f2',
  wrapBackground = '#ffffff',
  resolution = VAN.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: VanProps) {
  const { body, rockerY, wheels, profile, wrap } = VAN
  const shellRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [shellRef], [])

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
      bevelSize: body.bevel,
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
        (profile.cowlX + profile.windshieldTopX) / 2 + (dy / length) * 0.012,
        (profile.cowlY + profile.windshieldTopY) / 2 + (-dx / length) * 0.012,
      ] as const,
    }
  }, [profile])

  // Cab door glass: trapezoid with the leading edge slanted parallel to the
  // A-pillar and a blacked-out sail area, like the references.
  const doorGlassGeometry = React.useMemo(() => {
    const rake = 0.36 // dx per unit dy of the windshield slope
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

      {/* main grille, high on the nose between the headlights */}
      <RoundedBox args={[0.04, 0.4, 1.0]} radius={0.015} position={[2.79, -0.1, 0]}>
        <meshPhysicalMaterial color="#1d2025" metalness={0.3} roughness={0.6} />
      </RoundedBox>
      {/* slim lower intake in the bumper mass */}
      <RoundedBox args={[0.04, 0.14, 1.2]} radius={0.015} position={[2.83, -0.62, 0]}>
        <meshPhysicalMaterial color="#141619" metalness={0.3} roughness={0.65} />
      </RoundedBox>
      {/* headlights, swept toward the corners at hood height */}
      {[1, -1].map((side) => (
        <RoundedBox key={side} args={[0.06, 0.18, 0.5]} radius={0.03} position={[2.78, -0.08, side * 0.66]}>
          <meshPhysicalMaterial
            color="#e8edf4"
            emissive="#dfe9f5"
            emissiveIntensity={0.25}
            metalness={0.3}
            roughness={0.2}
            clearcoat={1}
          />
        </RoundedBox>
      ))}

      {/* black plastic nose mass below the headlights, wrapping the corners */}
      <RoundedBox args={[0.16, 0.5, body.width + 0.02]} radius={0.05} position={[2.76, -0.6, 0]}>
        {trimMaterial}
      </RoundedBox>
      <RoundedBox args={[0.1, 0.16, body.width + 0.02]} radius={0.04} position={[-2.77, -0.82, 0]}>
        {trimMaterial}
      </RoundedBox>
      {/* taillights at hand height on the rear corners */}
      {[1, -1].map((side) => (
        <RoundedBox key={side} args={[0.05, 0.46, 0.12]} radius={0.02} position={[-2.8, -0.07, side * 0.82]}>
          <meshPhysicalMaterial
            color="#8c1524"
            emissive="#b01a2e"
            emissiveIntensity={0.35}
            roughness={0.25}
            clearcoat={1}
          />
        </RoundedBox>
      ))}

      {/* door mirrors on long arms, standing well outboard */}
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh position={[2.06, 0.66, side * 1.09]}>
            <boxGeometry args={[0.05, 0.03, 0.28]} />
            {trimMaterial}
          </mesh>
          <RoundedBox args={[0.07, 0.26, 0.15]} radius={0.02} position={[2.03, 0.52, side * 1.22]}>
            {trimMaterial}
          </RoundedBox>
        </group>
      ))}

      {/* the live wrap: real DOM, CSS3D-transformed onto the cargo side */}
      <DeviceScreen
        width={wrap.width}
        height={wrap.height}
        radius={wrap.radius}
        resolution={resolution}
        position={[wrap.x, wrap.y, body.width / 2 + 0.008]}
        background={wrapBackground}
        interactive={interactive}
        dragToRotate={dragToRotate}
        occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
        screenStyle={screenStyle}
      >
        {children}
      </DeviceScreen>
    </group>
  )
}
