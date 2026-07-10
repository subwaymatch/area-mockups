import * as React from 'react'
import * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { POSTER_FRAME } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

type GroupProps = ThreeElements['group']

export interface PosterFrameProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Poster art — any React node. It fills the visible sheet, full bleed. */
  children?: React.ReactNode
  /** Frame molding color. */
  color?: string
  /** CSS background painted behind your poster content. */
  posterBackground?: string
  /** CSS pixel width of the virtual poster. Height follows the 18x24 sheet. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your poster content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How poster content hides when the frame faces away from the camera.
   * `true` raycasts against the frame and backing (fast, interactive).
   * `'blending'` uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the poster wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built gallery poster frame: an extruded molding with a true
 * through-hole, a recessed live 18" x 24" poster sheet, and a kraft dust
 * cover on the back. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function PosterFrame({
  children,
  color = '#22262e',
  posterBackground = '#ffffff',
  resolution = POSTER_FRAME.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: PosterFrameProps) {
  const { poster, frame, recess } = POSTER_FRAME
  const frameRef = React.useRef<THREE.Mesh>(null!)
  const backingRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [frameRef, backingRef], [])

  const outerWidth = poster.width + frame.width * 2
  const outerHeight = poster.height + frame.width * 2

  const frameGeometry = React.useMemo(() => {
    const shape = roundedRectShape(
      outerWidth - frame.bevel * 2,
      outerHeight - frame.bevel * 2,
      frame.radius - frame.bevel
    )
    shape.holes.push(roundedRectShape(poster.width, poster.height, poster.radius))
    const depth = frame.depth - frame.bevel * 2
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: frame.bevel,
      bevelSize: frame.bevel,
      bevelSegments: 2,
      curveSegments: 12,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [outerWidth, outerHeight, frame, poster])

  const backingGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(poster.width + 0.04, poster.height + 0.04, poster.radius), 8),
    [poster]
  )

  const dustCoverGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(outerWidth - 0.06, outerHeight - 0.06, frame.radius),
        8
      ),
    [outerWidth, outerHeight, frame]
  )

  React.useEffect(() => {
    return () => {
      frameGeometry.dispose()
      backingGeometry.dispose()
      dustCoverGeometry.dispose()
    }
  }, [frameGeometry, backingGeometry, dustCoverGeometry])

  const posterZ = frame.depth / 2 - recess

  return (
    <group {...groupProps}>
      {/* molding with a true through-hole */}
      <mesh ref={frameRef} geometry={frameGeometry}>
        <meshPhysicalMaterial color={color} metalness={0.15} roughness={0.45} clearcoat={0.4} />
      </mesh>

      {/* backing board the poster mounts on, just behind the sheet */}
      <mesh ref={backingRef} geometry={backingGeometry} position-z={posterZ - 0.008}>
        <meshPhysicalMaterial color="#f4f2ec" metalness={0} roughness={0.9} />
      </mesh>

      {/* kraft dust cover on the back */}
      <mesh geometry={dustCoverGeometry} rotation-y={Math.PI} position-z={-frame.depth / 2 - 0.002}>
        <meshPhysicalMaterial color="#8d7c62" metalness={0} roughness={0.95} />
      </mesh>

      {/* the live poster: real DOM, CSS3D-transformed onto the recessed sheet */}
      <DeviceScreen
        width={poster.width}
        height={poster.height}
        radius={poster.radius}
        resolution={resolution}
        position={[0, 0, posterZ]}
        background={posterBackground}
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
