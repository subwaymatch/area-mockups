/**
 * Phone device dimensions.
 *
 * Proportions follow the Samsung Galaxy S25 (146.9 x 70.5 x 7.2 mm body,
 * 6.2" 19.5:9 flat display, centered punch-hole camera) and are normalized so
 * the display is exactly 1.8 x 3.9 world units (~36.7 mm per unit).
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */
export const PHONE = {
  /** Aluminum frame + chassis. `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: 1.92, height: 4.0, depth: 0.196, radius: 0.26, bevel: 0.02 },
  /** Front cover glass (slightly larger than the active display — forms the bezel ring). */
  glass: { width: 1.86, height: 3.96, radius: 0.23 },
  /** Active display area. Content you pass as children is mapped onto this rect. */
  display: { width: 1.8, height: 3.9, radius: 0.21 },
  /** Front camera punch hole: circle radius + distance from the top display edge to its center. */
  punchHole: { radius: 0.05, offsetY: 0.12 },
} as const

/** Display aspect ratio (height / width) — a 19.5:9 panel. */
export const PHONE_DISPLAY_ASPECT = PHONE.display.height / PHONE.display.width
