import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { MAGAZINE } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface MagazineProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Cover art — any React node. It fills the whole front cover, full bleed. */
  children?: React.ReactNode
  /** Paper color of the trimmed page edges. */
  pageColor?: string
  /** Back cover color (the unprinted default is a light stock gray). */
  backColor?: string
  /** CSS background painted behind your cover content. */
  coverBackground?: string
  /** CSS pixel width of the virtual cover. Height follows the trim aspect. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your cover content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How cover content hides when the magazine faces away from the camera.
   * `true` raycasts against the page block (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the cover wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built perfect-bound magazine: a thin letter-trim page block
 * with visible paper edges, a flat glued spine, and a live full-bleed glossy
 * front cover. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Magazine({
  children,
  pageColor = '#fbfaf7',
  backColor = '#e9e7e2',
  coverBackground = '#ffffff',
  resolution = MAGAZINE.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: MagazineProps) {
  const { body, cover } = MAGAZINE
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  const backGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(body.width - 0.01, body.height - 0.01, body.radius),
        12
      ),
    [body]
  )

  React.useEffect(() => () => backGeometry.dispose(), [backGeometry])

  return (
    <group {...groupProps}>
      {/* trimmed page block — the paper edges you see on the three open sides */}
      <RoundedBox ref={bodyRef} args={[body.width, body.height, body.thickness]} radius={body.radius}>
        <meshPhysicalMaterial color={pageColor} metalness={0} roughness={0.9} />
      </RoundedBox>

      {/* back cover, a touch glossier than the page edges */}
      <mesh geometry={backGeometry} rotation-y={Math.PI} position-z={-body.thickness / 2 - 0.002}>
        <meshPhysicalMaterial color={backColor} metalness={0} roughness={0.35} clearcoat={0.5} />
      </mesh>

      {/* the live cover: real DOM, CSS3D-transformed onto the front */}
      <DeviceScreen
        width={cover.width}
        height={cover.height}
        radius={cover.radius}
        resolution={resolution}
        position={[0, 0, body.thickness / 2 + 0.004]}
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
