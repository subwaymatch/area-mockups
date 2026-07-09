import * as React from 'react'
import { Canvas, type CanvasProps } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'

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
      style={{ touchAction: 'none', background, ...style }}
      dpr={dpr}
      camera={camera ?? { position: [0, 0.5, 7.4], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
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
        <ContactShadows position={[0, -2.5, 0]} opacity={0.45} scale={13} blur={2.6} far={4.5} />
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
