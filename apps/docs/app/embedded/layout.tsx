import { inter, jetbrainsMono } from '@/lib/fonts'
import '../globals.css'
import '../screens.css'

// Root layout for the standalone /embedded route (iframed into device
// screens). No site chrome, but it shares the site stylesheet and fonts.
export default function EmbeddedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
