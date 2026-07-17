import * as React from 'react'
import type * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { MAILER_BOX } from '@area-mockups/core'
import { DeviceScreen } from '../../screen/device-screen'
import { useScreenOccluders } from '../../screen/occluders'

type GroupProps = ThreeElements['group']

export interface MailerBoxProps extends Omit<GroupProps, 'children' | 'color'> {
  /** Top panel design — the hero face of a shipper. Tape overlays it like real tape over print. */
  children?: React.ReactNode
  /** Front (long) panel design. */
  front?: React.ReactNode
  /** End panel design (the right short face). */
  side?: React.ReactNode
  /** Corrugated stock color. Kraft by default; try white or a brand dip. */
  color?: string
  /** Packing tape color. */
  tapeColor?: string
  /** CSS background painted behind each printed panel. */
  faceBackground?: string
  /** CSS pixel width of the virtual top panel; other panels share its dpi. */
  resolution?: number
  /** Let pointer events (clicks, scrolling, typing) reach your panel content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How panel content hides when that panel turns away from the camera.
   * `true` raycasts against the box (fast, interactive). `'blending'` uses
   * per-pixel depth blending. `false` disables hiding.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each panel wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built closed corrugated shipper: kraft stock with softened
 * corrugated edges, the flap seam under a packing-tape band that wraps down
 * both ends — and live DOM on the top, front and end panels. The tape stays
 * over your print via a DOM overlay, exactly like real tape over a printed
 * box. No 3D asset files are loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function MailerBox({
  children,
  front,
  side,
  color = '#b5915f',
  tapeColor = 'rgba(168, 127, 79, 0.82)',
  faceBackground = '#ffffff',
  resolution = MAILER_BOX.resolution,
  interactive = true,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: MailerBoxProps) {
  const { body, tape } = MAILER_BOX
  const bodyRef = React.useRef<THREE.Mesh>(null!)
  const occludeRefs = useScreenOccluders(bodyRef)
  const pxPerUnit = resolution / body.width

  // DOM tape overlay: a translucent band with edge shadows, so it reads as
  // tape laid OVER the printed face.
  const tapeOverlay = (vertical: boolean): React.ReactNode => (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 2147483647,
        background: tapeColor,
        boxShadow: 'inset 0 0 6px rgba(0,0,0,0.18)',
        ...(vertical
          ? { top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: tape.width * pxPerUnit }
          : { left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: tape.width * pxPerUnit }),
      }}
    />
  )

  // flap seam: the flaps hinge on the LONG walls and meet along the width,
  // so the gap runs left-right — visible through the translucent tape
  const seamOverlay = (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          height: 3,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.12))',
          pointerEvents: 'none',
          zIndex: 2147483646,
        }}
      />
      {tapeOverlay(false)}
    </>
  )

  const shared = {
    radius: body.radius,
    background: faceBackground,
    interactive,
    dragToRotate,
    occlude: occlude === true ? occludeRefs : occlude === 'blending' ? ('blending' as const) : undefined,
    screenStyle,
  }

  return (
    <group {...groupProps}>
      {/* the shipper */}
      <RoundedBox ref={bodyRef} args={[body.width, body.height, body.depth]} radius={body.radius}>
        <meshPhysicalMaterial color={color} metalness={0} roughness={0.85} />
      </RoundedBox>

      {/* geometry seam gap + tape for the unprinted faces (hidden under live
          DOM). The tape runs along the width — over the flap seam — and wraps
          down both short end faces. It is slightly translucent so the dark
          gap between the flaps reads through it, like real packing tape. */}
      <mesh position={[0, body.height / 2 + 0.0015, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[body.width, 0.022]} />
        <meshBasicMaterial color="#4a3a26" />
      </mesh>
      <mesh position={[0, body.height / 2 + 0.003, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[body.width, tape.width]} />
        <meshPhysicalMaterial color="#a87f4f" metalness={0} roughness={0.45} clearcoat={0.6} transparent opacity={0.88} />
      </mesh>
      {([1, -1] as const).map((s) => (
        <mesh key={s} position={[s * (body.width / 2 + 0.002), body.height / 2 - 0.385, 0]} rotation-y={s * (Math.PI / 2)}>
          <planeGeometry args={[tape.width, 0.77]} />
          <meshPhysicalMaterial color="#a87f4f" metalness={0} roughness={0.45} clearcoat={0.6} transparent opacity={0.94} />
        </mesh>
      ))}

      {/* manufacturer's joint: the vertical glued lap seam on one corner */}
      <mesh position={[-body.width / 2 - 0.002, 0, body.depth / 2 - 0.26]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[0.46, body.height - 0.04]} />
        <meshPhysicalMaterial color="#a8845a" metalness={0} roughness={0.85} />
      </mesh>

      {/* unprinted-state details: flap seam slabs and a skewed 4x6 label
          (hidden under the live top panel when one is mounted) */}
      {children == null && (
        <group position={[0, body.height / 2, 0]}>
          {/* the two flaps, hinged on the long walls, meeting along the width
              — below the seam/tape planes so both stay visible */}
          {([1, -1] as const).map((s) => (
            <mesh key={s} position={[0, 0.001, s * (body.depth / 4 + 0.006)]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[body.width - 0.012, body.depth / 2 - 0.012]} />
              <meshPhysicalMaterial color={color} metalness={0} roughness={0.82} />
            </mesh>
          ))}
          <mesh position={[0.9, 0.008, 0.7]} rotation={[-Math.PI / 2, 0, 0.06]}>
            <planeGeometry args={[1.3, 1.95]} />
            <meshPhysicalMaterial color="#f4f5f2" metalness={0} roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* live top panel — the seam and tape ride over the print */}
      {children != null && (
        <DeviceScreen
          {...shared}
          width={body.width}
          height={body.depth}
          resolution={resolution}
          position={[0, body.height / 2 + 0.004, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          overlay={seamOverlay}
        >
          {children}
        </DeviceScreen>
      )}

      {/* live front (long) panel */}
      {front != null && (
        <DeviceScreen
          {...shared}
          width={body.width}
          height={body.height}
          resolution={resolution}
          position={[0, 0, body.depth / 2 + 0.004]}
        >
          {front}
        </DeviceScreen>
      )}

      {/* live end panel — the wrapped tape rides over it */}
      {side != null && (
        <DeviceScreen
          {...shared}
          width={body.depth}
          height={body.height}
          resolution={Math.round(body.depth * pxPerUnit)}
          position={[body.width / 2 + 0.004, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
          overlay={tapeOverlay(true)}
        >
          {side}
        </DeviceScreen>
      )}
    </group>
  )
}
