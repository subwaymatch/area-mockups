// Measures the tree-shaken cost of importing each device mockup:
// esbuild-bundles a one-line entry per component (peers external), minified,
// and reports raw + gzip sizes. Run from packages/area-mockups:
//   node scripts/measure-size.mjs
import { build } from 'esbuild'
import { gzipSync } from 'node:zlib'

const ENTRIES = {
  'PhoneMockup (Galaxy family)': "export { PhoneMockup } from './src/index'",
  'IPhoneMockup (iPhone family)': "export { IPhoneMockup } from './src/index'",
  'LaptopMockup (MacBook Air)': "export { LaptopMockup } from './src/index'",
  'everything (full library)': "export * from './src/index'",
}

for (const [name, contents] of Object.entries(ENTRIES)) {
  const result = await build({
    stdin: { contents, resolveDir: process.cwd(), loader: 'ts' },
    bundle: true,
    minify: true,
    write: false,
    format: 'esm',
    target: 'es2022',
    external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
    jsx: 'automatic',
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
  })
  const bytes = result.outputFiles[0].contents
  const gz = gzipSync(bytes).length
  console.log(`${name}: ${(bytes.length / 1024).toFixed(1)} KB min / ${(gz / 1024).toFixed(1)} KB gzip`)
}
