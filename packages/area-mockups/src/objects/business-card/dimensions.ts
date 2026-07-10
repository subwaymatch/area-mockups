/**
 * Business card object dimensions.
 *
 * Proportions follow the US/ISO 7810 ID-1-adjacent standard card: 89 x 51 mm
 * (3.5" x 2") on premium 32 pt (0.8 mm) stock, normalized to ~26 mm per world
 * unit so the card is 3.42 units wide — filling the default mockup stage.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the business card. */
export const BUSINESS_CARD_MM = 1 / 26

export const BUSINESS_CARD = {
  /** The card itself. `radius` is the corner rounding of the die cut. */
  body: { width: 3.423, height: 1.962, thickness: 0.031, radius: 0.077, bevel: 0.006 },
  /** Printable face (full bleed). Content maps onto this rect on both sides. */
  face: { width: 3.423, height: 1.962, radius: 0.077 },
  /** Default CSS px width of the virtual face (~150 dpi of the physical card). */
  resolution: 520,
} as const

/** Face aspect ratio (height / width). */
export const BUSINESS_CARD_FACE_ASPECT = BUSINESS_CARD.face.height / BUSINESS_CARD.face.width
