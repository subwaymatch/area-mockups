import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

/** Shared options for the Fumadocs layouts under /docs. */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: 'linear-gradient(135deg, #7c9cff, #4ed0c2)',
              display: 'inline-block',
            }}
          />
          area-mockups
        </>
      ),
    },
    githubUrl: 'https://github.com/subwaymatch/area-mockups',
    links: [
      { text: 'Home', url: '/' },
      { text: 'Demos', url: '/demos' },
    ],
  }
}
