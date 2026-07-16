import * as React from 'react'
import * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { VINYL_RECORD } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '@area-mockups/core'

type GroupProps = ThreeElements['group']

export interface VinylRecordProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Album cover art — any React node, full bleed on the jacket front. */
  children?: React.ReactNode
  /** Back cover design. */
  back?: React.ReactNode
  /** Center label design — a live circular area on the disc. */
  label?: React.ReactNode
  /** Vinyl color. Classic black by default; try translucent-look colors. */
  vinylColor?: string
  /** Jacket stock color (edges and unprinted faces). */
  color?: string
  /** CSS background painted behind cover, back and label content. */
  faceBackground?: string
  /** CSS pixel width of the virtual cover; the label shares its dpi. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How content hides when a face turns away from the camera.
   * `true` raycasts against jacket and disc (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each face wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built 12" vinyl LP half-out of its jacket: a square sleeve
 * with live front and back cover art, a white paper inner sleeve peeking out
 * of the mouth, and a glossy grooved disc whose center label is a live
 * circular DOM area. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function VinylRecord({
  children,
  back,
  label,
  vinylColor = '#0b0b0d',
  color = '#f2efe8',
  faceBackground = '#ffffff',
  resolution = VINYL_RECORD.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: VinylRecordProps) {
  const { sleeve, disc, innerSleeve, discPeek } = VINYL_RECORD
  const sleeveRef = React.useRef<THREE.Mesh>(null!)
  const discRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [sleeveRef, discRef], [])

  const sleeveGeometry = React.useMemo(() => {
    const shape = roundedRectShape(sleeve.size - 0.012, sleeve.size - 0.012, sleeve.radius)
    const depth = sleeve.thickness - 0.012
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelSegments: 2,
      curveSegments: 8,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [sleeve])

  React.useEffect(() => () => sleeveGeometry.dispose(), [sleeveGeometry])

  // The groove band painted once into a texture: fine concentric circles from
  // the lead-in edge down to the dead wax, so the playing surface reads as
  // grooved vinyl under any light (thin torus rings vanish on a black disc).
  const grooveTexture = React.useMemo(() => {
    if (typeof document === 'undefined') return null
    const size = 1024
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const c = size / 2
    const rOut = c * 0.995
    const rIn = c * (disc.deadWaxRadius / disc.radius)
    for (let i = 0; i < 110; i++) {
      const r = rIn + ((rOut - rIn) * i) / 109
      // brighter sheen bands at the track gaps, faint lines elsewhere
      const gap = i % 16 === 0
      ctx.beginPath()
      ctx.arc(c, c, r, 0, Math.PI * 2)
      ctx.strokeStyle = gap ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)'
      ctx.lineWidth = gap ? 2.4 : 1.1
      ctx.stroke()
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 4
    return texture
  }, [disc])
  React.useEffect(() => () => grooveTexture?.dispose(), [grooveTexture])

  // Disc peeks out to the upper-right, tucked behind the jacket.
  const discX = sleeve.size / 2 - disc.radius + disc.radius * 2 * discPeek
  const discZ = -sleeve.thickness / 2 - disc.thickness / 2 - 0.006
  const labelPxPerUnit = resolution / sleeve.size

  const faceProps = {
    resolution,
    background: faceBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  return (
    <group {...groupProps}>
      {/* jacket */}
      <group position={[-disc.radius * discPeek * 0.9, 0, 0]}>
        <mesh ref={sleeveRef} geometry={sleeveGeometry}>
          <meshPhysicalMaterial color={color} metalness={0} roughness={0.75} />
        </mesh>

        {/* live cover art */}
        <DeviceScreen
          {...faceProps}
          width={sleeve.size}
          height={sleeve.size}
          radius={sleeve.radius}
          position={[0, 0, sleeve.thickness / 2 + 0.003]}
        >
          {children}
        </DeviceScreen>

        {/* live back cover */}
        {back != null && (
          <DeviceScreen
            {...faceProps}
            width={sleeve.size}
            height={sleeve.size}
            radius={sleeve.radius}
            position={[0, 0, -sleeve.thickness / 2 - disc.thickness - 0.015]}
            rotation={[0, Math.PI, 0]}
          >
            {back}
          </DeviceScreen>
        )}

        {/* white paper inner sleeve behind the disc, peeking out of the
            jacket mouth */}
        <mesh position={[0.08, 0, discZ - disc.thickness / 2 - 0.004]}>
          <boxGeometry args={[innerSleeve.size, innerSleeve.size, innerSleeve.thickness]} />
          <meshPhysicalMaterial color="#fdfdfa" metalness={0} roughness={0.95} />
        </mesh>

        {/* the disc, half-out behind the jacket */}
        <group position={[discX, 0, discZ]}>
          <mesh ref={discRef} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[disc.radius, disc.radius, disc.thickness, 64]} />
            <meshPhysicalMaterial color={vinylColor} metalness={0.1} roughness={0.32} clearcoat={1} clearcoatRoughness={0.25} />
          </mesh>
          {/* the grooved playing surface, lead-in to dead wax */}
          {grooveTexture && (
            <mesh position-z={disc.thickness / 2 + 0.001}>
              <ringGeometry args={[disc.deadWaxRadius, disc.radius * 0.995, 96]} />
              <meshBasicMaterial map={grooveTexture} transparent opacity={0.55} depthWrite={false} />
            </mesh>
          )}
          {/* dead-wax ring between grooves and label */}
          <mesh rotation-x={Math.PI / 2} position-z={0.0025}>
            <torusGeometry args={[disc.deadWaxRadius, 0.006, 6, 48]} />
            <meshPhysicalMaterial color={vinylColor} metalness={0.05} roughness={0.5} />
          </mesh>

          {/* paper label — the physical print under the (optional) live design */}
          <mesh position-z={disc.thickness / 2 + 0.0015}>
            <circleGeometry args={[disc.labelRadius, 48]} />
            <meshPhysicalMaterial color="#e7e1d3" metalness={0} roughness={0.85} />
          </mesh>

          {/* live circular label, with the spindle hole punched through the
              DOM layer (the content would otherwise paint over it) */}
          {label != null && (
            <DeviceScreen
              {...faceProps}
              width={disc.labelRadius * 2}
              height={disc.labelRadius * 2}
              radius={disc.labelRadius}
              resolution={Math.round(labelPxPerUnit * disc.labelRadius * 2)}
              position={[0, 0, disc.thickness / 2 + 0.003]}
              overlay={
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${((disc.spindleRadius * 2) / (disc.labelRadius * 2)) * 100}%`,
                    aspectRatio: '1',
                    borderRadius: '50%',
                    background: '#050506',
                    pointerEvents: 'none',
                    zIndex: 2147483647,
                  }}
                />
              }
            >
              {label}
            </DeviceScreen>
          )}

          {/* spindle hole — unlit black so it reads as a hole, not a plug */}
          <mesh rotation-x={Math.PI / 2} position-z={0.004}>
            <cylinderGeometry args={[disc.spindleRadius, disc.spindleRadius, disc.thickness + 0.012, 24]} />
            <meshBasicMaterial color="#050506" />
          </mesh>
        </group>
      </group>
    </group>
  )
}
