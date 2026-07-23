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

  // Hardware chain, referenced from the standard retail swivel J-hook: the
  // FLAT stamped-steel hook hangs coplanar with the card, its bottom bar
  // resting inside the slot on the slot's lower edge; the stem rises to the
  // swivel barrel, and the crimp above it swallows the strap fold.
  const slotBottom = slot.centerY - slot.height / 2
  const ringY = slotBottom + 0.005 + hook.outerR
  const stemBottom = ringY + hook.innerR - 0.03
  const stemTop = ringY + hook.outerR + hook.stem.height - 0.03
  const barrelY = stemTop + hook.barrel.height / 2 - 0.03
  const crimpY = barrelY + hook.barrel.height / 2 + hook.crimp.height / 2 - 0.025

  // The flat J profile: an annular arc open at the upper right (the mouth),
  // extruded at stamped-steel thickness.
  const hookGeometry = React.useMemo(() => {
    const a0 = (hook.mouthEnd * Math.PI) / 180
    const a1 = ((hook.mouthStart + 360) * Math.PI) / 180
    const s = new THREE.Shape()
    s.absarc(0, 0, hook.outerR, a0, a1, false)
    s.absarc(0, 0, hook.innerR, a1, a0, true)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, {
      depth: hook.depth - 0.008,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: 32,
    })
    g.translate(0, 0, -(hook.depth - 0.008) / 2)
    return g
  }, [hook])
  React.useEffect(() => () => hookGeometry.dispose(), [hookGeometry])

  // Spring gate: a thin flat strip closing the mouth, from beside the stem
  // down to the hook's nose tip.
  const gate = React.useMemo(() => {
    const rMid = (hook.outerR + hook.innerR) / 2
    const aNose = (hook.mouthStart * Math.PI) / 180
    const nose = { x: rMid * Math.cos(aNose), y: rMid * Math.sin(aNose) }
    const root = { x: hook.stem.width / 2 + 0.008, y: hook.outerR + 0.02 }
    return {
      length: Math.hypot(nose.x - root.x, nose.y - root.y) + 0.02,
      angle: Math.atan2(nose.y - root.y, nose.x - root.x) + Math.PI / 2,
      mid: { x: (nose.x + root.x) / 2, y: (nose.y + root.y) / 2 },
    }
  }, [hook])
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

      {/* the flat stamped-steel J-hook, hanging coplanar with the card, its
          bottom bar resting inside the slot */}
      <group position={[0, ringY, 0]}>
        <mesh geometry={hookGeometry}>{metal}</mesh>
        {/* thin spring gate closing the mouth */}
        <RoundedBox
          args={[0.016, gate.length, 0.012]}
          radius={0.005}
          position={[gate.mid.x, gate.mid.y, 0]}
          rotation-z={gate.angle}
        >
          {metal}
        </RoundedBox>
      </group>
      {/* stem rising from the ring to the swivel */}
      <RoundedBox
        args={[hook.stem.width, stemTop - stemBottom, hook.depth - 0.004]}
        radius={0.012}
        position={[0, (stemTop + stemBottom) / 2, 0]}
      >
        {metal}
      </RoundedBox>
      {/* swivel barrel with its collar — the joint that lets the badge spin */}
      <mesh position={[0, barrelY, 0]}>
        <cylinderGeometry args={[hook.barrel.radius, hook.barrel.radius, hook.barrel.height, 16]} />
        {metal}
      </mesh>
      <mesh position={[0, barrelY + hook.barrel.height / 2 - 0.03, 0]}>
        <cylinderGeometry args={[hook.barrel.collar, hook.barrel.collar, 0.05, 16]} />
        {metal}
      </mesh>
      {/* crimp sleeve above the swivel, swallowing the folded strap ends */}
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
