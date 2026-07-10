/**
 * Book object dimensions — a trade hardcover.
 *
 * Proportions follow a standard 6.14" x 9.21" (156 x 234 mm) trade hardcover,
 * 30 mm thick overall: a 22 mm page block between 4 mm binder's boards, with
 * a 3 mm board overhang ("squares") past the pages on the three open edges.
 * Normalized to ~56 mm per world unit so the book stands 4.18 units tall —
 * phone-sized on the default mockup stage.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the book. */
export const BOOK_MM = 1 / 56

export const BOOK = {
  /** One binder's board (front or back cover). `radius` rounds the corners in the cover plane. */
  board: { width: 2.786, height: 4.179, thickness: 0.071, radius: 0.045, bevel: 0.008 },
  /** Total closed thickness (page block + both boards). */
  thickness: 0.536,
  /** Page block, inset from the three open edges by the board overhang. */
  pages: { width: 2.732, height: 4.071, thickness: 0.393, inset: 0.054 },
  /** Rounded cloth spine wrapping the bound edge. */
  spine: { width: 0.1, radius: 0.032 },
  /** Cover art area (the whole front board). Content you pass as children maps onto this rect. */
  cover: { width: 2.786, height: 4.179, radius: 0.045 },
  /** Default CSS px width of the virtual cover. */
  resolution: 480,
} as const

/** Cover aspect ratio (height / width). */
export const BOOK_COVER_ASPECT = BOOK.cover.height / BOOK.cover.width
