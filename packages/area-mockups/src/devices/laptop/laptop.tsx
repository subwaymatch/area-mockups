import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { LAPTOP } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface LaptopProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the laptop screen: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Aluminum colorway (lid, deck, bottom). MacBook Air M5 finishes work well:
   * Silver `#e3e4e6` (default), Sky Blue `#aec6d9`, Starlight `#e8e0d4`, Midnight `#2e3642`. */
  color?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the virtual display. Height follows the 13.6" panel's
   * aspect. The default 1280 gives a 1280x832 screen — exactly the MacBook
   * Air's default scaled resolution (2560x1664 at 2x) — so desktop layouts and
   * breakpoints behave like on the real machine. Style your content with % / flex.
   */
  resolution?: number
  /** Show the camera-notch overlay at the top of the display. */
  notch?: boolean
  /** Lid angle in degrees between deck and screen (90 = upright). */
  openAngle?: number
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
   * `true` raycasts against the lid and base (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the screen wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/** One flat, rounded slab (base or lid), extruded with a soft edge bevel. */
function useSlabGeometry(width: number, depth: number, radius: number, thickness: number, bevel: number) {
  const geometry = React.useMemo(() => {
    const shape = roundedRectShape(width - bevel * 2, depth - bevel * 2, radius - bevel)
    const core = thickness - bevel * 2
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: core,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 16,
    })
    g.translate(0, 0, -core / 2)
    return g
  }, [width, depth, radius, thickness, bevel])
  React.useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}

/**
 * The Magic Keyboard as a single instanced mesh — the real M-series Air
 * layout: 78 US keys in 6 full-height rows (wide esc/delete/tab/caps/return/
 * shifts, 5u space bar, ⌘ keys at 1.25u) ending in the inverted-T arrow
 * cluster (half-height ← →, stacked half-height ↑ ↓). Rounded keycaps, one
 * draw call, plus the Touch ID ring on the top-right key.
 */
function Keys() {
  const { keyboard } = LAPTOP
  const meshRef = React.useRef<THREE.InstancedMesh>(null!)

  // Row definitions in standard key units; every row sums to 14.5u.
  const layout = React.useMemo(() => {
    const pad = 0.07
    const gap = 0.026
    const rowDepth = 0.222
    const usable = keyboard.width - pad * 2
    const pitch = usable / 14.5 // world units per key unit (key + its gap share)
    const UNITS: number[][] = [
      [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // esc F1–F12 TouchID
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], // ` 1–0 - = delete
      [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // tab q–] \
      [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75], // caps a–' return (13 keys)
      [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], // shift z–/ shift (12 keys)
      [1, 1, 1, 1.25, 5, 1.25, 1], // fn ctrl opt cmd space cmd opt (arrows appended below)
    ]
    type Key = { x: number; z: number; w: number; d: number }
    const keys: Key[] = []
    let z = -keyboard.depth / 2 + 0.03
    for (const row of UNITS) {
      let x = -usable / 2
      for (const u of row) {
        keys.push({ x: x + (u * pitch - gap) / 2, z: z + rowDepth / 2, w: u * pitch - gap, d: rowDepth })
        x += u * pitch
      }
      if (row === UNITS[5]) {
        // inverted-T arrows in the remaining 3u: ← (bottom half), ↑/↓ stacked, → (bottom half)
        const half = (rowDepth - gap / 2) / 2
        const slots = [0, 1, 2].map((i) => x + i * pitch)
        keys.push({ x: slots[0]! + (pitch - gap) / 2, z: z + rowDepth - half / 2, w: pitch - gap, d: half })
        keys.push({ x: slots[1]! + (pitch - gap) / 2, z: z + half / 2, w: pitch - gap, d: half })
        keys.push({ x: slots[1]! + (pitch - gap) / 2, z: z + rowDepth - half / 2, w: pitch - gap, d: half })
        keys.push({ x: slots[2]! + (pitch - gap) / 2, z: z + rowDepth - half / 2, w: pitch - gap, d: half })
      }
      z += rowDepth + gap
    }
    // Touch ID center (last key of the function row) for the sensor ring.
    const touchId = keys[UNITS[0]!.length - 1]!
    return { keys, touchId }
  }, [keyboard])

  // Rounded keycap: an extruded rounded-rect, laid flat (footprint in XZ).
  const capGeometry = React.useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRectShape(1, 1, 0.16), {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 6,
    })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  React.useEffect(() => () => capGeometry.dispose(), [capGeometry])

  React.useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    layout.keys.forEach((k, i) => {
      m.makeScale(k.w, 1, k.d)
      m.setPosition(k.x, 0, k.z)
      meshRef.current.setMatrixAt(i, m)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [layout])

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, layout.keys.length]} geometry={capGeometry}>
        {/* matte keycaps: tame the studio env so the black doesn't wash out */}
        <meshPhysicalMaterial color="#17181d" metalness={0.08} roughness={0.72} envMapIntensity={0.45} />
      </instancedMesh>
      {/* Touch ID sensor ring */}
      <mesh position={[layout.touchId.x, 0.019, layout.touchId.z]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.042, 0.055, 24]} />
        <meshPhysicalMaterial color="#0b0c10" metalness={0.3} roughness={0.4} envMapIntensity={0.5} />
      </mesh>
    </>
  )
}

/**
 * A procedurally built Apple MacBook Air 13" (M5)-style laptop: rounded
 * unibody base with a Magic-Keyboard deck and Force Touch trackpad, and a thin
 * hinged lid whose notched display carries your live content. No 3D asset
 * files — everything is generated from geometry at runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Laptop({
  children,
  color = '#e3e4e6',
  screenBackground = '#000000',
  resolution = 1280,
  notch = true,
  openAngle = LAPTOP.openAngle,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: LaptopProps) {
  const { footprint, base, lid, display, notch: notchDims, keyboard, trackpad } = LAPTOP
  const baseRef = React.useRef<THREE.Mesh>(null!)
  const lidRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [lidRef, baseRef], [])

  const baseGeometry = useSlabGeometry(footprint.width, footprint.depth, footprint.radius, base.thickness, base.bevel)
  const lidGeometry = useSlabGeometry(footprint.width, footprint.depth, footprint.radius, lid.thickness, lid.bevel)

  const wellGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(keyboard.width, keyboard.depth, 0.06), 12),
    [keyboard]
  )
  const trackpadGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(trackpad.width, trackpad.depth, 0.05), 12),
    [trackpad]
  )
  const trackpadRimGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(roundedRectShape(trackpad.width + 0.018, trackpad.depth + 0.018, 0.056), 12),
    [trackpad]
  )
  const bottomPlateGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(footprint.width - 0.34, footprint.depth - 0.34, footprint.radius - 0.1),
        16
      ),
    [footprint]
  )
  const glassGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(footprint.width - 0.14, footprint.depth - 0.14, footprint.radius - 0.05),
        16
      ),
    [footprint]
  )
  React.useEffect(() => {
    return () => {
      wellGeometry.dispose()
      trackpadGeometry.dispose()
      trackpadRimGeometry.dispose()
      bottomPlateGeometry.dispose()
      glassGeometry.dispose()
    }
  }, [wellGeometry, trackpadGeometry, trackpadRimGeometry, bottomPlateGeometry, glassGeometry])

  // CSS px per world unit for the display overlay (notch).
  const pxPerUnit = resolution / display.width
  const px = (units: number) => units * pxPerUnit

  const deckY = base.thickness / 2
  const hingeZ = -footprint.depth / 2 + 0.055
  // 90° = upright; larger angles lean the screen back, away from the viewer.
  const lidTilt = -((openAngle - 90) * Math.PI) / 180

  const aluminum = (
    <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.38} clearcoat={0.4} clearcoatRoughness={0.3} />
  )

  return (
    <group {...groupProps}>
      {/* ---------------- base: unibody chassis with the keyboard deck ---------------- */}
      <group>
        <mesh ref={baseRef} geometry={baseGeometry} rotation-x={-Math.PI / 2}>
          {aluminum}
        </mesh>

        {/* keyboard well (recess) + keys */}
        <mesh geometry={wellGeometry} rotation-x={-Math.PI / 2} position={[0, deckY + 0.002, keyboard.offsetZ]}>
          <meshPhysicalMaterial color="#101216" metalness={0.3} roughness={0.5} />
        </mesh>
        <group position={[0, deckY + 0.012, keyboard.offsetZ]}>
          <Keys />
        </group>

        {/* trackpad: flush glass with a hairline seam around it */}
        <mesh geometry={trackpadRimGeometry} rotation-x={-Math.PI / 2} position={[0, deckY + 0.0015, trackpad.offsetZ]}>
          <meshPhysicalMaterial color="#101216" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh geometry={trackpadGeometry} rotation-x={-Math.PI / 2} position={[0, deckY + 0.003, trackpad.offsetZ]}>
          <meshPhysicalMaterial color={color} metalness={0.75} roughness={0.22} />
        </mesh>

        {/* thumb scoop: the shallow opening recess on the front edge of the deck */}
        <mesh position={[0, deckY - 0.02, footprint.depth / 2 - 0.022]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.034, 0.034, 0.5, 24]} />
          <meshPhysicalMaterial color="#83878e" metalness={0.75} roughness={0.5} envMapIntensity={0.5} />
        </mesh>

        {/* inset bottom plate (the seam line visible along the lower edge) */}
        <mesh geometry={bottomPlateGeometry} rotation-x={Math.PI / 2} position={[0, -base.thickness / 2 - 0.004, 0]}>
          <meshPhysicalMaterial color={color} metalness={0.8} roughness={0.5} envMapIntensity={0.6} />
        </mesh>

        {/* ports: MagSafe + two Thunderbolt 4 pills on the left, headphone jack right */}
        {([[-1.08, 0.15, 0.038], [-0.84, 0.1, 0.03], [-0.66, 0.1, 0.03]] as const).map(([z, len, h], i) => (
          <RoundedBox key={i} args={[0.016, h, len]} radius={0.007} position={[-footprint.width / 2 + 0.004, 0, z]}>
            <meshPhysicalMaterial color="#0a0b0e" metalness={0.4} roughness={0.4} />
          </RoundedBox>
        ))}
        <mesh position={[footprint.width / 2 - 0.004, 0, -0.8]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.024, 0.024, 0.014, 20]} />
          <meshPhysicalMaterial color="#0a0b0e" metalness={0.4} roughness={0.4} />
        </mesh>

        {/* rubber feet */}
        {([[-1.75, -1.15], [1.75, -1.15], [-1.75, 1.15], [1.75, 1.15]] as const).map(([x, z], i) => (
          <mesh key={i} position={[x, -base.thickness / 2 - 0.01, z]}>
            <cylinderGeometry args={[0.055, 0.055, 0.016, 20]} />
            <meshPhysicalMaterial color="#17181c" metalness={0.1} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ---------------- lid: hinged at the back edge of the deck ---------------- */}
      <group position={[0, deckY, hingeZ]} rotation-x={lidTilt}>
        {/* hinge: the black band spanning the center of the back (aluminum shows at the ends) */}
        <mesh rotation-z={Math.PI / 2} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.052, 0.052, 2.7, 24]} />
          <meshPhysicalMaterial color="#0d0e12" metalness={0.5} roughness={0.55} envMapIntensity={0.5} />
        </mesh>

        {/* lid slab — local +y is "up the screen", inner face toward +z */}
        <mesh ref={lidRef} geometry={lidGeometry} position={[0, footprint.depth / 2, 0]}>
          {aluminum}
        </mesh>

        {/* edge-to-edge cover glass on the inner face */}
        <mesh geometry={glassGeometry} position={[0, footprint.depth / 2, lid.thickness / 2 + 0.002]}>
          <meshPhysicalMaterial color="#050608" metalness={0.1} roughness={0.09} clearcoat={1} />
        </mesh>

        {/* the live screen */}
        <DeviceScreen
          width={display.width}
          height={display.height}
          radius={[display.radius[0], display.radius[1], display.radius[2], display.radius[3]]}
          resolution={resolution}
          position={[0, footprint.depth / 2 + display.offsetY, lid.thickness / 2 + 0.006]}
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
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: px(notchDims.width),
                  height: px(notchDims.height),
                  borderRadius: `0 0 ${px(notchDims.radius)}px ${px(notchDims.radius)}px`,
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
                    background:
                      'radial-gradient(circle at 38% 38%, #1c2536 0%, #05060a 60%, #000 100%)',
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
