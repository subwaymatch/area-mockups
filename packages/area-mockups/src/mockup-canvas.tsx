import * as React from 'react'
import { Canvas, useFrame, useThree, type CanvasProps } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'

/**
 * react-three-fiber stamps `touch-action: none` on its event target when it
 * connects, which traps page scrolling on touch devices. Pin it to `pan-y`
 * instead: vertical swipes scroll past the mockup, horizontal drags orbit.
 * (Checked per frame because r3f can reconnect and re-stamp.)
 */
function TouchScrollFix() {
  const get = useThree((state) => state.get)
  useFrame(() => {
    const connected = get().events.connected as HTMLElement | undefined
    if (connected?.style && connected.style.touchAction !== 'pan-y') {
      connected.style.touchAction = 'pan-y'
    }
  })
  return null
}

export interface MockupCanvasProps {
  /** Your scene — typically a device such as `<Phone>`. */
  children: React.ReactNode
  /** Drag-to-orbit controls. */
  controls?: boolean
  /** Slowly orbit the camera around the device. */
  autoRotate?: boolean
  autoRotateSpeed?: number
  /** Scroll / pinch zoom. Off by default so an embedded mockup never hijacks page scroll. */
  zoom?: boolean
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
  shadows = true,
  shadowY = -2.05,
  environment = true,
  background,
  camera,
  dpr = [1, 2],
  className,
  style,
}: MockupCanvasProps) {
  return (
    <Canvas
      className={className}
      // pan-y keeps pages scrollable on touch: vertical swipes scroll past the
      // mockup, horizontal drags (and mouse) orbit the device.
      style={{ touchAction: 'pan-y', background, ...style }}
      dpr={dpr}
      camera={camera ?? { position: [0, 0.5, 7.4], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <TouchScrollFix />
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 8, 6]} intensity={0.6} />

      {environment && (
        <Environment resolution={256}>
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
          makeDefault
          enablePan={false}
          enableZoom={zoom}
          enableDamping
          dampingFactor={0.08}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          minPolarAngle={0.5}
          maxPolarAngle={Math.PI - 0.5}
          minDistance={4}
          maxDistance={12}
        />
      )}
    </Canvas>
  )
}
