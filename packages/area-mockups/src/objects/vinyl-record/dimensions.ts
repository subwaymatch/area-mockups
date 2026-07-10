/**
 * Vinyl record object dimensions — a 12" LP half-out of its sleeve.
 *
 * Proportions follow the real thing: a 313 mm square jacket ~4 mm thick, and
 * a 302 mm disc with a 100 mm center label, peeking out of the sleeve far enough to show the whole label. Normalized to ~92 mm per world unit so the jacket is 3.4
 * units square. The disc label is a live circular DOM area (like the round
 * Galaxy Watch face); the cover and back are live too.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the vinyl record. */
export const VINYL_RECORD_MM = 1 / 92

export const VINYL_RECORD = {
  /** Square jacket. `radius` softens the corners a hair. */
  sleeve: { size: 3.402, thickness: 0.043, radius: 0.01 },
  /** The disc: vinyl radius, thickness, and the label/dead-wax radii. */
  disc: { radius: 1.641, thickness: 0.022, labelRadius: 0.543, deadWaxRadius: 0.62 },
  /** Fraction of the disc exposed past the sleeve edge (~62% shows the whole label). */
  discPeek: 0.62,
  /** Default CSS px width of the virtual cover; the label shares its dpi. */
  resolution: 520,
} as const

/** Cover aspect ratio (height / width) — square. */
export const VINYL_RECORD_ASPECT = 1
