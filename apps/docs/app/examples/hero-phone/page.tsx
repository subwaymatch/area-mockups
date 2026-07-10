import type { Metadata } from 'next'
import Link from 'next/link'
import { HeroPhone } from './hero-phone-client'

export const metadata: Metadata = {
  title: 'Stride — hero phone example | area-mockups',
  description:
    'An isolated example page: a huge, absolutely positioned 3D phone showcasing an app, built with area-mockups.',
}

/**
 * A complete, isolated product-hero example: fictional app landing page,
 * giant phone bleeding off the hero. The layout technique is the point —
 * see `.xh-phone` in hero-phone.css for the absolute positioning and
 * hero-phone-scene.tsx for the camera that makes the device huge.
 */
export default function HeroPhoneExamplePage() {
  return (
    <main className="xh">
      <div className="xh-glow" aria-hidden />

      <header className="xh-top">
        <span className="xh-brand">
          <span className="xh-brand-mark" aria-hidden />
          Stride
        </span>
        <Link className="xh-badge" href="/">
          example · built with area-mockups
        </Link>
      </header>

      <section className="xh-copy">
        <p className="xh-eyebrow">New · iOS &amp; Android</p>
        <h1>
          Every step,
          <br />
          <span className="xh-grad">beautifully counted.</span>
        </h1>
        <p className="xh-lede">
          Stride turns daily walks into rings, streaks and gentle nudges. No ads, no
          subscriptions — just you, the sidewalk and a goal worth chasing.
        </p>
        <div className="xh-actions">
          <button type="button" className="xh-btn">
            Get the app
          </button>
          <Link className="xh-link" href="/docs">
            Read the area-mockups docs →
          </Link>
        </div>
        <p className="xh-hint">
          The phone is a live WebGL mockup — drag it around, log a walk on its screen,
          tap the week chart.
        </p>
      </section>

      <div className="xh-phone">
        <HeroPhone />
      </div>
    </main>
  )
}
