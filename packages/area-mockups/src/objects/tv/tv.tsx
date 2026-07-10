import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { TV } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface TVProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the TV: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
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
 * A procedurally built 65" flat-screen TV: near-bezel-less 16:9 panel, thin
 * edges with a shallow electronics bulge low on the back, and two splayed
 * blade feet. The screen is a live 1920×1080 DOM surface. No 3D asset files
 * are loaded.
 *
 * The origin is the panel center; the media-stand plane sits
 * `TV.standHeight` below it. Must be rendered inside a react-three-fiber
 * `<Canvas>` (or `<MockupCanvas>`).
 */
export function TVSet({
  children,
  color = '#15171b',
  screenBackground = '#000000',
  resolution = TV.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: TVProps) {
  const { body, display, backBulge, feet } = TV
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

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

  return (
    <group {...groupProps}>
      {/* enclosure */}
      <mesh ref={bodyRef} geometry={bodyGeometry}>
        <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* shallow electronics bulge low on the back */}
      <RoundedBox
        args={[backBulge.width, backBulge.height, backBulge.depth]}
        radius={0.04}
        position={[0, -(body.height - backBulge.height) / 2 + 0.1, -body.depth / 2 - backBulge.depth / 2 + 0.02]}
      >
        <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.6} />
      </RoundedBox>

      {/* splayed blade feet near the ends */}
      {([1, -1] as const).map((side) => (
        <group key={side} position={[side * feet.offsetX, -body.height / 2 - feet.height / 2, 0]}>
          <mesh rotation-x={0.08}>
            <boxGeometry args={[feet.thickness, feet.height, 0.06]} />
            <meshPhysicalMaterial color={color} metalness={0.7} roughness={0.35} />
          </mesh>
          <RoundedBox
            args={[feet.thickness + 0.02, 0.035, feet.length]}
            radius={0.015}
            position={[0, -feet.height / 2 + 0.02, 0.05]}
          >
            <meshPhysicalMaterial color={color} metalness={0.7} roughness={0.35} />
          </RoundedBox>
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
