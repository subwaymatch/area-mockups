/**
 * Roll-up banner object dimensions — the 850 x 2000 mm retractable
 * trade-show banner stand.
 *
 * Normalized to ~540 mm per world unit so the standing unit is ~4 units
 * tall: a floor-sitting oval-section aluminum cassette (~350 mm deep,
 * ~90 mm tall) with end caps, a rear support pole, a clamp rail across the
 * top edge, and the graphic rising out of the cassette slot. The group
 * origin is the graphic center; the floor is `standHeight` below it.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the roll-up banner. */
export const ROLLUP_BANNER_MM = 1 / 540

export const ROLLUP_BANNER = {
  /** Visible graphic (the live area). Content you pass as children maps onto this rect. */
  graphic: { width: 1.574, height: 3.704, radius: 0.006 },
  /** Aluminum cassette base: an oval-section extrusion flat on the floor, with end caps. */
  cassette: { width: 1.667, depth: 0.648, height: 0.167 },
  /** Rear support pole and the top clamp rail. */
  pole: { radius: 0.022 },
  rail: { height: 0.055, depth: 0.05 },
  /** Distance from the graphic center down to the floor. */
  standHeight: 3.704 / 2 + 0.16,
  /** Default CSS px width of the virtual graphic. */
  resolution: 420,
} as const

/** Graphic aspect ratio (height / width). */
export const ROLLUP_BANNER_ASPECT = ROLLUP_BANNER.graphic.height / ROLLUP_BANNER.graphic.width
