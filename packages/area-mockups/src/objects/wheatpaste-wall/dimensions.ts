/**
 * Wheatpaste wall object dimensions — a brick wall with pasted posters.
 *
 * A ~4.5 x 3.0 m section of city brick wall carrying up to three overlapping
 * wheatpasted one-sheet posters (~1200 x 1700 mm), each at a slight accident
 * of rotation, flush against the brick the way paste lays them. Normalized
 * to ~700 mm per world unit so the wall section is 6.43 units wide.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the wheatpaste wall. */
export const WHEATPASTE_WALL_MM = 1 / 700

export const WHEATPASTE_WALL = {
  /** Brick wall section: width (x), height (y), depth (z). */
  wall: { width: 6.43, height: 4.29, depth: 0.3 },
  /** Mortar course spacing (visual brick rows). */
  course: 0.214,
  /** One pasted poster. Content maps onto this rect per slot. */
  poster: { width: 1.714, height: 2.429, radius: 0.004 },
  /** The three paste-up slots: position, rotation, and stacking order. */
  slots: [
    { x: -1.85, y: 0.12, tilt: 0.03 },
    { x: 0.35, y: -0.18, tilt: -0.028 },
    { x: 2.35, y: 0.28, tilt: 0.014 },
  ],
  /** Default CSS px width of one virtual poster. */
  resolution: 440,
} as const

/** Poster aspect ratio (height / width). */
export const WHEATPASTE_WALL_ASPECT = WHEATPASTE_WALL.poster.height / WHEATPASTE_WALL.poster.width
