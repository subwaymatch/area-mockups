/**
 * Tap-vs-drag handoff for the live screen, shared by every framework binding.
 *
 * Presses are kept from the orbit controls so content stays clickable, but
 * once a pointer travels past a small threshold the press is replayed on the
 * WebGL canvas and the controls take over the gesture.
 */

/**
 * How far (in CSS px) a pointer must travel across the screen before the gesture
 * stops being a tap for the content and becomes a drag for the orbit controls.
 */
export const SCREEN_DRAG_THRESHOLD_PX = 10

export interface ScreenDragHandoff {
  /**
   * Call from the screen wrapper's `pointerdown` listener. The binding must
   * stop the event from propagating to the canvas first — taps and clicks
   * belong to the screen content; real drags are handed off here.
   */
  onPointerDown(event: PointerEvent): void
  /** Cancel any in-flight gesture and detach listeners. Call on unmount. */
  dispose(): void
}

/**
 * Create the handoff for one screen. `getCanvas` returns the WebGL canvas the
 * orbit controls listen on (looked up lazily, per gesture).
 */
export function createScreenDragHandoff(
  getCanvas: () => HTMLElement | null | undefined
): ScreenDragHandoff {
  let active: { id: number; cancel: () => void } | null = null

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || active) return
    const canvas = getCanvas()
    if (!canvas) return

    const start = { id: event.pointerId, x: event.clientX, y: event.clientY }

    const cancel = () => {
      if (active?.id === start.id) active = null
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', cancel)
      window.removeEventListener('pointercancel', cancel)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== start.id) return
      const dx = e.clientX - start.x
      const dy = e.clientY - start.y
      if (Math.hypot(dx, dy) < SCREEN_DRAG_THRESHOLD_PX) return
      cancel()
      // On touch, vertical gestures belong to the browser (page scrolling, per
      // the pan-y touch-action) — only predominantly horizontal drags rotate.
      if (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) return
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

    active = { id: start.id, cancel }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', cancel)
    window.addEventListener('pointercancel', cancel)
  }

  return {
    onPointerDown,
    dispose: () => active?.cancel(),
  }
}
