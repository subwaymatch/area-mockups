import * as React from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

/**
 * Gentle idle float shared by the device mockups. Runs its animation at frame
 * priority -2 — before the orbit controls (-1) and before drei's `<Html>`
 * screen sync (0) — so the DOM screen is positioned from this frame's device
 * pose and never trails the WebGL body.
 */
export function FloatGroup({
  children,
  intensity = 1,
}: {
  children: React.ReactNode
  /** Scales rotation and bob amplitudes (1 = phone-sized default). */
  intensity?: number
}) {
  const ref = React.useRef<Group>(null!)
  // Random phase so multiple mockups on one page don't bob in unison.
  const [phase] = React.useState(() => Math.random() * Math.PI * 2)
  useFrame(({ clock }) => {
    const t = phase + clock.elapsedTime * 0.4
    const group = ref.current
    group.rotation.x = Math.cos(t) * 0.025 * intensity
    group.rotation.y = Math.sin(t) * 0.025 * intensity
    group.rotation.z = Math.sin(t) * 0.01 * intensity
    group.position.y = Math.sin(t) * 0.05 * intensity
  }, -2)
  return <group ref={ref}>{children}</group>
}
