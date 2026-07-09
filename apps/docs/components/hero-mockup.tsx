'use client'

import dynamic from 'next/dynamic'

// WebGL only exists in the browser — skip SSR for the scene itself.
const HeroScene = dynamic(() => import('./scenes/hero-scene'), {
  ssr: false,
  loading: () => <div className="mockup-loading">Warming up the GPU…</div>,
})

export function HeroMockup() {
  return <HeroScene />
}
