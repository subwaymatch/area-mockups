import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { WATCH_VARIANTS, type WatchVariant } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface WatchProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the watch screen: React components, a <video>… */
  children?: React.ReactNode
  /**
   * Which watch to render, at true relative sizes: `series11` (Apple Watch
   * Series 11, 46 mm — default) or `watch8` (Galaxy Watch 8, 44 mm cushion
   * case with a round display).
   */
  variant?: WatchVariant
  /** Case colorway. Apple aluminum: Jet Black `#1c1d21` (default), Silver
   * `#dfe0e3`, Rose Gold `#dcb8a8`. Galaxy: Graphite `#33363c`, Silver `#d9dade`. */
  color?: string
  /** Band colorway (Sport-Band-style closed loop). Defaults to a dark band. */
  bandColor?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the virtual display. The default matches the device's
   * logical grid: 208 gives 208×248 on the Apple Watch; 240 gives a round
   * 240×240 on the Galaxy Watch — so content lays out like on the real device.
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
   * `true` raycasts against the case (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the screen wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built smartwatch — Apple Watch Series 11 (46 mm squircle
 * case, Digital Crown) or Samsung Galaxy Watch 8 (44 mm cushion case, round
 * display, two flat keys) depending on `variant` — wearing a full closed
 * wristband that loops behind the case as if on an invisible wrist. No 3D
 * asset files are loaded — the whole device is generated from geometry at
 * runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Watch({
  children,
  variant = 'series11',
  color = '#1c1d21',
  bandColor = '#2a2c31',
  screenBackground = '#000000',
  resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: WatchProps) {
  const spec = WATCH_VARIANTS[variant]
  const { body, glass, display, crown, buttons, band } = spec
  const res = resolution ?? spec.resolution
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  // Squircle / cushion case: extruded rounded-rect with a deep bevel for the
  // curved sides (the Galaxy cushion is the same construction, wider and
  // flatter with a bigger bevel).
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
      bevelSegments: 5,
      curveSegments: 24,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body])

  const glassGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(glass.width, glass.height, glass.radius), 32),
    [glass]
  )

  // Full wristband: a rounded-rect cross-section swept along a teardrop arc
  // that leaves the hidden lug slots, loops behind the case (around the
  // invisible wrist, blunt at the case and tapering toward the back — the
  // shape every worn-band product photo shows) and re-enters the case.
  // Hand-swept as an indexed grid so the vertex normals come out smooth;
  // ExtrudeGeometry's flat shading turns a glossy band into visible facets.
  const bandGeometry = React.useMemo(() => {
    const { ryFront, ryBack, rz, centerZ, startAngle } = band.loop
    const a1 = (startAngle * Math.PI) / 180
    const a2 = Math.PI * 2 - a1
    const rings = 96
    const path: THREE.Vector3[] = []
    for (let i = 0; i <= rings; i++) {
      const phi = a1 + ((a2 - a1) * i) / rings
      const ry = ryFront + (ryBack - ryFront) * (1 - Math.cos(phi)) * 0.5
      path.push(new THREE.Vector3(0, ry * Math.sin(phi), centerZ + rz * Math.cos(phi)))
    }
    // cross-section: x spans the thickness (radial), y the width (world x)
    const section = roundedRectShape(band.thickness, band.width, band.thickness * 0.33).getPoints(4)
    if (section.length > 1 && section[0]!.equals(section[section.length - 1]!)) section.pop()
    const cols = section.length

    const positions = new Float32Array((rings + 1) * cols * 3)
    const indices: number[] = []
    const tangent = new THREE.Vector3()
    const normal = new THREE.Vector3()
    const binormal = new THREE.Vector3(1, 0, 0) // the path is planar in yz
    for (let i = 0; i <= rings; i++) {
      tangent
        .subVectors(path[Math.min(i + 1, rings)]!, path[Math.max(i - 1, 0)]!)
        .normalize()
      normal.crossVectors(binormal, tangent).normalize()
      for (let j = 0; j < cols; j++) {
        const s = section[j]!
        const o = (i * cols + j) * 3
        positions[o] = path[i]!.x + binormal.x * s.y
        positions[o + 1] = path[i]!.y + normal.y * s.x
        positions[o + 2] = path[i]!.z + normal.z * s.x
      }
      if (i < rings) {
        for (let j = 0; j < cols; j++) {
          const jn = (j + 1) % cols
          const a = i * cols + j
          const b = i * cols + jn
          const c = (i + 1) * cols + j
          const d = (i + 1) * cols + jn
          indices.push(a, c, b, b, c, d)
        }
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    return geometry
  }, [band])

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
      bandGeometry.dispose()
    }
  }, [bodyGeometry, glassGeometry, bandGeometry])

  const isGalaxy = spec.style === 'galaxy'

  return (
    <group {...groupProps}>
      {/* case */}
      <mesh ref={bodyRef} geometry={bodyGeometry}>
        <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.3} clearcoat={0.5} />
      </mesh>

      {/* cover crystal (black ring around the display; a full circle on Galaxy) */}
      <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.002}>
        <meshPhysicalMaterial color="#020205" metalness={0.1} roughness={0.06} clearcoat={1} />
      </mesh>

      {/* back sensor island — spans most of the case back on both watches */}
      <mesh rotation-x={Math.PI / 2} position-z={-body.depth / 2 - 0.01}>
        <cylinderGeometry args={[0.78, 0.85, 0.03, 40]} />
        <meshPhysicalMaterial color="#101114" metalness={0.3} roughness={0.35} clearcoat={1} />
      </mesh>

      {/* Digital Crown (knurled), Apple only — protrudes ~2 mm past the case */}
      {crown && (
        <group position={[body.width / 2 + 0.04, crown.y, 0]}>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[crown.radius, crown.radius, crown.thickness + 0.06, 32]} />
            <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh rotation-z={Math.PI / 2}>
            <torusGeometry args={[crown.radius * 0.82, 0.014, 8, 32]} />
            <meshPhysicalMaterial color="#0c0d10" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* flat keys on the right edge — near-flush pills, as in the photos */}
      {buttons.map(({ y, length }) => (
        <RoundedBox
          key={y}
          args={[0.04, length, 0.14]}
          radius={0.018}
          position={[body.width / 2 - 0.008, y, 0]}
        >
          <meshPhysicalMaterial color={color} metalness={0.9} roughness={0.24} />
        </RoundedBox>
      ))}

      {/* full wristband loop, worn around the invisible wrist */}
      <mesh geometry={bandGeometry}>
        <meshPhysicalMaterial
          color={bandColor}
          metalness={0.05}
          roughness={0.6}
          clearcoat={0.4}
          clearcoatRoughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* lug stubs bridging the case into the loop (Galaxy's Dynamic Lug is a
          visible case-colored cradle; Apple's slots are hidden in the case) */}
      {([1, -1] as const).map((dir) => (
        <RoundedBox
          key={dir}
          args={[isGalaxy ? band.width * 0.8 : band.width, 0.36, band.thickness + (isGalaxy ? 0.04 : 0.01)]}
          radius={0.05}
          position={[0, dir * (body.height / 2 + 0.03), -0.11]}
          rotation-x={dir * -0.45}
        >
          <meshPhysicalMaterial
            color={isGalaxy ? color : bandColor}
            metalness={isGalaxy ? 0.7 : 0.05}
            roughness={isGalaxy ? 0.35 : 0.6}
            clearcoat={0.4}
            clearcoatRoughness={0.5}
          />
        </RoundedBox>
      ))}

      {/* Sport Band pin cap on the outer face at the bottom of the loop */}
      {!isGalaxy && (
        <mesh position={[0, -(band.loop.ryFront + band.loop.ryBack) / 2 - band.thickness / 2 - 0.012, band.loop.centerZ]}>
          <cylinderGeometry args={[0.17, 0.17, 0.024, 20]} />
          <meshPhysicalMaterial color="#9aa0ab" metalness={0.9} roughness={0.3} />
        </mesh>
      )}

      {/* the live screen: real DOM, CSS3D-transformed onto the crystal */}
      <DeviceScreen
        width={display.width}
        height={display.height}
        radius={display.radius}
        resolution={res}
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
