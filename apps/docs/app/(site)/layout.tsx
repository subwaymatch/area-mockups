import Link from 'next/link'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand">
            <span className="brand-dot" aria-hidden />
            area-mockups
          </Link>
          <nav className="site-nav">
            <Link href="/docs">Docs</Link>
            <Link href="/demos">Demos</Link>
            <a
              href="https://github.com/subwaymatch/area-mockups"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <span>
            MIT © {new Date().getFullYear()} subwaymatch · built with three.js &
            react-three-fiber
          </span>
          <a href="https://github.com/subwaymatch/area-mockups" target="_blank" rel="noreferrer">
            github.com/subwaymatch/area-mockups
          </a>
        </div>
      </footer>
    </div>
  )
}
