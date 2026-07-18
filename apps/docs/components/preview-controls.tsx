'use client'

import * as React from 'react'
import {
  FlipMockup,
  FoldMockup,
  IPhoneMockup,
  LaptopMockup,
  MockupCanvas,
  MonitorMockup,
  PhoneMockup,
  TabletMockup,
  WatchMockup,
  FLIP_COLORWAYS,
  FOLD_COLORWAYS,
  GALAXY_COLORWAYS,
  IPHONE_COLORWAYS,
  LAPTOP_COLORWAYS,
  MONITOR_COLORWAYS,
  TABLET_COLORWAYS,
  WATCH_COLORWAYS,
  type Colorway,
} from 'area-mockups'

/**
 * Every live preview on this docs site gets zoom + full-screen controls, a
 * 360°-rotation toggle and (for single-device demos) a retail-colorway
 * dropdown, even though the library ships all of them off/unset by default.
 * Rather than hand-editing the ~130 demo instances, we inject the props here
 * at the single point where a scene is mounted.
 *
 * The toggle and dropdown are docs-only UI: they flip the library's
 * `freeRotation` / `colorway` props and are NOT part of the npm components.
 */

/** Find the mockup element the controls will drive (recursing through DOM wrappers). */
function findMockup(node: React.ReactNode): React.ReactElement | null {
  if (!React.isValidElement(node)) return null
  if (typeof node.type === 'string') {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    const children = React.Children.toArray(el.props.children)
    for (const child of children) {
      const found = findMockup(child)
      if (found) return found
    }
    return null
  }
  return node
}

/** Inject props into the first mockup component found (recursing through DOM wrappers). */
function injectProps(node: React.ReactNode, props: Record<string, unknown>): React.ReactNode {
  if (!React.isValidElement(node)) return node
  if (typeof node.type === 'string') {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    return React.cloneElement(
      el,
      undefined,
      React.Children.map(el.props.children, (child) => injectProps(child, props)),
    )
  }
  return React.cloneElement(node as React.ReactElement<Record<string, unknown>>, props)
}

/** The retail colorway catalog for a mockup element, or undefined (composed scenes). */
function catalogFor(el: React.ReactElement): Colorway[] | undefined {
  const props = el.props as { variant?: string }
  switch (el.type) {
    case PhoneMockup:
      return GALAXY_COLORWAYS[(props.variant ?? 's26') as keyof typeof GALAXY_COLORWAYS]
    case IPhoneMockup:
      return IPHONE_COLORWAYS[(props.variant ?? '17') as keyof typeof IPHONE_COLORWAYS]
    case FoldMockup:
      return FOLD_COLORWAYS.fold7
    case FlipMockup:
      return FLIP_COLORWAYS.flip7
    case LaptopMockup:
      return LAPTOP_COLORWAYS[(props.variant ?? 'air13') as keyof typeof LAPTOP_COLORWAYS]
    case TabletMockup:
      return TABLET_COLORWAYS[(props.variant ?? 'ipadpro13') as keyof typeof TABLET_COLORWAYS]
    case WatchMockup:
      return WATCH_COLORWAYS[(props.variant ?? 'series11') as keyof typeof WATCH_COLORWAYS]
    case MonitorMockup:
      return MONITOR_COLORWAYS
    case MockupCanvas:
    default:
      return undefined
  }
}

const CONTROL_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 10px',
  borderRadius: 999,
  border: '1px solid rgba(148, 158, 176, 0.35)',
  background: 'rgba(16, 18, 22, 0.55)',
  color: '#aab2c0',
  font: '600 11px/1 var(--font-mono, monospace)',
  letterSpacing: '0.04em',
  cursor: 'pointer',
  backdropFilter: 'blur(6px)',
}

function PreviewControls({ children }: { children: React.ReactNode }) {
  const [freeRotation, setFreeRotation] = React.useState(false)
  const [colorwayId, setColorwayId] = React.useState('')

  const mockup = React.useMemo(() => findMockup(children), [children])
  const catalog = mockup ? catalogFor(mockup) : undefined

  const injected: Record<string, unknown> = { zoom: true, fullscreen: true, freeRotation }
  if (colorwayId) {
    // A picked colorway must beat the demo's hardcoded colors.
    injected.colorway = colorwayId
    injected.color = undefined
    injected.frameColor = undefined
  }

  return (
    <>
      {injectProps(children, injected)}
      <div style={{ position: 'absolute', left: 10, bottom: 10, zIndex: 30, display: 'flex', gap: 6 }}>
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
            ...CONTROL_STYLE,
            background: freeRotation ? 'rgba(84, 106, 255, 0.28)' : CONTROL_STYLE.background,
            color: freeRotation ? '#dfe5ff' : CONTROL_STYLE.color,
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
        {catalog && catalog.length > 1 && (
          <select
            aria-label="Colorway"
            value={colorwayId}
            onChange={(event) => setColorwayId(event.target.value)}
            style={{ ...CONTROL_STYLE, appearance: 'none', paddingRight: 14 }}
          >
            <option value="">colorway…</option>
            {catalog.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>
    </>
  )
}

/** Wrap a demo scene with the shared docs preview controls. */
export function withPreviewControls(node: React.ReactNode): React.ReactNode {
  return <PreviewControls>{node}</PreviewControls>
}
