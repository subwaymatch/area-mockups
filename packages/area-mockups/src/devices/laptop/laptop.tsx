import * as React from 'react'
import * as THREE from 'three'
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
   * own drag gestures (sliders, drawing, touch scrolling).
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
 * The Magic Keyboard as a single instanced mesh: a 78-key US layout
 * approximated row by row (half-height function row, wide space bar, arrow
 * cluster), one draw call.
 */
function Keys() {
  const { keyboard } = LAPTOP
  const meshRef = React.useRef<THREE.InstancedMesh>(null!)

  const layout = React.useMemo(() => {
    const pad = 0.07
    const gap = 0.028
    const usable = keyboard.width - pad * 2
    const rows: { depth: number; widths: number[] }[] = []
    const uniform = (n: number) => {
      const w = (usable - (n - 1) * gap) / n
      return Array.from({ length: n }, () => w)
    }
    rows.push({ depth: 0.13, widths: uniform(14) }) // esc … touch id
    rows.push({ depth: 0.235, widths: uniform(14) }) // number row
    rows.push({ depth: 0.235, widths: uniform(14) }) // qwerty
    rows.push({ depth: 0.235, widths: uniform(13) }) // home row
    rows.push({ depth: 0.235, widths: uniform(12) }) // shift row
    // bottom row: fn ctrl opt cmd [space] cmd opt + arrow cluster
    const small = (usable - 9 * gap) / 13.5
    rows.push({ depth: 0.235, widths: [small, small, small, small * 1.3, small * 4.9, small * 1.3, small, small, small, small] })
    return { rows, gap, pad }
  }, [keyboard])

  const count = layout.rows.reduce((n, r) => n + r.widths.length, 0)

  React.useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    let i = 0
    let z = -keyboard.depth / 2 + 0.06
    for (const row of layout.rows) {
      let x = -LAPTOP.keyboard.width / 2 + layout.pad
      for (const w of row.widths) {
        m.makeScale(w, 1, row.depth)
        m.setPosition(x + w / 2, 0, z + row.depth / 2)
        meshRef.current.setMatrixAt(i++, m)
        x += w + layout.gap
      }
      z += row.depth + layout.gap
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [layout, keyboard])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 0.018, 1]} />
      {/* matte keycaps: tame the studio env so the black doesn't wash out */}
      <meshPhysicalMaterial color="#17181d" metalness={0.08} roughness={0.72} envMapIntensity={0.45} />
    </instancedMesh>
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
      glassGeometry.dispose()
    }
  }, [wellGeometry, trackpadGeometry, glassGeometry])

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

        {/* trackpad: flush glass, set apart by a subtly tighter finish */}
        <mesh geometry={trackpadGeometry} rotation-x={-Math.PI / 2} position={[0, deckY + 0.002, trackpad.offsetZ]}>
          <meshPhysicalMaterial color={color} metalness={0.75} roughness={0.22} />
        </mesh>

        {/* ports: MagSafe + two Thunderbolt 4 on the left, headphone jack right */}
        {[-1.02, -0.74, -0.54].map((z, i) => (
          <mesh key={i} position={[-footprint.width / 2 + 0.004, 0, z]}>
            <boxGeometry args={[0.012, i === 0 ? 0.034 : 0.026, i === 0 ? 0.13 : 0.09]} />
            <meshPhysicalMaterial color="#0a0b0e" metalness={0.4} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[footprint.width / 2 - 0.004, 0, -0.8]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.022, 0.022, 0.012, 20]} />
          <meshPhysicalMaterial color="#0a0b0e" metalness={0.4} roughness={0.4} />
        </mesh>

        {/* rubber feet */}
        {([[-1.75, -1.15], [1.75, -1.15], [-1.75, 1.15], [1.75, 1.15]] as const).map(([x, z], i) => (
          <mesh key={i} position={[x, -base.thickness / 2 - 0.008, z]}>
            <cylinderGeometry args={[0.055, 0.055, 0.016, 20]} />
            <meshPhysicalMaterial color="#17181c" metalness={0.1} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ---------------- lid: hinged at the back edge of the deck ---------------- */}
      <group position={[0, deckY, hingeZ]} rotation-x={lidTilt}>
        {/* hinge barrel */}
        <mesh rotation-z={Math.PI / 2} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 3.3, 24]} />
          <meshPhysicalMaterial color="#111318" metalness={0.6} roughness={0.45} />
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
