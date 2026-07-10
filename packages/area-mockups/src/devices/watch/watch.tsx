import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { WATCH } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface WatchProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the watch screen: React components, a <video>… */
  children?: React.ReactNode
  /** Case colorway. Apple Watch aluminum finishes: Jet Black `#1c1d21`
   * (default), Silver `#dfe0e3`, Rose Gold `#dcb8a8`. */
  color?: string
  /** Band colorway (Sport Band look). Defaults to a dark band. */
  bandColor?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the virtual display. Height follows the panel aspect.
   * The default 208 gives a 208×248 screen — exactly the 46 mm Apple Watch's
   * logical point grid — so content lays out like on the real device.
   */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your screen content. */
  interactive?: boolean
  /**
   * Drags that start on the screen spin the device too: once the pointer travels
   * ~10px the gesture is handed off to the orbit controls, while plain taps and
   * clicks keep reaching your content. Disable if your screen content needs its
   * own drag gestures (sliders, drawing, horizontal swipes).
   */
  dragToRotate?: boolean
  /**
   * How screen content hides when the device faces away from the camera.
   * `true` raycasts against the case (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the screen wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built Apple Watch Series 11-style smartwatch (46 mm):
 * squircle aluminum case, Digital Crown and side button on the right edge,
 * Sport-Band-style straps, and a heavily rounded live display. No 3D asset
 * files are loaded — the whole device is generated from geometry at runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Watch({
  children,
  color = '#1c1d21',
  bandColor = '#2a2c31',
  screenBackground = '#000000',
  resolution = WATCH.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: WatchProps) {
  const { body, glass, display, crown, sideButton, band } = WATCH
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  // Squircle case: extruded rounded-rect with a deep bevel for the curved sides.
  const bodyGeometry = React.useMemo(() => {
    const shape = roundedRectShape(
      body.width - body.bevel * 2,
      body.height - body.bevel * 2,
      body.radius - body.bevel
    )
    const depth = body.depth - body.bevel * 2
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: body.bevel,
      bevelSize: body.bevel,
      bevelSegments: 5,
      curveSegments: 24,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body])

  const glassGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(glass.width, glass.height, glass.radius), 24),
    [glass]
  )

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
    }
  }, [bodyGeometry, glassGeometry])

  const bandZ = -0.04 // straps sit slightly behind the case center line

  return (
    <group {...groupProps}>
      {/* case */}
      <mesh ref={bodyRef} geometry={bodyGeometry}>
        <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.3} clearcoat={0.5} />
      </mesh>

      {/* cover crystal (black ring around the display) */}
      <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.002}>
        <meshPhysicalMaterial color="#020205" metalness={0.1} roughness={0.06} clearcoat={1} />
      </mesh>

      {/* back sensor dome */}
      <mesh rotation-x={Math.PI / 2} position-z={-body.depth / 2 - 0.01}>
        <cylinderGeometry args={[0.5, 0.56, 0.03, 40]} />
        <meshPhysicalMaterial color="#101114" metalness={0.3} roughness={0.35} clearcoat={1} />
      </mesh>

      {/* Digital Crown (knurled) + side button on the right edge */}
      <group position={[body.width / 2 + 0.02, crown.y, 0]}>
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[crown.radius, crown.radius, crown.thickness, 32]} />
          <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh rotation-z={Math.PI / 2}>
          <torusGeometry args={[crown.radius * 0.82, 0.014, 8, 32]} />
          <meshPhysicalMaterial color="#0c0d10" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
      <RoundedBox
        args={[0.05, sideButton.length, 0.16]}
        radius={0.022}
        position={[body.width / 2 - 0.005, sideButton.y, 0]}
      >
        <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.24} />
      </RoundedBox>

      {/* Sport-Band straps sliding into the hidden lug slots */}
      {([1, -1] as const).map((dir) => (
        <group
          key={dir}
          position={[0, dir * (body.height / 2 + band.length / 2 - 0.16), bandZ]}
          rotation-x={dir * -0.22}
        >
          <RoundedBox args={[band.width, band.length, band.thickness]} radius={0.06}>
            <meshPhysicalMaterial color={bandColor} metalness={0.05} roughness={0.6} clearcoat={0.4} clearcoatRoughness={0.5} />
          </RoundedBox>
        </group>
      ))}
      {/* buckle pin hint on the lower strap */}
      <mesh position={[0, -(body.height / 2 + band.length - 0.32), bandZ - 0.16]} rotation-x={-0.22}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 16]} />
        <meshPhysicalMaterial color="#9aa0ab" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* the live screen: real DOM, CSS3D-transformed onto the crystal */}
      <DeviceScreen
        width={display.width}
        height={display.height}
        radius={display.radius}
        resolution={resolution}
        position={[0, 0, body.depth / 2 + 0.006]}
        background={screenBackground}
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
