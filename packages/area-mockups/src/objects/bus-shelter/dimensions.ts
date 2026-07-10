/**
 * Bus shelter object dimensions — a glass transit shelter with a backlit
 * 6-sheet advertising lightbox.
 *
 * Proportions follow the JCDecaux-class street shelter: ~4.3 m wide, 2.5 m
 * tall, 1.45 m deep — flat roof slab on slim posts, full-width glass back
 * wall, a bench, and the 6-sheet lightbox (1185 x 1750 mm poster) standing
 * as the end panel. Normalized to ~700 mm per world unit so the shelter
 * stands 3.57 units tall. The poster is live DOM on both faces of the
 * lightbox.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the bus shelter. */
export const BUS_SHELTER_MM = 1 / 700

export const BUS_SHELTER = {
  /** Overall envelope: width (x), height (y), depth (z). */
  body: { width: 6.14, height: 3.57, depth: 2.07 },
  /** Flat roof slab with a small overhang. */
  roof: { width: 6.4, thickness: 0.16, depth: 2.25 },
  /** Full-width glass back wall. */
  backGlass: { width: 5.9, height: 3.3, thickness: 0.035 },
  /** Slim steel posts holding the roof at the open corners. */
  post: { radius: 0.055 },
  /** Bench slab inside, along the back wall. */
  bench: { width: 3.4, depth: 0.54, thickness: 0.07, height: 0.64, x: -1.1 },
  /** 6-sheet lightbox standing as the end panel (faces along the sidewalk). */
  lightbox: { width: 1.9, height: 3.15, depth: 0.36, x: 6.14 / 2 - 0.18 },
  /** The 6-sheet poster (1185 x 1750 mm), live on both lightbox faces. */
  poster: { width: 1.693, height: 2.5, radius: 0.01 },
  /** Distance from the envelope center down to the pavement. */
  standHeight: 3.57 / 2,
  /** Default CSS px width of the virtual poster. */
  resolution: 480,
} as const

/** Poster aspect ratio (height / width) — the 6-sheet. */
export const BUS_SHELTER_POSTER_ASPECT = BUS_SHELTER.poster.height / BUS_SHELTER.poster.width
