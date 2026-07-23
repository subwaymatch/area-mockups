import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { STOREFRONT } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface StorefrontProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Front fascia sign design — any React node, full bleed on the sign band. */
  children?: React.ReactNode
  /** Poster displayed inside the front's left window bay. */
  windowPoster?: React.ReactNode
  /** Fascia sign on the windowed side (+X) — the door-less twin elevation. */
  sideSign?: React.ReactNode
  /** Painted-wall mural on the brick side (−X). Plain brick when omitted. */
  sideWall?: React.ReactNode
  /** Painted-wall mural on the rear (−Z). Plain brick when omitted. */
  rearWall?: React.ReactNode
  /** Shopfront paint (fascia surround, frames, door, stall riser). */
  color?: string
  /** Masonry color: the brickwork on every elevation. */
  wallColor?: string
  /** CSS background painted behind sign, poster and mural content. */
  faceBackground?: string
  /** CSS pixel width of the virtual fascia sign. The window poster is a fixed 420 px wide. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How content hides when its elevation faces away from the camera.
   * `true` raycasts against the building (fast, interactive). `'blending'`
   * uses per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each content wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/** Paint one running-bond brick panel into a canvas texture. */
function paintBricks(wUnits: number, hUnits: number, wallColor: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  const pxPerUnit = 220
  canvas.width = Math.round(wUnits * pxPerUnit)
  canvas.height = Math.round(hUnits * pxPerUnit)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#a89d90' // mortar
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const course = 0.068 * pxPerUnit // 65 mm brick + 10 mm joint
  const brickW = 0.205 * pxPerUnit // 215 mm brick + joint
  const joint = 0.009 * pxPerUnit
  const base = new THREE.Color(wallColor)
  const tint = new THREE.Color()
  const rows = Math.ceil(canvas.height / course)
  const cols = Math.ceil(canvas.width / brickW) + 1
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : -brickW / 2
    for (let c = 0; c < cols; c++) {
      // deterministic per-brick tint jitter
      const j = ((r * 31 + c * 17) % 10) / 10 - 0.5
      tint.copy(base).offsetHSL(j * 0.01, j * 0.04, j * 0.06)
      ctx.fillStyle = `#${tint.getHexString()}`
      ctx.fillRect(offset + c * brickW, r * course, brickW - joint, course - joint)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * A procedurally built free-standing corner shop with four real elevations
 * and a capped flat roof. The front (+Z) is the classic high-street
 * shopfront — painted timber surround, stall riser, big display window with
 * a mullion and transom lights, glazed door with a vertical pull, corniced
 * fascia on console brackets. The windowed side (+X) repeats the same
 * composition without the door and carries its own fascia sign. The brick
 * side (−X) and the rear (−Z) are running-bond masonry, each with an
 * optional painted-wall mural. Every elevation is live DOM — fascia signs,
 * window poster and wall murals; the roof is plain hardware. No 3D asset
 * files are loaded.
 *
 * The origin is the building center; the pavement sits
 * `STOREFRONT.standHeight` below it. Must be rendered inside a
 * react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Storefront({
  children,
  windowPoster,
  sideSign,
  sideWall,
  rearWall,
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
  const { body, fascia, sign, sideSign: sideSignSpec, riser, window: win, poster, sideMural, rearMural, roof, standHeight, muralResolution } = STOREFRONT
  const wallRef = React.useRef<THREE.Mesh>(null!)
  const roofRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(wallRef, roofRef)

  // Shop glass reflects the street: a lighter blue-gray with strong env
  // reflections, instead of a pitch-black hole in the façade.
  const glassMaterial = (
    <meshPhysicalMaterial
      color="#5a6d75"
      metalness={0.5}
      roughness={0.05}
      clearcoat={1}
      clearcoatRoughness={0.08}
      envMapIntensity={1.6}
    />
  )
  const paint = { color, metalness: 0.05, roughness: 0.55, clearcoat: 0.3 }

  // Cornice geometry (the brick panel above starts at its top edge). The
  // windowed side shares every horizontal datum with the front.
  const corniceY = fascia.y + fascia.height / 2 + 0.05
  const brickTop = body.height / 2
  const brickBottom = corniceY + 0.06
  const brickH = brickTop - brickBottom

  // Brick panels per elevation: the bands above both fascias, and the two
  // full-height masonry walls.
  const bricks = React.useMemo(
    () => ({
      frontBand: paintBricks(body.width, brickH, wallColor),
      sideBand: paintBricks(body.depth, brickH, wallColor),
      sideFull: paintBricks(body.depth, body.height, wallColor),
      rearFull: paintBricks(body.width, body.height, wallColor),
    }),
    [body.width, body.depth, body.height, brickH, wallColor]
  )
  React.useEffect(
    () => () => {
      for (const texture of Object.values(bricks)) texture?.dispose()
    },
    [bricks]
  )

  const riserTop = -standHeight + riser.height
  const windowH = win.top - riserTop
  const frontZ = body.depth / 2
  const sideX = body.width / 2
  // front window glazing extent (the door bay sits to its right)
  const glazeX = (win.doorX - 0.35 - body.width / 2) / 2
  const glazeW = win.doorX - 0.35 + body.width / 2 - 0.3
  // transom rail ~450 mm below the window head
  const transomY = win.top - 0.409
  // windowed side glazing runs pilaster to pilaster
  const sideGlazeL = body.depth - 0.6

  const screenCommon = {
    resolution,
    background: faceBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  return (
    <group {...groupProps}>
      {/* the building volume */}
      <mesh ref={wallRef}>
        <boxGeometry args={[body.width, body.height, body.depth]} />
        <meshPhysicalMaterial color={wallColor} metalness={0} roughness={0.9} />
      </mesh>

      {/* capped flat roof, overhanging the parapet line all round */}
      <RoundedBox
        ref={roofRef}
        args={[body.width + roof.overhang * 2, roof.thickness, body.depth + roof.overhang * 2]}
        radius={0.02}
        position={[0, body.height / 2 + roof.thickness / 2, 0]}
      >
        <meshPhysicalMaterial color="#33363b" metalness={0.1} roughness={0.85} />
      </RoundedBox>

      {/* brick bands above the two fascias */}
      {bricks.frontBand && (
        <mesh position={[0, (brickBottom + brickTop) / 2, frontZ + 0.002]}>
          <planeGeometry args={[body.width, brickH]} />
          <meshPhysicalMaterial map={bricks.frontBand} metalness={0} roughness={0.92} />
        </mesh>
      )}
      {bricks.sideBand && (
        <mesh rotation-y={Math.PI / 2} position={[sideX + 0.002, (brickBottom + brickTop) / 2, 0]}>
          <planeGeometry args={[body.depth, brickH]} />
          <meshPhysicalMaterial map={bricks.sideBand} metalness={0} roughness={0.92} />
        </mesh>
      )}
      {/* full-height masonry on the brick side and the rear */}
      {bricks.sideFull && (
        <mesh rotation-y={-Math.PI / 2} position={[-sideX - 0.002, 0, 0]}>
          <planeGeometry args={[body.depth, body.height]} />
          <meshPhysicalMaterial map={bricks.sideFull} metalness={0} roughness={0.92} />
        </mesh>
      )}
      {bricks.rearFull && (
        <mesh rotation-y={Math.PI} position={[0, 0, -frontZ - 0.002]}>
          <planeGeometry args={[body.width, body.height]} />
          <meshPhysicalMaterial map={bricks.rearFull} metalness={0} roughness={0.92} />
        </mesh>
      )}

      {/* ---------- front elevation (+Z): the full shopfront ---------- */}
      {/* painted shopfront surround: fascia band, cornice, pilasters, riser */}
      <RoundedBox args={[body.width, fascia.height, 0.12]} radius={0.015} position={[0, fascia.y, frontZ + 0.02]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      <RoundedBox args={[body.width + 0.12, 0.12, 0.2]} radius={0.02} position={[0, corniceY, frontZ + 0.03]}>
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
      {/* painted pilaster panel between the window bay and the door bay
          (otherwise the raw wall shows through the gap) */}
      <RoundedBox
        args={[win.doorX - (glazeX + glazeW / 2) + 0.08, windowH + riser.height, 0.09]}
        radius={0.012}
        position={[
          (glazeX + glazeW / 2 + win.doorX) / 2,
          riserTop + (windowH - riser.height) / 2,
          frontZ + 0.012,
        ]}
      >
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
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

      {/* ---------- windowed side (+X): the door-less twin ---------- */}
      <RoundedBox args={[0.12, fascia.height, body.depth]} radius={0.015} position={[sideX + 0.02, fascia.y, 0]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.12, body.depth + 0.12]} radius={0.02} position={[sideX + 0.03, corniceY, 0]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      {([1, -1] as const).map((s) => (
        <RoundedBox key={s} args={[0.14, fascia.y - riserTop + fascia.height / 2 + riser.height + 0.4, 0.16]} radius={0.015} position={[sideX + 0.02, (fascia.y + -standHeight) / 2 + 0.15, s * (body.depth / 2 - 0.08)]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.1, riser.height, body.depth]} radius={0.012} position={[sideX + 0.015, -standHeight + riser.height / 2, 0]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      {/* the side's glazing band, pilaster to pilaster — windows only */}
      <mesh rotation-y={Math.PI / 2} position={[sideX + 0.005, riserTop + windowH / 2, 0]}>
        <planeGeometry args={[sideGlazeL, windowH]} />
        {glassMaterial}
      </mesh>
      {/* mullions at thirds + window head + transom rail and dividers */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.1, windowH, 0.1]} radius={0.012} position={[sideX + 0.02, riserTop + windowH / 2, s * (sideGlazeL / 6) * 2]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.1, 0.1, body.depth]} radius={0.012} position={[sideX + 0.02, win.top + 0.02, 0]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      <RoundedBox args={[0.09, 0.055, sideGlazeL + 0.1]} radius={0.012} position={[sideX + 0.02, transomY, 0]}>
        <meshPhysicalMaterial {...paint} />
      </RoundedBox>
      {[-1.2, 0, 1.2].map((z) => (
        <RoundedBox key={z} args={[0.08, win.top - transomY, 0.045]} radius={0.01} position={[sideX + 0.018, (win.top + transomY) / 2, z]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
      ))}
      {([1, -1] as const).map((s) => (
        <RoundedBox key={s} args={[0.14, 0.26, 0.14]} radius={0.02} position={[sideX + 0.06, fascia.y + fascia.height / 2 - 0.13, s * (body.depth / 2 - 0.15)]}>
          <meshPhysicalMaterial {...paint} />
        </RoundedBox>
      ))}

      {/* ---------- live surfaces ---------- */}
      {/* front fascia sign */}
      <DeviceScreen
        {...screenCommon}
        width={sign.width}
        height={sign.height}
        radius={sign.radius}
        position={[0, fascia.y, frontZ + 0.085]}
      >
        {children}
      </DeviceScreen>

      {/* front window poster, pasted inside the left bay */}
      {windowPoster != null && (
        <DeviceScreen
          {...screenCommon}
          width={poster.width}
          height={poster.height}
          radius={poster.radius}
          resolution={420}
          position={[poster.x, poster.y, frontZ + 0.008]}
        >
          {windowPoster}
        </DeviceScreen>
      )}

      {/* windowed side's fascia sign */}
      {sideSign != null && (
        <DeviceScreen
          {...screenCommon}
          width={sideSignSpec.width}
          height={sideSignSpec.height}
          radius={sideSignSpec.radius}
          position={[sideX + 0.085, fascia.y, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          {sideSign}
        </DeviceScreen>
      )}

      {/* painted-wall murals on the brick side and the rear */}
      {sideWall != null && (
        <DeviceScreen
          {...screenCommon}
          width={sideMural.width}
          height={sideMural.height}
          radius={sideMural.radius}
          resolution={muralResolution}
          position={[-sideX - 0.008, sideMural.y, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          {sideWall}
        </DeviceScreen>
      )}
      {rearWall != null && (
        <DeviceScreen
          {...screenCommon}
          width={rearMural.width}
          height={rearMural.height}
          radius={rearMural.radius}
          resolution={muralResolution}
          position={[0, rearMural.y, -frontZ - 0.008]}
          rotation={[0, Math.PI, 0]}
        >
          {rearWall}
        </DeviceScreen>
      )}
    </group>
  )
}
