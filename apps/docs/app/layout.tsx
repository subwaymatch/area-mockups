import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

// Variable fonts: weights stay flexible for later, while the UI sticks to
// 100-increment stops (200/400/500/600/700/800) for now.
const inter = localFont({
  src: './fonts/InterVariable.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = localFont({
  src: './fonts/JetBrainsMono-Variable.woff2',
  weight: '100 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'area-mockups — interactive 3D device mockups for React',
  description:
    'GPU-accelerated 3D device mockups for React, built on three.js. Drop any content onto the screen of a Galaxy-style 3D phone — it stays fully live and interactive.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
