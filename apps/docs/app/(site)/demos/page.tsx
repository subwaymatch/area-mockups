import type { Metadata } from 'next'
import { DemoGallery } from '@/components/demo-gallery'

export const metadata: Metadata = {
  title: 'Demos | area-mockups',
  description: 'Live, interactive demos of area-mockups 3D device mockups.',
}

export default function DemosPage() {
  return (
    <div className="container page">
      <header className="page-header">
        <h1>Demos</h1>
        <p>
          Every mockup below is a live WebGL scene, and every surface is real DOM — device
          screens, book covers, brochure panels, even the van wrap. Drag the models, click
          the buttons, scroll the iframe.
        </p>
      </header>
      <DemoGallery />
    </div>
  )
}
