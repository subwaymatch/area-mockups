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

  // Rear camera plateau, iPhone 17 style: two large lenses stacked vertically
  // on a rounded pedestal. Coordinates are front-view; mirrored on the back
  // this puts the plateau top-left with the flash to its right — matching the
  // real device.
  const plateau = { width: 0.7, height: 1.34, x: body.width / 2 - 0.49, y: body.height / 2 - 0.81 }
  const lensYs = [plateau.y + 0.3, plateau.y - 0.3]
  const flash = { x: plateau.x - 0.52, y: plateau.y + 0.3 }

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

      {/* rear camera plateau with two vertically stacked lenses */}
      <RoundedBox
        args={[plateau.width, plateau.height, 0.05]}
        radius={0.02}
        position={[plateau.x, plateau.y, -body.depth / 2 - 0.02]}
      >
        <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.3} clearcoat={0.8} />
      </RoundedBox>
      {lensYs.map((y, i) => (
        <group key={i} position={[plateau.x, y, -body.depth / 2 - 0.045]}>
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.23, 0.23, 0.05, 40]} />
            <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position-z={-0.028}>
            <cylinderGeometry args={[0.17, 0.17, 0.008, 40]} />
            <meshPhysicalMaterial color="#05070d" metalness={0.2} roughness={0.05} clearcoat={1} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position-z={-0.034}>
            <cylinderGeometry args={[0.08, 0.08, 0.008, 32]} />
            <meshPhysicalMaterial color="#101a30" metalness={0.4} roughness={0.1} clearcoat={1} />
          </mesh>
        </group>
      ))}
      {/* flash beside the plateau */}
      <mesh rotation-x={Math.PI / 2} position={[flash.x, flash.y, -body.depth / 2 - 0.008]}>
        <cylinderGeometry args={[0.06, 0.06, 0.016, 32]} />
        <meshPhysicalMaterial
          color="#efe9da"
          emissive="#fff3d6"
          emissiveIntensity={0.25}
          roughness={0.4}
        />
      </mesh>

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
