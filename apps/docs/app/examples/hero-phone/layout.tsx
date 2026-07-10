import { inter, jetbrainsMono } from '@/lib/fonts'
import '../../globals.css'
import '../../screens.css'
import './hero-phone.css'

// Root layout for the standalone /examples/hero-phone route. Like /embedded,
// it carries no site chrome: the page is a self-contained product-hero
// example, sharing only the site stylesheet and fonts.
export default function HeroPhoneExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
