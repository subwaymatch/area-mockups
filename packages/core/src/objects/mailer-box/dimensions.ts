/**
 * Mailer box object dimensions — a closed corrugated shipper.
 *
 * Proportions follow the classic e-commerce hero shipper: 350 x 250 x 120 mm
 * kraft corrugated, lying flat, with a 48 mm packing-tape band over the flap
 * seam that wraps down both ends. Normalized to ~78 mm per world unit so the
 * box is 4.49 units wide.
 *
 * Live faces: top (`children`, tape rendered as a DOM overlay so it stays
 * over your print), front and end panels.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the mailer box. */
export const MAILER_BOX_MM = 1 / 78

export const MAILER_BOX = {
  /** The shipper: width (x), height (y), depth (z). `radius` softens the corrugated edges. */
  body: { width: 4.487, height: 1.538, depth: 3.205, radius: 0.03 },
  /** Packing tape: band width, running across the top seam and down both ends. */
  tape: { width: 0.615 },
  /** Default CSS px width of the virtual top face; other faces share its dpi. */
  resolution: 520,
} as const

/** Top face aspect ratio (depth / width). */
export const MAILER_BOX_TOP_ASPECT = MAILER_BOX.body.depth / MAILER_BOX.body.width
