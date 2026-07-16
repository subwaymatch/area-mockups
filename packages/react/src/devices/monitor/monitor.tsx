import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { MONITOR } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '@area-mockups/core'

type GroupProps = ThreeElements['group']

export interface MonitorProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the monitor: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Aluminum colorway (enclosure + stand). */
  color?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the virtual display. Height follows the 16:9 panel.
   * The default 2560 gives a 2560×1440 screen — exactly the Studio Display's
   * logical "looks like" resolution (5120×2880 at 2x) — so desktop layouts
   * behave like on the real display.
   */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your screen content. */
  interactive?: boolean
  /**
   * Drags that start on the screen spin the device too: once the pointer travels
   * ~10px the gesture is handed off to the orbit controls, while plain taps and
   * clicks keep reaching your content. Disable if your screen content needs its
   * own drag gestures (sliders, drawing, horizontal swipes).
   */
  dragToRotate?: boolean
  /**
   * How screen content hides when the device faces away from the camera.
   * `true` raycasts against the enclosure (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the screen wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built Apple Studio Display-style monitor (2026 generation):
 * 27" 5K panel behind an edge-to-edge glass front (uniform black bezel, only
 * a hairline of aluminum at the rim), centered camera dot, speaker
 * perforations along the bottom of the back, and the signature tilt stand —
 * a narrow arm hanging from its hinge barrel with a real cable-routing hole
 * punched through it, the black cable/power recess behind it, and the thin
 * forward foot plate. Thunderbolt/USB-C port row on the back and,
 * faithfully, no power button or external power inlet. No 3D asset files
 * are loaded.
 *
 * The group origin is the panel center; the stand reaches `MONITOR.standHeight`
 * below it. Must be rendered inside a react-three-fiber `<Canvas>` (or
 * `<MockupCanvas>`).
 */
export function Monitor({
  children,
  color = '#c8cbd0',
  screenBackground = '#000000',
  resolution = MONITOR.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: MonitorProps) {
  const { body, glass, display, stand, standHeight } = MONITOR
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  const bodyGeometry = React.useMemo(() => {
    const shape = roundedRectShape(
      body.width - body.bevel * 2,
      body.height - body.bevel * 2,
      body.radius - body.bevel
    )
    const depth = body.depth - body.bevel * 2
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: body.bevel,
      bevelSize: body.bevel,
      bevelSegments: 3,
      curveSegments: 12,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body])

  const glassGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(glass.width, glass.height, glass.radius), 12),
    [glass]
  )

  // The tilt stand, matching the real construction: a narrow arm hangs from
  // the hinge barrel a third of the way up the back, leans back down to the
  // knee and runs forward as the thin foot plate. Foot + knee are one bent
  // side profile (z/y plane) extruded across the stand width and capped just
  // above the knee, where the separate arm slab — carrying the real
  // stadium-shaped cable-routing hole — takes over along the lean axis.
  const standParts = React.useMemo(() => {
    const {
      width,
      thickness,
      leanDeg,
      attachY,
      footFrontZ,
      footThickness,
      outerKneeRadius: Ro,
      innerKneeRadius: Ri,
      hingeRadius,
      cableHole,
    } = stand
    const deskY = -standHeight
    const lean = (leanDeg * Math.PI) / 180
    const d = { z: Math.sin(lean), y: Math.cos(lean) } // arm axis, up-forward
    const n = { z: Math.cos(lean), y: -Math.sin(lean) } // front-face normal
    // The arm's centerline passes through the hinge barrel, pressed against
    // the enclosure back. Faces as lines n·X = c.
    const hinge = { y: attachY, z: -body.depth / 2 - hingeRadius + 0.03 }
    const cCenter = n.z * hinge.z + n.y * hinge.y
    const cFront = cCenter + thickness / 2
    const cBack = cCenter - thickness / 2
    const footTopY = deskY + footThickness
    const tangentAngle = Math.atan2(n.y, n.z) + Math.PI

    // Outer knee: tangent to the desk plane and to the arm's back face.
    const oC = { y: deskY + Ro, z: 0 }
    oC.z = (cBack + Ro - n.y * oC.y) / n.z
    const oTan = { z: oC.z - n.z * Ro, y: oC.y - n.y * Ro }
    // Inner knee: fillet between the foot's top face and the arm's front face.
    const iC = { y: footTopY + Ri, z: 0 }
    iC.z = (cFront + Ri - n.y * iC.y) / n.z
    const iTan = { z: iC.z - n.z * Ri, y: iC.y - n.y * Ri }
    // Cap the knee piece just above the tangencies — the cut hides inside
    // the (slightly thicker) arm slab that overlaps it.
    const yCut = Math.max(oTan.y, iTan.y) + 0.17
    const zCutBack = oTan.z + (d.z / d.y) * (yCut - oTan.y)
    const zCutFront = iTan.z + (d.z / d.y) * (yCut - iTan.y)
    // Rounded front lip of the foot.
    const r = footThickness / 2
    const cap = { z: footFrontZ - r, y: deskY + r }

    const shape = new THREE.Shape()
    shape.moveTo(cap.z, deskY)
    shape.lineTo(oC.z, deskY)
    shape.absarc(oC.z, oC.y, Ro, -Math.PI / 2, tangentAngle, true)
    shape.lineTo(zCutBack, yCut)
    shape.lineTo(zCutFront, yCut)
    shape.lineTo(iTan.z, iTan.y)
    shape.absarc(iC.z, iC.y, Ri, tangentAngle, -Math.PI / 2, false)
    shape.lineTo(cap.z, footTopY)
    shape.absarc(cap.z, cap.y, r, Math.PI / 2, -Math.PI / 2, true)

    const bevel = 0.012
    const extrudeW = width - bevel * 2
    const footKnee = new THREE.ExtrudeGeometry(shape, {
      depth: extrudeW,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 24,
    })
    footKnee.translate(0, 0, -extrudeW / 2)
    footKnee.rotateY(-Math.PI / 2)

    // Arm slab: rounded-rect face (x across, y down the lean axis, hinge
    // center at +armLen/2) with the cable hole as a real punched stadium.
    const armLen = (hinge.y - yCut) / d.y + 0.24
    const armShape = roundedRectShape(width - 0.016, armLen, 0.02)
    const holePts = roundedRectShape(cableHole.width, cableHole.height, cableHole.width / 2).getPoints(12)
    const holeCenterS = armLen / 2 - cableHole.topOffset - cableHole.height / 2
    const holePath = new THREE.Path(holePts.map((p) => p.clone().setY(p.y + holeCenterS)))
    holePath.closePath()
    armShape.holes.push(holePath)
    const slabT = thickness + 0.006
    const armSlab = new THREE.ExtrudeGeometry(armShape, {
      depth: slabT - 0.016,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 2,
      curveSegments: 16,
    })
    armSlab.translate(0, 0, -(slabT - 0.016) / 2)
    armSlab.rotateX(lean)
    const armPos: [number, number, number] = [
      0,
      hinge.y - (d.y * armLen) / 2,
      hinge.z - (d.z * armLen) / 2,
    ]

    // The recess covers the hole's span above the enclosure's bottom edge
    // (through the part below the edge you see straight through, as on the
    // product — its lower arc is the notch visible from the front).
    const holeTopY = hinge.y - d.y * cableHole.topOffset
    const recessY = (holeTopY - body.height / 2) / 2

    return { footKnee, armSlab, armPos, hinge, recessY }
  }, [body, stand, standHeight])

  // Black cable/power recess behind the arm's routing hole, ending flush
  // with the enclosure's bottom edge.
  const recessGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(0.44, 0.19, 0.09), 16),
    []
  )

  // Speaker perforations along the bottom of the back: a dot grid painted
  // once into a texture strip.
  const grilleTexture = React.useMemo(() => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 20
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'rgba(52, 55, 60, 0.9)'
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 146; col++) {
        ctx.beginPath()
        ctx.arc(5 + col * 7 + (row % 2) * 3.5, 4 + row * 6, 1.7, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = 4
    return texture
  }, [])

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
      standParts.footKnee.dispose()
      standParts.armSlab.dispose()
      recessGeometry.dispose()
      grilleTexture?.dispose()
    }
  }, [bodyGeometry, glassGeometry, standParts, recessGeometry, grilleTexture])

  return (
    <group {...groupProps}>
      {/* enclosure */}
      <mesh ref={bodyRef} geometry={bodyGeometry}>
        <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.42} />
      </mesh>

      {/* cover glass (uniform black bezel) */}
      <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.002}>
        <meshPhysicalMaterial color="#020205" metalness={0.1} roughness={0.07} clearcoat={1} />
      </mesh>

      {/* centered camera dot in the top bezel */}
      <mesh rotation-x={Math.PI / 2} position={[0, glass.height / 2 - (glass.height - display.height) / 4, body.depth / 2 + 0.004]}>
        <cylinderGeometry args={[0.02, 0.02, 0.004, 16]} />
        <meshPhysicalMaterial color="#0a1420" metalness={0.4} roughness={0.2} clearcoat={1} />
      </mesh>

      {/* back: 2x Thunderbolt 5 + 2x USB-C row (power connects inside the
          stand's cable recess — no external inlet, and no power button) */}
      {[0, 1, 2, 3].map((i) => (
        <RoundedBox
          key={i}
          args={[0.11, 0.042, 0.02]}
          radius={0.018}
          position={[body.width / 2 - 0.7 - i * 0.2, -body.height / 2 + 0.42, -body.depth / 2 - 0.004]}
        >
          <meshPhysicalMaterial color="#07080c" metalness={0.4} roughness={0.4} />
        </RoundedBox>
      ))}

      {/* speaker perforations along the bottom of the back */}
      {grilleTexture && (
        <mesh rotation-y={Math.PI} position={[0, -body.height / 2 + 0.085, -body.depth / 2 - 0.002]}>
          <planeGeometry args={[4.6, 0.058]} />
          <meshBasicMaterial map={grilleTexture} transparent depthWrite={false} />
        </mesh>
      )}

      {/* tilt stand: knee-and-foot profile + the arm slab with its
          cable-routing hole, all in the enclosure finish */}
      <mesh geometry={standParts.footKnee}>
        <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.42} />
      </mesh>
      <mesh geometry={standParts.armSlab} position={standParts.armPos}>
        <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.42} />
      </mesh>

      {/* hinge barrel across the arm's top, pressed against the back, with
          machined end caps flush on the arm's sides */}
      <mesh rotation-z={Math.PI / 2} position={[0, standParts.hinge.y, standParts.hinge.z]}>
        <cylinderGeometry args={[stand.hingeRadius, stand.hingeRadius, stand.width - 0.03, 32]} />
        <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.42} />
      </mesh>
      {([1, -1] as const).map((s) => (
        <mesh
          key={s}
          rotation-z={Math.PI / 2}
          position={[s * (stand.width / 2 - 0.005), standParts.hinge.y, standParts.hinge.z]}
        >
          <cylinderGeometry args={[stand.hingeRadius * 0.8, stand.hingeRadius * 0.8, 0.014, 24]} />
          <meshPhysicalMaterial color="#dfe2e6" metalness={0.9} roughness={0.22} />
        </mesh>
      ))}

      {/* circular pivot cover on the arm's back face, partway down the arm */}
      <group
        position={[
          0,
          standParts.hinge.y - Math.cos((stand.leanDeg * Math.PI) / 180) * 0.8 + Math.sin((stand.leanDeg * Math.PI) / 180) * 0.058,
          standParts.hinge.z - Math.sin((stand.leanDeg * Math.PI) / 180) * 0.8 - Math.cos((stand.leanDeg * Math.PI) / 180) * 0.058,
        ]}
        rotation-x={Math.PI + (stand.leanDeg * Math.PI) / 180}
      >
        <mesh>
          <circleGeometry args={[0.19, 32]} />
          <meshPhysicalMaterial color="#26282c" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position-z={0.001}>
          <ringGeometry args={[0.165, 0.19, 32]} />
          <meshPhysicalMaterial color="#c3c7cc" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>

      {/* black cable/power recess in the back, seen through the arm's hole */}
      <mesh geometry={recessGeometry} rotation-y={Math.PI} position={[0, standParts.recessY, -body.depth / 2 - 0.004]}>
        <meshPhysicalMaterial color="#0a0b0e" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* the live screen: real DOM, CSS3D-transformed onto the panel */}
      <DeviceScreen
        width={display.width}
        height={display.height}
        radius={display.radius}
        resolution={resolution}
        position={[0, 0, body.depth / 2 + 0.006]}
        background={screenBackground}
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
