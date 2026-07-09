import * as React from 'react'
import type * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'

/**
 * Class applied to drei's `<Html transform>` portal root so we can promote it to
 * its own compositor layer (see the `<style>` element rendered with the screen).
 */
const SCREEN_LAYER_CLASS = 'area-mockups-screen-layer'

/**
 * How far (in CSS px) a pointer must travel across the screen before the gesture
 * stops being a tap for the content and becomes a drag for the orbit controls.
 */
const SCREEN_DRAG_THRESHOLD_PX = 10

/** Per-corner radii in world units (top-left, top-right, bottom-right, bottom-left). */
export type ScreenRadius = number | [number, number, number, number]

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
 * display glass via drei's `<Html transform>`, with two behaviors layered on:
 *
 * - **Compositor-layer promotion.** The portal root (the element carrying the
 *   CSS `perspective`) gets `will-change: transform`. Without it, Chromium can
 *   rasterize the perspective → preserve-3d → matrix3d chain against a
 *   pixel-snapped origin when the canvas lands on a fractional page offset
 *   (e.g. an odd window width centering a max-width layout), painting the
 *   screen visibly detached from the glass.
 *
 * - **Tap-vs-drag handoff.** Presses are kept from the orbit controls so
 *   content stays clickable, but once a pointer travels past a small threshold
 *   the press is replayed on the canvas and the controls take over the gesture.
 */
export function DeviceScreen({
  width,
  height,
  radius,
  resolution,
  position,
  rotation,
  background = '#000000',
  interactive = true,
  dragToRotate = true,
  occlude,
  screenStyle,
  overlay,
  children,
}: DeviceScreenProps) {
  const gl = useThree((state) => state.gl)
  const screenDrag = React.useRef<{ id: number; cancel: () => void } | null>(null)

  React.useEffect(() => () => screenDrag.current?.cancel(), [])

  // CSS px per world unit for the virtual display.
  const pxPerUnit = resolution / width
  const px = (units: number) => units * pxPerUnit
  const corners: [number, number, number, number] =
    typeof radius === 'number' ? [radius, radius, radius, radius] : radius
  const borderRadius = corners.map((r) => `${px(r)}px`).join(' ')

  const beginScreenDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    // Never let the initial press reach the orbit controls — taps and clicks
    // belong to the screen content. Real drags are handed off below.
    event.stopPropagation()
    if (!dragToRotate || event.button !== 0 || screenDrag.current) return

    const start = { id: event.pointerId, x: event.clientX, y: event.clientY }
    const canvas = gl.domElement

    const cancel = () => {
      if (screenDrag.current?.id === start.id) screenDrag.current = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', cancel)
      window.removeEventListener('pointercancel', cancel)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== start.id) return
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < SCREEN_DRAG_THRESHOLD_PX) return
      cancel()
      // Replay the press on the canvas: the orbit controls (attached to the
      // canvas or an ancestor) pick it up and capture the pointer, so the rest
      // of the gesture orbits the device — and the content, having lost the
      // pointer, never receives a click for this gesture.
      canvas.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          pointerId: e.pointerId,
          pointerType: e.pointerType,
          isPrimary: e.isPrimary,
          button: 0,
          buttons: 1,
          clientX: e.clientX,
          clientY: e.clientY,
          screenX: e.screenX,
          screenY: e.screenY,
        })
      )
    }

    screenDrag.current = { id: start.id, cancel }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', cancel)
    window.addEventListener('pointercancel', cancel)
  }

  return (
    <Html
      transform
      occlude={occlude}
      distanceFactor={(400 * width) / resolution}
      position={position}
      rotation={rotation}
      zIndexRange={[10, 0]}
      wrapperClass={SCREEN_LAYER_CLASS}
    >
      <style>{`.${SCREEN_LAYER_CLASS}{will-change:transform}`}</style>
      <div
        onPointerDown={beginScreenDrag}
        style={{
          position: 'relative',
          width: resolution,
          height: Math.round((resolution * height) / width),
          borderRadius,
          overflow: 'hidden',
          background,
          pointerEvents: interactive ? 'auto' : 'none',
          // With drag-to-rotate the browser must not claim touch gestures for
          // scrolling — moves past the threshold become orbit input instead.
          touchAction: dragToRotate ? 'none' : undefined,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
          ...screenStyle,
        }}
      >
        {children}
        {overlay}
      </div>
    </Html>
  )
}
