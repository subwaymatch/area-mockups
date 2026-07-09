import type { Metadata } from 'next'
import { EmbeddedScreen } from '@/components/screens/embedded-screen'

export const metadata: Metadata = {
  title: 'Embedded — area-mockups',
  robots: { index: false },
}

// A minimal standalone route (no site chrome) designed to be iframed into a
// device screen — see the “Embed a whole page” demo.
export default function EmbeddedPage() {
  return <EmbeddedScreen />
}
