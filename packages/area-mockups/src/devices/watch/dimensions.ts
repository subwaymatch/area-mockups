/**
 * Watch device dimensions.
 *
 * Proportions follow the Apple Watch Series 11, 46 mm case (46 x 39 x 9.7 mm,
 * ~1.96" 416x496 always-on wide-angle OLED with heavily rounded corners,
 * Digital Crown + flush side button on the right edge, 24 mm lug slots)
 * normalized to ~17.7 mm per world unit, so the case is 2.6 units tall.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */
export const WATCH = {
  /** Squircle case. `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: 2.203, height: 2.6, depth: 0.42, radius: 0.88, bevel: 0.1 },
  /** Cover crystal (slightly larger than the active display). */
  glass: { width: 2.02, height: 2.38, radius: 0.72 },
  /** Active display area. Content you pass as children maps onto this rect. */
  display: { width: 1.808, height: 2.158, radius: 0.62 },
  /** Default CSS px width of the virtual display (the 208x248-pt logical grid). */
  resolution: 208,
  /** Digital Crown + side button on the right edge. */
  crown: { y: 0.5, radius: 0.15, thickness: 0.1 },
  sideButton: { y: -0.18, length: 0.52 },
  /** Band: Sport-Band-style straps sliding into the hidden 24 mm lug slots. */
  band: { width: 1.32, length: 1.35, thickness: 0.13 },
} as const

/** Display aspect ratio (height / width) — the 416x496 panel. */
export const WATCH_DISPLAY_ASPECT = WATCH.display.height / WATCH.display.width
