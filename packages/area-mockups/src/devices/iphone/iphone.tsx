import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { IPHONE } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface IPhoneProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the phone screen: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Back glass colorway. iPhone 17 finishes work well: Black `#1a1c20`
   * (default), White `#f2f2f4`, Mist Blue `#b7c9dd`, Sage `#aebfae`, Lavender `#cfc4e6`. */
  color?: string
  /** Aluminum frame, buttons and camera-plateau color. */
  frameColor?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the virtual display. Height follows the 6.3" panel's
   * aspect. The default 402 gives a 402x874 screen — exactly the iPhone 17's
   * logical point grid (2622x1206 at 3x) — so content lays out just like it
   * would on the real device. Style your content with % / flex.
   */
  resolution?: number
  /** Show the Dynamic Island overlay. */
  dynamicIsland?: boolean
  /** Let pointer events (clicks, scrolling, typing) reach your screen content. */
  interactive?: boolean
  /**
   * Drags that start on the screen spin the device too: once the pointer travels
   * ~10px the gesture is handed off to the orbit controls, while plain taps and
   * clicks keep reaching your content. Disable if your screen content needs its
   * own drag gestures (sliders, drawing, touch scrolling).
   */
  dragToRotate?: boolean
  /**
   * How screen content hides when the device faces away from the camera.
   * `true` raycasts against the phone body (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the screen wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built Apple iPhone 17-style phone: flat aluminum frame,
 * Dynamic Island, and the dual rear camera stack on its rounded plateau. No 3D
 * asset files are loaded — the whole device is generated from geometry at
 * runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function IPhone({
  children,
  color = '#1a1c20',
  frameColor = '#3f434b',
  screenBackground = '#000000',
  resolution = 402,
  dynamicIsland = true,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: IPhoneProps) {
  const { body, glass, display, island } = IPHONE
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  // Chassis: an extruded rounded-rect with lightly beveled edges — the iPhone
  // 17's flat-sided frame. The shape is inset by the bevel size so the final
  // silhouette lands exactly on IPHONE.body.
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
      bevelSegments: 4,
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
        roundedRectShape(body.width - 0.06, body.height - 0.06, body.radius - 0.03),
        16
      ),
    [body]
  )

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
      backGeometry.dispose()
    }
  }, [bodyGeometry, glassGeometry, backGeometry])

  // CSS px per world unit for the display overlay (Dynamic Island).
  const pxPerUnit = resolution / display.width
  const px = (units: number) => units * pxPerUnit

  // Rear camera bump, iPhone 16/17 style: a vertical PILL (fully rounded ends,
  // iPhone X lineage) hugging two large stacked lenses; flash and mic sit on
  // the back panel outside the pill. Coordinates are front-view; mirrored on
  // the back this puts the pill top-left with the flash to its right —
  // matching the real device.
  const pill = { width: 0.58, height: 1.2, x: body.width / 2 - 0.41, y: body.height / 2 - 0.72 }
  const lensYs = [pill.y + 0.3, pill.y - 0.3]
  const flash = { x: pill.x - 0.45, y: pill.y + 0.3 }
  const mic = { x: pill.x - 0.45, y: pill.y + 0.08 }

  // The pill itself: an extruded rounded shape with a soft edge bevel, so the
  // face corners are truly semicircular (a RoundedBox can't round a flat face).
  const pillGeometry = React.useMemo(() => {
    const bevel = 0.018
    const shape = roundedRectShape(
      pill.width - bevel * 2,
      pill.height - bevel * 2,
      (pill.width - bevel * 2) / 2
    )
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 24,
    })
    return geometry
    // depends only on constant device dimensions
  }, [pill.width, pill.height])
  React.useEffect(() => () => pillGeometry.dispose(), [pillGeometry])

  return (
    <group {...groupProps}>
      {/* chassis */}
      <mesh ref={bodyRef} geometry={bodyGeometry}>
        <meshPhysicalMaterial color={frameColor} metalness={0.8} roughness={0.35} />
      </mesh>

      {/* back glass colorway */}
      <mesh geometry={backGeometry} rotation-y={Math.PI} position-z={-body.depth / 2 - 0.002}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.25}
          roughness={0.32}
          clearcoat={1}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* cover glass (the black ring visible around the display) */}
      <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.002}>
        <meshPhysicalMaterial color="#020205" metalness={0.1} roughness={0.08} clearcoat={1} />
      </mesh>

      {/* rear camera pill with two vertically stacked lenses */}
      <mesh geometry={pillGeometry} rotation-y={Math.PI} position={[pill.x, pill.y, -body.depth / 2 - 0.002]}>
        <meshPhysicalMaterial color={color} metalness={0.35} roughness={0.28} clearcoat={1} clearcoatRoughness={0.2} />
      </mesh>
      {lensYs.map((y, i) => (
        <group key={i} position={[pill.x, y, -body.depth / 2 - 0.05]}>
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.225, 0.225, 0.045, 48]} />
            <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position-z={-0.026}>
            <cylinderGeometry args={[0.175, 0.175, 0.008, 48]} />
            <meshPhysicalMaterial color="#04060a" metalness={0.2} roughness={0.12} clearcoat={1} envMapIntensity={0.4} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position-z={-0.032}>
            <cylinderGeometry args={[0.085, 0.085, 0.008, 32]} />
            <meshPhysicalMaterial color="#0c1526" metalness={0.4} roughness={0.15} clearcoat={1} envMapIntensity={0.5} />
          </mesh>
          {/* specular glint on the lens glass */}
          <mesh rotation-x={Math.PI / 2} position={[0.045, 0.045, -0.037]}>
            <cylinderGeometry args={[0.018, 0.018, 0.004, 16]} />
            <meshPhysicalMaterial color="#3c4c6e" metalness={0.6} roughness={0.15} clearcoat={1} />
          </mesh>
        </group>
      ))}
      {/* flash + mic on the back panel, outside the pill */}
      <mesh rotation-x={Math.PI / 2} position={[flash.x, flash.y, -body.depth / 2 - 0.008]}>
        <cylinderGeometry args={[0.06, 0.06, 0.016, 32]} />
        <meshPhysicalMaterial
          color="#efe9da"
          emissive="#fff3d6"
          emissiveIntensity={0.25}
          roughness={0.4}
        />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[mic.x, mic.y, -body.depth / 2 - 0.006]}>
        <cylinderGeometry args={[0.018, 0.018, 0.012, 16]} />
        <meshPhysicalMaterial color="#07080c" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* USB-C slot on the bottom edge */}
      <RoundedBox args={[0.15, 0.016, 0.052]} radius={0.007} position={[0, -body.height / 2 - 0.002, 0]}>
        <meshPhysicalMaterial color="#07080c" metalness={0.4} roughness={0.4} />
      </RoundedBox>

      {/* left side (front view): Action button above the volume keys */}
      <RoundedBox args={[0.04, 0.2, 0.1]} radius={0.015} position={[-body.width / 2 - 0.005, 1.12, 0]}>
        <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.04, 0.3, 0.1]} radius={0.015} position={[-body.width / 2 - 0.005, 0.7, 0]}>
        <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.04, 0.3, 0.1]} radius={0.015} position={[-body.width / 2 - 0.005, 0.3, 0]}>
        <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.3} />
      </RoundedBox>

      {/* right side (front view): side button + Camera Control */}
      <RoundedBox args={[0.04, 0.42, 0.1]} radius={0.015} position={[body.width / 2 + 0.005, 0.72, 0]}>
        <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.03, 0.3, 0.09] } radius={0.012} position={[body.width / 2 + 0.002, -0.5, 0]}>
        <meshPhysicalMaterial color={frameColor} metalness={0.9} roughness={0.2} />
      </RoundedBox>

      {/* the live screen: real DOM, CSS3D-transformed onto the display */}
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
        overlay={
          dynamicIsland ? (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: px(island.offsetY - island.height / 2),
                left: '50%',
                transform: 'translateX(-50%)',
                width: px(island.width),
                height: px(island.height),
                borderRadius: px(island.height / 2),
                background: '#020308',
                boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.04)',
                pointerEvents: 'none',
                zIndex: 2147483647,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: px(0.05),
              }}
            >
              <div
                style={{
                  width: px(0.09),
                  height: px(0.09),
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 38% 38%, #1b2436 0%, #05060a 55%, #000 100%)',
                }}
              />
            </div>
          ) : undefined
        }
      >
        {children}
      </DeviceScreen>
    </group>
  )
}
