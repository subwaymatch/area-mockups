import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { IPHONE_VARIANTS, type IPhoneVariant } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { createLogoGeometry } from '../logos'
import { SideKey, LensRing, UsbC } from '../details'
import { roundedRectShape } from '@area-mockups/core'

type GroupProps = ThreeElements['group']

export interface IPhoneProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the phone screen: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /**
   * Which iPhone 17-family device to render. All variants use their true
   * relative sizes: `'17'` (6.3", two-lens pill), `air` (6.5", ultra-thin,
   * single-lens bar), `pro` (6.3") and `promax` (6.9") with the full-width
   * triple-lens plateau.
   */
  variant?: IPhoneVariant
  /**
   * `landscape` lays the device on its side and swaps the virtual display to
   * H×W with upright content — exactly like rotating the real phone.
   */
  orientation?: 'portrait' | 'landscape'
  /** Back glass colorway. iPhone 17 finishes work well: Black `#1a1c20`
   * (default), White `#f2f2f4`, Mist Blue `#b7c9dd`, Sage `#aebfae`, Lavender `#cfc4e6`. */
  color?: string
  /** Frame, buttons and camera-ring color. */
  frameColor?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the virtual display in the current orientation. Height
   * follows the panel aspect. Defaults to the device's logical point grid —
   * e.g. the iPhone 17 gives 402×874 in portrait and 874×402 in landscape —
   * so content lays out just like it would on the real device.
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
   * own drag gestures (sliders, drawing, horizontal swipes).
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
 * A procedurally built Apple iPhone 17-family phone: flat frame, Dynamic
 * Island, and the per-model rear camera architecture (vertical pill on the 17,
 * single-lens bar on the Air, full-width triple-lens plateau on the Pros). No
 * 3D asset files are loaded — the whole device is generated from geometry at
 * runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function IPhone({
  children,
  variant = '17',
  orientation = 'portrait',
  color = '#1a1c20',
  frameColor = '#3f434b',
  screenBackground = '#000000',
  resolution,
  dynamicIsland = true,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: IPhoneProps) {
  const spec = IPHONE_VARIANTS[variant]
  const { body, glass, display, island, rearCamera, backWindow, buttons, buttonProfile } = spec
  const landscape = orientation === 'landscape'
  const aspect = display.height / display.width
  const res = resolution ?? Math.round(spec.resolution * (landscape ? aspect : 1))
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  // Chassis: an extruded rounded-rect with lightly beveled edges — the flat
  // aluminum/titanium frame. The shape is inset by the bevel size so the final
  // silhouette lands exactly on the spec body.
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

  // The Ceramic Shield glass window — a thin raised rounded-rect panel so its
  // edge reads as a real seam against the aluminum unibody, not just a color
  // change. Covers most of the lower back below the plateau.
  const backWindowGeometry = React.useMemo(() => {
    if (!backWindow) return null
    const bevel = 0.01
    const shape = roundedRectShape(
      backWindow.width - bevel * 2,
      backWindow.height - bevel * 2,
      backWindow.radius - bevel
    )
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.006,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 16,
    })
  }, [backWindow])
  React.useEffect(() => () => backWindowGeometry?.dispose(), [backWindowGeometry])

  // The camera pedestal: a vertical pill (17) or a full-width plateau bar
  // (Air / Pro / Pro Max) — extruded so face corners are truly semicircular.
  const pedestalGeometry = React.useMemo(() => {
    const { frame } = rearCamera
    const bevel = 0.018
    const radius =
      frame.radius ??
      (rearCamera.style === 'pill'
        ? (frame.width - bevel * 2) / 2 // fully rounded pill ends
        : Math.min(0.24, (frame.height - bevel * 2) / 2))
    const shape = roundedRectShape(
      frame.width - bevel * 2,
      frame.height - bevel * 2,
      Math.max(0.01, radius - bevel)
    )
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.012, (frame.raise ?? 0.048) - bevel),
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 24,
    })
    return geometry
  }, [rearCamera])

  // Every lens ring mounts on the pedestal face and stands `h` proud of it.
  const pedestalTop = body.depth / 2 + (rearCamera.frame.raise ?? 0.048)
  // Apple badge — real vector geometry from the SVG.
  const logoGeometry = React.useMemo(
    () => (spec.logo ? createLogoGeometry('apple', spec.logo.width, spec.logo.height) : null),
    [spec.logo]
  )
  React.useEffect(() => () => logoGeometry?.dispose(), [logoGeometry])

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
      backGeometry.dispose()
      pedestalGeometry.dispose()
    }
  }, [bodyGeometry, glassGeometry, backGeometry, pedestalGeometry])

  // CSS px per world unit for the display overlay (Dynamic Island).
  const pxPerUnit = res / (landscape ? display.height : display.width)
  const px = (units: number) => units * pxPerUnit

  return (
    <group {...groupProps}>
      {/* landscape lays the body on its side (top edge to the left, the classic
          camera-left pose); the screen plane counter-rotates below */}
      <group rotation-z={landscape ? Math.PI / 2 : 0}>
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

        {/* Ceramic Shield window on the aluminum unibody (Pro / Pro Max) */}
        {backWindow && backWindowGeometry && (
          <mesh
            geometry={backWindowGeometry}
            rotation-y={Math.PI}
            position={[0, backWindow.y, -body.depth / 2 - 0.003]}
          >
            <meshPhysicalMaterial
              color={color}
              metalness={0.15}
              roughness={0.16}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </mesh>
        )}

        {/* rear camera pedestal (pill or full-width plateau) */}
        <mesh
          geometry={pedestalGeometry}
          rotation-y={Math.PI}
          position={[rearCamera.frame.x, rearCamera.frame.y, -body.depth / 2 - 0.002]}
        >
          <meshPhysicalMaterial
            color={color}
            metalness={0.35}
            roughness={0.28}
            clearcoat={1}
            clearcoatRoughness={0.2}
          />
        </mesh>

        {/* lens stacks: machined ring standing proud of the pedestal, dark bezel
            wall, blue-coated glass, glint */}
        {rearCamera.lenses.map(({ x, y, r, h }, i) => (
          <group key={i} position={[x, y, -pedestalTop]}>
            <LensRing r={r} proud={h ?? 0.05} frameColor={frameColor} glass="#0b1c3f" element="#152a55" />
          </group>
        ))}

        {/* flash + auxiliary sensors on the back panel or plateau */}
        <mesh
          rotation-x={Math.PI / 2}
          position={[
            rearCamera.flash.x,
            rearCamera.flash.y,
            rearCamera.style === 'bar' ? -pedestalTop - 0.005 : -body.depth / 2 - 0.008,
          ]}
        >
          <cylinderGeometry args={[rearCamera.flash.r, rearCamera.flash.r, 0.016, 32]} />
          <meshPhysicalMaterial
            color="#efe9da"
            emissive="#fff3d6"
            emissiveIntensity={0.25}
            roughness={0.4}
          />
        </mesh>
        {rearCamera.dots?.map(({ x, y, r }, i) => (
          <mesh
            key={i}
            rotation-x={Math.PI / 2}
            position={[x, y, rearCamera.style === 'bar' ? -pedestalTop - 0.004 : -body.depth / 2 - 0.006]}
          >
            <cylinderGeometry args={[r, r, 0.012, 24]} />
            <meshPhysicalMaterial color="#111318" metalness={0.5} roughness={0.3} clearcoat={0.6} />
          </mesh>
        ))}

        {/* Apple badge */}
        {spec.logo && logoGeometry && (
          <mesh geometry={logoGeometry} rotation-y={Math.PI} position={[0, spec.logo.y, -body.depth / 2 - 0.0085]}>
            <meshPhysicalMaterial
              transparent
              opacity={0.6}
              color="#3a3d44"
              metalness={0.9}
              roughness={0.12}
              clearcoat={1}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </mesh>
        )}

        {/* side keys, spec-accurate: Action + volume on the left rail, side button
            + the flush Camera Control on the right — pills protruding a scan-true
            ~0.3-0.45 mm (Camera Control sits flush, seated in the rail) */}
        {buttons.map(({ edge, y, length, flush }, i) => (
          <SideKey
            key={i}
            side={edge === 'right' ? 1 : -1}
            railX={body.width / 2}
            y={y}
            length={length}
            thickness={buttonProfile.thickness}
            protrusion={buttonProfile.protrusion}
            color={frameColor}
            flush={flush}
          />
        ))}

        {/* antenna strips crossing both rails */}
        {spec.antennaLines?.map((y, i) => (
          <React.Fragment key={i}>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * (body.width / 2 - 0.005), y, 0]}>
                <boxGeometry args={[0.012, 0.04, body.depth * 0.86]} />
                <meshStandardMaterial color="#20242a" transparent opacity={0.32} roughness={0.7} />
              </mesh>
            ))}
          </React.Fragment>
        ))}

        {/* RF window centered on the top edge (Pro Max) */}
        {spec.topWindow && (
          <RoundedBox
            args={[spec.topWindow.width, 0.014, spec.topWindow.height]}
            radius={0.006}
            position={[0, body.height / 2 + 0.001, 0]}
          >
            <meshStandardMaterial color="#22262c" transparent opacity={0.3} roughness={0.7} />
          </RoundedBox>
        )}

        {/* bottom edge: USB-C between two screws, speaker/mic hole rows */}
        {spec.bottomEdge && (
          <>
            <UsbC
              x={spec.bottomEdge.usb.x}
              y={-body.height / 2 - 0.002}
              width={spec.bottomEdge.usb.width}
              height={spec.bottomEdge.usb.height}
            />
            {spec.bottomEdge.screws?.map(({ x, r }, i) => (
              <mesh key={`s${i}`} position={[x, -body.height / 2 - 0.002, 0]}>
                <cylinderGeometry args={[r, r, 0.012, 16]} />
                <meshPhysicalMaterial color="#caccd0" metalness={0.9} roughness={0.35} />
              </mesh>
            ))}
            {spec.bottomEdge.speakers?.map(({ x, r }, i) => (
              <mesh key={`h${i}`} position={[x, -body.height / 2 - 0.002, 0]}>
                <cylinderGeometry args={[r, r, 0.012, 12]} />
                <meshPhysicalMaterial color="#07080c" metalness={0.3} roughness={0.5} />
              </mesh>
            ))}
          </>
        )}

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
            dynamicIsland ? (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  // the island hugs the panel's physical top — the left edge in landscape
                  ...(landscape
                    ? {
                        left: px(island.offsetY - island.height / 2),
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: px(island.height),
                        height: px(island.width),
                        flexDirection: 'column' as const,
                      }
                    : {
                        top: px(island.offsetY - island.height / 2),
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: px(island.width),
                        height: px(island.height),
                        flexDirection: 'row' as const,
                      }),
                  borderRadius: px(island.height / 2),
                  background: '#020308',
                  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.04)',
                  pointerEvents: 'none',
                  zIndex: 2147483647,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: landscape ? `0 0 ${px(0.05)}px 0` : `0 ${px(0.05)}px 0 0`,
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
    </group>
  )
}
