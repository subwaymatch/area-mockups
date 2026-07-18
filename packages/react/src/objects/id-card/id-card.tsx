import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { ID_CARD } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '@area-mockups/core'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface IDCardProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Front face design — any React node, full bleed below the punch strip. */
  children?: React.ReactNode
  /** Back face design. Spin the badge around to see it (plain stock if omitted). */
  back?: React.ReactNode
  /** Card stock color — the edges and the unprinted punch strip. */
  color?: string
  /** Woven lanyard strap color. */
  lanyardColor?: string
  /** CSS background painted behind your face content. */
  faceBackground?: string
  /** CSS pixel width of the virtual face. Height follows the printable area. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your face content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How face content hides when that face turns away from the camera.
   * `true` raycasts against the card (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each face wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built ID badge on a lanyard: a portrait CR80 card with a
 * real punched slot, a swivel hook and crimp in brushed metal, and two woven
 * strap halves rising in a hanging V that exits the top of the frame. The
 * printable face is live DOM on the front — and optionally the back.
 * No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function IDCard({
  children,
  back,
  color = '#f4f5f7',
  lanyardColor = '#b3223a',
  faceBackground = '#ffffff',
  resolution = ID_CARD.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: IDCardProps) {
  const { body, slot, face, hook, strap } = ID_CARD
  const cardRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(cardRef)

  const cardGeometry = React.useMemo(() => {
    const shape = roundedRectShape(
      body.width - body.bevel * 2,
      body.height - body.bevel * 2,
      body.radius - body.bevel
    )
    // the slot punch is a real hole through the card
    const punch = roundedRectShape(slot.width, slot.height, slot.height / 2)
    const punchPath = new THREE.Path()
    punch.getPoints(16).forEach((p, i) => {
      const y = p.y + slot.centerY
      if (i === 0) punchPath.moveTo(p.x, y)
      else punchPath.lineTo(p.x, y)
    })
    shape.holes.push(punchPath)
    const depth = body.thickness - body.bevel * 2
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: body.bevel,
      bevelSize: body.bevel,
      bevelSegments: 2,
      curveSegments: 12,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body, slot])

  React.useEffect(() => () => cardGeometry.dispose(), [cardGeometry])

  const metal = <meshPhysicalMaterial color="#c3c7cd" metalness={0.9} roughness={0.3} />
  const fabric = (
    <meshPhysicalMaterial color={lanyardColor} metalness={0} roughness={0.85} sheen={1} sheenColor="#ffffff" sheenRoughness={0.6} />
  )

  // Hardware chain: the J-hook's nose wire rests INSIDE the slot, loaded
  // against its bottom edge the way a hanging badge sits; the swivel barrel
  // rises from the hook, clamps the flat D-eye, and the crimp overlaps the
  // eye's top arc with the strap fold passing through the aperture.
  const slotBottom = slot.centerY - slot.height / 2
  const hookY = slotBottom + hook.hookTube + hook.hookRadius * hook.hookScaleY
  const hookTop = hookY + hook.hookRadius * hook.hookScaleY
  const barrelY = hookTop + hook.barrel.height / 2 - 0.05
  const eyeY = barrelY + hook.barrel.height / 2 + hook.eye.radius - hook.eye.tube - 0.02
  const crimpY = eyeY + hook.crimp.height / 2
  const faceProps = {
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
      {/* PVC card with the punched slot */}
      <mesh ref={cardRef} geometry={cardGeometry}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.55} clearcoat={0.4} clearcoatRoughness={0.4} />
      </mesh>

      {/* elongated trigger snap J-hook: an open wire loop stretched tall,
          its nose resting inside the slot, closed by the spring gate */}
      <group position={[0, hookY, 0]} scale={[1, hook.hookScaleY, 1]}>
        <mesh rotation-z={Math.PI / 2 + 0.5}>
          <torusGeometry args={[hook.hookRadius, hook.hookTube, 10, 40, Math.PI * 1.72]} />
          {metal}
        </mesh>
        <mesh position={[0.06, 0.09, 0]} rotation-z={-0.45}>
          <cylinderGeometry args={[0.016, 0.016, 0.21, 8]} />
          {metal}
        </mesh>
      </group>
      {/* swivel barrel */}
      <mesh position={[0, barrelY, 0]}>
        <cylinderGeometry args={[hook.barrel.radius, hook.barrel.radius, hook.barrel.height, 14]} />
        {metal}
      </mesh>
      {/* flat D-eye, its bottom arc clamped inside the barrel */}
      <mesh position={[0, eyeY, 0]} scale={[hook.eye.scaleX, 1, 1]}>
        <torusGeometry args={[hook.eye.radius, hook.eye.tube, 10, 24]} />
        {metal}
      </mesh>
      {/* strap fold carrying the load through the eye's aperture */}
      <RoundedBox args={[0.34, 0.42, 0.02]} radius={0.008} position={[0, eyeY + 0.12, -0.004]}>
        {fabric}
      </RoundedBox>
      {/* crimp sleeve clamping the folded strap ends, overlapping the eye */}
      <RoundedBox
        args={[hook.crimp.width, hook.crimp.height, hook.crimp.depth]}
        radius={0.02}
        position={[0, crimpY, 0]}
      >
        {metal}
      </RoundedBox>

      {/* woven strap halves, rising in a hanging V and tilting slightly back */}
      {([1, -1] as const).map((side) => (
        <group
          key={side}
          position={[0, crimpY + hook.crimp.height / 2 - 0.02, -0.01]}
          rotation={[strap.backTilt, 0, side * strap.spreadAngle]}
        >
          <RoundedBox
            args={[strap.width, strap.length, strap.thickness]}
            radius={0.01}
            position={[0, strap.length / 2, 0]}
          >
            {fabric}
          </RoundedBox>
        </group>
      ))}

      {/* live front face, clear of the punch strip */}
      <DeviceScreen {...faceProps} position={[0, face.offsetY, body.thickness / 2 + 0.003]}>
        {children}
      </DeviceScreen>

      {/* live back face — only mounted when there's a design for it */}
      {back != null && (
        <DeviceScreen
          {...faceProps}
          position={[0, face.offsetY, -body.thickness / 2 - 0.003]}
          rotation={[0, Math.PI, 0]}
        >
          {back}
        </DeviceScreen>
      )}
    </group>
  )
}
