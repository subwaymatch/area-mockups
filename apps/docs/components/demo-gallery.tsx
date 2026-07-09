'use client'

import dynamic from 'next/dynamic'

const DemoScenes = dynamic(() => import('./scenes/demo-scenes'), {
  ssr: false,
  loading: () => <div className="mockup-loading">Loading demos…</div>,
})

export function DemoGallery() {
  return <DemoScenes />
}
