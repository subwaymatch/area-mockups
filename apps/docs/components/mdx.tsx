import defaultMdxComponents from 'fumadocs-ui/mdx'
import { Card, Cards } from 'fumadocs-ui/components/card'
import type { MDXComponents } from 'mdx/types'
import { ObjectDemo } from './object-examples'

// The cast bridges a structural mismatch between fumadocs-ui's component map
// and @types/mdx under our @types/react version; the shapes agree at runtime.
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Card,
    Cards,
    ObjectDemo,
    ...components,
  } as unknown as MDXComponents
}

export const useMDXComponents = getMDXComponents
