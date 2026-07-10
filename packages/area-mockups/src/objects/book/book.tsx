import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { BOOK } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface BookProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Cover art — any React node. It fills the whole front board, full bleed. */
  children?: React.ReactNode
  /** Cloth color of the spine, back board and board edges. */
  color?: string
  /** Paper color of the page block edges. */
  pageColor?: string
  /** CSS background painted behind your cover content. */
  coverBackground?: string
  /** CSS pixel width of the virtual cover. Height follows the board aspect. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your cover content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How cover content hides when the book faces away from the camera.
   * `true` raycasts against the boards (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the cover wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built trade hardcover: cloth-wrapped binder's boards with a
 * rounded spine, a cream page block recessed behind the board overhang, and a
 * live full-bleed front cover. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Book({
  children,
  color = '#1f3a5f',
  pageColor = '#f4eede',
  coverBackground = '#ffffff',
  resolution = BOOK.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: BookProps) {
  const { board, thickness, pages, spine, cover } = BOOK
  const frontRef = React.useRef<THREE.Mesh>(null!)
  const backRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [frontRef, backRef], [])

  const boardGeometry = React.useMemo(() => {
    const shape = roundedRectShape(
      board.width - board.bevel * 2,
      board.height - board.bevel * 2,
      board.radius - board.bevel
    )
    const depth = board.thickness - board.bevel * 2
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: board.bevel,
      bevelSize: board.bevel,
      bevelSegments: 2,
      curveSegments: 12,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [board])

  React.useEffect(() => () => boardGeometry.dispose(), [boardGeometry])

  const boardZ = thickness / 2 - board.thickness / 2

  return (
    <group {...groupProps}>
      {/* front and back binder's boards */}
      <mesh ref={frontRef} geometry={boardGeometry} position-z={boardZ}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.72} />
      </mesh>
      <mesh ref={backRef} geometry={boardGeometry} position-z={-boardZ}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.72} />
      </mesh>

      {/* page block, flush at the spine and recessed behind the board squares
          on the three open edges (the fore edge overhang is what you see) */}
      <RoundedBox
        args={[pages.width, pages.height, pages.thickness]}
        radius={0.008}
        position-x={-pages.inset / 2}
      >
        <meshPhysicalMaterial color={pageColor} metalness={0} roughness={0.92} />
      </RoundedBox>

      {/* rounded cloth spine wrapping the bound edge, flush with the boards */}
      <RoundedBox
        args={[spine.width, board.height, thickness]}
        radius={spine.radius}
        smoothness={6}
        position-x={-board.width / 2 + 0.012}
      >
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.72} />
      </RoundedBox>

      {/* case-binding joint groove on the back board, ~7 mm from the spine
          edge (the front board's groove is under the cover art) */}
      <mesh position={[-board.width / 2 + spine.width + 0.03, 0, -thickness / 2 - 0.0015]}>
        <boxGeometry args={[0.024, board.height - 0.16, 0.002]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>

      {/* the live cover: real DOM, CSS3D-transformed onto the front board */}
      <DeviceScreen
        width={cover.width}
        height={cover.height}
        radius={cover.radius}
        resolution={resolution}
        position={[0, 0, thickness / 2 + 0.004]}
        background={coverBackground}
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
