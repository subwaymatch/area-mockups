import * as React from 'react'
import type * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { PRODUCT_BOX, productBoxLayout, type ProductBoxSizeMm } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface ProductBoxProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Front panel design — any React node, full bleed. */
  children?: React.ReactNode
  /** Right side panel design (the one visible in a standard 3/4 pose). */
  side?: React.ReactNode
  /** Top panel design. */
  top?: React.ReactNode
  /** Back panel design. */
  back?: React.ReactNode
  /**
   * Carton size in real millimeters: `{ width, height, depth }`. The longest
   * edge normalizes to the stage, so any size fills the default camera while
   * the mm dimensions set the true proportions. Defaults to the 190×265×55 mm
   * retail blank.
   */
  size?: ProductBoxSizeMm
  /** Carton stock color — every unprinted panel and the fold edges. */
  color?: string
  /** CSS background painted behind each printed panel. */
  faceBackground?: string
  /** CSS pixel width of the virtual front panel; other panels share its dpi. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your panel content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How panel content hides when that panel turns away from the camera.
   * `true` raycasts against the carton (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each panel wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built standing product carton: crisp fold edges, matte
 * coated stock, and up to four live DOM panels — front, right side, top and
 * back — so a standard 3/4 hero pose shows three printed faces at once.
 * No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function ProductBox({
  children,
  side,
  top,
  back,
  size,
  color = '#f4f1ea',
  faceBackground = '#ffffff',
  resolution = PRODUCT_BOX.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: ProductBoxProps) {
  const { body, flap } = React.useMemo(
    () => productBoxLayout(size),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size?.width, size?.height, size?.depth]
  )
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(bodyRef)
  const flapDepth = body.depth - flap.backGap

  // the glue-seam lap joint scales down with shallow cartons
  const seamWidth = Math.min(0.38, body.depth * 0.43)

  // every panel shares the front panel's dpi so type sizes match across faces
  const pxPerUnit = resolution / body.width

  const shared = {
    radius: body.radius,
    background: faceBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  return (
    <group {...groupProps}>
      {/* the carton — satin coated stock, crisp but not razor-sharp folds */}
      <RoundedBox ref={bodyRef} args={[body.width, body.height, body.depth]} radius={body.radius}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.55} clearcoat={0.2} clearcoatRoughness={0.7} />
      </RoundedBox>

      {/* tuck flap resting on the top face, its seam short of the back edge */}
      <RoundedBox
        args={[body.width - 0.02, flap.lift * 2, flapDepth]}
        radius={flap.lift * 0.9}
        position={[0, body.height / 2, (body.depth - flapDepth) / 2 - flap.backGap / 2]}
      >
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.55} clearcoat={0.2} clearcoatRoughness={0.7} />
      </RoundedBox>

      {/* manufacturer's glue seam: the vertical lap joint on the left rear edge */}
      <mesh position={[-body.width / 2 - 0.0015, 0, -body.depth / 2 + seamWidth / 2 + 0.01]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[seamWidth, body.height - 0.02]} />
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.62} />
      </mesh>
      <mesh position={[-body.width / 2 - 0.003, 0, -body.depth / 2 + seamWidth + 0.01]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[0.006, body.height - 0.02]} />
        <meshBasicMaterial color="rgba(0,0,0)" transparent opacity={0.22} />
      </mesh>

      {/* front panel */}
      <DeviceScreen
        {...shared}
        width={body.width}
        height={body.height}
        resolution={resolution}
        position={[0, 0, body.depth / 2 + 0.003]}
      >
        {children}
      </DeviceScreen>

      {/* right side panel */}
      {side != null && (
        <DeviceScreen
          {...shared}
          width={body.depth}
          height={body.height}
          resolution={Math.round(body.depth * pxPerUnit)}
          position={[body.width / 2 + 0.003, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          {side}
        </DeviceScreen>
      )}

      {/* top panel — oriented so its content reads from the front */}
      {top != null && (
        <DeviceScreen
          {...shared}
          width={body.width}
          height={body.depth}
          resolution={resolution}
          position={[0, body.height / 2 + 0.003, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {top}
        </DeviceScreen>
      )}

      {/* back panel */}
      {back != null && (
        <DeviceScreen
          {...shared}
          width={body.width}
          height={body.height}
          resolution={resolution}
          position={[0, 0, -body.depth / 2 - 0.003]}
          rotation={[0, Math.PI, 0]}
        >
          {back}
        </DeviceScreen>
      )}
    </group>
  )
}
