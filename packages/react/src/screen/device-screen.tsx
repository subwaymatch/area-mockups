import * as React from 'react'
import type * as THREE from 'three'
import { Group } from 'three'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
  SCREEN_LAYER_CSS,
  createBackfaceCuller,
  createScreenDragHandoff,
  screenDistanceFactor,
  screenLayerClass,
  screenSurfaceStyle,
  type ScreenRadius,
} from '@area-mockups/core'
import { createScreenOcclusionTester } from './occluders'

export type { ScreenRadius }

export interface DeviceScreenProps {
  /** Active display size in world units. */
  width: number
  height: number
  /** Corner rounding of the display in world units. */
  radius: ScreenRadius
  /** CSS pixel width of the virtual display; height follows the panel aspect. */
  resolution: number
  /** Where the display plane sits within the parent device group. */
  position: [number, number, number]
  /**
   * Rotation of the display plane within the device group. Used for landscape
   * orientation: the device body is laid on its side while the screen plane
   * counter-rotates, so the DOM content renders upright with swapped
   * dimensions — exactly like a real device rotating into landscape.
   * Always applied explicitly (never undefined) — react-three-fiber does not
   * reset a property when a prop is simply omitted, which would leave a stale
   * rotation behind when toggling back to portrait.
   */
  rotation?: [number, number, number]
  /** CSS background painted behind the content. */
  background?: string
  /** Let pointer events (clicks, scrolling, typing) reach the content. */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /** Occlusion mode resolved by the device (mesh refs, 'blending', or off). */
  occlude?: React.RefObject<THREE.Mesh>[] | 'blending' | undefined
  /** Extra styles merged onto the screen wrapper. */
  screenStyle?: React.CSSProperties
  /** Device-specific overlay (punch hole, notch…) rendered above the content. */
  overlay?: React.ReactNode
  children?: React.ReactNode
}

/**
 * The live screen shared by every device: real DOM, CSS3D-transformed onto the
 * display glass via drei's `<Html transform>`. The behaviors layered on top —
 * compositor-layer promotion, tap-vs-drag handoff, backface culling — live in
 * `@area-mockups/core` (see `SCREEN_LAYER_CSS`, `createScreenDragHandoff` and
 * `createBackfaceCuller` there); this component is the thin React wiring.
 */
export function DeviceScreen({
  width,
  height,
  radius,
  resolution,
  position,
  rotation = [0, 0, 0],
  background = '#000000',
  interactive = true,
  dragToRotate = true,
  occlude,
  screenStyle,
  overlay,
  children,
}: DeviceScreenProps) {
  const gl = useThree((state) => state.gl)

  // Tap-vs-drag handoff: presses stay with the content, real drags are
  // replayed on the canvas so the orbit controls take over the gesture.
  const dragHandoff = React.useMemo(() => createScreenDragHandoff(() => gl.domElement), [gl])
  React.useEffect(() => () => dragHandoff.dispose(), [dragHandoff])

  // Backface culling for the DOM plane — hide it whenever its normal points
  // away from the camera (CSS backface-visibility can't see drei's chain) —
  // plus multi-sample raycast occlusion against every registered body in the
  // scene: one ray to the center (what drei checks) lets a partially covered
  // screen pierce through chassis edges and neighboring devices.
  const anchorRef = React.useRef<Group>(null!)
  const contentRef = React.useRef<HTMLDivElement>(null!)
  const cullBackface = React.useMemo(() => createBackfaceCuller(), [])
  const occlusionBlocked = React.useMemo(() => createScreenOcclusionTester(), [])
  const occludeMeshes = Array.isArray(occlude) ? occlude : undefined
  useFrame(({ camera }) => {
    if (!anchorRef.current || !contentRef.current) return
    const content = contentRef.current
    cullBackface(anchorRef.current, content, camera)
    if (
      occludeMeshes?.length &&
      content.style.visibility !== 'hidden' &&
      occlusionBlocked(anchorRef.current, width, height, occludeMeshes, camera)
    ) {
      content.style.visibility = 'hidden'
    }
    // A hidden screen must never intercept pointers either — user content can
    // re-enable its own `visibility`, which would silently eat drags on the
    // device's back (visibility alone doesn't stop such children hit-testing).
    const pointerEvents = content.style.visibility === 'hidden' || !interactive ? 'none' : 'auto'
    if (content.style.pointerEvents !== pointerEvents) {
      content.style.pointerEvents = pointerEvents
    }
  })

  const beginScreenDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    // Never let the initial press reach the orbit controls — taps and clicks
    // belong to the screen content. Real drags are handed off by the core.
    event.stopPropagation()
    if (dragToRotate) dragHandoff.onPointerDown(event.nativeEvent)
  }

  return (
    <group ref={anchorRef} position={position} rotation={rotation}>
      <Html
        transform
        occlude={occlude === 'blending' ? 'blending' : undefined}
        distanceFactor={screenDistanceFactor(width, resolution)}
        zIndexRange={[10, 0]}
        wrapperClass={screenLayerClass(dragToRotate)}
        // Keep drei's inner transform div from hit-testing: pointer handling
        // lives on the content div alone (visible + interactive → auto,
        // hidden → none). Otherwise the invisible bridge div spanning the
        // screen rect eats drags over the device's BACK, so drag-to-rotate
        // dies exactly where the body should be grabbable.
        pointerEvents="none"
      >
        <style>{SCREEN_LAYER_CSS}</style>
        <div
          ref={contentRef}
          onPointerDown={beginScreenDrag}
          style={{
            ...screenSurfaceStyle({
              width,
              height,
              radius,
              resolution,
              background,
              interactive,
              dragToRotate,
            }),
            ...screenStyle,
          }}
        >
          {children}
          {overlay}
        </div>
      </Html>
    </group>
  )
}
