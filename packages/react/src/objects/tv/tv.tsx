import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { TV, tvSpec } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '@area-mockups/core'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface TVProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the TV: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /**
   * Diagonal size in inches, clamped to `TV_MIN_INCHES`..`TV_MAX_INCHES`
   * (32–98). The panel scales with the diagonal while the bezels, cabinet
   * depth, ports and feet follow real product ratios — the feet keep a
   * near-constant inset from the panel ends and grow only mildly, like the
   * shared plastic stands on retail ranges. Default 65.
   */
  size?: number
  /** Enclosure colorway (frame, back, feet). */
  color?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /** CSS pixel width of the virtual display. 1920 gives 1920×1080. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your screen content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How screen content hides when the TV faces away from the camera.
   * `true` raycasts against the enclosure (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the screen wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built flat-screen TV (65" by default, sized via `size` in
 * inches): near-bezel-less 16:9 panel, thin edges with a shallow
 * electronics bulge low on the back, a recessed rear input bay (HDMI, USB,
 * LAN, optical audio, antenna) and two slim feet near the ends — each a
 * pair of wide-splayed struts, the shallow Λ stance of current retail
 * stands. The screen is a live 1920×1080 DOM surface. No 3D asset files
 * are loaded.
 *
 * The origin is the panel center; the media-stand plane sits
 * `standHeight` below it. Must be rendered inside a react-three-fiber
 * `<Canvas>` (or `<MockupCanvas>`).
 */
export function TVSet({
  children,
  size,
  color = '#15171b',
  screenBackground = '#000000',
  resolution = TV.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: TVProps) {
  const spec = React.useMemo(() => (size === undefined ? TV : tvSpec(size)), [size])
  const { body, display, backBulge, feet, portBay } = spec
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(bodyRef)

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
      bevelSegments: 2,
      curveSegments: 12,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body])
  React.useEffect(() => () => bodyGeometry.dispose(), [bodyGeometry])

  // One foot strut: from the ankle under the cabinet down-and-outward to
  // its floor pad. Length and rake follow the spec's height and span.
  const strut = React.useMemo(() => {
    const half = feet.span / 2
    return {
      length: Math.hypot(feet.height, half) + 0.04,
      rake: Math.atan2(half, feet.height),
    }
  }, [feet])

  const plastic = <meshPhysicalMaterial color={color} metalness={0.55} roughness={0.42} />
  const bayBottom = -body.height / 2 + body.centerY + 0.42

  // The rear input bay's connector column, top to bottom: 3x HDMI, 2x USB,
  // LAN, optical audio, antenna coax. Bay-local coordinates, y from the top.
  const ports: { w: number; h: number; y: number; color: string; round?: boolean }[] = [
    { w: 0.075, h: 0.02, y: 0.1, color: '#101114' },
    { w: 0.075, h: 0.02, y: 0.2, color: '#101114' },
    { w: 0.075, h: 0.02, y: 0.3, color: '#101114' },
    { w: 0.05, h: 0.018, y: 0.42, color: '#0d1a3a' },
    { w: 0.05, h: 0.018, y: 0.5, color: '#0d1a3a' },
    { w: 0.062, h: 0.05, y: 0.63, color: '#101114' },
    { w: 0.036, h: 0.034, y: 0.76, color: '#1a2415' },
    { w: 0.04, h: 0.04, y: 0.92, color: '#26292f', round: true },
  ]

  return (
    <group {...groupProps}>
      {/* enclosure, dropped by the chin offset so the display stays centered */}
      <mesh ref={bodyRef} geometry={bodyGeometry} position={[0, body.centerY, 0]}>
        <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* logo/IR bar projecting just below the chin at bottom center */}
      <RoundedBox
        args={[0.35, 0.04, 0.023]}
        radius={0.01}
        position={[0, -body.height / 2 + body.centerY - 0.012, body.depth / 2 - 0.02]}
      >
        <meshPhysicalMaterial color="#0b0c0e" metalness={0.5} roughness={0.4} />
      </RoundedBox>

      {/* shallow electronics bulge low on the back */}
      <RoundedBox
        args={[backBulge.width, backBulge.height, backBulge.depth]}
        radius={0.04}
        position={[0, -(body.height - backBulge.height) / 2 + body.centerY + 0.1, -body.depth / 2 - backBulge.depth / 2 + 0.02]}
      >
        <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.6} />
      </RoundedBox>

      {/* recessed input bay on the back — right side viewed from the back
          (-x), the entry-class loadout: HDMI x3, USB x2, LAN, optical,
          antenna coax. The connectors sit inside a darker recess. */}
      <group
        position={[
          -(backBulge.width / 2 - portBay.width / 2 - 0.14),
          bayBottom + portBay.height / 2,
          -body.depth / 2 - backBulge.depth + 0.016,
        ]}
      >
        <RoundedBox args={[portBay.width, portBay.height, 0.05]} radius={0.02}>
          <meshPhysicalMaterial color="#0e0f12" metalness={0.4} roughness={0.55} />
        </RoundedBox>
        {ports.map((p, i) => (
          <group key={i} position={[-0.1, portBay.height / 2 - p.y - 0.06, -0.028]}>
            {p.round ? (
              <mesh rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[p.w / 2, p.w / 2, 0.05, 16]} />
                <meshPhysicalMaterial color="#b9bdc4" metalness={0.85} roughness={0.3} />
              </mesh>
            ) : (
              <RoundedBox args={[p.w, p.h, 0.03]} radius={Math.min(0.006, p.h / 3)}>
                <meshPhysicalMaterial color={p.color} metalness={0.35} roughness={0.5} />
              </RoundedBox>
            )}
          </group>
        ))}
      </group>

      {/* feet: a slim ankle block under the cabinet with two wide-splayed
          struts running fore and aft to small pads — the shallow Λ stance
          of the reference stands (no floor runner) */}
      {([1, -1] as const).map((sideX) => (
        <group
          key={sideX}
          position={[sideX * feet.offsetX, -body.height / 2 + body.centerY, 0.02]}
          rotation-z={sideX * -0.045}
        >
          <RoundedBox args={[feet.strutWidth + 0.02, 0.06, 0.12]} radius={0.012} position={[0, -0.02, 0]}>
            {plastic}
          </RoundedBox>
          {([1, -1] as const).map((end) => (
            <group key={end} rotation-x={end * strut.rake}>
              <RoundedBox
                args={[feet.strutWidth, strut.length, feet.strutDepth]}
                radius={0.014}
                position={[0, -strut.length / 2 + 0.03, 0]}
              >
                {plastic}
              </RoundedBox>
            </group>
          ))}
          {/* floor pads under the strut ends */}
          {([1, -1] as const).map((end) => (
            <RoundedBox
              key={end}
              args={[feet.strutWidth + 0.03, 0.028, 0.15]}
              radius={0.012}
              position={[0, -feet.height + 0.012, end * (feet.span / 2 - 0.03)]}
            >
              {plastic}
            </RoundedBox>
          ))}
        </group>
      ))}

      {/* the live screen: real DOM, CSS3D-transformed onto the panel */}
      <DeviceScreen
        width={display.width}
        height={display.height}
        radius={display.radius}
        resolution={resolution}
        position={[0, 0, body.depth / 2 + 0.004]}
        background={screenBackground}
        interactive={interactive}
        dragToRotate={dragToRotate}
        occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
        screenStyle={screenStyle}
        overlay={
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 2147483647,
              background:
                'linear-gradient(118deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0) 46%)',
            }}
          />
        }
      >
        {children}
      </DeviceScreen>
    </group>
  )
}
