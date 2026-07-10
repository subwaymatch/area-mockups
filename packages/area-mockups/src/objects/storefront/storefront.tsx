import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { STOREFRONT } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface StorefrontProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Fascia sign design — any React node, full bleed on the sign band. */
  children?: React.ReactNode
  /** Poster displayed inside the left window bay. */
  windowPoster?: React.ReactNode
  /** Shopfront paint (fascia surround, frames, door, stall riser). */
  color?: string
  /** Upper wall / masonry color above the fascia. */
  wallColor?: string
  /** CSS background painted behind sign and poster content. */
  faceBackground?: string
  /** CSS pixel width of the virtual fascia sign. The window poster is a fixed 420 px wide. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How content hides when the façade faces away from the camera.
   * `true` raycasts against the wall (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each content wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built high-street shopfront: painted timber surround, stall
 * riser, big display window with a mullion and a band of transom lights,
 * glazed door with a vertical pull, corniced fascia on console brackets —
 * with the fascia sign and a window poster as live DOM. No 3D asset files
 * are loaded.
 *
 * The origin is the façade center; the pavement sits
 * `STOREFRONT.standHeight` below it. Must be rendered inside a
 * react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Storefront({
  children,
  windowPoster,
  color = '#2e4638',
  wallColor = '#8d7a6a',
  faceBackground = '#ffffff',
  resolution = STOREFRONT.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: StorefrontProps) {
  const { body, fascia, sign, riser, window: win, poster, standHeight } = STOREFRONT
  const wallRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [wallRef], [])

  const glassMaterial = (
    <meshPhysicalMaterial color="#1a2b33" metalness={0.15} roughness={0.06} clearcoat={1} />
  )
  const paint = { color, metalness: 0.05, roughness: 0.55, clearcoat: 0.3 }

  const riserTop = -standHeight + riser.height
  const windowH = win.top - riserTop
  const frontZ = body.depth / 2
  // window glazing extent (the door bay sits to its right)
  const glazeX = (win.doorX - 0.35 - body.width / 2) / 2
  const glazeW = win.doorX - 0.35 + body.width / 2 - 0.3
  // transom rail ~450 mm below the window head
  const transomY = win.top - 0.409

  return (
    <group {...groupProps}>
      {/* backing wall */}
      <mesh ref={wallRef}>
        <boxGeometry args={[body.width, body.height, body.depth]} />
        <meshPhysicalMaterial color={wallColor} metalness={0} roughness={0.9} />
      </mesh>

      {/* painted shopfront surround: fascia band, cornice, pilasters, riser */}
      <RoundedBox args={[body.width, fascia.height, 0.12]} radius={0.015} position={[0, fascia.y, frontZ + 0.02]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      <RoundedBox args={[body.width + 0.12, 0.12, 0.2]} radius={0.02} position={[0, fascia.y + fascia.height / 2 + 0.05, frontZ + 0.03]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      {([1, -1] as const).map((s) => (
        <RoundedBox key={s} args={[0.16, fascia.y - riserTop + fascia.height / 2 + riser.height + 0.4, 0.14]} radius={0.015} position={[s * (body.width / 2 - 0.08), (fascia.y + -standHeight) / 2 + 0.15, frontZ + 0.02]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
      ))}
      <RoundedBox args={[body.width, riser.height, 0.1]} radius={0.012} position={[0, -standHeight + riser.height / 2, frontZ + 0.015]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>

      {/* display glazing: window bays left of the door, door bay right */}
      <mesh position={[glazeX, riserTop + windowH / 2, frontZ + 0.005]}>
        <planeGeometry args={[glazeW, windowH]} />
        {glassMaterial}
      </mesh>
      {/* mullion + window head */}
      <RoundedBox args={[0.1, windowH, 0.1]} radius={0.012} position={[win.mullionX, riserTop + windowH / 2, frontZ + 0.02]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      <RoundedBox args={[body.width, 0.1, 0.1]} radius={0.012} position={[0, win.top + 0.02, frontZ + 0.02]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      {/* transom rail below the window head; the band above it reads as
          separate transom lights, split by thin vertical dividers */}
      <RoundedBox args={[glazeW + 0.1, 0.055, 0.09]} radius={0.012} position={[glazeX, transomY, frontZ + 0.02]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      {[-1.61, -0.07, 0.52].map((x) => (
        <RoundedBox key={x} args={[0.045, win.top - transomY, 0.08]} radius={0.01} position={[x, (win.top + transomY) / 2, frontZ + 0.018]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
      ))}

      {/* glazed door with frame, handle and a doorstep */}
      <RoundedBox args={[win.doorWidth, windowH + riser.height, 0.08]} radius={0.015} position={[win.doorX + win.doorWidth / 2, riserTop + (windowH - riser.height) / 2, frontZ + 0.012]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      <mesh position={[win.doorX + win.doorWidth / 2, riserTop + windowH / 2 - 0.15, frontZ + 0.055]}>
        <planeGeometry args={[win.doorWidth - 0.22, windowH + riser.height - 0.34]} />
        {glassMaterial}
      </mesh>
      {/* vertical pull (~300 mm) on the lock stile, centered ~1 m above the pavement */}
      <mesh position={[win.doorX + 0.16, -standHeight + 0.909, frontZ + 0.075]}>
        <cylinderGeometry args={[0.015, 0.015, 0.273, 10]} />
        <meshPhysicalMaterial color="#c9ccd2" metalness={0.9} roughness={0.3} />
      </mesh>
      {([1, -1] as const).map((s) => (
        <mesh key={s} rotation-x={Math.PI / 2} position={[win.doorX + 0.16, -standHeight + 0.909 + s * 0.11, frontZ + 0.065]}>
          <cylinderGeometry args={[0.008, 0.008, 0.03, 8]} />
          <meshPhysicalMaterial color="#c9ccd2" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* console brackets carrying the cornice at the fascia ends */}
      {([1, -1] as const).map((s) => (
        <RoundedBox key={s} args={[0.14, 0.26, 0.14]} radius={0.02} position={[s * (body.width / 2 - 0.15), fascia.y + fascia.height / 2 - 0.13, frontZ + 0.06]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
      ))}

      {/* the live fascia sign */}
      <DeviceScreen
        width={sign.width}
        height={sign.height}
        radius={sign.radius}
        resolution={resolution}
        position={[0, fascia.y, frontZ + 0.085]}
        background={faceBackground}
        interactive={interactive}
        dragToRotate={dragToRotate}
        occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
        screenStyle={screenStyle}
      >
        {children}
      </DeviceScreen>

      {/* the live window poster, pasted inside the left bay */}
      {windowPoster != null && (
        <DeviceScreen
          width={poster.width}
          height={poster.height}
          radius={poster.radius}
          resolution={420}
          position={[poster.x, poster.y, frontZ + 0.008]}
          background={faceBackground}
          interactive={interactive}
          dragToRotate={dragToRotate}
          occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
          screenStyle={screenStyle}
        >
          {windowPoster}
        </DeviceScreen>
      )}
    </group>
  )
}
