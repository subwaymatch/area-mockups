/**
 * Tablet device dimensions.
 *
 * Proportions follow the Apple iPad Pro 13" (M5, 2025 — the M4 chassis
 * unchanged: 281.6 x 215.5 x 5.1 mm, 13" 2752x2064 tandem-OLED Ultra Retina
 * XDR, uniform thin bezels, single-lens camera pod top-left of the back,
 * landscape-edge front camera) normalized to ~64 mm per world unit, so the
 * portrait body is 4.4 units tall.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */
export const TABLET = {
  /** Ultra-thin flat slab. `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: 3.367, height: 4.4, depth: 0.08, radius: 0.22, bevel: 0.01 },
  /** Front cover glass (slightly larger than the active display — forms the bezel ring). */
  glass: { width: 3.31, height: 4.343, radius: 0.2 },
  /** Active display area (portrait). Content you pass as children maps onto this rect. */
  display: { width: 3.095, height: 4.128, radius: 0.17 },
  /** Default CSS px width of the portrait virtual display (the 1032x1376-pt logical grid). */
  resolution: 1032,
  /** Rear camera pod: rounded square, top-left viewed from the back (front-view mirrored). */
  cameraPod: { x: 3.367 / 2 - 0.36, y: 4.4 / 2 - 0.36, size: 0.42, radius: 0.13 },
} as const

/** Display aspect ratio (height / width) — the 4:3-class 2752x2064 panel. */
export const TABLET_DISPLAY_ASPECT = TABLET.display.height / TABLET.display.width
