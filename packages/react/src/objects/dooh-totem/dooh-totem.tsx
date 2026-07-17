import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { DOOH_TOTEM } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '@area-mockups/core'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface DOOHTotemProps extends Omit<GroupProps, 'children' | 'color'> {
  /** The creative — any React node on the portrait 9:16 display. */
  children?: React.ReactNode
  /** Creative on the back (−Z) display — real totems are double-sided. */
  back?: React.ReactNode
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
 * rounded street-furniture enclosure running full-width into a kick plinth,
 * ventilation louvres, cover glass on both faces, and a live portrait 9:16
 * display behind the front glass (plus an optional `back` display — real
 * units are double-sided). No 3D asset files are loaded.
 *
 * The origin is the enclosure center; the pavement sits
 * `DOOH_TOTEM.standHeight` below it. Must be rendered inside a
 * react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function DOOHTotem({
  children,
  back,
  color = '#2f333a',
  screenBackground = '#000000',
  resolution = DOOH_TOTEM.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: DOOHTotemProps) {
  const { body, glass, display, plinth, louvre, standHeight } = DOOH_TOTEM
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

  const screenProps = {
    width: display.width,
    height: display.height,
    radius: display.radius,
    resolution,
    background: screenBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  return (
    <group {...groupProps}>
      {/* enclosure */}
      <mesh ref={bodyRef} geometry={bodyGeometry}>
        <meshPhysicalMaterial color={color} metalness={0.65} roughness={0.4} />
      </mesh>

      {/* both faces: matte display surround, subtle cover glass, louvre bands */}
      {([1, -1] as const).map((s) => (
        <group key={s} rotation-y={s === 1 ? 0 : Math.PI}>
          {/* matte black surround — reads through the glass around the display */}
          <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.001}>
            <meshPhysicalMaterial color="#05070b" metalness={0.1} roughness={0.5} />
          </mesh>
          {/* cover glass; the display sits ~2 mm behind this plane, never proud of it */}
          <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.005}>
            <meshPhysicalMaterial
              color="#0b0f14"
              metalness={0.1}
              roughness={0.06}
              clearcoat={1}
              transparent
              opacity={0.22}
            />
          </mesh>
          {/* ventilation louvre bands above and below the glass */}
          {([1, -1] as const).map((v) => (
            <mesh key={v} position={[0, v * louvre.y, body.depth / 2 + 0.001]}>
              <planeGeometry args={[louvre.width, louvre.height]} />
              <meshPhysicalMaterial color="#14161a" metalness={0.3} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}

      {/* full-width kick plinth — the enclosure runs straight into it, no neck */}
      <RoundedBox
        args={[plinth.width, plinth.height, plinth.depth]}
        radius={0.03}
        position={[0, -standHeight + plinth.height / 2, 0]}
      >
        <meshPhysicalMaterial color="#1d2025" metalness={0.4} roughness={0.6} />
      </RoundedBox>

      {/* the live portrait display, just behind the front cover glass */}
      <DeviceScreen {...screenProps} position={[0, 0, body.depth / 2 + 0.002]}>
        {children}
      </DeviceScreen>

      {/* the back display — real totems are double-sided */}
      {back != null && (
        <DeviceScreen
          {...screenProps}
          position={[0, 0, -(body.depth / 2 + 0.002)]}
          rotation={[0, Math.PI, 0]}
        >
          {back}
        </DeviceScreen>
      )}
    </group>
  )
}
