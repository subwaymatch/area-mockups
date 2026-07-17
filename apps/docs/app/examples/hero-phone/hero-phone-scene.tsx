'use client'

import { PhoneMockup } from 'area-mockups'
import { StrideApp } from '@/components/screens/stride-app'

/**
 * The huge hero phone. The wrapper (`.xh-phone`) is a 128vh absolutely
 * positioned box that bleeds past the hero section's edges; the section's
 * `overflow: clip` does the cropping. The camera (fov 38 at z 6.6) makes the
 * device span ~88% of that canvas — about 113vh on screen, taller than any
 * viewport — while leaving enough horizontal head-room that the float
 * animation never clips against the canvas sides.
 */
export default function HeroPhoneScene() {
  return (
    <PhoneMockup
      variant="s26ultra"
      float
      camera={{ position: [0, 0.1, 6.6], fov: 38 }}
      shadows={false}
      color="#12151c"
      frameColor="#565b64"
      screenBackground="#070a0f"
      deviceProps={{ rotation: [0, -0.3, 0] }}
    >
      <StrideApp />
    </PhoneMockup>
  )
}
