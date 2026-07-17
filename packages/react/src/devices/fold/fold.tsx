import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { FOLD_COLORWAYS, findColorway, FOLD_VARIANTS, type FoldVariant } from '@area-mockups/core'
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

export interface FoldProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the active display: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Which Galaxy Z Fold device to render. */
  variant?: FoldVariant
  /**
   * A retail colorway id from `FOLD_COLORWAYS` (e.g. the catalog's first
   * entry) presetting the device colors. Explicit color props override it.
   */
  colorway?: string
  /**
   * `true` (default) renders the unfolded tablet — your content fills the large,
   * nearly square inner display (with a faint center crease). `false` renders the
   * folded candy-bar — your content fills the tall cover display and the rear
   * triple camera shows on the back.
   */
  open?: boolean
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
   * whichever screen is showing (inner display when open, cover when closed).
   */
  resolution?: number
  /** Show the front-camera punch-hole overlay. */
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

/** An extruded rounded-rect slab with a soft edge bevel (a fold half / the open body). */
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

/**
 * A procedurally built Samsung Galaxy Z Fold 7. One device, two form factors:
 * the unfolded tablet (big inner display) and the folded candy-bar — two
 * stacked slabs with the real crevice of air between them — switched with the
 * `open` prop. No 3D asset files are loaded — the whole device is generated
 * from geometry at runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Fold({
  children,
  variant = 'fold7',
  open = true,
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
}: FoldProps) {
  const spec = FOLD_VARIANTS[variant]
  const retail = findColorway(FOLD_COLORWAYS[variant], colorway)
  const color = colorProp ?? retail?.color ?? '#3a3d42'
  const frameColor = frameColorProp ?? retail?.frameColor ?? '#54585f'
  const state = open ? spec.open : spec.closed
  const cam = open ? spec.rearCamera.open : spec.rearCamera.closed
  const { body, display } = state
  const landscape = orientation === 'landscape'
  const aspect = display.height / display.width
  const res = resolution ?? Math.round(state.resolution * (landscape ? aspect : 1))
  // Open pose: one body mesh. Closed pose: front (cover) + rear (camera) slabs.
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const rearRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(bodyRef, rearRef)

  // The folded stack: body.depth spans both slabs plus the crevice between them.
  const gap = spec.closed.gap
  const halfDepth = (spec.closed.body.depth - gap) / 2
  const halfZ = gap / 2 + halfDepth / 2

  // Unfolded chassis with its bottom-edge machining (USB, speakers, mics).
  const openGeometry = React.useMemo(() => {
    const b = spec.open.body
    const edge = spec.bottomEdge.open
    const bottom = -b.height / 2
    return cutGeometry(slabGeometry(b.width, b.height, b.radius, b.depth, b.bevel), [
      stadiumCutter(edge.usb.width, edge.usb.height, USB_CUT_DEPTH).translate(edge.usb.x, bottom, 0),
      ...edge.speakers.map((sp) =>
        stadiumCutter(sp.width, sp.height, 0.06).translate(sp.x, bottom, 0)
      ),
      ...(edge.mics ?? []).map(({ x, r }) => holeCutter(r, 0.05).translate(x, bottom, 0)),
    ])
  }, [spec.open.body, spec.bottomEdge.open])

  // Folded slabs, each machining its own opening: the speaker lives on the
  // cover (front) half, the USB-C on the camera (rear) half — like the scan.
  const frontHalfGeometry = React.useMemo(() => {
    const b = spec.closed.body
    const sp = spec.bottomEdge.closed.speaker
    return cutGeometry(slabGeometry(b.width, b.height, b.radius, halfDepth, b.bevel), [
      stadiumCutter(sp.width, sp.height, 0.06).translate(sp.x, -b.height / 2, 0),
    ])
  }, [spec.closed.body, spec.bottomEdge.closed, halfDepth])
  const rearHalfGeometry = React.useMemo(() => {
    const b = spec.closed.body
    const usb = spec.bottomEdge.closed.usb
    return cutGeometry(slabGeometry(b.width, b.height, b.radius, halfDepth, b.bevel), [
      stadiumCutter(usb.width, usb.height, USB_CUT_DEPTH).translate(usb.x, -b.height / 2, 0),
    ])
  }, [spec.closed.body, spec.bottomEdge.closed, halfDepth])

  const backGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(body.width - 0.05, body.height - 0.05, Math.max(0.02, body.radius - 0.025)),
        16
      ),
    [body]
  )

  const glassGeometry = React.useMemo(
    () =>
      new THREE.ShapeGeometry(
        roundedRectShape(body.width - 0.03, body.height - 0.03, Math.max(0.02, body.radius - 0.015)),
        16
      ),
    [body]
  )

  // Camera pedestal: the light plateau plate with the dark pill on top of it.
  const pillGeometry = (part: { width: number; height: number; radius: number; raise: number }) => {
    const bevel = 0.014
    const shape = roundedRectShape(part.width - bevel * 2, part.height - bevel * 2, part.radius - bevel)
    return new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.008, part.raise - bevel),
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 16,
    })
  }
  const plateauGeometry = React.useMemo(() => pillGeometry(cam.plateau), [cam.plateau])
  const islandGeometry = React.useMemo(() => pillGeometry(cam.island), [cam.island])

  // The (off) cover-display glass on the back of the open pose's left half.
  const coverGlassGeometry = React.useMemo(() => {
    if (!open) return null
    const c = spec.closed
    return new THREE.ShapeGeometry(
      roundedRectShape(c.display.width + 0.03, c.display.height + 0.06, c.display.radius + 0.02),
      16
    )
  }, [open, spec.closed])
  React.useEffect(() => () => coverGlassGeometry?.dispose(), [coverGlassGeometry])

  // The vertical SAMSUNG emboss on the hinge spine — vector geometry from the SVG.
  const spineLogoGeometry = React.useMemo(
    () => createLogoGeometry('samsung', spec.hinge.emboss.length, spec.hinge.emboss.length * 0.155),
    [spec.hinge.emboss.length]
  )

  React.useEffect(() => {
    return () => {
      openGeometry.dispose()
      frontHalfGeometry.dispose()
      rearHalfGeometry.dispose()
      backGeometry.dispose()
      glassGeometry.dispose()
      plateauGeometry.dispose()
      islandGeometry.dispose()
      spineLogoGeometry.dispose()
    }
  }, [
    openGeometry,
    frontHalfGeometry,
    rearHalfGeometry,
    backGeometry,
    glassGeometry,
    plateauGeometry,
    islandGeometry,
    spineLogoGeometry,
  ])

  // CSS px per world unit for display overlays.
  const pxPerUnit = res / (landscape ? display.height : display.width)
  const px = (units: number) => units * pxPerUnit

  const holeX = open ? spec.open.punchHole.offsetX : 0
  const holeOffsetY = state.punchHole.offsetY
  const holeR = state.punchHole.radius

  const chassisMaterial = (
    <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.32} />
  )

  const spineLogoMaterial = (
    <meshPhysicalMaterial
      transparent
      opacity={0.45}
      color="#3c4046"
      metalness={0.7}
      roughness={0.35}
      polygonOffset
      polygonOffsetFactor={-1}
    />
  )

  // Camera cluster on a back face at `backZ` (local to its slab/body group).
  const cameraCluster = (backZ: number) => (
    <>
      <mesh
        geometry={plateauGeometry}
        rotation-y={Math.PI}
        position={[cam.plateau.x, cam.plateau.y, backZ - 0.002]}
      >
        <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.32} clearcoat={0.8} />
      </mesh>
      <mesh
        geometry={islandGeometry}
        rotation-y={Math.PI}
        position={[cam.island.x, cam.island.y, backZ - cam.plateau.raise]}
      >
        <meshPhysicalMaterial color="#26282d" metalness={0.5} roughness={0.35} clearcoat={0.7} />
      </mesh>
      {cam.rings.map(({ y, r, pupil }, i) => (
        <group key={i} position={[cam.island.x, y, backZ - cam.plateau.raise - cam.island.raise]}>
          <LensRing r={r} proud={0.028} seat={0.03} frameColor={frameColor} pupil={pupil} />
        </group>
      ))}
      <mesh rotation-x={Math.PI / 2} position={[cam.flash.x, cam.flash.y, backZ - 0.008]}>
        <cylinderGeometry args={[cam.flash.r, cam.flash.r, 0.016, 32]} />
        <meshPhysicalMaterial
          color="#efe9da"
          emissive="#fff3d6"
          emissiveIntensity={0.25}
          roughness={0.4}
        />
      </mesh>
    </>
  )

  // Side keys on the right rail (closed: they ride the camera slab).
  const sideKeys = (railX: number) =>
    spec.buttons.map(({ y, length }, i) => (
      <SideKey
        key={i}
        side={1}
        railX={railX}
        y={y}
        length={length}
        thickness={spec.buttonProfile.thickness}
        protrusion={spec.buttonProfile.protrusion}
        color={frameColor}
      />
    ))

  // Antenna seam inserts on both rails, sized to the slab that carries them.
  const antennaSeams = (depth: number) =>
    spec.antennaLines?.map((y, i) => (
      <React.Fragment key={i}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (body.width / 2 - 0.005), y, 0]}>
            <boxGeometry args={[0.012, 0.026, depth * 0.8]} />
            <meshStandardMaterial color="#22262c" transparent opacity={0.35} roughness={0.65} />
          </mesh>
        ))}
      </React.Fragment>
    ))

  const screen = (surfaceZ: number) => (
    <DeviceScreen
      width={landscape ? display.height : display.width}
      height={landscape ? display.width : display.height}
      radius={display.radius}
      resolution={res}
      position={[0, 0, surfaceZ]}
      rotation={landscape ? [0, 0, -Math.PI / 2] : [0, 0, 0]}
      background={screenBackground}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude === true ? occludeRefs : occlude === 'blending' ? 'blending' : undefined}
      screenStyle={screenStyle}
      overlay={
        <>
          {/* the inner display's soft center crease (open only) */}
          {open && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                ...(landscape
                  ? { left: 0, right: 0, top: '50%', height: px(0.06), transform: 'translateY(-50%)' }
                  : { top: 0, bottom: 0, left: '50%', width: px(0.06), transform: 'translateX(-50%)' }),
                background: landscape
                  ? 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.14) 50%, rgba(0,0,0,0) 100%)'
                  : 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.14) 50%, rgba(0,0,0,0) 100%)',
                pointerEvents: 'none',
                zIndex: 2147483646,
              }}
            />
          )}
          {punchHole && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                ...(landscape
                  ? {
                      left: px(holeOffsetY - holeR),
                      top: `calc(50% - ${px(holeX)}px)`,
                      transform: 'translateY(-50%)',
                    }
                  : {
                      top: px(holeOffsetY - holeR),
                      left: `calc(50% + ${px(holeX)}px)`,
                      transform: 'translateX(-50%)',
                    }),
                width: px(holeR * 2),
                height: px(holeR * 2),
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 38% 38%, #1b2436 0%, #05060a 55%, #000 100%)',
                boxShadow: '0 0 0 1.5px rgba(255, 255, 255, 0.05)',
                pointerEvents: 'none',
                zIndex: 2147483647,
              }}
            />
          )}
        </>
      }
    >
      {children}
    </DeviceScreen>
  )

  if (open) {
    return (
      <group {...groupProps}>
        <group rotation-z={landscape ? Math.PI / 2 : 0}>
          {/* chassis */}
          <mesh ref={bodyRef} geometry={openGeometry}>
            {chassisMaterial}
          </mesh>

          {/* back panel colorway */}
          <mesh geometry={backGeometry} rotation-y={Math.PI} position-z={-body.depth / 2 - 0.002}>
            <meshPhysicalMaterial
              color={color}
              metalness={0.3}
              roughness={0.34}
              clearcoat={0.8}
              clearcoatRoughness={0.3}
            />
          </mesh>

          {/* cover glass (the black ring around the active display) */}
          <mesh geometry={glassGeometry} position-z={body.depth / 2 + 0.002}>
            <meshPhysicalMaterial color="#040507" metalness={0.1} roughness={0.09} clearcoat={1} />
          </mesh>

          {/* the recessed hinge spine down the center of the unfolded back,
              carrying the vertical SAMSUNG emboss */}
          <mesh rotation-y={Math.PI} position={[0, 0, -body.depth / 2 - 0.0045]}>
            <planeGeometry args={[spec.hinge.width, body.height - 0.3]} />
            <meshPhysicalMaterial color={frameColor} metalness={0.8} roughness={0.42} />
          </mesh>
          <mesh
            geometry={spineLogoGeometry}
            rotation={[0, Math.PI, Math.PI / 2]}
            position={[0, 0, -body.depth / 2 - 0.006]}
          >
            {spineLogoMaterial}
          </mesh>

          {/* the cover display, dark, on the back of the left half */}
          {coverGlassGeometry && (
            <group position={[-0.982, 0, 0]}>
              <mesh
                geometry={coverGlassGeometry}
                rotation-y={Math.PI}
                position-z={-body.depth / 2 - 0.003}
              >
                <meshPhysicalMaterial color="#0a0b0f" metalness={0.15} roughness={0.14} clearcoat={1} clearcoatRoughness={0.1} />
              </mesh>
              {/* its punch camera, top center of the cover panel */}
              <mesh rotation-x={Math.PI / 2} position={[0, 1.961, -body.depth / 2 - 0.005]}>
                <cylinderGeometry args={[0.053, 0.053, 0.004, 20]} />
                <meshPhysicalMaterial color="#1a2130" metalness={0.4} roughness={0.2} clearcoat={1} />
              </mesh>
            </group>
          )}

          {cameraCluster(-body.depth / 2)}
          {sideKeys(body.width / 2)}
          {antennaSeams(body.depth)}

          {/* bottom edge: the machined cavities' interiors */}
          <UsbC
            x={spec.bottomEdge.open.usb.x}
            y={-body.height / 2}
            width={spec.bottomEdge.open.usb.width}
            height={spec.bottomEdge.open.usb.height}
          />
          {spec.bottomEdge.open.speakers.map((sp, i) => (
            <EdgeSocket
              key={i}
              position={[sp.x, -body.height / 2, 0]}
              width={sp.width}
              height={sp.height}
              depth={0.06}
            />
          ))}
          {spec.bottomEdge.open.mics?.map(({ x, r }, i) => (
            <EdgeSocket key={i} position={[x, -body.height / 2, 0]} r={r} depth={0.05} lip={0.008} />
          ))}

          {screen(body.depth / 2 + 0.006)}
        </group>
      </group>
    )
  }

  return (
    <group {...groupProps}>
      <group rotation-z={landscape ? Math.PI / 2 : 0}>
        {/* front (cover) slab — carries the cover screen and the speaker slot */}
        <group position-z={halfZ}>
          <mesh ref={bodyRef} geometry={frontHalfGeometry}>
            {chassisMaterial}
          </mesh>
          <mesh geometry={glassGeometry} position-z={halfDepth / 2 + 0.002}>
            <meshPhysicalMaterial color="#040507" metalness={0.1} roughness={0.09} clearcoat={1} />
          </mesh>
          <EdgeSocket
            position={[spec.bottomEdge.closed.speaker.x, -body.height / 2, 0]}
            width={spec.bottomEdge.closed.speaker.width}
            height={spec.bottomEdge.closed.speaker.height}
            depth={0.06}
          />
          {antennaSeams(halfDepth)}
          {screen(halfDepth / 2 + 0.006)}
        </group>

        {/* rear (camera) slab — colorway back, camera stack, buttons, USB-C */}
        <group position-z={-halfZ}>
          <mesh ref={rearRef} geometry={rearHalfGeometry}>
            {chassisMaterial}
          </mesh>
          <mesh geometry={backGeometry} rotation-y={Math.PI} position-z={-halfDepth / 2 - 0.002}>
            <meshPhysicalMaterial
              color={color}
              metalness={0.3}
              roughness={0.34}
              clearcoat={0.8}
              clearcoatRoughness={0.3}
            />
          </mesh>
          {cameraCluster(-halfDepth / 2)}
          {sideKeys(body.width / 2)}
          {antennaSeams(halfDepth)}
          <UsbC
            x={spec.bottomEdge.closed.usb.x}
            y={-body.height / 2}
            width={spec.bottomEdge.closed.usb.width}
            height={spec.bottomEdge.closed.usb.height}
          />
        </group>

        {/* the flat hinge band capping the left edge, bridging the crevice,
            with the vertical SAMSUNG emboss */}
        <group position={[-body.width / 2 - spec.hinge.overhang / 2, 0, 0]}>
          <RoundedBox args={[spec.hinge.overhang + 0.05, body.height - 0.02, spec.hinge.width]} radius={0.024}>
            <meshPhysicalMaterial color={frameColor} metalness={0.8} roughness={0.38} />
          </RoundedBox>
          <mesh
            geometry={spineLogoGeometry}
            rotation={[0, -Math.PI / 2, Math.PI / 2]}
            position-x={-(spec.hinge.overhang + 0.05) / 2 - 0.002}
          >
            {spineLogoMaterial}
          </mesh>
        </group>
      </group>
    </group>
  )
}
