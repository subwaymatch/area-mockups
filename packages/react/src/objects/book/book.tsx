import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { BOOK } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '@area-mockups/core'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface BookProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Cover art — any React node. It fills the whole front board, full bleed. */
  children?: React.ReactNode
  /** Back cover design — fills the whole back board, full bleed. */
  back?: React.ReactNode
  /** Spine design — a tall strip on the crown of the cloth backbone. */
  spine?: React.ReactNode
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
 * convex cloth backbone, french grooves along the spine joints, headbands, a
 * cream page block recessed behind the board overhang, and live full-bleed
 * front cover, back cover, and spine strip. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Book({
  children,
  back,
  spine: spineContent,
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
  const { board, thickness, pages, spine, groove, headband, cover } = BOOK
  const frontRef = React.useRef<THREE.Mesh>(null!)
  const backRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(frontRef, backRef)

  const screenProps = {
    resolution,
    background: coverBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }
  // spine strip: rides the crown of the convex backbone, narrowed so its
  // flat DOM plane stays tight against the curved shell
  const spineWidth = thickness * 0.75
  const spineX = -board.width / 2 + 0.012 - (spine.bulge + 0.012) - 0.002

  // the boards stop short of the spine by the french groove width — the
  // groove itself is a thinner recessed strip added separately below
  const boardGeometry = React.useMemo(() => {
    const shape = roundedRectShape(
      board.width - groove.width - board.bevel * 2,
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
  }, [board, groove])

  React.useEffect(() => () => boardGeometry.dispose(), [boardGeometry])

  const boardZ = thickness / 2 - board.thickness / 2

  return (
    <group {...groupProps}>
      {/* front and back binder's boards, shifted clear of the french groove */}
      <mesh ref={frontRef} geometry={boardGeometry} position={[groove.width / 2, 0, boardZ]}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.72} />
      </mesh>
      <mesh ref={backRef} geometry={boardGeometry} position={[groove.width / 2, 0, -boardZ]}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.72} />
      </mesh>

      {/* french grooves: a shallow recessed cloth strip on each cover along
          the spine joint (the front one tucks under the cover art's edge) */}
      {[1, -1].map((sign) => (
        <mesh
          key={sign}
          position={[-board.width / 2 + (groove.width + 0.01) / 2, 0, sign * (boardZ - groove.depth / 2)]}
        >
          <boxGeometry args={[groove.width + 0.01, board.height - 0.016, board.thickness - groove.depth]} />
          <meshPhysicalMaterial color={color} metalness={0} roughness={0.72} />
        </mesh>
      ))}

      {/* page block, flush at the spine and recessed behind the board squares
          on the three open edges (the fore edge overhang is what you see) */}
      <RoundedBox
        args={[pages.width, pages.height, pages.thickness]}
        radius={0.008}
        position-x={-pages.inset / 2}
      >
        <meshPhysicalMaterial color={pageColor} metalness={0} roughness={0.92} />
      </RoundedBox>

      {/* convex cloth backbone: a half-cylinder shell wrapping OUTSIDE the
          bound edge, projecting past the boards (scaled unit cylinder so the
          shell spans the full closed thickness) */}
      <mesh position-x={-board.width / 2 + 0.012} scale={[spine.bulge + 0.012, 1, thickness / 2]}>
        <cylinderGeometry args={[1, 1, board.height, 24, 1, false, Math.PI, Math.PI]} />
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.72} />
      </mesh>

      {/* headbands at the head and tail of the spine, spanning the text block */}
      {[1, -1].map((sign) => (
        <mesh
          key={sign}
          rotation-x={Math.PI / 2}
          position={[-board.width / 2 + 0.01, sign * (pages.height / 2), 0]}
        >
          <cylinderGeometry args={[headband.radius, headband.radius, pages.thickness, 12]} />
          <meshPhysicalMaterial color="#b6403a" metalness={0} roughness={0.6} />
        </mesh>
      ))}

      {/* the live cover: real DOM, CSS3D-transformed onto the front board */}
      <DeviceScreen
        {...screenProps}
        width={cover.width}
        height={cover.height}
        radius={cover.radius}
        position={[0, 0, thickness / 2 + 0.004]}
      >
        {children}
      </DeviceScreen>

      {/* live back cover */}
      {back != null && (
        <DeviceScreen
          {...screenProps}
          width={cover.width}
          height={cover.height}
          radius={cover.radius}
          position={[0, 0, -thickness / 2 - 0.004]}
          rotation={[0, Math.PI, 0]}
        >
          {back}
        </DeviceScreen>
      )}

      {/* live spine strip on the backbone crown */}
      {spineContent != null && (
        <DeviceScreen
          {...screenProps}
          width={spineWidth}
          height={board.height - 0.03}
          radius={0.01}
          resolution={Math.max(48, Math.round((resolution / cover.width) * spineWidth))}
          position={[spineX, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          {spineContent}
        </DeviceScreen>
      )}
    </group>
  )
}
