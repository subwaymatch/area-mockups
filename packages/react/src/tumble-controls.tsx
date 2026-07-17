import * as React from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ORBIT, TumbleOrbit, tumbleAutoRotateStep } from '@area-mockups/core'

export interface TumbleControlsHandle {
  /** Multiply the camera distance (used by the overlay +/− buttons). */
  zoomBy: (factor: number) => void
}

export interface TumbleControlsProps {
  /** Pointer-drag rotation (the tumble itself always keeps the target centered). */
  enabled?: boolean
  /** Wheel / pinch zoom. */
  zoom?: boolean
  /** Slowly spin the stage. */
  autoRotate?: boolean
  autoRotateSpeed?: number
  /**
   * Allow the camera to tumble a full 360° vertically — straight over the top
   * and bottom of the stage. Off by default: vertical rotation stays within
   * the classic orbit clamp.
   */
  freeRotation?: boolean
  minDistance?: number
  maxDistance?: number
}

/**
 * Drag-to-rotate camera controls: horizontal drags spin the turntable,
 * vertical drags tilt within the classic polar clamp — or, with
 * `freeRotation`, tumble straight over the top and bottom with no pole clamp.
 * The rotation axis always stays at the stage center; damping, auto-rotation
 * and zoom match the classic orbit feel.
 */
export const TumbleControls = React.forwardRef<TumbleControlsHandle, TumbleControlsProps>(
  function TumbleControls(
    {
      enabled = true,
      zoom = false,
      autoRotate = false,
      autoRotateSpeed = 1,
      freeRotation = false,
      minDistance,
      maxDistance,
    },
    ref
  ) {
    const camera = useThree((state) => state.camera)
    const gl = useThree((state) => state.gl)

    const orbit = React.useMemo(() => new TumbleOrbit(ORBIT.dampingFactor), [])
    React.useEffect(() => {
      if (minDistance !== undefined) orbit.minDistance = minDistance
      if (maxDistance !== undefined) orbit.maxDistance = maxDistance
    }, [orbit, minDistance, maxDistance])
    React.useEffect(() => {
      orbit.setPolarLimits(
        freeRotation ? null : { min: ORBIT.minPolarAngle, max: ORBIT.maxPolarAngle }
      )
    }, [orbit, freeRotation])

    React.useImperativeHandle(
      ref,
      () => ({ zoomBy: (factor: number) => orbit.zoomBy(camera, factor) }),
      [orbit, camera]
    )

    React.useEffect(() => {
      const element = gl.domElement
      const pointers = new Map<number, { x: number; y: number }>()
      let pinchDistance = 0

      const onPointerDown = (event: PointerEvent) => {
        if (!enabled || (event.pointerType === 'mouse' && event.button !== 0)) return
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()]
          pinchDistance = Math.hypot(a!.x - b!.x, a!.y - b!.y)
        }
        try {
          element.setPointerCapture(event.pointerId)
        } catch {
          /* synthetic events (drag handoff) can't always be captured */
        }
      }

      const onPointerMove = (event: PointerEvent) => {
        const previous = pointers.get(event.pointerId)
        if (!enabled || !previous) return
        const dx = event.clientX - previous.x
        const dy = event.clientY - previous.y
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

        if (pointers.size === 1) {
          const height = element.clientHeight || 1
          // Negative dy: dragging down carries the device's front face down
          // with the cursor (grab-the-scene feel, like dragging sideways does),
          // instead of tilting the opposite way.
          orbit.rotate((2 * Math.PI * dx) / height, (-2 * Math.PI * dy) / height)
        } else if (pointers.size === 2 && zoom) {
          const [a, b] = [...pointers.values()]
          const distance = Math.hypot(a!.x - b!.x, a!.y - b!.y)
          if (pinchDistance > 0 && distance > 0) orbit.zoomBy(camera, pinchDistance / distance)
          pinchDistance = distance
        }
      }

      const onPointerEnd = (event: PointerEvent) => {
        pointers.delete(event.pointerId)
        pinchDistance = 0
      }

      const onWheel = (event: WheelEvent) => {
        if (!enabled || !zoom) return
        event.preventDefault()
        orbit.zoomBy(camera, event.deltaY > 0 ? 1.1 : 1 / 1.1)
      }

      element.addEventListener('pointerdown', onPointerDown)
      element.addEventListener('pointermove', onPointerMove)
      element.addEventListener('pointerup', onPointerEnd)
      element.addEventListener('pointercancel', onPointerEnd)
      element.addEventListener('pointerleave', onPointerEnd)
      element.addEventListener('wheel', onWheel, { passive: false })
      return () => {
        element.removeEventListener('pointerdown', onPointerDown)
        element.removeEventListener('pointermove', onPointerMove)
        element.removeEventListener('pointerup', onPointerEnd)
        element.removeEventListener('pointercancel', onPointerEnd)
        element.removeEventListener('pointerleave', onPointerEnd)
        element.removeEventListener('wheel', onWheel)
      }
    }, [gl, enabled, zoom, orbit, camera])

    // Priority -1: move the camera BEFORE default-priority frame callbacks —
    // drei's <Html transform> positions the DOM screens in its own useFrame,
    // and if the camera moves after that, the live screens visibly trail the
    // WebGL body by one frame during fast drags.
    useFrame((_, delta) => {
      const step = autoRotate ? tumbleAutoRotateStep(delta, autoRotateSpeed) : 0
      orbit.update(camera, step)
    }, -1)

    return null
  }
)
