/**
 * TV object dimensions — a 65" flat-screen on blade feet.
 *
 * Proportions follow the current 65" class: a 1448 x 830 mm 16:9 panel in a
 * near-bezel-less enclosure (~8 mm frame), thin at the edges with a shallow
 * electronics bulge low on the back, standing on two splayed blade feet near
 * the ends. Normalized to ~258 mm per world unit so the panel is 5.6 units
 * wide. The origin is the panel center; the media stand plane is
 * `standHeight` below it.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the TV. */
export const TV_MM = 1 / 258

export const TV = {
  /**
   * Enclosure (glass face). `radius` is the corner radius, `bevel` the edge
   * rounding. The body is taller than the display band by a ~14 mm bottom
   * chin (vs ~8 mm sides), so it sits `centerY` below the panel center.
   */
  body: { width: 5.671, height: 3.302, depth: 0.11, radius: 0.03, bevel: 0.012, centerY: -0.0115 },
  /** Active display area. Content you pass as children maps onto this rect. */
  display: { width: 5.612, height: 3.217, radius: 0.008 },
  /** Wide, shallow electronics bulge low on the back. */
  backBulge: { width: 5.2, height: 1.9, depth: 0.14 },
  /** Two splayed blade feet near the ends. */
  feet: { offsetX: 2.2, length: 1.05, height: 0.28, thickness: 0.055 },
  /** Distance from panel center down to the media-stand plane. */
  standHeight: 3.302 / 2 + 0.0115 + 0.28,
  /** Default CSS px width of the virtual display (the 1920x1080 logical grid). */
  resolution: 1920,
} as const

/** Display aspect ratio (height / width) — the 16:9 panel. */
export const TV_DISPLAY_ASPECT = TV.display.height / TV.display.width
