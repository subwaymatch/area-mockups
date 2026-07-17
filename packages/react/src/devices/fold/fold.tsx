import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { FOLD_VARIANTS, type FoldVariant } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { createLogoGeometry } from '../logos'
import { SideKey, LensRing, UsbC } from '../details'
import { roundedRectShape } from '@area-mockups/core'

type GroupProps = ThreeElements['group']

export interface FoldProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Anything you want on the active display: React components, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Which Galaxy Z Fold device to render. */
  variant?: FoldVariant
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

/**
 * A procedurally built Samsung Galaxy Z Fold 7. One device, two form factors:
 * the unfolded tablet (big inner display) and the folded candy-bar (tall cover
 * display + rear triple camera), switched with the `open` prop. No 3D asset
 * files are loaded — the whole device is generated from geometry at runtime.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function Fold({
  children,
  variant = 'fold7',
  open = true,
  orientation = 'portrait',
  color = '#3a3d42',
  frameColor = '#54585f',
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
  const state = open ? spec.open : spec.closed
  const cam = open ? spec.rearCamera.open : spec.rearCamera.closed
  const { body, display } = state
  const landscape = orientation === 'landscape'
  const aspect = display.height / display.width
  const res = resolution ?? Math.round(state.resolution * (landscape ? aspect : 1))
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = React.useMemo(() => [bodyRef], [])

  // Chassis: an extruded rounded-rect with beveled edges, inset by the bevel so
  // the final silhouette lands exactly on the spec body.
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
      bevelSegments: 4,
      curveSegments: 16,
    })
    geometry.translate(0, 0, -depth / 2)
    return geometry
  }, [body])

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
      bodyGeometry.dispose()
      backGeometry.dispose()
      glassGeometry.dispose()
      plateauGeometry.dispose()
      islandGeometry.dispose()
      spineLogoGeometry.dispose()
    }
  }, [bodyGeometry, backGeometry, glassGeometry, plateauGeometry, islandGeometry, spineLogoGeometry])

  // CSS px per world unit for display overlays.
  const pxPerUnit = res / (landscape ? display.height : display.width)
  const px = (units: number) => units * pxPerUnit

  const holeX = open ? spec.open.punchHole.offsetX : 0
  const holeOffsetY = state.punchHole.offsetY
  const holeR = state.punchHole.radius

  return (
    <group {...groupProps}>
      <group rotation-z={landscape ? Math.PI / 2 : 0}>
        {/* chassis */}
        <mesh ref={bodyRef} geometry={bodyGeometry}>
          <meshPhysicalMaterial color={frameColor} metalness={0.85} roughness={0.32} />
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
        {open && (
          <>
            <mesh rotation-y={Math.PI} position={[0, 0, -body.depth / 2 - 0.0045]}>
              <planeGeometry args={[spec.hinge.width, body.height - 0.3]} />
              <meshPhysicalMaterial color={frameColor} metalness={0.8} roughness={0.42} />
            </mesh>
            <mesh
              geometry={spineLogoGeometry}
              rotation={[0, Math.PI, Math.PI / 2]}
              position={[0, 0, -body.depth / 2 - 0.006]}
            >
              <meshPhysicalMaterial
                transparent
                opacity={0.55}
                color="#3c4046"
                metalness={0.7}
                roughness={0.35}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </mesh>
          </>
        )}

        {/* folded: the flat hinge band capping the left edge, slightly proud,
            with the same vertical emboss */}
        {!open && (
          <group position={[-body.width / 2 - spec.hinge.overhang / 2, 0, 0]}>
            <RoundedBox args={[spec.hinge.overhang + 0.05, body.height - 0.02, spec.hinge.width]} radius={0.024}>
              <meshPhysicalMaterial color={frameColor} metalness={0.8} roughness={0.38} />
            </RoundedBox>
            <mesh
              geometry={spineLogoGeometry}
              rotation={[0, -Math.PI / 2, Math.PI / 2]}
              position-x={-(spec.hinge.overhang + 0.05) / 2 - 0.002}
            >
              <meshPhysicalMaterial
                transparent
                opacity={0.55}
                color="#3c4046"
                metalness={0.7}
                roughness={0.35}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </mesh>
          </group>
        )}

        {/* the cover display, dark, on the back of the left half (open only) */}
        {open && coverGlassGeometry && (
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

        {/* camera pedestal: light plateau plate + the dark pill on it */}
        <mesh
          geometry={plateauGeometry}
          rotation-y={Math.PI}
          position={[cam.plateau.x, cam.plateau.y, -body.depth / 2 - 0.002]}
        >
          <meshPhysicalMaterial color={color} metalness={0.4} roughness={0.32} clearcoat={0.8} />
        </mesh>
        <mesh
          geometry={islandGeometry}
          rotation-y={Math.PI}
          position={[cam.island.x, cam.island.y, -body.depth / 2 - cam.plateau.raise]}
        >
          <meshPhysicalMaterial color="#26282d" metalness={0.5} roughness={0.35} clearcoat={0.7} />
        </mesh>

        {/* three stacked lens collars rising to the island top */}
        {cam.rings.map(({ y, r }, i) => (
          <group
            key={i}
            position={[cam.island.x, y, -body.depth / 2 - cam.plateau.raise - cam.island.raise]}
          >
            <LensRing r={r} proud={0.028} seat={0.03} frameColor={frameColor} />
          </group>
        ))}

        {/* fresnel flash disc, flush on the flat back beside the pedestal */}
        <mesh rotation-x={Math.PI / 2} position={[cam.flash.x, cam.flash.y, -body.depth / 2 - 0.008]}>
          <cylinderGeometry args={[cam.flash.r, cam.flash.r, 0.016, 32]} />
          <meshPhysicalMaterial
            color="#efe9da"
            emissive="#fff3d6"
            emissiveIntensity={0.25}
            roughness={0.4}
          />
        </mesh>

        {/* side keys on the right edge, scan-accurate */}
        {spec.buttons.map(({ y, length }, i) => (
          <SideKey
            key={i}
            side={1}
            railX={body.width / 2}
            y={y}
            length={length}
            thickness={spec.buttonProfile.thickness}
            protrusion={spec.buttonProfile.protrusion}
            color={frameColor}
          />
        ))}

        {/* antenna seams on both rails */}
        {spec.antennaLines?.map((y, i) => (
          <React.Fragment key={i}>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[side * (body.width / 2 - 0.005), y, 0]}>
                <boxGeometry args={[0.012, 0.026, body.depth * 0.8]} />
                <meshStandardMaterial color="#22262c" transparent opacity={0.35} roughness={0.65} />
              </mesh>
            ))}
          </React.Fragment>
        ))}

        {/* bottom edge: USB-C + speaker slot(s) + mics */}
        {(() => {
          const bottomY = -body.height / 2 - 0.002
          const edge = open ? spec.bottomEdge.open : spec.bottomEdge.closed
          return (
            <>
              <UsbC x={edge.usb.x} y={bottomY} width={edge.usb.width} height={edge.usb.height} />
              {('speakers' in edge ? edge.speakers : [edge.speaker]).map((sp, i) => (
                <RoundedBox
                  key={i}
                  args={[sp.width, 0.014, sp.height]}
                  radius={Math.min(0.016, sp.height / 2 - 0.002)}
                  position={[sp.x, bottomY, 0]}
                >
                  <meshPhysicalMaterial color="#0a0b0e" metalness={0.3} roughness={0.5} />
                </RoundedBox>
              ))}
              {'mics' in edge &&
                edge.mics?.map(({ x, r }, i) => (
                  <mesh key={i} position={[x, bottomY, 0]}>
                    <cylinderGeometry args={[r, r, 0.012, 12]} />
                    <meshPhysicalMaterial color="#0a0b0e" metalness={0.3} roughness={0.5} />
                  </mesh>
                ))}
            </>
          )
        })()}

        {/* the live screen: real DOM, CSS3D-transformed onto the active display */}
        <DeviceScreen
          width={landscape ? display.height : display.width}
          height={landscape ? display.width : display.height}
          radius={display.radius}
          resolution={res}
          position={[0, 0, body.depth / 2 + 0.006]}
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
      </group>
    </group>
  )
}
