import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { GALAXY_VARIANTS, type GalaxyVariant } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']
import { roundedRectShape } from '@area-mockups/core'

export interface PhoneProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the phone screen: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /**
   * Which Galaxy device to render. All variants use their true relative sizes:
   * `s25` (6.2"), `s25plus` (6.7"), `s25ultra` (6.9", boxier corners,
   * five-element camera), `s25edge` (6.7", ultra-thin, two-lens island), and
   * `s26` (6.3", three lenses in a vertical pill island).
   */
  variant?: GalaxyVariant
  /**
   * `landscape` lays the device on its side and swaps the virtual display to
   * H×W with upright content — exactly like rotating the real phone.
   */
  orientation?: 'portrait' | 'landscape'
  /** Back panel colorway. */
  color?: string
  /** Metal frame, buttons and camera-ring color. */
  frameColor?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the virtual display in the current orientation. Height
   * follows the panel aspect. Defaults to the device's logical resolution —
   * e.g. the S25 gives 360×780 in portrait and 780×360 in landscape — so
   * content lays out just like it would on the real device.
   */
  resolution?: number
  /** Show the front camera punch-hole overlay. */
  punchHole?: boolean
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
   * uses per-pixel depth blending (prettier at grazing angles, but the canvas
   * paints over the DOM, so content is not clickable). `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the screen wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built Samsung Galaxy S25-family phone. No 3D asset files are
 * loaded — the whole device is generated from geometry at runtime, so it
 * tree-shakes, ships in a few KB and never pops in.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Phone({
  children,
  variant = 's25',
  orientation = 'portrait',
  color = '#101216',
  frameColor = '#4a4f59',
  screenBackground = '#000000',
  resolution,
  punchHole = true,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: PhoneProps) {
  const spec = GALAXY_VARIANTS[variant]
  const { body, glass, display, punchHole: hole, rearCamera } = spec
  const landscape = orientation === 'landscape'
  const aspect = display.height / display.width
  const res = resolution ?? Math.round(spec.resolution * (landscape ? aspect : 1))
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  // Chassis: an extruded rounded-rect with beveled edges. The shape is inset by
  // the bevel size so the final silhouette lands exactly on the spec body.
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

  // Optional raised camera island (Galaxy S25 Edge style).
  const islandGeometry = React.useMemo(() => {
    const island = rearCamera.island
    if (!island) return null
    const bevel = 0.016
    const shape = roundedRectShape(
      island.width - bevel * 2,
      island.height - bevel * 2,
      island.radius - bevel
    )
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.024,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 16,
    })
    return geometry
  }, [rearCamera.island])

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
      backGeometry.dispose()
      islandGeometry?.dispose()
    }
  }, [bodyGeometry, glassGeometry, backGeometry, islandGeometry])

  // CSS px per world unit for the virtual display overlay.
  const pxPerUnit = res / (landscape ? display.height : display.width)
  const px = (units: number) => units * pxPerUnit

  // A back element (flash, sensor) rides on the raised island only when it
  // actually sits within the island footprint; otherwise it's flush on the flat
  // back. The S25 Edge tucks its flash inside the island; the S26 keeps it on
  // the back beside the pill.
  const island = rearCamera.island
  const onIsland = (x: number, y: number) =>
    !!island &&
    Math.abs(x - island.x) <= island.width / 2 &&
    Math.abs(y - island.y) <= island.height / 2
  const backZ = (x: number, y: number, flat: number, raised: number) =>
    -body.depth / 2 - (onIsland(x, y) ? raised : flat)

  return (
    <group {...groupProps}>
      {/* landscape lays the body on its side (top edge to the left, the classic
          camera-left pose); the screen plane counter-rotates below */}
      <group rotation-z={landscape ? Math.PI / 2 : 0}>
        {/* chassis */}
        <mesh ref={bodyRef} geometry={bodyGeometry}>
          <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.32} />
        </mesh>

        {/* back panel colorway */}
        <mesh geometry={backGeometry} rotation-y={Math.PI} position-z={-body.depth / 2 - 0.002}>
          <meshPhysicalMaterial
            color={color}
            metalness={0.35}
            roughness={0.3}
            clearcoat={1}
            clearcoatRoughness={0.25}
          />
        </mesh>

        {/* cover glass (the black ring visible around the display) */}
        <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.002}>
          <meshPhysicalMaterial color="#020205" metalness={0.1} roughness={0.08} clearcoat={1} />
        </mesh>

        {/* rear camera: optional island pedestal (S25 Edge), floating rings, flash, sensors */}
        {rearCamera.island && islandGeometry && (
          <mesh
            geometry={islandGeometry}
            rotation-y={Math.PI}
            position={[rearCamera.island.x, rearCamera.island.y, -body.depth / 2 - 0.002]}
          >
            <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.3} clearcoat={0.9} />
          </mesh>
        )}
        {rearCamera.rings.map(({ x, y, r }, i) => (
          <group
            key={i}
            position={[x ?? rearCamera.ringsX, y, backZ(x ?? rearCamera.ringsX, y, 0, 0.026)]}
          >
            <mesh rotation-x={Math.PI / 2} position-z={-0.02}>
              <cylinderGeometry args={[r, r, 0.06, 40]} />
              <meshPhysicalMaterial color={frameColor} metalness={0.9} roughness={0.25} />
            </mesh>
            <mesh rotation-x={Math.PI / 2} position-z={-0.048}>
              <cylinderGeometry args={[r * 0.77, r * 0.77, 0.008, 40]} />
              <meshPhysicalMaterial color="#05070d" metalness={0.2} roughness={0.05} clearcoat={1} />
            </mesh>
            <mesh rotation-x={Math.PI / 2} position-z={-0.054}>
              <cylinderGeometry args={[r * 0.35, r * 0.35, 0.008, 32]} />
              <meshPhysicalMaterial color="#10182e" metalness={0.4} roughness={0.1} clearcoat={1} />
            </mesh>
          </group>
        ))}
        <mesh
          rotation-x={Math.PI / 2}
          position={[
            rearCamera.flash.x,
            rearCamera.flash.y,
            backZ(rearCamera.flash.x, rearCamera.flash.y, 0.008, 0.036),
          ]}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.016, 32]} />
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
            position={[x, y, backZ(x, y, 0.006, 0.034)]}
          >
            <cylinderGeometry args={[r, r, 0.012, 16]} />
            <meshPhysicalMaterial color="#07080c" metalness={0.3} roughness={0.45} />
          </mesh>
        ))}

        {/* side buttons: volume rocker + power on the right edge — machined
            pills seated in the frame, protruding ~0.7mm like the real keys */}
        <RoundedBox
          args={[0.06, 0.52, 0.082]}
          radius={0.026}
          position={[body.width / 2 - 0.012, body.height * 0.2125, 0]}
        >
          <meshPhysicalMaterial color={frameColor} metalness={0.9} roughness={0.24} />
        </RoundedBox>
        <RoundedBox
          args={[0.06, 0.3, 0.082]}
          radius={0.026}
          position={[body.width / 2 - 0.012, body.height * 0.08, 0]}
        >
          <meshPhysicalMaterial color={frameColor} metalness={0.9} roughness={0.24} />
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
            punchHole ? (
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  // the hole sits at the panel's physical top — the left edge in landscape
                  ...(landscape
                    ? { left: px(hole.offsetY - hole.radius), top: '50%', transform: 'translateY(-50%)' }
                    : { top: px(hole.offsetY - hole.radius), left: '50%', transform: 'translateX(-50%)' }),
                  width: px(hole.radius * 2),
                  height: px(hole.radius * 2),
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 38% 38%, #1b2436 0%, #05060a 55%, #000 100%)',
                  boxShadow: '0 0 0 1.5px rgba(255, 255, 255, 0.05)',
                  pointerEvents: 'none',
                  zIndex: 2147483647,
                }}
              />
            ) : undefined
          }
        >
          {children}
        </DeviceScreen>
      </group>
    </group>
  )
}
