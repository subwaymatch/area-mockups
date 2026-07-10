import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { TABLET } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface TabletProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the tablet screen: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /**
   * `landscape` lays the device on its side and swaps the virtual display to
   * H×W with upright content — exactly like rotating the real tablet.
   */
  orientation?: 'portrait' | 'landscape'
  /** Aluminum colorway. iPad Pro finishes: Space Black `#3a3c40` (default), Silver `#e3e4e6`. */
  color?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the virtual display in the current orientation. Height
   * follows the panel aspect. The default matches the 13" iPad Pro's logical
   * point grid — 1032×1376 in portrait, 1376×1032 in landscape — so content
   * (and iPadOS-class breakpoints) lay out just like on the real device.
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
   * `true` raycasts against the body (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the screen wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built Apple iPad Pro 13"-style tablet: ultra-thin flat slab,
 * uniform thin bezels, rear camera pod, edge buttons and the Apple Pencil
 * magnetic strip. No 3D asset files are loaded — the whole device is generated
 * from geometry at runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Tablet({
  children,
  orientation = 'portrait',
  color = '#3a3c40',
  screenBackground = '#000000',
  resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: TabletProps) {
  const { body, glass, display, cameraPod } = TABLET
  const landscape = orientation === 'landscape'
  const aspect = display.height / display.width
  const res = resolution ?? Math.round(TABLET.resolution * (landscape ? aspect : 1))
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
      curveSegments: 16,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body])

  const glassGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(glass.width, glass.height, glass.radius), 16),
    [glass]
  )

  const backGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(body.width - 0.05, body.height - 0.05, body.radius - 0.025),
        16
      ),
    [body]
  )

  // Rear camera pod: rounded square with the wide lens, LiDAR and flash.
  const podGeometry = React.useMemo(() => {
    const bevel = 0.014
    const shape = roundedRectShape(
      cameraPod.size - bevel * 2,
      cameraPod.size - bevel * 2,
      cameraPod.radius - bevel
    )
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 16,
    })
    return geometry
  }, [cameraPod])

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
      backGeometry.dispose()
      podGeometry.dispose()
    }
  }, [bodyGeometry, glassGeometry, backGeometry, podGeometry])

  return (
    <group {...groupProps}>
      {/* landscape lays the body on its side (camera edge up-left); the screen
          plane counter-rotates below */}
      <group rotation-z={landscape ? Math.PI / 2 : 0}>
        {/* chassis */}
        <mesh ref={bodyRef} geometry={bodyGeometry}>
          <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.38} />
        </mesh>

        {/* back panel */}
        <mesh geometry={backGeometry} rotation-y={Math.PI} position-z={-body.depth / 2 - 0.002}>
          <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.42} envMapIntensity={0.7} />
        </mesh>

        {/* cover glass (thin uniform bezel ring around the display) */}
        <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.002}>
          <meshPhysicalMaterial color="#020205" metalness={0.1} roughness={0.08} clearcoat={1} />
        </mesh>

        {/* rear camera pod (top-left from the back) with lens + LiDAR + flash */}
        <mesh
          geometry={podGeometry}
          rotation-y={Math.PI}
          position={[cameraPod.x, cameraPod.y, -body.depth / 2 - 0.002]}
        >
          <meshPhysicalMaterial color={color} metalness={0.75} roughness={0.3} clearcoat={0.6} />
        </mesh>
        <group position={[cameraPod.x + 0.09, cameraPod.y + 0.09, -body.depth / 2 - 0.036]}>
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.085, 0.085, 0.03, 40]} />
            <meshPhysicalMaterial color="#17181c" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position-z={-0.018}>
            <cylinderGeometry args={[0.06, 0.06, 0.008, 32]} />
            <meshPhysicalMaterial color="#04060a" metalness={0.2} roughness={0.12} clearcoat={1} envMapIntensity={0.4} />
          </mesh>
        </group>
        <mesh rotation-x={Math.PI / 2} position={[cameraPod.x - 0.1, cameraPod.y + 0.09, -body.depth / 2 - 0.026]}>
          <cylinderGeometry args={[0.045, 0.045, 0.012, 24]} />
          <meshPhysicalMaterial color="#efe9da" emissive="#fff3d6" emissiveIntensity={0.2} roughness={0.4} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} position={[cameraPod.x + 0.09, cameraPod.y - 0.1, -body.depth / 2 - 0.026]}>
          <cylinderGeometry args={[0.05, 0.05, 0.012, 24]} />
          <meshPhysicalMaterial color="#0b0d12" metalness={0.4} roughness={0.25} clearcoat={1} />
        </mesh>

        {/* Apple Pencil magnetic strip on the right edge (front view) */}
        <RoundedBox args={[0.02, 1.6, 0.05]} radius={0.008} position={[body.width / 2 + 0.002, 0, 0]}>
          <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.6} envMapIntensity={0.5} />
        </RoundedBox>

        {/* top button (top edge, right in portrait) + volume keys (right edge, top) */}
        <RoundedBox args={[0.3, 0.05, 0.05]} radius={0.02} position={[body.width / 2 - 0.32, body.height / 2 - 0.008, 0]}>
          <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.24} />
        </RoundedBox>
        <RoundedBox args={[0.05, 0.34, 0.05]} radius={0.02} position={[body.width / 2 - 0.008, body.height / 2 - 0.5, 0]}>
          <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.24} />
        </RoundedBox>

        {/* USB-C slot on the bottom edge */}
        <RoundedBox args={[0.16, 0.018, 0.045]} radius={0.008} position={[0, -body.height / 2 - 0.002, 0]}>
          <meshPhysicalMaterial color="#07080c" metalness={0.4} roughness={0.4} />
        </RoundedBox>

        {/* the live screen: real DOM, CSS3D-transformed onto the display */}
        <DeviceScreen
          width={landscape ? display.height : display.width}
          height={landscape ? display.width : display.height}
          radius={display.radius}
          resolution={res}
          position={[0, 0, body.depth / 2 + 0.006]}
          rotation={landscape ? [0, 0, -Math.PI / 2] : [0, 0, 0]}
          background={screenBackground}
          interactive={interactive}
          dragToRotate={dragToRotate}
          occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
          screenStyle={screenStyle}
        >
          {children}
        </DeviceScreen>
      </group>
    </group>
  )
}
