'use client'

import dynamic from 'next/dynamic'

// WebGL only exists in the browser, so skip SSR for the scene itself.
const Scene = dynamic(() => import('./hero-phone-scene'), {
  ssr: false,
  loading: () => <div className="mockup-loading">Warming up the GPU…</div>,
})

export function HeroPhone() {
  return <Scene />
}
