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

  // One foot: ankle + two raked struts whose tips land INSIDE the flat
  // floor pads (the pads sit level on the stand plane outside the leaned
  // strut frame, and the struts terminate buried in them — no overshoot).
  const foot = React.useMemo(() => {
    const lean = 0.045
    const padH = 0.032
    const padLen = 0.16
    const drop = feet.height - padH / 2
    const spanZ = feet.span / 2 - padLen / 2 + 0.02
    return {
      lean,
      padH,
      padLen,
      spanZ,
      strutLength: Math.hypot(drop + 0.02, spanZ),
      rake: Math.atan2(spanZ, drop + 0.02),
      padX: feet.offsetX - Math.sin(lean) * drop,
    }
  }, [feet])

  const plastic = <meshPhysicalMaterial color={color} metalness={0.55} roughness={0.42} />
  const bayBottom = -body.height / 2 + body.centerY + 0.42
  const bulgeY = -(body.height - backBulge.height) / 2 + body.centerY + 0.1
  const bulgeZ = -body.depth / 2 - backBulge.depth / 2 + 0.02
  const bayX = -(backBulge.width / 2 - portBay.width / 2 - 0.14)
  const bayY = bayBottom + portBay.height / 2
  // The bulge's rear surface and how deep the input bay sinks behind it.
  const bulgeBackZ = bulgeZ - backBulge.depth / 2
  const cavityDepth = 0.06

  // Electronics bulge with the input bay punched THROUGH it: the opening's
  // side walls come from the extrusion's hole, so the bay reads as a real
  // carved cavity (a floor plate closes it `cavityDepth` in).
  const bulgeGeometry = React.useMemo(() => {
    const bevel = 0.012
    const shape = roundedRectShape(
      backBulge.width - bevel * 2,
      backBulge.height - bevel * 2,
      0.06
    )
    const hole = roundedRectShape(portBay.width, portBay.height, 0.03)
    const holePath = new THREE.Path()
    hole.getPoints(12).forEach((p, i) => {
      const x = p.x + bayX
      const y = p.y + (bayY - bulgeY)
      if (i === 0) holePath.moveTo(x, y)
      else holePath.lineTo(x, y)
    })
    shape.holes.push(holePath)
    const core = backBulge.depth - bevel * 2
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: core,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 12,
    })
    geometry.translate(0, 0, -core / 2)
    return geometry
  }, [backBulge, portBay, bayX, bayY, bulgeY])
  React.useEffect(() => () => bulgeGeometry.dispose(), [bulgeGeometry])

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

      {/* shallow electronics bulge low on the back, the input bay punched
          through it */}
      <mesh geometry={bulgeGeometry} position={[0, bulgeY, bulgeZ]}>
        <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.6} />
      </mesh>

      {/* the input bay's interior — right side viewed from the back (-x),
          the entry-class loadout: HDMI x3, USB x2, LAN, optical, antenna
          coax. A floor plate closes the punched opening `cavityDepth` in;
          every connector mounts on it and stays BELOW the bulge surface,
          so the ports read as carved-in inputs, not stuck-on blocks. */}
      <group position={[bayX, bayY, bulgeBackZ + cavityDepth]}>
        <RoundedBox args={[portBay.width - 0.008, portBay.height - 0.008, 0.016]} radius={0.028}>
          <meshPhysicalMaterial color="#0b0c0f" metalness={0.3} roughness={0.6} />
        </RoundedBox>
        {ports.map((p, i) => (
          <group key={i} position={[-0.1, portBay.height / 2 - p.y - 0.06, 0]}>
            {p.round ? (
              <>
                {/* the coax barrel genuinely protrudes, even inside a bay */}
                <mesh rotation-x={Math.PI / 2} position-z={-0.02}>
                  <cylinderGeometry args={[p.w / 2, p.w / 2, 0.045, 16]} />
                  <meshPhysicalMaterial color="#b9bdc4" metalness={0.85} roughness={0.3} />
                </mesh>
                <mesh rotation-x={Math.PI / 2} position-z={-0.043}>
                  <cylinderGeometry args={[p.w / 4, p.w / 4, 0.002, 12]} />
                  <meshPhysicalMaterial color="#0a0b0d" metalness={0.2} roughness={0.6} />
                </mesh>
              </>
            ) : (
              <>
                {/* stamped socket bezel rising just proud of the bay floor */}
                <RoundedBox
                  args={[p.w + 0.016, p.h + 0.016, 0.024]}
                  radius={Math.min(0.008, p.h / 2)}
                  position-z={-0.012}
                >
                  <meshPhysicalMaterial color="#3f434b" metalness={0.7} roughness={0.45} />
                </RoundedBox>
                {/* the dark opening of the connector itself */}
                <RoundedBox
                  args={[p.w, p.h, 0.006]}
                  radius={Math.min(0.005, p.h / 3)}
                  position-z={-0.026}
                >
                  <meshPhysicalMaterial color={p.color} metalness={0.25} roughness={0.55} />
                </RoundedBox>
              </>
            )}
          </group>
        ))}
      </group>

      {/* feet: a slim ankle block under the cabinet with two wide-splayed
          struts running fore and aft — the shallow Λ stance of the
          reference stands. The struts terminate buried inside flat floor
          pads that sit level on the stand plane. */}
      {([1, -1] as const).map((sideX) => (
        <group key={sideX}>
          <group
            position={[sideX * feet.offsetX, -body.height / 2 + body.centerY, 0.02]}
            rotation-z={sideX * -foot.lean}
          >
            <RoundedBox args={[feet.strutWidth + 0.02, 0.07, 0.13]} radius={0.014} position={[0, -0.024, 0]}>
              {plastic}
            </RoundedBox>
            {([1, -1] as const).map((end) => (
              <group key={end} rotation-x={end * foot.rake}>
                <RoundedBox
                  args={[feet.strutWidth, foot.strutLength, feet.strutDepth]}
                  radius={0.014}
                  position={[0, 0.02 - foot.strutLength / 2, 0]}
                >
                  {plastic}
                </RoundedBox>
              </group>
            ))}
          </group>
          {/* floor pads, level on the stand plane, swallowing the strut tips */}
          {([1, -1] as const).map((end) => (
            <RoundedBox
              key={end}
              args={[feet.strutWidth + 0.034, foot.padH, foot.padLen]}
              radius={0.015}
              position={[
                sideX * foot.padX,
                -body.height / 2 + body.centerY - feet.height + foot.padH / 2,
                0.02 - end * foot.spanZ,
              ]}
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
