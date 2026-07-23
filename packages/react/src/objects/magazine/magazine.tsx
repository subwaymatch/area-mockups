import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { MAGAZINE, magazineSpec, type MagazineSize } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '@area-mockups/core'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface MagazineProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Cover art — any React node. It fills the whole front cover, full bleed. */
  children?: React.ReactNode
  /** Back cover design — full bleed, with the same glossy stock sheen. */
  back?: React.ReactNode
  /**
   * Physical trim size in millimeters, e.g. `{ width: 210, height: 297 }`
   * for A4 or `{ thickness: 12 }` for a thick issue. Defaults to the
   * 216 x 279 x 6 mm US letter trim.
   */
  size?: MagazineSize
  /** Paper color of the trimmed page edges. */
  pageColor?: string
  /** Back cover color (the unprinted default is a light stock gray). */
  backColor?: string
  /** Glossy cover stock: a soft diagonal sheen over the cover art. */
  glossy?: boolean
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
 * with visible paper edges, a flat glued spine, and live full-bleed glossy
 * front and back covers. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Magazine({
  children,
  back,
  size,
  pageColor = '#fbfaf7',
  backColor = '#e9e7e2',
  glossy = true,
  coverBackground = '#ffffff',
  resolution = MAGAZINE.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: MagazineProps) {
  const { body, cover } = React.useMemo(
    () => (size ? magazineSpec(size) : MAGAZINE),
    [size?.width, size?.height, size?.thickness]
  )
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(bodyRef)

  const glossOverlay = glossy ? (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2147483647,
        background:
          'linear-gradient(112deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 24%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.05) 100%)',
      }}
    />
  ) : undefined

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

      {/* perfect-bound spine: the glossy cover stock wraps only the bound
          edge, trimmed flush with the block on the other sides (the hair of
          offset just avoids z-fighting with the page block faces) */}
      <RoundedBox
        args={[0.016, body.height - 0.002, body.thickness + 0.001]}
        radius={0.004}
        position-x={-body.width / 2}
      >
        <meshPhysicalMaterial color={backColor} metalness={0} roughness={0.35} clearcoat={0.5} />
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
        overlay={glossOverlay}
      >
        {children}
      </DeviceScreen>

      {/* live back cover — same stock, same sheen */}
      {back != null && (
        <DeviceScreen
          width={cover.width}
          height={cover.height}
          radius={cover.radius}
          resolution={resolution}
          position={[0, 0, -body.thickness / 2 - 0.004]}
          rotation={[0, Math.PI, 0]}
          background={coverBackground}
          interactive={interactive}
          dragToRotate={dragToRotate}
          occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
          screenStyle={screenStyle}
          overlay={glossOverlay}
        >
          {back}
        </DeviceScreen>
      )}
    </group>
  )
}
