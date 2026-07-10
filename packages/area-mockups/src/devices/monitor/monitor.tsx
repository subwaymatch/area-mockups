import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { MONITOR } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface MonitorProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the monitor: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Aluminum colorway (enclosure + stand). */
  color?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the virtual display. Height follows the 16:9 panel.
   * The default 2560 gives a 2560×1440 screen — exactly the Studio Display's
   * logical "looks like" resolution (5120×2880 at 2x) — so desktop layouts
   * behave like on the real display.
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
   * `true` raycasts against the enclosure (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the screen wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built Apple Studio Display-style monitor: 27" 5K panel in an
 * all-aluminum enclosure with a uniform black bezel, centered camera dot,
 * L-shaped tilt stand, USB-C/Thunderbolt port row and power inlet on the back
 * (and, faithfully, no power button). No 3D asset files are loaded.
 *
 * The group origin is the panel center; the stand reaches `MONITOR.standHeight`
 * below it. Must be rendered inside a react-three-fiber `<Canvas>` (or
 * `<MockupCanvas>`).
 */
export function Monitor({
  children,
  color = '#c8cbd0',
  screenBackground = '#000000',
  resolution = MONITOR.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: MonitorProps) {
  const { body, glass, display, stand, standHeight } = MONITOR
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

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
      bevelSegments: 3,
      curveSegments: 12,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body])

  const glassGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(glass.width, glass.height, glass.radius), 12),
    [glass]
  )

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
    }
  }, [bodyGeometry, glassGeometry])

  return (
    <group {...groupProps}>
      {/* enclosure */}
      <mesh ref={bodyRef} geometry={bodyGeometry}>
        <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.35} />
      </mesh>

      {/* cover glass (uniform black bezel) */}
      <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.002}>
        <meshPhysicalMaterial color="#020205" metalness={0.1} roughness={0.07} clearcoat={1} />
      </mesh>

      {/* centered camera dot in the top bezel */}
      <mesh rotation-x={Math.PI / 2} position={[0, glass.height / 2 - (glass.height - display.height) / 4, body.depth / 2 + 0.004]}>
        <cylinderGeometry args={[0.02, 0.02, 0.004, 16]} />
        <meshPhysicalMaterial color="#0a1420" metalness={0.4} roughness={0.2} clearcoat={1} />
      </mesh>

      {/* back: 2x Thunderbolt 5 + 2x USB-C row (2nd-gen port set, same layout) and the captive power inlet */}
      {[0, 1, 2, 3].map((i) => (
        <RoundedBox
          key={i}
          args={[0.11, 0.042, 0.02]}
          radius={0.018}
          position={[body.width / 2 - 0.7 - i * 0.2, -body.height / 2 + 0.42, -body.depth / 2 - 0.004]}
        >
          <meshPhysicalMaterial color="#07080c" metalness={0.4} roughness={0.4} />
        </RoundedBox>
      ))}
      <mesh rotation-x={Math.PI / 2} position={[0, -body.height / 2 + 0.42, -body.depth / 2 - 0.006]}>
        <cylinderGeometry args={[0.06, 0.06, 0.012, 24]} />
        <meshPhysicalMaterial color="#101114" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* L-shaped tilt stand: the arm leaves the back panel and sweeps down-back,
          landing flush on the base plate (never poking through it) */}
      <group position={[0, -body.height / 2, -body.depth / 2]}>
        <RoundedBox
          args={[stand.armWidth, 1.28, stand.armThickness]}
          radius={0.03}
          position={[0, -0.4, -0.34]}
          rotation-x={0.47}
        >
          <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.5} envMapIntensity={1} />
        </RoundedBox>
        <RoundedBox
          args={[stand.base.width, stand.base.thickness, stand.base.depth]}
          radius={0.028}
          smoothness={6}
          position={[0, -(standHeight - body.height / 2) + stand.base.thickness / 2, -0.62]}
        >
          <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.5} envMapIntensity={1} />
        </RoundedBox>
      </group>

      {/* the live screen: real DOM, CSS3D-transformed onto the panel */}
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
