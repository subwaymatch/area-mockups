import * as React from 'react'
import * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { BUSINESS_CARD } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '@area-mockups/core'

type GroupProps = ThreeElements['group']

export interface BusinessCardProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Front face design — any React node, full bleed. */
  children?: React.ReactNode
  /** Back face design. Spin the card around to see it (plain stock if omitted). */
  back?: React.ReactNode
  /** Stock color — the faces' base (and the back, behind any `back` content). */
  color?: string
  /**
   * Painted-edge color, the signature of premium 32 pt stock (think a bright
   * seam of color around the card). Defaults to the stock color (unpainted).
   */
  edgeColor?: string
  /** CSS background painted behind your face content. */
  faceBackground?: string
  /** CSS pixel width of the virtual face. Height follows the card aspect. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your face content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How face content hides when that face turns away from the camera.
   * `true` raycasts against the card (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each face wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built business card on premium 32 pt stock: rounded die-cut
 * corners, visible paper edge, and live full-bleed DOM on the front — and,
 * optionally, the back. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function BusinessCard({
  children,
  back,
  color = '#f7f6f2',
  edgeColor,
  faceBackground = '#ffffff',
  resolution = BUSINESS_CARD.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: BusinessCardProps) {
  const { body, face } = BUSINESS_CARD
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  const bodyGeometry = React.useMemo(() => {
    const shape = roundedRectShape(
      body.width - body.bevel * 2,
      body.height - body.bevel * 2,
      body.radius - body.bevel
    )
    const depth = body.thickness - body.bevel * 2
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

  const faceProps = {
    width: face.width,
    height: face.height,
    radius: face.radius,
    resolution,
    background: faceBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  return (
    <group {...groupProps}>
      {/* the stock — faces in the stock color, die-cut edge optionally painted
          (ExtrudeGeometry material group 0 is the caps, group 1 the sides) */}
      <mesh ref={bodyRef} geometry={bodyGeometry}>
        <meshPhysicalMaterial attach="material-0" color={color} metalness={0} roughness={0.82} />
        <meshPhysicalMaterial
          attach="material-1"
          color={edgeColor ?? color}
          metalness={0}
          roughness={edgeColor ? 0.5 : 0.82}
        />
      </mesh>

      {/* live front face */}
      <DeviceScreen {...faceProps} position={[0, 0, body.thickness / 2 + 0.003]}>
        {children}
      </DeviceScreen>

      {/* live back face — only mounted when there's a design for it */}
      {back != null && (
        <DeviceScreen
          {...faceProps}
          position={[0, 0, -body.thickness / 2 - 0.003]}
          rotation={[0, Math.PI, 0]}
        >
          {back}
        </DeviceScreen>
      )}
    </group>
  )
}
