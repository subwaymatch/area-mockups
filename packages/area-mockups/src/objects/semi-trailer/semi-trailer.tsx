import * as React from 'react'
import type * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { SEMI_TRAILER } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface SemiTrailerProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Wrap for the curb-side (+Z) panel — any React node, full bleed. */
  children?: React.ReactNode
  /** Wrap for the street-side (−Z) panel. */
  streetSide?: React.ReactNode
  /** Panel on the rear doors, between the lock rods. */
  rear?: React.ReactNode
  /** Box paint. Wrap trailers are usually white. */
  color?: string
  /** CSS background painted behind your wrap content. */
  wrapBackground?: string
  /** CSS pixel width of the virtual side panel. The rear shares its dpi. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your wrap content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How wrap content hides when the trailer faces away from the camera.
   * `true` raycasts against the box (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each wrap wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built 53 ft dry-van semi trailer, parked on its landing
 * gear: smooth wrap-ready sides, tandem rear axles, side skirts, ICC bumper,
 * lock-rod rear doors, mudflaps, and DOT reflective tape along the bottom
 * rail. Both sides and the rear doors are live DOM. No 3D asset files are
 * loaded.
 *
 * The origin is the box center; the road sits `SEMI_TRAILER.groundY` below
 * it. Must be rendered inside a react-three-fiber `<Canvas>` (or
 * `<MockupCanvas>`).
 */
export function SemiTrailer({
  children,
  streetSide,
  rear,
  color = '#eef0f2',
  wrapBackground = '#ffffff',
  resolution = SEMI_TRAILER.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: SemiTrailerProps) {
  const { body, groundY, wheels, landingGear, side, rear: rearSpec } = SEMI_TRAILER
  const boxRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [boxRef], [])

  const steel = { color: '#1d2025', metalness: 0.4, roughness: 0.6 }
  const floorY = -body.height / 2

  const wrapProps = {
    background: wrapBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  return (
    <group {...groupProps}>
      {/* the box — smooth-sided, wrap-ready */}
      <RoundedBox ref={boxRef} args={[body.length, body.height, body.width]} radius={body.radius}>
        <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.4} clearcoat={0.6} clearcoatRoughness={0.3} />
      </RoundedBox>

      {/* underbody frame, kingpin plate, side skirts */}
      <mesh position={[0, floorY - 0.055, 0]}>
        <boxGeometry args={[body.length - 0.2, 0.11, body.width - 0.16]} />
        <meshPhysicalMaterial color="#0d0e11" metalness={0.1} roughness={0.95} />
      </mesh>
      <mesh position={[2.85, floorY - 0.09, 0]}>
        <boxGeometry args={[0.6, 0.06, 0.6]} />
        <meshPhysicalMaterial {...steel} />
      </mesh>
      {([1, -1] as const).map((s) => (
        <mesh key={s} position={[0.1, floorY - 0.24, s * (body.width / 2 - 0.03)]}>
          <boxGeometry args={[3.2, 0.36, 0.025]} />
          <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.5} />
        </mesh>
      ))}

      {/* amber front markers, white inverted-L conspicuity at the rear corners */}
      {([1, -1] as const).map((s) => (
        <mesh key={s} position={[body.length / 2 - 0.06, 0.5, s * (body.width / 2 + 0.002)]}>
          <planeGeometry args={[0.08, 0.045]} />
          <meshPhysicalMaterial color="#f2a33c" emissive="#ffb340" emissiveIntensity={0.4} roughness={0.3} side={2} />
        </mesh>
      ))}
      {([1, -1] as const).map((s) => (
        <group key={s}>
          <mesh position={[-body.length / 2 - 0.002, 0.42, s * 0.47]} rotation-y={-Math.PI / 2}>
            <planeGeometry args={[0.05, 0.26]} />
            <meshPhysicalMaterial color="#e8ecf2" emissive="#f4f7fb" emissiveIntensity={0.25} roughness={0.3} side={2} />
          </mesh>
          <mesh position={[-body.length / 2 - 0.002, 0.53, s * 0.37]} rotation-y={-Math.PI / 2}>
            <planeGeometry args={[0.26, 0.05]} />
            <meshPhysicalMaterial color="#e8ecf2" emissive="#f4f7fb" emissiveIntensity={0.25} roughness={0.3} side={2} />
          </mesh>
        </group>
      ))}

      {/* DOT reflective tape along both bottom rails */}
      {([1, -1] as const).map((s) =>
        Array.from({ length: 10 }, (_, i) => (
          <mesh key={`${s}${i}`} position={[-body.length / 2 + 0.5 + i * 0.61, floorY + 0.045, s * (body.width / 2 + 0.002)]}>
            <planeGeometry args={[0.3, 0.045]} />
            <meshPhysicalMaterial
              color={i % 2 ? '#c8ccd2' : '#a01822'}
              emissive={i % 2 ? '#e8ecf2' : '#c01a28'}
              emissiveIntensity={0.25}
              roughness={0.3}
              side={2}
            />
          </mesh>
        ))
      )}

      {/* tandem axles: bogie, axles, dual wheels, mudflaps */}
      <mesh position={[(wheels.axles[0] + wheels.axles[1]) / 2, floorY - 0.22, 0]}>
        <boxGeometry args={[1.15, 0.3, 0.8]} />
        <meshPhysicalMaterial {...steel} />
      </mesh>
      {wheels.axles.map((x) => (
        <group key={x}>
          <mesh rotation-x={Math.PI / 2} position={[x, wheels.centerY, 0]}>
            <cylinderGeometry args={[0.045, 0.045, body.width - 0.2, 10]} />
            <meshPhysicalMaterial {...steel} />
          </mesh>
          {([1, -1] as const).map((s) => (
            <group key={s} position={[x, wheels.centerY, s * (body.width / 2 - 0.21)]}>
              <mesh rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[wheels.radius, wheels.radius, wheels.width, 24]} />
                <meshPhysicalMaterial color="#15161a" metalness={0} roughness={0.95} />
              </mesh>
              <mesh rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[0.115, 0.115, wheels.width + 0.006, 20]} />
                <meshPhysicalMaterial color="#c6cad1" metalness={0.85} roughness={0.35} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {([1, -1] as const).map((s) => (
        <mesh key={s} position={[wheels.axles[1] - 0.32, groundY + 0.14, s * (body.width / 2 - 0.21)]}>
          <boxGeometry args={[0.02, 0.26, 0.3]} />
          <meshPhysicalMaterial color="#0d0e11" metalness={0} roughness={0.95} />
        </mesh>
      ))}

      {/* landing gear: legs, cross brace, foot pads */}
      {([1, -1] as const).map((s) => (
        <group key={s} position={[landingGear.x, 0, s * landingGear.spread]}>
          <mesh position={[0, (floorY - 0.11 + groundY + 0.02) / 2, 0]}>
            <boxGeometry args={[0.08, floorY - 0.11 - groundY - 0.02, 0.08]} />
            <meshPhysicalMaterial {...steel} />
          </mesh>
          <mesh position={[0, groundY + 0.02, 0]}>
            <boxGeometry args={[0.17, 0.04, 0.17]} />
            <meshPhysicalMaterial {...steel} />
          </mesh>
        </group>
      ))}
      <mesh rotation-x={Math.PI / 2} position={[landingGear.x, groundY + 0.28, 0]}>
        <cylinderGeometry args={[0.02, 0.02, landingGear.spread * 2, 8]} />
        <meshPhysicalMaterial {...steel} />
      </mesh>

      {/* rear: ICC bumper and door lock rods */}
      <mesh position={[-body.length / 2 + 0.02, groundY + 0.2, 0]}>
        <boxGeometry args={[0.05, 0.05, 0.9]} />
        <meshPhysicalMaterial {...steel} />
      </mesh>
      {([1, -1] as const).map((s) => (
        <mesh key={s} position={[-body.length / 2 + 0.03, groundY + 0.32, s * 0.3]}>
          <boxGeometry args={[0.04, 0.28, 0.045]} />
          <meshPhysicalMaterial {...steel} />
        </mesh>
      ))}
      {([0.24, -0.24, 0.44, -0.44] as const).map((z) => (
        <mesh key={z} rotation-x={0} position={[-body.length / 2 - 0.012, 0, z]}>
          <cylinderGeometry args={[0.013, 0.013, body.height - 0.08, 8]} />
          <meshPhysicalMaterial color="#c6cad1" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}

      {/* the live wraps: both smooth sides and the rear doors */}
      <DeviceScreen
        {...wrapProps}
        width={side.width}
        height={side.height}
        radius={side.radius}
        resolution={resolution}
        position={[0, 0.02, body.width / 2 + 0.006]}
      >
        {children}
      </DeviceScreen>
      {streetSide != null && (
        <DeviceScreen
          {...wrapProps}
          width={side.width}
          height={side.height}
          radius={side.radius}
          resolution={resolution}
          position={[0, 0.02, -body.width / 2 - 0.006]}
          rotation={[0, Math.PI, 0]}
        >
          {streetSide}
        </DeviceScreen>
      )}
      {rear != null && (
        <DeviceScreen
          {...wrapProps}
          width={rearSpec.width}
          height={rearSpec.height}
          radius={rearSpec.radius}
          resolution={Math.round(resolution * (rearSpec.width / side.width))}
          position={[-body.length / 2 - 0.03, 0.02, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          overlay={
            <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2147483647 }}>
              {[3, 24.5, 72.5, 94].map((left) => (
                <div
                  key={left}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${left}%`,
                    width: '3%',
                    background:
                      'linear-gradient(90deg, rgba(60,64,70,0.9), rgba(200,204,210,0.95) 45%, rgba(60,64,70,0.9))',
                    boxShadow: '2px 0 4px rgba(0,0,0,0.35)',
                  }}
                />
              ))}
            </div>
          }
        >
          {rear}
        </DeviceScreen>
      )}
    </group>
  )
}
