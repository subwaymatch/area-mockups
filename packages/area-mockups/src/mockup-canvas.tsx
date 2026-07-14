import * as React from 'react'
import { Canvas, useFrame, useThree, type CanvasProps } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

/**
 * react-three-fiber stamps `touch-action: none` on its event target when it
 * connects, which traps page scrolling on touch devices. Pin it to `pan-y`
 * instead: vertical swipes scroll past the mockup, horizontal drags orbit.
 * (Checked per frame because r3f can reconnect and re-stamp.)
 *
 * With `zoom` on, the trade flips: pinch must reach the controls, so the
 * canvas keeps `touch-action: none` — the mockup owns two-finger gestures
 * and vertical page scrolling starts outside it.
 */
function TouchScrollFix({ zoom }: { zoom: boolean }) {
  const get = useThree((state) => state.get)
  const touchAction = zoom ? 'none' : 'pan-y'
  useFrame(() => {
    const connected = get().events.connected as HTMLElement | undefined
    if (connected?.style && connected.style.touchAction !== touchAction) {
      connected.style.touchAction = touchAction
    }
  })
  return null
}

/** Shared look for the overlay control buttons — self-contained, no page CSS. */
const OVERLAY_BUTTON_STYLE: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(22,24,29,0.55)',
  color: '#f2f4f8',
  font: '600 18px/1 system-ui, sans-serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  WebkitBackdropFilter: 'blur(4px)',
  backdropFilter: 'blur(4px)',
  padding: 0,
}

/** Feather-style corner icons for the fullscreen toggle (16px, current color). */
function EnterFullscreenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  )
}

function ExitFullscreenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </svg>
  )
}

export interface MockupCanvasProps {
  /** Your scene — typically a device such as `<Phone>`. */
  children: React.ReactNode
  /** Drag-to-orbit controls. */
  controls?: boolean
  /** Slowly orbit the camera around the device. */
  autoRotate?: boolean
  autoRotateSpeed?: number
  /**
   * Zoom controls: pinch on touch, scroll wheel on desktop, plus overlay
   * +/− buttons. Off by default so an embedded mockup never hijacks page
   * scroll — turning it on gives the canvas the two-finger gesture (vertical
   * page scrolling then starts outside the mockup).
   */
  zoom?: boolean
  /**
   * Full-screen view: adds an overlay button that expands the mockup to fill
   * the whole screen via the Fullscreen API (and collapses it back). Off by
   * default so an embedded mockup never grows a control it wasn't asked for.
   */
  fullscreen?: boolean
  /** Soft contact shadow under the device. */
  shadows?: boolean
  /**
   * Y position (world units) of the contact-shadow plane. The default sits just
   * under the bundled phone (body height 4, centered on the origin), grounding
   * the device on its shadow instead of leaving it floating in mid-air.
   */
  shadowY?: number
  /** Procedural studio lighting + reflections. No HDR downloads — works offline. */
  environment?: boolean
  /** CSS background of the canvas (any CSS color/gradient/image value). */
  background?: string
  /** Override the default camera (position [0, 0.5, 7.4], fov 40). */
  camera?: CanvasProps['camera']
  /** Device-pixel-ratio range; clamped for consistent GPU load on hi-dpi screens. */
  dpr?: CanvasProps['dpr']
  className?: string
  style?: React.CSSProperties
}

/**
 * A ready-made react-three-fiber stage for device mockups: GPU-accelerated
 * WebGL canvas, studio lighting, soft shadows and orbit controls. Compose it
 * with any device model, e.g. `<MockupCanvas><Phone>…</Phone></MockupCanvas>`.
 */
export function MockupCanvas({
  children,
  controls = true,
  autoRotate = false,
  autoRotateSpeed = 1,
  zoom = false,
  fullscreen = false,
  shadows = true,
  shadowY = -2.05,
  environment = true,
  background,
  camera,
  dpr = [1, 2],
  className,
  style,
}: MockupCanvasProps) {
  // Keep the orbit-zoom range sane for whatever camera the mockup configured:
  // a wide stage (billboard, van) must not snap back to a closer maxDistance
  // on the first drag.
  const cameraPosition = (camera as { position?: [number, number, number] } | undefined)?.position
  const cameraDistance = cameraPosition
    ? Math.hypot(cameraPosition[0], cameraPosition[1], cameraPosition[2])
    : 7.4

  // Full-screen view toggles the overlay wrapper into the browser's Fullscreen
  // API. Track the live state so the button flips its icon and label, and so a
  // dark backdrop only appears while actually filling the screen (keeping the
  // transparent-by-default canvas transparent the rest of the time).
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  React.useEffect(() => {
    if (!fullscreen) return
    const doc = document as Document & { webkitFullscreenElement?: Element }
    const onChange = () => {
      const active = doc.fullscreenElement ?? doc.webkitFullscreenElement
      setIsFullscreen(active === wrapperRef.current)
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [fullscreen])

  const toggleFullscreen = () => {
    const el = wrapperRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> | void })
      | null
    if (!el) return
    const doc = document as Document & {
      webkitFullscreenElement?: Element
      webkitExitFullscreen?: () => Promise<void> | void
    }
    const active = doc.fullscreenElement ?? doc.webkitFullscreenElement
    if (active) {
      ;(doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc)
    } else {
      ;(el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el)
    }
  }

  const controlsRef = React.useRef<OrbitControlsImpl>(null)
  const zoomBy = (factor: number) => {
    const c = controlsRef.current
    if (!c) return
    const cam = c.object
    const offset = cam.position.clone().sub(c.target)
    const length = Math.min(Math.max(offset.length() * factor, c.minDistance), c.maxDistance)
    offset.setLength(length)
    cam.position.copy(c.target).add(offset)
    c.update()
  }

  const canvas = (
    <Canvas
      className={className}
      // pan-y keeps pages scrollable on touch: vertical swipes scroll past the
      // mockup, horizontal drags (and mouse) orbit the device. With zoom on,
      // the canvas owns the pinch instead (touch-action none).
      style={{ touchAction: zoom ? 'none' : 'pan-y', background, ...style }}
      dpr={dpr}
      camera={camera ?? { position: [0, 0.5, 7.4], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <TouchScrollFix zoom={zoom} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 8, 6]} intensity={0.6} />

      {environment && (
        <Environment resolution={512}>
          {/* A tiny procedural light studio, rendered once into an env map. */}
          <Lightformer form="rect" intensity={5} position={[0, 6, -9]} scale={[12, 12, 1]} />
          <Lightformer
            form="rect"
            intensity={2.4}
            rotation-y={Math.PI / 2}
            position={[-6, 1, 0]}
            scale={[16, 1.4, 1]}
          />
          <Lightformer
            form="rect"
            intensity={2.4}
            rotation-y={-Math.PI / 2}
            position={[6, 1, 0]}
            scale={[16, 1.4, 1]}
          />
          <Lightformer form="rect" intensity={1.4} position={[0, 3, 9]} scale={[12, 2, 1]} />
          <Lightformer
            form="circle"
            intensity={1.8}
            rotation-x={Math.PI / 2}
            position={[0, 9, 0]}
            scale={[6, 6, 1]}
          />
        </Environment>
      )}

      {children}

      {shadows && (
        <ContactShadows position={[0, shadowY, 0]} opacity={0.45} scale={13} blur={2.6} far={4.5} />
      )}

      {controls && (
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          enableZoom={zoom}
          enableDamping
          dampingFactor={0.08}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          minPolarAngle={0.5}
          maxPolarAngle={Math.PI - 0.5}
          minDistance={Math.min(4, cameraDistance * 0.6)}
          maxDistance={Math.max(12, cameraDistance * 1.35)}
        />
      )}
    </Canvas>
  )

  // Zoom's +/− buttons need the orbit controls to move the camera; the
  // full-screen button is independent. With neither overlay, hand back the
  // bare canvas untouched.
  const showZoomButtons = zoom && controls
  if (!showZoomButtons && !fullscreen) return canvas

  // Wrap so the overlay buttons anchor to the canvas box — and so the
  // Fullscreen API has an element to expand. A dark backdrop fills the letter-
  // boxing only while actually full-screen, using `background` when provided.
  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: isFullscreen ? background ?? '#0b0d12' : undefined,
      }}
    >
      {canvas}
      {fullscreen && (
        <div style={{ position: 'absolute', right: 10, top: 10, zIndex: 30 }}>
          <button
            type="button"
            aria-label={isFullscreen ? 'Exit full screen' : 'View full screen'}
            style={OVERLAY_BUTTON_STYLE}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />}
          </button>
        </div>
      )}
      {showZoomButtons && (
        <div
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            zIndex: 30,
          }}
        >
          <button type="button" aria-label="Zoom in" style={OVERLAY_BUTTON_STYLE} onClick={() => zoomBy(0.8)}>
            +
          </button>
          <button type="button" aria-label="Zoom out" style={OVERLAY_BUTTON_STYLE} onClick={() => zoomBy(1.25)}>
            −
          </button>
        </div>
      )}
    </div>
  )
}
