import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { BUS } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface BusProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Creative for the curb-side (+Z) king-size ad panel — any React node, full bleed. */
  children?: React.ReactNode
  /** Creative for the street-side (−Z) king-size ad panel. */
  streetSideAd?: React.ReactNode
  /** Creative for the rear tail-ad panel (21"x70") on the engine door. */
  rearAd?: React.ReactNode
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
  streetSideAd,
  rearAd,
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
  const { body, skirtY, wheels, profile, windowBand, doors, hvac, ad, rearAd: rearAdSpec, rearWindow, destination } = BUS
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
      // a small in-plane bevel keeps the profile within ~15mm of nominal,
      // so the glass band and lamps placed on it stay visible
      bevelSize: 0.015,
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
        (profile.noseX + profile.signBandTopX) / 2 + (dy / length) * 0.032,
        (profile.windshieldBaseY + profile.signBandTopY) / 2 + (-dx / length) * 0.032,
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
  // drive-axle dual pair: outer tire face lines up with the single fronts
  const dualOuterZ = body.width / 2 - 0.02 - wheels.dualWidth / 2
  const dualInnerZ = dualOuterZ - wheels.dualWidth - wheels.dualGap

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

      {/* curb-side doors: two-leaf full-glass slabs dropping to the low-floor
          entry, with a center mullion slightly proud of the glass marking the
          leaf split */}
      {doors.map(({ x, width, bottomY }) => (
        <group key={x}>
          <RoundedBox
            args={[width, doorTopY - bottomY, 0.1]}
            radius={0.03}
            position={[x, (doorTopY + bottomY) / 2, body.width / 2 - 0.02]}
          >
            {glassMaterial}
          </RoundedBox>
          <mesh position={[x, (doorTopY + bottomY) / 2, body.width / 2 + 0.036]}>
            <boxGeometry args={[0.013, doorTopY - bottomY - 0.04, 0.015]} />
            {trimMaterial}
          </mesh>
        </group>
      ))}

      {/* roof HVAC pod over the rear half */}
      <RoundedBox
        args={[hvac.length, hvac.height, hvac.width]}
        radius={0.05}
        position={[hvac.x, profile.roofY + hvac.height / 2, 0]}
      >
        <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.5} />
      </RoundedBox>

      {/* running gear: dark wheel-well liners fill the arch openings, axles
          tie each wheel pair together, and an underbody pan closes the gap
          between the skirts — the wheels read as attached, not floating */}
      {([wheels.frontX, wheels.rearX] as const).map((x) => (
        <group key={x}>
          <mesh position={[x, skirtY + (wheels.archRadius + 0.02) / 2, 0]}>
            <boxGeometry args={[wheels.archRadius * 2 - 0.04, wheels.archRadius + 0.02, body.width - 0.08]} />
            <meshPhysicalMaterial color="#0c0d10" metalness={0} roughness={1} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position={[x, wheels.centerY, 0]}>
            <cylinderGeometry args={[0.05, 0.05, body.width - 0.3, 12]} />
            <meshPhysicalMaterial color="#191b1f" metalness={0.5} roughness={0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, skirtY - 0.06, 0]}>
        <boxGeometry args={[body.length - 0.7, 0.12, body.width - 0.36]} />
        <meshPhysicalMaterial color="#0d0e11" metalness={0.1} roughness={0.95} />
      </mesh>

      {/* wheels: single steer tires up front — tire, rim, hub */}
      {[1, -1].map((side) => (
        <group key={side} position={[wheels.frontX, wheels.centerY, side * (body.width / 2 - 0.12)]}>
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
      ))}
      {/* drive axle runs dual tires per side; rim and hub only on the outer */}
      {[1, -1].map((side) => (
        <group key={side} position={[wheels.rearX, wheels.centerY, 0]}>
          {[dualOuterZ, dualInnerZ].map((z) => (
            <mesh key={z} rotation-x={Math.PI / 2} position={[0, 0, side * z]}>
              <cylinderGeometry args={[wheels.radius, wheels.radius, wheels.dualWidth, 28]} />
              <meshPhysicalMaterial color="#15161a" metalness={0} roughness={0.95} />
            </mesh>
          ))}
          <mesh rotation-x={Math.PI / 2} position={[0, 0, side * dualOuterZ]}>
            <cylinderGeometry args={[0.15, 0.15, wheels.dualWidth + 0.006, 24]} />
            <meshPhysicalMaterial color="#c6cad1" metalness={0.85} roughness={0.35} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position={[0, 0, side * dualOuterZ]}>
            <cylinderGeometry args={[0.05, 0.05, wheels.dualWidth + 0.012, 16]} />
            <meshPhysicalMaterial color="#3c4046" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* bumpers */}
      <RoundedBox args={[0.1, 0.27, body.width + 0.02]} radius={0.04} position={[3.2, -0.4, 0]}>
        {trimMaterial}
      </RoundedBox>
      <RoundedBox args={[0.1, 0.2, body.width + 0.02]} radius={0.04} position={[-3.2, -0.52, 0]}>
        {trimMaterial}
      </RoundedBox>

      {/* headlights low on the nose, amber turn signals at the corners */}
      {[1, -1].map((side) => (
        <group key={side}>
          <RoundedBox args={[0.05, 0.12, 0.28]} radius={0.02} position={[3.21, -0.52, side * 0.4]}>
            <meshPhysicalMaterial
              color="#e8edf4"
              emissive="#dfe9f5"
              emissiveIntensity={0.25}
              metalness={0.3}
              roughness={0.2}
              clearcoat={1}
            />
          </RoundedBox>
          <RoundedBox args={[0.05, 0.1, 0.09]} radius={0.02} position={[3.21, -0.51, side * 0.6]}>
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

      {/* rear: window above the engine bay, small route-sign box near the
          roof, engine louvers, and stacked round lamps — brake and tail in
          red, turn signal in amber — at each corner */}
      <RoundedBox
        args={[0.05, rearWindow.height, rearWindow.width]}
        radius={0.03}
        position={[-3.21, rearWindow.y, 0]}
      >
        {glassMaterial}
      </RoundedBox>
      <RoundedBox args={[0.04, 0.1, 0.5]} radius={0.015} position={[-3.22, 0.77, 0]}>
        <meshPhysicalMaterial color="#0a0a08" metalness={0.2} roughness={0.3} clearcoat={1} />
      </RoundedBox>
      <RoundedBox args={[0.05, 0.22, 0.9]} radius={0.02} position={[-3.21, 0.05, 0]}>
        <meshPhysicalMaterial color="#1d2025" metalness={0.3} roughness={0.6} />
      </RoundedBox>
      {[1, -1].map((side) =>
        (
          [
            { y: 0.3, color: '#8c1524', emissive: '#c11a30' },
            { y: 0.16, color: '#8c1524', emissive: '#c11a30' },
            { y: 0.02, color: '#f2a33c', emissive: '#ffb340' },
          ] as const
        ).map(({ y, color: lampColor, emissive }) => (
          <mesh key={`${side}${y}`} rotation-z={Math.PI / 2} position={[-3.22, y, side * 0.56]}>
            <cylinderGeometry args={[0.05, 0.05, 0.03, 20]} />
            <meshPhysicalMaterial
              color={lampColor}
              emissive={emissive}
              emissiveIntensity={0.4}
              roughness={0.25}
              clearcoat={1}
            />
          </mesh>
        ))
      )}

      {/* door mirrors on swan-neck arms: the heads hang ~450 mm forward of
          the windshield at its mid-height, transit style — root stub off the
          A-pillar, forward run, then the drop to the head */}
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh position={[3.15, 0.34, side * (body.width / 2 + 0.06)]}>
            <boxGeometry args={[0.035, 0.03, 0.16]} />
            {trimMaterial}
          </mesh>
          <mesh position={[3.29, 0.34, side * (body.width / 2 + 0.12)]}>
            <boxGeometry args={[0.32, 0.028, 0.028]} />
            {trimMaterial}
          </mesh>
          <mesh position={[3.44, 0.22, side * (body.width / 2 + 0.12)]}>
            <boxGeometry args={[0.028, 0.26, 0.028]} />
            {trimMaterial}
          </mesh>
          <RoundedBox
            args={[0.06, 0.3, 0.13]}
            radius={0.02}
            position={[3.44, 0.05, side * (body.width / 2 + 0.12)]}
            rotation-y={side * 0.15}
          >
            {trimMaterial}
          </RoundedBox>
        </group>
      ))}

      {/* five amber marker lights across the front roof dome */}
      {[-0.44, -0.22, 0, 0.22, 0.44].map((z) => (
        <RoundedBox key={z} args={[0.05, 0.03, 0.09]} radius={0.012} position={[2.99, 0.81, z]} rotation-z={-0.49}>
          <meshPhysicalMaterial
            color="#f2a33c"
            emissive="#ffb340"
            emissiveIntensity={0.4}
            roughness={0.25}
            clearcoat={1}
          />
        </RoundedBox>
      ))}

      {/* the live ads: king-size panels on both sides, tail ad on the rear */}
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
      {streetSideAd != null && (
        <DeviceScreen
          width={ad.width}
          height={ad.height}
          radius={ad.radius}
          resolution={resolution}
          position={[ad.x, ad.y, -body.width / 2 - 0.008]}
          rotation={[0, Math.PI, 0]}
          background={adBackground}
          interactive={interactive}
          dragToRotate={dragToRotate}
          occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
          screenStyle={screenStyle}
        >
          {streetSideAd}
        </DeviceScreen>
      )}
      {rearAd != null && (
        <DeviceScreen
          width={rearAdSpec.width}
          height={rearAdSpec.height}
          radius={rearAdSpec.radius}
          resolution={Math.round(resolution * (rearAdSpec.width / ad.width))}
          position={[-body.length / 2 - 0.028, rearAdSpec.y, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          background={adBackground}
          interactive={interactive}
          dragToRotate={dragToRotate}
          occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
          screenStyle={screenStyle}
        >
          {rearAd}
        </DeviceScreen>
      )}
    </group>
  )
}
