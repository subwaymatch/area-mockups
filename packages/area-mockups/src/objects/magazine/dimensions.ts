/**
 * Magazine object dimensions — a perfect-bound glossy monthly.
 *
 * Proportions follow a standard US letter-trim magazine: 216 x 279 mm with a
 * ~6 mm perfect-bound page block (roughly a 100-page issue), normalized to
 * ~66 mm per world unit so the magazine stands 4.23 units tall on the default
 * mockup stage.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the magazine. */
export const MAGAZINE_MM = 1 / 66

export const MAGAZINE = {
  /** Trimmed page block (covers are flush — it's perfect-bound, not a hardcover). */
  body: { width: 3.273, height: 4.227, thickness: 0.091, radius: 0.016 },
  /** Cover art area (the whole front). Content you pass as children maps onto this rect. */
  cover: { width: 3.273, height: 4.227, radius: 0.016 },
  /** Default CSS px width of the virtual cover. */
  resolution: 480,
} as const

/** Cover aspect ratio (height / width). */
export const MAGAZINE_COVER_ASPECT = MAGAZINE.cover.height / MAGAZINE.cover.width
