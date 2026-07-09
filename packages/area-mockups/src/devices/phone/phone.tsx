import * as React from 'react'
import * as THREE from 'three'
import { Html, RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { PHONE, PHONE_DISPLAY_ASPECT } from './dimensions'

type GroupProps = ThreeElements['group']
import { roundedRectShape } from '../../utils/rounded-rect'

export interface PhoneProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the phone screen: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Back panel colorway. */
  color?: string
  /** Metal frame, buttons and camera-ring color. */
  frameColor?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the virtual display. Height follows the 19.5:9 panel
   * (default 360 → a 360x780 screen). Style your content with % / flex — it is
   * rendered into a box of exactly this size.
   */
  resolution?: number
  /** Show the front camera punch-hole overlay. */
  punchHole?: boolean
  /** Let pointer events (clicks, scrolling, typing) reach your screen content. */
  interactive?: boolean
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
 * A procedurally built Samsung Phone-style phone. No 3D asset files are
 * loaded — the whole device is generated from geometry at runtime, so it
 * tree-shakes, ships in a few KB and never pops in.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Phone({
  children,
  color = '#101216',
  frameColor = '#4a4f59',
  screenBackground = '#000000',
  resolution = 360,
  punchHole = true,
  interactive = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: PhoneProps) {
  const { body, glass, display, punchHole: hole } = PHONE
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  // Chassis: an extruded rounded-rect with beveled edges. The shape is inset by
  // the bevel size so the final silhouette lands exactly on PHONE.body.
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

  // CSS px per world unit for the virtual display.
  const pxPerUnit = resolution / display.width
  const px = (units: number) => units * pxPerUnit

  const lensX = -body.width / 2 + 0.3
  const lensYs = [1.5, 1.14, 0.78]

  return (
    <group {...groupProps}>
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

      {/* rear camera module: three vertical lenses + flash */}
      {lensYs.map((y, i) => (
        <group key={i} position={[lensX, y, -body.depth / 2]}>
          <mesh rotation-x={Math.PI / 2} position-z={-0.02}>
            <cylinderGeometry args={[0.13, 0.13, 0.06, 40]} />
            <meshPhysicalMaterial color={frameColor} metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position-z={-0.048}>
            <cylinderGeometry args={[0.1, 0.1, 0.008, 40]} />
            <meshPhysicalMaterial color="#05070d" metalness={0.2} roughness={0.05} clearcoat={1} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position-z={-0.054}>
            <cylinderGeometry args={[0.045, 0.045, 0.008, 32]} />
            <meshPhysicalMaterial color="#10182e" metalness={0.4} roughness={0.1} clearcoat={1} />
          </mesh>
        </group>
      ))}
      <mesh
        rotation-x={Math.PI / 2}
        position={[lensX + 0.27, lensYs[0] ?? 1.5, -body.depth / 2 - 0.008]}
      >
        <cylinderGeometry args={[0.05, 0.05, 0.016, 32]} />
        <meshPhysicalMaterial
          color="#efe9da"
          emissive="#fff3d6"
          emissiveIntensity={0.25}
          roughness={0.4}
        />
      </mesh>

      {/* side buttons: volume rocker + power */}
      <RoundedBox args={[0.04, 0.52, 0.1]} radius={0.015} position={[body.width / 2 + 0.005, 0.85, 0]}>
        <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.04, 0.3, 0.1]} radius={0.015} position={[body.width / 2 + 0.005, 0.32, 0]}>
        <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.3} />
      </RoundedBox>

      {/* the live screen: real DOM, CSS3D-transformed onto the display */}
      <Html
        transform
        occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
        distanceFactor={(400 * display.width) / resolution}
        position={[0, 0, body.depth / 2 + 0.006]}
        zIndexRange={[10, 0]}
      >
        <div
          onPointerDown={(event) => event.stopPropagation()}
          style={{
            position: 'relative',
            width: resolution,
            height: Math.round(resolution * PHONE_DISPLAY_ASPECT),
            borderRadius: px(display.radius),
            overflow: 'hidden',
            background: screenBackground,
            pointerEvents: interactive ? 'auto' : 'none',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            WebkitFontSmoothing: 'antialiased',
            ...screenStyle,
          }}
        >
          {children}
          {punchHole && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: px(hole.offsetY - hole.radius),
                left: '50%',
                transform: 'translateX(-50%)',
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
          )}
        </div>
      </Html>
    </group>
  )
}
