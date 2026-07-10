import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { DOOH_TOTEM } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface DOOHTotemProps extends Omit<GroupProps, 'children' | 'color'> {
  /** The creative — any React node on the portrait 9:16 display. */
  children?: React.ReactNode
  /** Enclosure colorway (street-furniture dark gray by default). */
  color?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /** CSS pixel width of the virtual display. 540 gives 540×960. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your screen content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How screen content hides when the totem faces away from the camera.
   * `true` raycasts against the enclosure (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the screen wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built digital out-of-home totem (digital 6-sheet class): a
 * rounded street-furniture enclosure on a low plinth, dark glass face, and a
 * live portrait 9:16 display. No 3D asset files are loaded.
 *
 * The origin is the enclosure center; the pavement sits
 * `DOOH_TOTEM.standHeight` below it. Must be rendered inside a
 * react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function DOOHTotem({
  children,
  color = '#2f333a',
  screenBackground = '#000000',
  resolution = DOOH_TOTEM.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: DOOHTotemProps) {
  const { body, glass, display, plinth, standHeight } = DOOH_TOTEM
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
      bevelSegments: 3,
      curveSegments: 16,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body])

  const glassGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(glass.width, glass.height, glass.radius), 16),
    [glass]
  )

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
    }
  }, [bodyGeometry, glassGeometry])

  return (
    <group {...groupProps}>
      {/* enclosure */}
      <mesh ref={bodyRef} geometry={bodyGeometry}>
        <meshPhysicalMaterial color={color} metalness={0.65} roughness={0.4} />
      </mesh>

      {/* dark glass face (both sides carry glass; the display lives in front) */}
      <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.003}>
        <meshPhysicalMaterial color="#05070b" metalness={0.15} roughness={0.08} clearcoat={1} />
      </mesh>
      <mesh geometry={glassGeometry} rotation-y={Math.PI} position-z={-body.depth / 2 - 0.003}>
        <meshPhysicalMaterial color="#05070b" metalness={0.15} roughness={0.08} clearcoat={1} />
      </mesh>

      {/* plinth on the pavement */}
      <RoundedBox
        args={[plinth.width, plinth.height, plinth.depth]}
        radius={0.03}
        position={[0, -standHeight + plinth.height / 2, 0]}
      >
        <meshPhysicalMaterial color="#1d2025" metalness={0.4} roughness={0.6} />
      </RoundedBox>
      {/* column connecting enclosure to plinth */}
      <RoundedBox args={[body.width - 0.5, 0.35, body.depth - 0.14]} radius={0.05} position={[0, -body.height / 2 - 0.1, 0]}>
        <meshPhysicalMaterial color={color} metalness={0.65} roughness={0.4} />
      </RoundedBox>

      {/* the live portrait display behind the glass line */}
      <DeviceScreen
        width={display.width}
        height={display.height}
        radius={display.radius}
        resolution={resolution}
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
