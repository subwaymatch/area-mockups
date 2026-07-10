import localFont from 'next/font/local'

// Variable fonts shared by every root layout (site, docs, embedded). Weights
// stay flexible for later, while the UI sticks to 100-increment stops.
export const inter = localFont({
  src: '../app/fonts/InterVariable.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
})

export const jetbrainsMono = localFont({
  src: '../app/fonts/JetBrainsMono-Variable.woff2',
  weight: '100 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-jetbrains-mono',
})
