/**
 * Roll-up banner object dimensions — the 850 x 2000 mm retractable
 * trade-show banner stand.
 *
 * Normalized to ~540 mm per world unit so the standing unit is ~4 units
 * tall: an aluminum cassette base with rounded ends and swivel feet, a rear
 * support pole, a clamp rail across the top edge, and the graphic rising out
 * of the cassette slot. The group origin is the graphic center; the floor is
 * `standHeight` below it.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the roll-up banner. */
export const ROLLUP_BANNER_MM = 1 / 540

export const ROLLUP_BANNER = {
  /** Visible graphic (the live area). Content you pass as children maps onto this rect. */
  graphic: { width: 1.574, height: 3.704, radius: 0.006 },
  /** Aluminum cassette base: a horizontal rounded body with end caps. */
  cassette: { width: 1.667, radius: 0.1, depth: 0.24 },
  /** Swivel feet under the cassette: length (front-back), width, thickness. */
  feet: { length: 0.5, width: 0.09, thickness: 0.035, offsetX: 0.62 },
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
