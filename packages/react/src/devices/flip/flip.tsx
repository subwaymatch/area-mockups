import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { FLIP_COLORWAYS, findColorway, FLIP_VARIANTS, type FlipVariant } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { createLogoGeometry } from '../logos'
import {
  SideKey,
  LensRing,
  UsbC,
  EdgeSocket,
  cutGeometry,
  stadiumCutter,
  holeCutter,
  USB_CUT_DEPTH,
} from '../details'
import { roundedRectShape } from '@area-mockups/core'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface FlipProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the active display: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Which Galaxy Z Flip device to render. */
  variant?: FlipVariant
  /**
   * A retail colorway id from `FLIP_COLORWAYS` (e.g. the catalog's first
   * entry) presetting the device colors. Explicit color props override it.
   */
  colorway?: string
  /**
   * `true` (default) renders the unfolded tall phone — your content fills the
   * 6.85" main display. `false` renders the folded compact — your content
   * fills the nearly-square cover display, with the two lens rings and
   * flash sitting on the glass beside it.
   */
  open?: boolean
  /**
   * Degree of openness between the two halves (0 = folded shut, 180 = flat
   * open), overriding `open` when set. Intermediate angles render the real
   * Flex Mode pose: the halves pivot around the hinge line while the spine's
   * curved housing rolls into the gap between them, and your content bends
   * across the fold — e.g. `openAngle={100}` for the classic half-open
   * standing pose. At intermediate angles the main display is composited
   * from two planes, so stateful screen content is best kept simple.
   */
  openAngle?: number
  /**
   * `landscape` lays the device on its side and swaps the virtual display to
   * H×W with upright content — exactly like rotating the real device.
   */
  orientation?: 'portrait' | 'landscape'
  /** Back panel colorway. */
  color?: string
  /** Metal frame, buttons and camera-ring color. */
  frameColor?: string
  /** CSS background painted behind your screen content. */
  screenBackground?: string
  /**
   * CSS pixel width of the active display in the current orientation. Height
   * follows the panel aspect. Defaults to the device's logical resolution for
   * whichever screen is showing (main display when open, cover when closed).
   */
  resolution?: number
  /** Show the front-camera punch-hole overlay (open pose only). */
  punchHole?: boolean
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
   * `true` raycasts against the body (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto the screen wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/** An extruded rounded-rect slab with a soft edge bevel (one flip half / body). */
function slabGeometry(width: number, height: number, radius: number, depth: number, bevel: number) {
  const shape = roundedRectShape(width - bevel * 2, height - bevel * 2, radius - bevel)
  const core = depth - bevel * 2
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: core,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 16,
  })
  g.translate(0, 0, -core / 2)
  return g
}

/** Cutters for the free edge's machining (USB-C, speaker slot, mic holes) at `edgeY`. */
function freeEdgeCutters(
  edge: { usb: { x: number; width: number; height: number }; speaker: { x: number; width: number; height: number }; mics: { x: number; r: number }[] },
  edgeY: number
): THREE.BufferGeometry[] {
  return [
    stadiumCutter(edge.usb.width, edge.usb.height, USB_CUT_DEPTH).translate(edge.usb.x, edgeY, 0),
    stadiumCutter(edge.speaker.width, edge.speaker.height, 0.06).translate(edge.speaker.x, edgeY, 0),
    ...edge.mics.map(({ x, r }) => holeCutter(r, 0.05).translate(x, edgeY, 0)),
  ]
}

/**
 * A procedurally built Samsung Galaxy Z Flip 7. One device, two form factors:
 * the unfolded tall phone (6.85" main display) and the folded compact whose
 * front is nearly all cover screen, switched with the `open` prop. Detail
 * geometry (separate protruding lens rings, hinge band with its engraved wordmark, button
 * pills, ports) follows a reference scan of the retail device. No 3D asset
 * files are loaded — everything is generated from geometry at runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Flip({
  children,
  variant = 'flip7',
  open = true,
  openAngle,
  orientation = 'portrait',
  colorway,
  color: colorProp,
  frameColor: frameColorProp,
  screenBackground = '#000000',
  resolution,
  punchHole = true,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: FlipProps) {
  const spec = FLIP_VARIANTS[variant]
  const retail = findColorway(FLIP_COLORWAYS[variant], colorway)
  const color = colorProp ?? retail?.color ?? '#22252b'
  const frameColor = frameColorProp ?? retail?.frameColor ?? '#4a4f59'
  // Resolve the pose: an explicit fold angle wins over the boolean; the
  // extremes snap to the dedicated flat-open / folded-shut paths so the
  // default renders are pixel-identical to before.
  const angle = openAngle === undefined ? (open ? 180 : 0) : Math.max(0, Math.min(180, openAngle))
  const mode: 'open' | 'closed' | 'flex' = angle >= 177 ? 'open' : angle <= 3 ? 'closed' : 'flex'
  const isOpenFace = mode !== 'closed'
  const state = isOpenFace ? spec.open : spec.closed
  const { display } = state
  const cam = spec.rearCamera
  const landscape = orientation === 'landscape'
  const aspect = display.height / display.width
  const res = resolution ?? Math.round(state.resolution * (landscape ? aspect : 1))
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const lowerBodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(bodyRef, lowerBodyRef)

  const openBody = spec.open.body
  const half = spec.closed.body
  // Cover-half center offset from the open body's center (+y = upper half).
  const halfOffsetY = openBody.height / 2 - half.height / 2

  // The open slab with the free-edge kit machined out of its bottom edge.
  const openGeometry = React.useMemo(
    () =>
      cutGeometry(
        slabGeometry(openBody.width, openBody.height, openBody.radius, openBody.depth, openBody.bevel),
        freeEdgeCutters(spec.bottomEdge, -openBody.height / 2)
      ),
    [openBody, spec.bottomEdge]
  )
  // Folded halves: the front (cover) half is uncut; the rear half carries the
  // same kit machined into what becomes the TOP edge of the folded stack.
  const halfGeometry = React.useMemo(
    () => slabGeometry(half.width, half.height, half.radius, half.depth, half.bevel),
    [half]
  )
  const rearHalfGeometry = React.useMemo(
    () =>
      cutGeometry(
        slabGeometry(half.width, half.height, half.radius, half.depth, half.bevel),
        freeEdgeCutters(spec.bottomEdge, half.height / 2)
      ),
    [half, spec.bottomEdge]
  )
  // Flex pose lower half: the same slab with the free-edge kit machined into
  // its own bottom edge (the open-plane orientation, unlike the folded stack
  // where that edge faces up).
  const flexLowerGeometry = React.useMemo(
    () =>
      mode === 'flex'
        ? cutGeometry(
            slabGeometry(half.width, half.height, half.radius, half.depth, half.bevel),
            freeEdgeCutters(spec.bottomEdge, -half.height / 2)
          )
        : null,
    [mode, half, spec.bottomEdge]
  )
  React.useEffect(
    () => () => {
      openGeometry.dispose()
      halfGeometry.dispose()
      rearHalfGeometry.dispose()
      flexLowerGeometry?.dispose()
    },
    [openGeometry, halfGeometry, rearHalfGeometry, flexLowerGeometry]
  )

  const coverGlassGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(spec.coverGlass.width, spec.coverGlass.height, spec.coverGlass.radius),
        16
      ),
    [spec.coverGlass]
  )

  const hingeLogoGeometry = React.useMemo(
    () => createLogoGeometry('samsung', spec.hinge.emboss.length, spec.hinge.emboss.length * 0.155),
    [spec.hinge.emboss.length]
  )

  React.useEffect(() => {
    return () => {
      coverGlassGeometry.dispose()
      hingeLogoGeometry.dispose()
    }
  }, [coverGlassGeometry, hingeLogoGeometry])

  // CSS px per world unit for display overlays.
  const pxPerUnit = res / (landscape ? display.height : display.width)
  const px = (units: number) => units * pxPerUnit

  // Maps a cover-display physical rect (center x,y + size, +y up) to CSS.
  const coverAt = (
    x: number,
    y: number,
    w: number,
    h: number,
    extra: React.CSSProperties
  ): React.CSSProperties => ({
    position: 'absolute',
    ...(landscape
      ? {
          left: `calc(50% - ${px(y) + px(h) / 2}px)`,
          top: `calc(50% - ${px(x) + px(w) / 2}px)`,
          width: px(h),
          height: px(w),
        }
      : {
          left: `calc(50% + ${px(x) - px(w) / 2}px)`,
          top: `calc(50% - ${px(y) + px(h) / 2}px)`,
          width: px(w),
          height: px(h),
        }),
    ...extra,
  })

  // The two separate lens rings + flash, in cover-half local coordinates —
  // each module rises straight from the cover glass with no plate joining
  // them, like the retail device. `sign` is +1 when the cluster faces the
  // viewer (closed front) and -1 on the open back.
  const cameraCluster = (sign: 1 | -1, surfaceZ: number) => (
    <group>
      {cam.rings.map(({ x, y, r, pupil }, i) => (
        <group key={i} position={[x, y, surfaceZ]} rotation-y={sign === 1 ? Math.PI : 0}>
          <LensRing r={r} proud={cam.raise + 0.016} seat={0.03} frameColor={frameColor} pupil={pupil} />
        </group>
      ))}
      <mesh rotation-x={Math.PI / 2} position={[cam.flash.x, cam.flash.y, surfaceZ + sign * 0.006]}>
        <cylinderGeometry args={[cam.flash.r, cam.flash.r, 0.012, 24]} />
        <meshPhysicalMaterial
          color="#e8e4da"
          emissive="#fff3d6"
          emissiveIntensity={0.22}
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>
    </group>
  )

  // Side keys + SIM on the cover half's rails (half-local coordinates).
  const rails = (
    <group>
      {spec.buttons.map(({ y, length }, i) => (
        <SideKey
          key={i}
          side={1}
          railX={half.width / 2}
          y={y}
          length={length}
          thickness={spec.buttonProfile.thickness}
          protrusion={spec.buttonProfile.protrusion}
          color={frameColor}
        />
      ))}
      <RoundedBox
        args={[0.012, spec.sim.length, 0.074]}
        radius={0.005}
        position={[-half.width / 2 + 0.005, spec.sim.y, 0]}
      >
        <meshStandardMaterial color="#15181d" transparent opacity={0.35} roughness={0.5} />
      </RoundedBox>
    </group>
  )

  // Interiors for the free edge's machined cavities (the cavities themselves
  // are cut from the slab geometry): USB-C receptacle, speaker sleeve, mic
  // plugs. `edgeY` is that edge's y in the current pose.
  const freeEdgeKit = (edgeY: number) => {
    const inward: 1 | -1 = edgeY > 0 ? -1 : 1
    return (
      <group>
        <UsbC
          x={spec.bottomEdge.usb.x}
          y={edgeY}
          width={spec.bottomEdge.usb.width}
          height={spec.bottomEdge.usb.height}
          inward={inward}
        />
        <EdgeSocket
          position={[spec.bottomEdge.speaker.x, edgeY, 0]}
          width={spec.bottomEdge.speaker.width}
          height={spec.bottomEdge.speaker.height}
          depth={0.06}
          inward={inward}
        />
        {spec.bottomEdge.mics.map(({ x, r }, i) => (
          <EdgeSocket key={i} position={[x, edgeY, 0]} r={r} depth={0.05} lip={0.008} inward={inward} />
        ))}
      </group>
    )
  }

  // The rust-toned hinge band capping the folded bottom, with its engraving.
  const hingeBand = (y: number) => (
    <group position={[0, y, 0]}>
      <RoundedBox
        args={[openBody.width - 0.03, spec.hinge.overhang + 0.05, spec.hinge.width]}
        radius={Math.min(0.032, spec.hinge.width / 2 - 0.004)}
      >
        <meshPhysicalMaterial color={frameColor} metalness={0.75} roughness={0.4} />
      </RoundedBox>
      <mesh
        geometry={hingeLogoGeometry}
        rotation-x={Math.PI / 2}
        position-y={-(spec.hinge.overhang + 0.05) / 2 - 0.002}
      >
        <meshPhysicalMaterial
          transparent
          opacity={0.45}
          color="#33363c"
          metalness={0.7}
          roughness={0.35}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
    </group>
  )

  const endSeams = (ys: number[], depth: number) =>
    ys.map((y, i) => (
      <React.Fragment key={i}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (openBody.width / 2 - 0.005), y, 0]}>
            <boxGeometry args={[0.012, 0.022, depth * 0.8]} />
            <meshStandardMaterial color="#22262c" transparent opacity={0.35} roughness={0.65} />
          </mesh>
        ))}
      </React.Fragment>
    ))

  // The main display's punch-hole camera — shared by the flat-open screen and
  // the flex pose's upper half (the hole rides the display's top edge, which
  // is that half's top edge too).
  const punchHoleOverlay = (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        ...(landscape
          ? {
              left: px(spec.open.punchHole.offsetY - spec.open.punchHole.radius),
              top: '50%',
              transform: 'translateY(-50%)',
            }
          : {
              top: px(spec.open.punchHole.offsetY - spec.open.punchHole.radius),
              left: '50%',
              transform: 'translateX(-50%)',
            }),
        width: px(spec.open.punchHole.radius * 2),
        height: px(spec.open.punchHole.radius * 2),
        borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 38%, #1b2436 0%, #05060a 55%, #000 100%)',
        boxShadow: '0 0 0 1.5px rgba(255, 255, 255, 0.05)',
        pointerEvents: 'none',
        zIndex: 2147483647,
      }}
    />
  )

  const screen = (
    <DeviceScreen
      width={landscape ? display.height : display.width}
      height={landscape ? display.width : display.height}
      radius={display.radius}
      resolution={res}
      position={[0, 0, (mode !== 'closed' ? openBody.depth : half.depth) / 2 + 0.006]}
      rotation={landscape ? [0, 0, -Math.PI / 2] : [0, 0, 0]}
      background={screenBackground}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
      screenStyle={screenStyle}
      overlay={
        mode === 'open' && punchHole ? (
          punchHoleOverlay
        ) : mode === 'closed' ? (
          // The two lens rings + flash live ON the cover screen — rendered as
          // a DOM overlay so they sit above your live content, like a cutout.
          // No pill behind them: the retail modules protrude individually.
          <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2147483647 }}>
            {cam.rings.map(({ x, y, r }, i) => (
              <div
                key={i}
                style={coverAt(x, y, r * 2, r * 2, {
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 38%, #262f42 0%, #0a0c12 55%, #000 100%)',
                  boxShadow: 'inset 0 0 0 2px rgba(215, 222, 232, 0.35)',
                })}
              />
            ))}
            <div
              style={coverAt(cam.flash.x, cam.flash.y, cam.flash.r * 2, cam.flash.r * 2, {
                borderRadius: '50%',
                background: 'radial-gradient(circle at 45% 40%, #fdf7e4 0%, #d9d2bd 70%, #b7b19e 100%)',
              })}
            />
          </div>
        ) : undefined
      }
    >
      {children}
    </DeviceScreen>
  )

  if (mode === 'flex') {
    // Each half pivots around a shared virtual axis at the fold line, sitting
    // just inside the main display surface (the panel's neutral axis) — so
    // the screens meet flush when shut and lie coplanar when flat. The
    // Armor FlexHinge spine is a separate rigid body: a cylinder segment the
    // halves' back shells progressively cover as the device opens.
    const alpha = ((180 - angle) / 2) * (Math.PI / 180)
    const pz = openBody.depth / 2 - 0.015
    const halfH = half.height
    // Spine housing: radius ≈ the real 6.85 mm exterior curve, spanning the
    // rails; only the back wedge between the two tilted halves is drawn.
    const spineR = 0.175
    const spineLen = openBody.width - 0.2
    const wedge = 2 * alpha + 0.5
    const spineTheta = Math.PI - wedge / 2
    // Screen halves: the fold splits the panel at the hinge line; each plane
    // shows its half of one shared virtual viewport via a clipped wrapper.
    const r = display.radius
    const halfScreen = (part: 'upper' | 'lower') => {
      const upper = part === 'upper'
      const radius: [number, number, number, number] = landscape
        ? upper
          ? [r, 0, 0, r]
          : [0, r, r, 0]
        : upper
          ? [r, r, 0, 0]
          : [0, 0, r, r]
      const localY = (upper ? 1 : -1) * (display.height / 4 - halfH / 2)
      return (
        <DeviceScreen
          width={landscape ? display.height / 2 : display.width}
          height={landscape ? display.width : display.height / 2}
          radius={radius}
          resolution={landscape ? res / 2 : res}
          position={[0, localY, half.depth / 2 + 0.006]}
          rotation={landscape ? [0, 0, -Math.PI / 2] : [0, 0, 0]}
          background={screenBackground}
          interactive={interactive}
          dragToRotate={dragToRotate}
          occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
          screenStyle={screenStyle}
          overlay={
            <>
              {upper && punchHole ? punchHoleOverlay : null}
              {/* the fold's soft shadow falling into the crease */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  zIndex: 2147483646,
                  ...(landscape
                    ? upper
                      ? { top: 0, bottom: 0, right: 0, width: px(0.18), background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.24))' }
                      : { top: 0, bottom: 0, left: 0, width: px(0.18), background: 'linear-gradient(to left, transparent, rgba(0,0,0,0.24))' }
                    : upper
                      ? { left: 0, right: 0, bottom: 0, height: px(0.18), background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.24))' }
                      : { left: 0, right: 0, top: 0, height: px(0.18), background: 'linear-gradient(to top, transparent, rgba(0,0,0,0.24))' }),
                }}
              />
            </>
          }
        >
          <div
            style={{
              position: 'absolute',
              left: landscape && !upper ? '-100%' : 0,
              top: !landscape && !upper ? '-100%' : 0,
              width: landscape ? '200%' : '100%',
              height: landscape ? '100%' : '200%',
            }}
          >
            {children}
          </div>
        </DeviceScreen>
      )
    }

    return (
      <group {...groupProps}>
        <group rotation-z={landscape ? Math.PI / 2 : 0}>
          {/* upper (cover) half folds toward the viewer around the hinge */}
          <group position={[0, 0, pz]} rotation-x={alpha}>
            <group position={[0, halfH / 2, -pz]}>
              <mesh ref={bodyRef} geometry={halfGeometry}>
                <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.32} />
              </mesh>
              <mesh geometry={coverGlassGeometry} rotation-y={Math.PI} position-z={-half.depth / 2 - 0.002}>
                <meshPhysicalMaterial color={coverOffColor(color)} metalness={0.2} roughness={0.18} clearcoat={1} clearcoatRoughness={0.12} />
              </mesh>
              {cameraCluster(-1, -half.depth / 2 - 0.002)}
              {rails}
              {endSeams([halfH / 2 - spec.endSeamInset], half.depth)}
              {halfScreen('upper')}
            </group>
          </group>

          {/* lower half folds the opposite way */}
          <group position={[0, 0, pz]} rotation-x={-alpha}>
            <group position={[0, -halfH / 2, -pz]}>
              <mesh ref={lowerBodyRef} geometry={flexLowerGeometry ?? halfGeometry}>
                <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.32} />
              </mesh>
              <mesh geometry={coverGlassGeometry} rotation-y={Math.PI} position-z={-half.depth / 2 - 0.002}>
                <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.3} clearcoat={1} clearcoatRoughness={0.25} />
              </mesh>
              {freeEdgeKit(-halfH / 2)}
              {endSeams([-(halfH / 2 - spec.endSeamInset)], half.depth)}
              {halfScreen('lower')}
            </group>
          </group>

          {/* the spine housing rolling into the wedge between the halves —
              frame-colored but glossier than the satin rails, with the
              tone-on-tone SAMSUNG engraving centered on the band face */}
          <group position={[0, 0, pz]}>
            <mesh rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[spineR, spineR, spineLen, 48, 1, true, spineTheta, wedge]} />
              <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.22} clearcoat={0.4} side={THREE.DoubleSide} />
            </mesh>
            <mesh geometry={hingeLogoGeometry} rotation-y={Math.PI} position={[0, 0, -spineR - 0.003]}>
              <meshPhysicalMaterial
                transparent
                opacity={0.45}
                color="#33363c"
                metalness={0.7}
                roughness={0.35}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </mesh>
            {/* dark neutral end-cap wedges between the converging rails */}
            {([1, -1] as const).map((s) => (
              <mesh key={s} rotation-y={s * (Math.PI / 2)} position={[s * (spineLen / 2 + 0.004), 0, 0]}>
                {/* local theta 0 lands on world -z (the wedge center) for the
                    +x cap and on +z for the -x cap — start each accordingly */}
                <circleGeometry args={[spineR * 0.98, 32, s === 1 ? -wedge / 2 : Math.PI - wedge / 2, wedge]} />
                <meshPhysicalMaterial color="#26282d" metalness={0.5} roughness={0.4} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    )
  }

  if (mode === 'open') {
    return (
      <group {...groupProps}>
        <group rotation-z={landscape ? Math.PI / 2 : 0}>
          {/* chassis */}
          <mesh ref={bodyRef} geometry={openGeometry}>
            <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.32} />
          </mesh>

          {/* lower back glass colorway */}
          <mesh geometry={coverGlassGeometry} rotation-y={Math.PI} position={[0, -halfOffsetY, -openBody.depth / 2 - 0.002]}>
            <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.3} clearcoat={1} clearcoatRoughness={0.25} />
          </mesh>

          {/* upper back: the cover screen glass (off, dark tint of the colorway) +
              the lens rings riding it */}
          <group position={[0, halfOffsetY, 0]}>
            <mesh geometry={coverGlassGeometry} rotation-y={Math.PI} position-z={-openBody.depth / 2 - 0.002}>
              <meshPhysicalMaterial color={coverOffColor(color)} metalness={0.2} roughness={0.18} clearcoat={1} clearcoatRoughness={0.12} />
            </mesh>
            {cameraCluster(-1, -openBody.depth / 2 - 0.002)}
            {rails}
          </group>

          {/* faint hinge seam across the middle of the frame rails */}
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * (openBody.width / 2 - 0.004), 0, 0]}>
              <boxGeometry args={[0.014, 0.05, openBody.depth * 0.9]} />
              <meshStandardMaterial color="#101216" transparent opacity={0.5} roughness={0.6} />
            </mesh>
          ))}
          {endSeams([openBody.height / 2 - spec.endSeamInset, -openBody.height / 2 + spec.endSeamInset], openBody.depth)}

          {freeEdgeKit(-openBody.height / 2)}
          {screen}
        </group>
      </group>
    )
  }

  const halfZ = spec.closed.gap / 2 + half.depth / 2
  const stackBottom = -half.height / 2

  return (
    <group {...groupProps}>
      <group rotation-z={landscape ? Math.PI / 2 : 0}>
        {/* front half (cover screen + cameras) and rear half, with the air gap */}
        <group position-z={halfZ}>
          <mesh ref={bodyRef} geometry={halfGeometry}>
            <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.32} />
          </mesh>
          {rails}
          {screen}
        </group>
        <group position-z={-halfZ}>
          <mesh geometry={rearHalfGeometry}>
            <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.32} />
          </mesh>
          {/* back glass colorway on the rear half */}
          <mesh geometry={coverGlassGeometry} rotation-y={Math.PI} position-z={-half.depth / 2 - 0.002}>
            <meshPhysicalMaterial color={color} metalness={0.3} roughness={0.3} clearcoat={1} clearcoatRoughness={0.25} />
          </mesh>
        </group>

        {/* the lower half's edge kit lands on the TOP edge when folded */}
        <group position-z={-halfZ}>{freeEdgeKit(half.height / 2)}</group>

        {/* hinge band capping the bottom */}
        {hingeBand(stackBottom - spec.hinge.overhang / 2 - 0.006)}

        {endSeams([half.height / 2 - spec.endSeamInset], half.depth)}
      </group>
    </group>
  )
}

/** The cover screen shows near-black glass when off, tinted faintly by the colorway. */
function coverOffColor(color: string): string {
  return `#${new THREE.Color(color).lerp(new THREE.Color('#06070a'), 0.82).getHexString()}`
}
