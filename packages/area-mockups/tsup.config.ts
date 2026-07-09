import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  // Components use hooks and WebGL, so the bundle is a client module for RSC frameworks.
  banner: { js: "'use client';" },
  external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
})
