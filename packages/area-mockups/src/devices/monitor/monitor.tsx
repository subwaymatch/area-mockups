import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { MONITOR } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'
import { roundedRectShape } from '../../utils/rounded-rect'

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
 * A procedurally built Apple Studio Display-style monitor: 27" 5K panel behind
 * an edge-to-edge glass front (uniform black bezel, only a hairline of
 * aluminum at the rim), centered camera dot, the signature one-piece bent
 * aluminum tilt stand, USB-C/Thunderbolt port row and power inlet on the back
 * (and, faithfully, no power button). No 3D asset files are loaded.
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

  // The tilt stand is one continuous bent slab of aluminum: the arm leans
  // forward from the knee at the rear up to the panel back, the foot runs
  // forward under the display. Built as a 2D side profile (in the z/y plane)
  // extruded across the stand width, so arm and foot read as a single piece.
  const standGeometry = React.useMemo(() => {
    const deskY = -standHeight
    const lean = (stand.leanDeg * Math.PI) / 180
    const d = { z: Math.sin(lean), y: Math.cos(lean) } // arm axis, up-forward
    const n = { z: Math.cos(lean), y: -Math.sin(lean) } // front-face normal
    // Arm faces as lines n·X = c; the front face meets the panel back at attachY.
    const cFront = n.z * (-body.depth / 2) + n.y * stand.attachY
    const cBack = cFront - stand.thickness
    const zTopCap = -body.depth / 2 + 0.04 // buried inside the panel
    const footTopY = deskY + stand.footThickness
    const tangentAngle = Math.atan2(n.y, n.z) + Math.PI

    // Outer knee: tangent to the desk plane and to the arm's back face.
    const Ro = stand.outerKneeRadius
    const oC = { y: deskY + Ro, z: 0 }
    oC.z = (cBack + Ro - n.y * oC.y) / n.z
    const oTan = { z: oC.z - n.z * Ro, y: oC.y - n.y * Ro }
    // Inner knee: fillet between the foot's top face and the arm's front face.
    const Ri = stand.innerKneeRadius
    const iC = { y: footTopY + Ri, z: 0 }
    iC.z = (cFront + Ri - n.y * iC.y) / n.z
    const iTan = { z: iC.z - n.z * Ri, y: iC.y - n.y * Ri }
    // Arm face endpoints on the top-cap plane.
    const topBackY = oTan.y + (d.y / d.z) * (zTopCap - oTan.z)
    const topFrontY = stand.attachY + (d.y / d.z) * (zTopCap + body.depth / 2)
    // Rounded front edge of the foot.
    const r = stand.footThickness / 2
    const cap = { z: stand.footFrontZ - r, y: deskY + r }

    const shape = new THREE.Shape()
    shape.moveTo(cap.z, deskY)
    shape.lineTo(oC.z, deskY)
    shape.absarc(oC.z, oC.y, Ro, -Math.PI / 2, tangentAngle, true)
    shape.lineTo(zTopCap, topBackY)
    shape.lineTo(zTopCap, topFrontY)
    shape.lineTo(iTan.z, iTan.y)
    shape.absarc(iC.z, iC.y, Ri, tangentAngle, -Math.PI / 2, false)
    shape.lineTo(cap.z, footTopY)
    shape.absarc(cap.z, cap.y, r, Math.PI / 2, -Math.PI / 2, true)

    const bevel = 0.012
    const depth = stand.width - bevel * 2
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 24,
    })
    geometry.translate(0, 0, -depth / 2)
    geometry.rotateY(-Math.PI / 2)
    return geometry
  }, [body, stand, standHeight])

  React.useEffect(() => {
    return () => {
      bodyGeometry.dispose()
      glassGeometry.dispose()
      standGeometry.dispose()
    }
  }, [bodyGeometry, glassGeometry, standGeometry])

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

      {/* back: 2x Thunderbolt 5 + 2x USB-C row (2nd-gen port set, same layout) and the captive power inlet */}
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
      <mesh rotation-x={Math.PI / 2} position={[0, -body.height / 2 + 0.42, -body.depth / 2 - 0.006]}>
        <cylinderGeometry args={[0.06, 0.06, 0.012, 24]} />
        <meshPhysicalMaterial color="#101114" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* one-piece bent-aluminum tilt stand, same finish as the enclosure */}
      <mesh geometry={standGeometry}>
        <meshPhysicalMaterial color={color} metalness={0.5} roughness={0.42} />
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
