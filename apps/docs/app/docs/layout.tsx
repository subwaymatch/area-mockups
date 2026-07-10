import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { source } from '@/lib/source'
import { baseOptions } from '@/lib/layout.shared'
import { inter, jetbrainsMono } from '@/lib/fonts'
import './docs.css'

export const metadata: Metadata = {
  title: {
    template: '%s | area-mockups',
    default: 'Documentation | area-mockups',
  },
  description: 'Installation, usage guides and API reference for area-mockups.',
}

// Root layout for the documentation. It is deliberately separate from the
// site root layout: the docs use Fumadocs UI on Tailwind, the site keeps its
// own stylesheet, and neither can leak resets into the other.
export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  )
}
