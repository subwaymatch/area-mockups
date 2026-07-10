import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { A_FRAME_SIGN } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface AFrameSignProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Front panel design — any React node, full bleed inside the frame. */
  children?: React.ReactNode
  /** Back panel design (the other side of the A). */
  back?: React.ReactNode
  /** Frame color — classic dark-stained wood by default. */
  color?: string
  /** CSS background painted behind each panel (chalkboard black works well). */
  faceBackground?: string
  /** CSS pixel width of the virtual face. Height follows the 600x900 panel. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your panel content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How panel content hides when that panel turns away from the camera.
   * `true` raycasts against the panels (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each panel wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built sidewalk A-frame sandwich board: two wood-framed
 * 600 x 900 mm panels hinged at the top and splayed into an A, both sides
 * live DOM — chalk menus, sale boards, open/closed signs. No 3D asset files
 * are loaded.
 *
 * The origin is mid-height between the panels; the pavement sits at the leg
 * bottoms. Must be rendered inside a react-three-fiber `<Canvas>` (or
 * `<MockupCanvas>`).
 */
export function AFrameSign({
  children,
  back,
  color = '#4a3826',
  faceBackground = '#20241f',
  resolution = A_FRAME_SIGN.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: AFrameSignProps) {
  const { panel, face, splayAngle } = A_FRAME_SIGN
  const frontRef = React.useRef<THREE.Mesh>(null!)
  const backRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [frontRef, backRef], [])

  const frameGeometry = React.useMemo(() => {
    const shape = roundedRectShape(panel.width, panel.height, 0.03)
    shape.holes.push(roundedRectShape(face.width, face.height, face.radius))
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: panel.frameDepth - 0.02,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
      curveSegments: 8,
    })
    geometry.translate(0, 0, -(panel.frameDepth - 0.02) / 2)
    return geometry
  }, [panel, face])

  const boardGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(face.width + 0.1, face.height + 0.1, face.radius), 8),
    [face]
  )

  React.useEffect(() => {
    return () => {
      frameGeometry.dispose()
      boardGeometry.dispose()
    }
  }, [frameGeometry, boardGeometry])

  const tilt = (splayAngle * Math.PI) / 180
  // hinge at the top: panels pivot about their top edge
  const topY = (panel.height / 2) * Math.cos(tilt)
  const screenProps = {
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
      {([-1, 1] as const).map((dir) => {
        // dir -1 leans toward the viewer (the front face); tops meet at the
        // hinge and bottoms splay apart into the A stance
        const isFront = dir === -1
        return (
          <group
            key={dir}
            position={[0, 0, -dir * (panel.height / 2) * Math.sin(tilt)]}
            rotation-x={dir * tilt}
          >
            {/* wood frame with a true opening */}
            <mesh ref={isFront ? frontRef : backRef} geometry={frameGeometry} rotation-y={isFront ? 0 : Math.PI}>
              <meshPhysicalMaterial color={color} metalness={0} roughness={0.75} />
            </mesh>
            {/* board behind the opening */}
            <mesh geometry={boardGeometry} rotation-y={isFront ? 0 : Math.PI} position-z={isFront ? -0.012 : 0.012}>
              <meshPhysicalMaterial color="#181b17" metalness={0} roughness={0.95} />
            </mesh>

            {/* live face */}
            <DeviceScreen
              {...screenProps}
              position={[0, 0, isFront ? panel.frameDepth / 2 - 0.02 : -(panel.frameDepth / 2 - 0.02)]}
              rotation={isFront ? [0, 0, 0] : [0, Math.PI, 0]}
            >
              {isFront ? children : back}
            </DeviceScreen>
          </group>
        )
      })}

      {/* hinge bar across the apex */}
      <mesh rotation-z={Math.PI / 2} position={[0, topY + 0.02, 0]}>
        <cylinderGeometry args={[0.035, 0.035, panel.width - 0.1, 12]} />
        <meshPhysicalMaterial color="#8f949c" metalness={0.9} roughness={0.35} />
      </mesh>
    </group>
  )
}
