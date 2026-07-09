/**
 * iPhone device dimensions.
 *
 * Proportions follow the Apple iPhone 17 (149.6 x 71.5 x 7.95 mm body, 6.3"
 * 2622x1206 display, Dynamic Island, flat aluminum frame) and are normalized
 * so the display is exactly 1.8 wide (~37.2 mm per unit); the taller panel
 * (2622:1206, the 402x874-pt logical grid) makes it 3.9134 world units high.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */
export const IPHONE = {
  /** Flat aluminum frame + chassis. `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: 1.925, height: 4.027, depth: 0.214, radius: 0.38, bevel: 0.02 },
  /** Front cover glass (slightly larger than the active display — forms the bezel ring). */
  glass: { width: 1.865, height: 3.967, radius: 0.35 },
  /** Active display area. Content you pass as children is mapped onto this rect. */
  display: { width: 1.8, height: 3.9134, radius: 0.32 },
  /**
   * Dynamic Island pill: size + distance from the top display edge to its
   * center. Fully rounded (radius = height / 2).
   */
  island: { width: 0.56, height: 0.17, offsetY: 0.225 },
} as const

/** Display aspect ratio (height / width) — the 6.3" 2622x1206 panel. */
export const IPHONE_DISPLAY_ASPECT = IPHONE.display.height / IPHONE.display.width
