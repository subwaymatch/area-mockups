import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { ROLLUP_BANNER } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface RollupBannerProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Banner graphic — any React node. It fills the visible graphic, full bleed. */
  children?: React.ReactNode
  /** Hardware color (cassette, pole, top rail). Brushed aluminum by default. */
  color?: string
  /** CSS background painted behind your graphic content. */
  graphicBackground?: string
  /** CSS pixel width of the virtual graphic. Height follows the 850x2000 sheet. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your graphic content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How graphic content hides when the banner faces away from the camera.
   * `true` raycasts against the backing (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the graphic wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built retractable roll-up banner stand (the 850 x 2000 mm
 * trade-show standard): a floor-sitting oval-section aluminum cassette with
 * end caps, rear support pole, top clamp rail with its hanger hook, and the
 * graphic rising out of the cassette slot as a live full-bleed DOM surface.
 * No 3D asset files are loaded.
 *
 * The origin is the graphic center; the floor sits
 * `ROLLUP_BANNER.standHeight` below it. Must be rendered inside a
 * react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function RollupBanner({
  children,
  color = '#b9bdc4',
  graphicBackground = '#ffffff',
  resolution = ROLLUP_BANNER.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: RollupBannerProps) {
  const { graphic, cassette, pole, rail, standHeight } = ROLLUP_BANNER
  const backingRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [backingRef], [])

  const backingGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(graphic.width + 0.004, graphic.height + 0.02, graphic.radius),
        8
      ),
    [graphic]
  )
  React.useEffect(() => () => backingGeometry.dispose(), [backingGeometry])

  const aluminum = { color, metalness: 0.75, roughness: 0.4 }
  // the end caps stand slightly proud of the oval body and carry the floor contact
  const cassetteY = -standHeight + cassette.height / 2 + 0.012

  return (
    <group {...groupProps}>
      {/* vinyl backing the graphic prints on (its gray reverse side) */}
      <mesh ref={backingRef} geometry={backingGeometry} position-z={-0.004}>
        <meshPhysicalMaterial color="#c9c9c6" metalness={0} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* cassette base: an oval-section extrusion lying flat on the floor — a
          horizontal cylinder scaled front-to-back into the teardrop profile */}
      <group position={[0, cassetteY, -0.06]} scale={[1, 1, cassette.depth / cassette.height]}>
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[cassette.height / 2, cassette.height / 2, cassette.width, 32]} />
          <meshPhysicalMaterial {...aluminum} />
        </mesh>
        {/* end caps, slightly proud of the body */}
        {([1, -1] as const).map((side) => (
          <mesh key={side} rotation-z={Math.PI / 2} position-x={side * (cassette.width / 2 + 0.012)}>
            <cylinderGeometry args={[cassette.height / 2 + 0.012, cassette.height / 2 + 0.012, 0.024, 32]} />
            <meshPhysicalMaterial color="#31343a" metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
      </group>
      {/* slot lip the graphic rises through (outside the scaled group so it keeps its shape) */}
      <RoundedBox args={[graphic.width + 0.05, 0.05, 0.1]} radius={0.02} position={[0, cassetteY + cassette.height / 2 - 0.01, -0.01]}>
        <meshPhysicalMaterial {...aluminum} roughness={0.5} />
      </RoundedBox>

      {/* rear support pole up to the clamp rail */}
      <mesh position={[0, (cassetteY + graphic.height / 2) / 2, -0.09]}>
        <cylinderGeometry args={[pole.radius, pole.radius, graphic.height / 2 - cassetteY, 12]} />
        <meshPhysicalMaterial {...aluminum} roughness={0.35} />
      </mesh>

      {/* top clamp rail */}
      <RoundedBox
        args={[graphic.width + 0.04, rail.height, rail.depth]}
        radius={0.018}
        position={[0, graphic.height / 2 + rail.height / 2 - 0.01, -0.02]}
      >
        <meshPhysicalMaterial {...aluminum} />
      </RoundedBox>
      {/* hanger hook (~35 mm) where the pole meets the clamp rail */}
      <RoundedBox args={[0.065, 0.05, 0.09]} radius={0.012} position={[0, graphic.height / 2 - 0.015, -0.055]}>
        <meshPhysicalMaterial color="#31343a" metalness={0.4} roughness={0.5} />
      </RoundedBox>

      {/* the live graphic: real DOM, CSS3D-transformed onto the vinyl */}
      <DeviceScreen
        width={graphic.width}
        height={graphic.height}
        radius={graphic.radius}
        resolution={resolution}
        position={[0, 0, 0.002]}
        background={graphicBackground}
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
