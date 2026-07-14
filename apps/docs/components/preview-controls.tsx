import * as React from 'react'

/**
 * Every live preview on this docs site gets zoom + full-screen controls, even
 * though the library ships both off by default. Rather than hand-editing the
 * ~130 demo instances, we inject `zoom`/`fullscreen` here at the single point
 * where a scene is mounted.
 *
 * The injection lands on the first mockup component it reaches: DOM wrappers
 * (e.g. the `alpha-checker` div behind the transparency demo) are recursed
 * through so the props never end up as stray HTML attributes, and once a
 * mockup/canvas component is found we stop — its screen-content children are
 * left alone.
 */
export function withPreviewControls(node: React.ReactNode): React.ReactNode {
  if (!React.isValidElement(node)) return node

  // A plain DOM element (string type) is a layout wrapper, not a mockup — it
  // wouldn't accept these props. Recurse into its children instead.
  if (typeof node.type === 'string') {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    return React.cloneElement(
      el,
      undefined,
      React.Children.map(el.props.children, withPreviewControls),
    )
  }

  // A mockup or MockupCanvas component: it accepts both props via
  // MockupCanvasProps, so enable them and stop descending.
  return React.cloneElement(node as React.ReactElement<Record<string, unknown>>, {
    zoom: true,
    fullscreen: true,
  })
}
