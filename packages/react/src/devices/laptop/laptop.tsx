import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { LAPTOP_VARIANTS, type LaptopVariant } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { createWordmarkTexture } from '../wordmark'
import { createLogoGeometry } from '../logos'
import { roundedRectShape } from '@area-mockups/core'

type GroupProps = ThreeElements['group']

export interface LaptopProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the laptop screen: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /**
   * Which laptop to render: `air13` (MacBook Air 13", uniform thin slab) or
   * `pro14` (MacBook Pro 14", thicker body, HDMI/SDXC ports, speaker grilles,
   * larger feet and a deeper notch). True relative sizes.
   */
  variant?: LaptopVariant
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

/** Key layout entry: keyboard-local position/size plus the printed legend. */
type KeyDef = { x: number; z: number; w: number; d: number; label: string; small?: boolean }

/**
 * The real M-series Air 78-key US layout in standard key units (every row
 * sums to 14.5u), with legends. Coordinates are keyboard-local.
 */
function buildKeyboardLayout(keyboard: { width: number; depth: number }) {
  const pad = 0.07
  const gap = 0.026
  const rowDepth = 0.222
  const usable = keyboard.width - pad * 2
  const pitch = usable / 14.5 // world units per key unit (key + its gap share)
  const ROWS: [number, string, boolean?][][] = [
    [[1.5, 'esc', true], ...Array.from({ length: 12 }, (_, i) => [1, `F${i + 1}`, true] as [number, string, boolean]), [1, '', true]],
    [[1, '`'], [1, '1'], [1, '2'], [1, '3'], [1, '4'], [1, '5'], [1, '6'], [1, '7'], [1, '8'], [1, '9'], [1, '0'], [1, '-'], [1, '='], [1.5, 'delete', true]],
    [[1.5, 'tab', true], [1, 'Q'], [1, 'W'], [1, 'E'], [1, 'R'], [1, 'T'], [1, 'Y'], [1, 'U'], [1, 'I'], [1, 'O'], [1, 'P'], [1, '['], [1, ']'], [1, '\\']],
    [[1.75, 'caps lock', true], [1, 'A'], [1, 'S'], [1, 'D'], [1, 'F'], [1, 'G'], [1, 'H'], [1, 'J'], [1, 'K'], [1, 'L'], [1, ';'], [1, "'"], [1.75, 'return', true]],
    [[2.25, 'shift', true], [1, 'Z'], [1, 'X'], [1, 'C'], [1, 'V'], [1, 'B'], [1, 'N'], [1, 'M'], [1, ','], [1, '.'], [1, '/'], [2.25, 'shift', true]],
    [[1, 'fn', true], [1, 'control', true], [1, 'option', true], [1.25, 'command', true], [5, ''], [1.25, 'command', true], [1, 'option', true]],
  ]
  const keys: KeyDef[] = []
  let z = -keyboard.depth / 2 + 0.03
  for (const [rowIndex, row] of ROWS.entries()) {
    let x = -usable / 2
    for (const [u, label, small] of row) {
      keys.push({ x: x + (u * pitch - gap) / 2, z: z + rowDepth / 2, w: u * pitch - gap, d: rowDepth, label, small })
      x += u * pitch
    }
    if (rowIndex === ROWS.length - 1) {
      // inverted-T arrows in the remaining 3u: ← (bottom half), ↑/↓ stacked, → (bottom half)
      const half = (rowDepth - gap / 2) / 2
      const slots = [0, 1, 2].map((i) => x + i * pitch)
      keys.push({ x: slots[0]! + (pitch - gap) / 2, z: z + rowDepth - half / 2, w: pitch - gap, d: half, label: '◀', small: true })
      keys.push({ x: slots[1]! + (pitch - gap) / 2, z: z + half / 2, w: pitch - gap, d: half, label: '▲', small: true })
      keys.push({ x: slots[1]! + (pitch - gap) / 2, z: z + rowDepth - half / 2, w: pitch - gap, d: half, label: '▼', small: true })
      keys.push({ x: slots[2]! + (pitch - gap) / 2, z: z + rowDepth - half / 2, w: pitch - gap, d: half, label: '▶', small: true })
    }
    z += rowDepth + gap
  }
  // Touch ID = last key of the function row (no legend, gets the sensor ring).
  return { keys, touchId: keys[ROWS[0]!.length - 1]! }
}

/**
 * The Magic Keyboard: rounded keycaps as a single instanced mesh (one draw
 * call), a canvas-painted legends layer just above the caps, and the Touch ID
 * ring on the top-right key.
 */
function Keys({ keyboard }: { keyboard: { width: number; depth: number; offsetZ: number } }) {
  const meshRef = React.useRef<THREE.InstancedMesh>(null!)

  const layout = React.useMemo(() => buildKeyboardLayout(keyboard), [keyboard])

  // All legends painted once into a texture spanning the keyboard well.
  const legendsTexture = React.useMemo(() => {
    if (typeof document === 'undefined') return null
    const scale = 1024 / keyboard.width // canvas px per world unit
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = Math.round(keyboard.depth * scale)
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'rgba(228, 231, 240, 0.85)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const key of layout.keys) {
      if (!key.label) continue
      const px = (key.x + keyboard.width / 2) * scale
      const py = (key.z + keyboard.depth / 2) * scale
      const size = key.small ? Math.min(0.052 * scale, (key.w * scale * 0.8) / Math.max(key.label.length * 0.55, 1)) : 0.085 * scale
      ctx.font = `500 ${Math.round(size)}px -apple-system, 'Helvetica Neue', Arial, sans-serif`
      ctx.fillText(key.label, px, py)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 4
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [layout, keyboard])
  React.useEffect(() => () => legendsTexture?.dispose(), [legendsTexture])

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
      {/* printed legends, floating just above the caps */}
      {legendsTexture && (
        <mesh position={[0, 0.027, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[keyboard.width, keyboard.depth]} />
          <meshBasicMaterial map={legendsTexture} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      )}
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
  variant = 'air13',
  color = '#e3e4e6',
  screenBackground = '#000000',
  resolution,
  notch = true,
  openAngle,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: LaptopProps) {
  const spec = LAPTOP_VARIANTS[variant]
  const { footprint, base, lid, display, notch: notchDims, keyboard, trackpad } = spec
  // Default scaled desktop: 1280x832 on the Air, 1512x982 on the Pro 14.
  const res = resolution ?? (variant === 'pro14' ? 1512 : 1280)
  const lidAngle = openAngle ?? spec.openAngle
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

  // Lid badge (vector geometry from the SVG) + underside wordmark (canvas text).
  // The badge is glossy tone-on-tone: darker on light finishes, lighter on dark
  // ones, so it reads in every colorway.
  const logoColor = React.useMemo(() => {
    const c = new THREE.Color(color)
    const luminance = c.r * 0.299 + c.g * 0.587 + c.b * 0.114
    return `#${c.lerp(new THREE.Color(luminance > 0.4 ? '#000000' : '#ffffff'), 0.45).getHexString()}`
  }, [color])
  const logoGeometry = React.useMemo(
    () => createLogoGeometry('apple', spec.logo.width, spec.logo.height),
    [spec.logo]
  )
  const bottomTextTexture = React.useMemo(
    () => (spec.bottomText ? createWordmarkTexture(spec.bottomText.text, { letterSpacing: 0.06, weight: 600 }) : null),
    [spec.bottomText]
  )
  React.useEffect(
    () => () => {
      logoGeometry.dispose()
      bottomTextTexture?.dispose()
    },
    [logoGeometry, bottomTextTexture]
  )

  // CSS px per world unit for the display overlay (notch).
  const pxPerUnit = res / display.width
  const px = (units: number) => units * pxPerUnit

  const deckY = base.thickness / 2
  const hingeZ = -footprint.depth / 2 + 0.055
  // 90° = upright; larger angles lean the screen back, away from the viewer.
  const lidTilt = -((lidAngle - 90) * Math.PI) / 180

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
          <Keys keyboard={keyboard} />
        </group>

        {/* trackpad: flush glass with a hairline seam around it. Same finish as
            the deck — a glossier material here reads as a bright sticker */}
        <mesh geometry={trackpadRimGeometry} rotation-x={-Math.PI / 2} position={[0, deckY + 0.0015, trackpad.offsetZ]}>
          <meshPhysicalMaterial color="#5c5f66" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh geometry={trackpadGeometry} rotation-x={-Math.PI / 2} position={[0, deckY + 0.003, trackpad.offsetZ]}>
          <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.36} clearcoat={0.4} clearcoatRoughness={0.3} />
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

        {/* perforated speaker strips flanking the keyboard (Pro) */}
        {spec.speakers &&
          [-1, 1].map((side) => (
            <mesh
              key={side}
              rotation-x={-Math.PI / 2}
              position={[side * spec.speakers!.x, deckY + 0.0015, spec.speakers!.offsetZ]}
            >
              <planeGeometry args={[spec.speakers!.width, spec.speakers!.depth]} />
              <meshPhysicalMaterial color="#26272b" metalness={0.5} roughness={0.65} envMapIntensity={0.5} />
            </mesh>
          ))}

        {/* port openings, spec-accurate per side wall */}
        {([['left', -1], ['right', 1]] as const).map(([side, dir]) =>
          spec.ports[side].map((port, i) =>
            port.shape === 'round' ? (
              <mesh
                key={`${side}${i}`}
                position={[dir * (footprint.width / 2 - 0.004), -0.004, port.z]}
                rotation-z={Math.PI / 2}
              >
                <cylinderGeometry args={[port.height / 2, port.height / 2, 0.014, 20]} />
                <meshPhysicalMaterial color="#0a0b0e" metalness={0.4} roughness={0.4} />
              </mesh>
            ) : (
              <RoundedBox
                key={`${side}${i}`}
                args={[0.016, port.height, port.width]}
                radius={Math.min(0.014, port.height / 2 - 0.002)}
                position={[dir * (footprint.width / 2 - 0.004), -0.004, port.z]}
              >
                <meshPhysicalMaterial color="#0a0b0e" metalness={0.4} roughness={0.4} />
              </RoundedBox>
            )
          )
        )}

        {/* rubber feet */}
        {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([sx, sz], i) => (
          <mesh key={i} position={[sx * spec.feet.x, -base.thickness / 2 - 0.01, sz * spec.feet.z]}>
            <cylinderGeometry args={[spec.feet.radius, spec.feet.radius, 0.016, 20]} />
            <meshPhysicalMaterial color="#17181c" metalness={0.1} roughness={0.8} />
          </mesh>
        ))}

        {/* embossed wordmark near the front of the underside (Pro) */}
        {spec.bottomText && bottomTextTexture && (
          <mesh
            rotation-x={Math.PI / 2}
            position={[0, -base.thickness / 2 - 0.0055, spec.bottomText.offsetZ]}
          >
            <planeGeometry args={[spec.bottomText.width, spec.bottomText.height]} />
            <meshPhysicalMaterial
              map={bottomTextTexture}
              transparent
              opacity={0.5}
              color="#9a9da4"
              metalness={0.7}
              roughness={0.4}
              polygonOffset
              polygonOffsetFactor={-1}
            />
          </mesh>
        )}
      </group>

      {/* ---------------- lid: hinged at the back edge of the deck ---------------- */}
      <group position={[0, deckY, hingeZ]} rotation-x={lidTilt}>
        {/* hinge: the black band spanning the center of the back (aluminum shows at the ends) */}
        <mesh rotation-z={Math.PI / 2} position={[0, 0, 0]}>
          <cylinderGeometry args={[variant === 'pro14' ? 0.069 : 0.052, variant === 'pro14' ? 0.069 : 0.052, footprint.width * 0.76, 24]} />
          <meshPhysicalMaterial color="#0d0e12" metalness={0.5} roughness={0.55} envMapIntensity={0.5} />
        </mesh>

        {/* lid slab — local +y is "up the screen", inner face toward +z */}
        <mesh ref={lidRef} geometry={lidGeometry} position={[0, footprint.depth / 2, 0]}>
          {aluminum}
        </mesh>

        {/* the badge on the lid's outer face */}
        <mesh
          geometry={logoGeometry}
          rotation-y={Math.PI}
          position={[0, footprint.depth / 2 + spec.logo.offsetY, -lid.thickness / 2 - 0.003]}
        >
          <meshPhysicalMaterial
            color={logoColor}
            metalness={0.95}
            roughness={0.06}
            clearcoat={1}
            envMapIntensity={1.4}
            polygonOffset
            polygonOffsetFactor={-1}
          />
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
          resolution={res}
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
