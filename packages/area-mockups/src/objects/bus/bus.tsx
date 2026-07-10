import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { BUS } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface BusProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Creative for the king-size curb-side ad panel — any React node, full bleed. */
  children?: React.ReactNode
  /** Optional live LED destination sign in the dark band above the windshield. */
  destinationSign?: React.ReactNode
  /** Body paint. Transit fleets are usually white or silver. */
  color?: string
  /** CSS background painted behind your ad content. */
  adBackground?: string
  /** CSS pixel width of the virtual ad panel. Height follows the 30x144 king size. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your ad content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How ad content hides when the bus faces away from the camera.
   * `true` raycasts against the shell (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the ad wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built 40 ft / 12 m low-floor city transit bus (generic
 * Xcelsior/LFS/Citaro-class silhouette, no brand): a one-box shell extruded
 * from the side profile — no hood, lightly-raked two-piece windshield under
 * a dark sign fascia, flat roof — with the near-half-height window band,
 * two full-glass curb-side doors, roof HVAC pod, wheels, stacked round
 * taillights, rear louvers, mirrors and bumpers added on. The curb side
 * carries a live king-size (30" x 144") ad panel between the wheels, and
 * the destination sign can be live DOM too. No 3D asset files are loaded.
 *
 * The origin is the body center; the road sits `BUS.groundY` below it. The
 * ad panel faces +Z. Must be rendered inside a react-three-fiber `<Canvas>`
 * (or `<MockupCanvas>`).
 */
export function Bus({
  children,
  destinationSign,
  color = '#eef0f2',
  adBackground = '#ffffff',
  resolution = BUS.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: BusProps) {
  const { body, skirtY, wheels, profile, windowBand, doors, hvac, ad, destination } = BUS
  const shellRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [shellRef], [])

  const shellGeometry = React.useMemo(() => {
    const { noseX, tailX, windshieldBaseY, windshieldTopX, windshieldTopY, signBandTopX, signBandTopY, roofStartX, roofY } = profile
    const arch = wheels.archRadius
    const s = new THREE.Shape()
    // counterclockwise from the rear skirt, arcs cut the wheel arches
    s.moveTo(tailX + 0.06, skirtY)
    s.lineTo(wheels.rearX - arch, skirtY)
    s.absarc(wheels.rearX, skirtY, arch, Math.PI, 0, true)
    s.lineTo(wheels.frontX - arch, skirtY)
    s.absarc(wheels.frontX, skirtY, arch, Math.PI, 0, true)
    s.lineTo(noseX - 0.07, skirtY)
    s.quadraticCurveTo(noseX, skirtY, noseX, skirtY + 0.07)
    // flat nose, light windshield rake, dark sign band, front roof dome
    s.lineTo(noseX, windshieldBaseY)
    s.lineTo(windshieldTopX, windshieldTopY)
    s.lineTo(signBandTopX, signBandTopY)
    s.quadraticCurveTo(signBandTopX - 0.06, roofY, roofStartX, roofY)
    s.lineTo(tailX + 0.1, roofY)
    s.quadraticCurveTo(tailX, roofY, tailX, roofY - 0.08)
    s.lineTo(tailX, skirtY + 0.06)
    s.quadraticCurveTo(tailX, skirtY, tailX + 0.06, skirtY)

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
  }, [body, skirtY, wheels, profile])

  // The whole front glass band — windshield up through the sign fascia —
  // reads as one dark plane on these buses.
  const frontBand = React.useMemo(() => {
    const dx = profile.signBandTopX - profile.noseX
    const dy = profile.signBandTopY - profile.windshieldBaseY
    const length = Math.hypot(dx, dy)
    return {
      tilt: Math.atan2(-dx / length, dy / length),
      length,
      mid: [
        (profile.noseX + profile.signBandTopX) / 2 + (dy / length) * 0.012,
        (profile.windshieldBaseY + profile.signBandTopY) / 2 + (-dx / length) * 0.012,
      ] as const,
    }
  }, [profile])

  React.useEffect(() => () => shellGeometry.dispose(), [shellGeometry])

  const glassMaterial = (
    <meshPhysicalMaterial color="#10161f" metalness={0.2} roughness={0.12} clearcoat={1} />
  )
  const trimMaterial = <meshPhysicalMaterial color="#23262b" metalness={0.1} roughness={0.7} />

  const bandCenterX = (windowBand.frontX + windowBand.backX) / 2
  const bandLength = windowBand.frontX - windowBand.backX
  const doorTopY = windowBand.y + windowBand.height / 2

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

      {/* front glass band: windshield + sign fascia as one dark plane, with
          the two-piece windshield's center mullion */}
      <group position={[frontBand.mid[0], frontBand.mid[1], 0]} rotation-z={frontBand.tilt}>
        <mesh rotation-y={Math.PI / 2}>
          <planeGeometry args={[body.width - 0.2, frontBand.length - 0.06]} />
          {glassMaterial}
        </mesh>
        <mesh position={[0.012, -0.28, 0]}>
          <boxGeometry args={[0.02, frontBand.length - 0.62, 0.035]} />
          {trimMaterial}
        </mesh>

        {/* live LED destination sign inside the fascia */}
        {destinationSign != null && (
          <DeviceScreen
            width={destination.width}
            height={destination.height}
            radius={0.01}
            resolution={480}
            position={[0.016, destination.y - frontBand.mid[1], 0]}
            rotation={[0, Math.PI / 2, 0]}
            background="#0a0a08"
            interactive={interactive}
            dragToRotate={dragToRotate}
            occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
            screenStyle={screenStyle}
          >
            {destinationSign}
          </DeviceScreen>
        )}
      </group>

      {/* passenger window bands, both sides — almost half the body height */}
      {[1, -1].map((side) => (
        <RoundedBox
          key={side}
          args={[bandLength, windowBand.height, 0.1]}
          radius={0.03}
          position={[bandCenterX, windowBand.y, side * (body.width / 2 - 0.03)]}
        >
          {glassMaterial}
        </RoundedBox>
      ))}

      {/* curb-side doors: full-glass slabs breaking below the belt line */}
      {doors.map(({ x, width, bottomY }) => (
        <RoundedBox
          key={x}
          args={[width, doorTopY - bottomY, 0.1]}
          radius={0.03}
          position={[x, (doorTopY + bottomY) / 2, body.width / 2 - 0.02]}
        >
          {glassMaterial}
        </RoundedBox>
      ))}

      {/* roof HVAC pod over the rear half */}
      <RoundedBox
        args={[hvac.length, hvac.height, hvac.width]}
        radius={0.05}
        position={[hvac.x, profile.roofY + hvac.height / 2, 0]}
      >
        <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.5} />
      </RoundedBox>

      {/* wheels: tire, rim, hub — four corners */}
      {([wheels.frontX, wheels.rearX] as const).map((x) =>
        [1, -1].map((side) => (
          <group key={`${x}${side}`} position={[x, wheels.centerY, side * (body.width / 2 - 0.12)]}>
            <mesh rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[wheels.radius, wheels.radius, wheels.width, 28]} />
              <meshPhysicalMaterial color="#15161a" metalness={0} roughness={0.95} />
            </mesh>
            <mesh rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.15, 0.15, wheels.width + 0.006, 24]} />
              <meshPhysicalMaterial color="#c6cad1" metalness={0.85} roughness={0.35} />
            </mesh>
            <mesh rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.05, 0.05, wheels.width + 0.012, 16]} />
              <meshPhysicalMaterial color="#3c4046" metalness={0.7} roughness={0.4} />
            </mesh>
          </group>
        ))
      )}

      {/* bumpers */}
      <RoundedBox args={[0.1, 0.27, body.width + 0.02]} radius={0.04} position={[3.17, -0.4, 0]}>
        {trimMaterial}
      </RoundedBox>
      <RoundedBox args={[0.1, 0.2, body.width + 0.02]} radius={0.04} position={[-3.17, -0.52, 0]}>
        {trimMaterial}
      </RoundedBox>

      {/* headlights low on the nose */}
      {[1, -1].map((side) => (
        <RoundedBox key={side} args={[0.05, 0.12, 0.3]} radius={0.02} position={[3.19, -0.52, side * 0.42]}>
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

      {/* rear: stacked round taillights, engine louvers, small route sign */}
      {[1, -1].map((side) =>
        [0.32, 0.16, 0.0].map((y) => (
          <mesh key={`${side}${y}`} rotation-z={Math.PI / 2} position={[-3.2, y, side * 0.56]}>
            <cylinderGeometry args={[0.05, 0.05, 0.03, 20]} />
            <meshPhysicalMaterial
              color="#8c1524"
              emissive="#b01a2e"
              emissiveIntensity={0.35}
              roughness={0.25}
              clearcoat={1}
            />
          </mesh>
        ))
      )}
      <RoundedBox args={[0.05, 0.34, 0.95]} radius={0.02} position={[-3.19, 0.42, 0]}>
        <meshPhysicalMaterial color="#1d2025" metalness={0.3} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.04, 0.14, 0.5]} radius={0.015} position={[-3.19, 0.68, 0]}>
        <meshPhysicalMaterial color="#0a0a08" metalness={0.2} roughness={0.3} clearcoat={1} />
      </RoundedBox>

      {/* door mirrors on forward arms */}
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh position={[3.12, 0.5, side * (body.width / 2 + 0.1)]} rotation-y={side * 0.3}>
            <boxGeometry args={[0.22, 0.03, 0.04]} />
            {trimMaterial}
          </mesh>
          <RoundedBox args={[0.06, 0.28, 0.12]} radius={0.02} position={[3.2, 0.36, side * (body.width / 2 + 0.16)]}>
            {trimMaterial}
          </RoundedBox>
        </group>
      ))}

      {/* the live king-size ad: real DOM on the curb side, between the wheels */}
      <DeviceScreen
        width={ad.width}
        height={ad.height}
        radius={ad.radius}
        resolution={resolution}
        position={[ad.x, ad.y, body.width / 2 + 0.008]}
        background={adBackground}
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
