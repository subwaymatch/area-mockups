import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { TABLET_VARIANTS, type TabletVariant } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '@area-mockups/core'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface TabletProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the tablet screen: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /**
   * Which tablet to render, at true relative sizes: `ipadpro13` (default),
   * `ipadpro11`, `tabs11` (Galaxy Tab S11 11"), `tabs11ultra` (14.6", display
   * notch, dual camera rings).
   */
  variant?: TabletVariant
  /**
   * `landscape` lays the device on its side and swaps the virtual display to
   * H×W with upright content — exactly like rotating the real tablet.
   */
  orientation?: 'portrait' | 'landscape'
  /** Body colorway. iPad Pro: Space Black `#3a3c40` (default), Silver `#e3e4e6`.
   * Galaxy Tab: Gray `#4b4f56`, Silver `#d7dade`. */
  color?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the virtual display in the current orientation. Height
   * follows the panel aspect. Defaults to the device's logical grid — e.g.
   * the 13" iPad Pro gives 1032×1376 in portrait and 1376×1032 in landscape —
   * so content and breakpoints lay out just like on the real device.
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
 * A procedurally built tablet — Apple iPad Pro (M5) or Samsung Galaxy Tab S11
 * style depending on `variant`: ultra-thin flat slab, thin bezels, per-family
 * rear camera (iPad pod with LiDAR vs Tab protruding rings), long-edge stylus
 * mount (Pencil charging strip vs octagonal S Pen side clip), landscape-edge
 * front camera, edge buttons and USB-C. No 3D asset files are loaded —
 * everything is generated from geometry at runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Tablet({
  children,
  variant = 'ipadpro13',
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
  const spec = TABLET_VARIANTS[variant]
  const { body, glass, display, rearCamera, stylus, notch, pogo } = spec
  const landscape = orientation === 'landscape'
  const aspect = display.height / display.width
  const res = resolution ?? Math.round(spec.resolution * (landscape ? aspect : 1))
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(bodyRef)
  const isPad = rearCamera.style === 'pod'

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

  const podGeometry = React.useMemo(() => {
    if (rearCamera.style !== 'pod') return null
    const bevel = 0.014
    const shape = roundedRectShape(
      rearCamera.size - bevel * 2,
      rearCamera.size - bevel * 2,
      rearCamera.radius - bevel
    )
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 16,
    })
  }, [rearCamera])

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
      backGeometry.dispose()
      podGeometry?.dispose()
    }
  }, [bodyGeometry, glassGeometry, backGeometry, podGeometry])

  // CSS px per world unit for the display overlay (Tab Ultra notch).
  const pxPerUnit = res / (landscape ? display.height : display.width)
  const px = (units: number) => units * pxPerUnit

  return (
    <group {...groupProps}>
      {/* landscape lays the body on its side; the screen counter-rotates below */}
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

        {/* front camera — a dot in the bezel on the landscape-top (portrait
            right) edge, where iPad Pro (M4/M5) and Tab S11 put it; the Tab
            Ultra's camera lives in its display notch instead */}
        {!notch && (
          <mesh
            rotation-x={Math.PI / 2}
            position={[display.width / 2 + (glass.width - display.width) / 4, 0, body.depth / 2 + 0.004]}
          >
            <cylinderGeometry args={[0.016, 0.016, 0.004, 16]} />
            <meshPhysicalMaterial color="#0a1420" metalness={0.4} roughness={0.2} clearcoat={1} />
          </mesh>
        )}

        {/* rear camera: iPad pod (wide + LiDAR + flash) or Tab floating rings */}
        {rearCamera.style === 'pod' && podGeometry && (
          <>
            <mesh
              geometry={podGeometry}
              rotation-y={Math.PI}
              position={[rearCamera.x, rearCamera.y, -body.depth / 2 - 0.002]}
            >
              <meshPhysicalMaterial color={color} metalness={0.75} roughness={0.3} clearcoat={0.6} />
            </mesh>
            <group position={[rearCamera.x + 0.09, rearCamera.y + 0.09, -body.depth / 2 - 0.036]}>
              <mesh rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[0.085, 0.085, 0.03, 40]} />
                <meshPhysicalMaterial color="#17181c" metalness={0.85} roughness={0.3} />
              </mesh>
              <mesh rotation-x={Math.PI / 2} position-z={-0.018}>
                <cylinderGeometry args={[0.06, 0.06, 0.008, 32]} />
                <meshPhysicalMaterial color="#04060a" metalness={0.2} roughness={0.12} clearcoat={1} envMapIntensity={0.4} />
              </mesh>
            </group>
            <mesh rotation-x={Math.PI / 2} position={[rearCamera.x - 0.1, rearCamera.y + 0.09, -body.depth / 2 - 0.026]}>
              <cylinderGeometry args={[0.045, 0.045, 0.012, 24]} />
              <meshPhysicalMaterial color="#efe9da" emissive="#fff3d6" emissiveIntensity={0.2} roughness={0.4} />
            </mesh>
            <mesh rotation-x={Math.PI / 2} position={[rearCamera.x + 0.09, rearCamera.y - 0.1, -body.depth / 2 - 0.026]}>
              <cylinderGeometry args={[0.05, 0.05, 0.012, 24]} />
              <meshPhysicalMaterial color="#0b0d12" metalness={0.4} roughness={0.25} clearcoat={1} />
            </mesh>
          </>
        )}
        {rearCamera.style === 'rings' && (
          <>
            {rearCamera.rings.map(({ x, y, r }, i) => (
              <group key={i} position={[x, y, -body.depth / 2]}>
                <mesh rotation-x={Math.PI / 2} position-z={-0.016}>
                  <cylinderGeometry args={[r, r, 0.05, 40]} />
                  <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.25} />
                </mesh>
                <mesh rotation-x={Math.PI / 2} position-z={-0.042}>
                  <cylinderGeometry args={[r * 0.76, r * 0.76, 0.008, 40]} />
                  <meshPhysicalMaterial color="#05070d" metalness={0.2} roughness={0.08} clearcoat={1} envMapIntensity={0.4} />
                </mesh>
                <mesh rotation-x={Math.PI / 2} position-z={-0.048}>
                  <cylinderGeometry args={[r * 0.34, r * 0.34, 0.008, 32]} />
                  <meshPhysicalMaterial color="#0c1526" metalness={0.4} roughness={0.12} clearcoat={1} envMapIntensity={0.5} />
                </mesh>
              </group>
            ))}
            <mesh rotation-x={Math.PI / 2} position={[rearCamera.flash.x, rearCamera.flash.y, -body.depth / 2 - 0.008]}>
              <cylinderGeometry args={[0.04, 0.04, 0.014, 24]} />
              <meshPhysicalMaterial color="#efe9da" emissive="#fff3d6" emissiveIntensity={0.2} roughness={0.4} />
            </mesh>
          </>
        )}

        {/* stylus on the portrait right edge (landscape top): the iPad's Pencil
            charging strip, or the Tab's octagonal S Pen clipped to the long
            side (the back charging strip is gone this generation) */}
        <RoundedBox
          args={[0.02, stylus.length, 0.05]}
          radius={0.008}
          position={[body.width / 2 + 0.002, stylus.offsetY, 0]}
        >
          <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.6} envMapIntensity={0.5} />
        </RoundedBox>

        {/* keyboard-cover pogo pins on the back, along the portrait left edge
            (the landscape-bottom edge the Book Cover Keyboard docks against) */}
        {pogo &&
          [-1, 0, 1].map((i) => (
            <mesh
              key={i}
              rotation-x={Math.PI / 2}
              position={[pogo.x, i * pogo.spacing, -body.depth / 2 - 0.004]}
            >
              <cylinderGeometry args={[0.016, 0.016, 0.006, 16]} />
              <meshPhysicalMaterial color="#b9a26a" metalness={0.95} roughness={0.3} />
            </mesh>
          ))}

        {/* buttons — machined pills seated in the frame. iPad: top button on the
            top edge + volumes on the right edge; Tab: power + volume together on
            the right edge (the top edge in landscape). */}
        {isPad ? (
          <>
            <RoundedBox args={[0.3, 0.06, 0.05]} radius={0.022} position={[body.width / 2 - 0.32, body.height / 2 - 0.014, 0]}>
              <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.24} />
            </RoundedBox>
            <RoundedBox args={[0.06, 0.34, 0.05]} radius={0.022} position={[body.width / 2 - 0.014, body.height / 2 - 0.5, 0]}>
              <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.24} />
            </RoundedBox>
          </>
        ) : (
          <>
            <RoundedBox args={[0.06, 0.22, 0.05]} radius={0.022} position={[body.width / 2 - 0.014, body.height / 2 - 0.42, 0]}>
              <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.24} />
            </RoundedBox>
            <RoundedBox args={[0.06, 0.44, 0.05]} radius={0.022} position={[body.width / 2 - 0.014, body.height / 2 - 0.82, 0]}>
              <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.24} />
            </RoundedBox>
          </>
        )}

        {/* USB-C slot, centered on the bottom edge (portrait) */}
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
          overlay={
            notch ? (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  // the Tab Ultra notch lives on the landscape-top edge — the
                  // right edge when the tablet is held in portrait
                  ...(landscape
                    ? { top: 0, left: '50%', transform: 'translateX(-50%)', width: px(notch.width), height: px(notch.height), borderRadius: `0 0 ${px(notch.radius)}px ${px(notch.radius)}px` }
                    : { right: 0, top: '50%', transform: 'translateY(-50%)', width: px(notch.height), height: px(notch.width), borderRadius: `${px(notch.radius)}px 0 0 ${px(notch.radius)}px` }),
                  background: '#04050a',
                  pointerEvents: 'none',
                  zIndex: 2147483647,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: px(0.045),
                    height: px(0.045),
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 38%, #1c2536 0%, #05060a 60%, #000 100%)',
                  }}
                />
              </div>
            ) : undefined
          }
        >
          {children}
        </DeviceScreen>
      </group>
    </group>
  )
}
