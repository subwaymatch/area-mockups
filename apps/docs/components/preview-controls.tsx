'use client'

import * as React from 'react'

/**
 * Every live preview on this docs site gets zoom + full-screen controls and a
 * 360°-rotation toggle, even though the library ships all of them off by
 * default. Rather than hand-editing the ~130 demo instances, we inject the
 * props here at the single point where a scene is mounted.
 *
 * The rotation toggle is docs-only UI: it flips the library's `freeRotation`
 * prop (limited classic orbit by default; full 360° tumble when pressed) and
 * is NOT part of the rendered npm components.
 */

/** Inject props into the first mockup component found (recursing through DOM wrappers). */
function injectProps(node: React.ReactNode, props: Record<string, unknown>): React.ReactNode {
  if (!React.isValidElement(node)) return node

  // A plain DOM element (string type) is a layout wrapper, not a mockup — it
  // wouldn't accept these props. Recurse into its children instead.
  if (typeof node.type === 'string') {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    return React.cloneElement(
      el,
      undefined,
      React.Children.map(el.props.children, (child) => injectProps(child, props)),
    )
  }

  // A mockup or MockupCanvas component: it accepts these via MockupCanvasProps.
  return React.cloneElement(node as React.ReactElement<Record<string, unknown>>, props)
}

function PreviewControls({ children }: { children: React.ReactNode }) {
  const [freeRotation, setFreeRotation] = React.useState(false)
  return (
    <>
      {injectProps(children, { zoom: true, fullscreen: true, freeRotation })}
      <button
        type="button"
        aria-pressed={freeRotation}
        title={
          freeRotation
            ? 'Free rotation: drag over the top and bottom too'
            : 'Limited rotation: vertical drags stay clamped'
        }
        onClick={() => setFreeRotation((value) => !value)}
        style={{
          position: 'absolute',
          left: 10,
          bottom: 10,
          zIndex: 30,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          borderRadius: 999,
          border: '1px solid rgba(148, 158, 176, 0.35)',
          background: freeRotation ? 'rgba(84, 106, 255, 0.28)' : 'rgba(16, 18, 22, 0.55)',
          color: freeRotation ? '#dfe5ff' : '#aab2c0',
          font: '600 11px/1 var(--font-mono, monospace)',
          letterSpacing: '0.04em',
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
        360°
      </button>
    </>
  )
}

/** Wrap a demo scene with the shared docs preview controls. */
export function withPreviewControls(node: React.ReactNode): React.ReactNode {
  return <PreviewControls>{node}</PreviewControls>
}
