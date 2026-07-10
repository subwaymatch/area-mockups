/**
 * Poster frame object dimensions.
 *
 * Proportions follow an 18" x 24" (457 x 610 mm) poster in a 22 mm gallery
 * frame with a 30 mm deep profile, normalized to ~140 mm per world unit so
 * the framed poster stands ~4.7 units tall on the default mockup stage.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the poster frame. */
export const POSTER_FRAME_MM = 1 / 140

export const POSTER_FRAME = {
  /** Poster sheet (the live area). Content you pass as children maps onto this rect. */
  poster: { width: 3.264, height: 4.357, radius: 0.004 },
  /** Frame molding: bar width in the frame plane, and profile depth. */
  frame: { width: 0.157, depth: 0.214, radius: 0.02, bevel: 0.012 },
  /** How far the poster sits recessed behind the frame's front lip. */
  recess: 0.05,
  /** Default CSS px width of the virtual poster. */
  resolution: 540,
} as const

/** Poster aspect ratio (height / width). */
export const POSTER_FRAME_ASPECT = POSTER_FRAME.poster.height / POSTER_FRAME.poster.width
