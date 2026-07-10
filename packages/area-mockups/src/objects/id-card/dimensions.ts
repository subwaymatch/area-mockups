/**
 * ID card object dimensions — a portrait CR80 badge on a lanyard.
 *
 * The card is the standard CR80 badge blank: 54 x 85.6 mm held portrait on
 * 30 mil (0.76 mm) PVC with a 14 x 3 mm slot punch centered 6 mm below the
 * top edge. Normalized to ~32 mm per world unit so the card is 2.68 units
 * tall. The lanyard rises from a metal crimp and swivel hook clipped through
 * the slot; the strap halves exit the top of the frame like a hanging badge.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the ID card. */
export const ID_CARD_MM = 1 / 32

export const ID_CARD = {
  /** CR80 blank, portrait. `radius` is the die-cut corner rounding. */
  body: { width: 1.687, height: 2.675, thickness: 0.03, radius: 0.1, bevel: 0.005 },
  /** Slot punch (a real 14x3 mm stadium hole), centerline ~5.5 mm below the top edge. */
  slot: { width: 0.44, height: 0.095, centerY: 2.675 / 2 - 0.172 },
  /**
   * Printable face. It stops just below the slot-punch strip — like a real
   * badge, the design keeps clear of the punch — so the clip hardware never
   * overlaps the live DOM area. Content maps onto this rect on both sides.
   */
  face: { width: 1.687, height: 2.235, radius: 0.1, offsetY: -0.22 },
  /**
   * Hardware chain, bottom to top exactly as on real lanyards: an elongated
   * trigger snap hook whose nose wire threads the slot, the swivel barrel,
   * the flat D-shaped eye clamped by the barrel, and the sheet-metal crimp
   * that captures the folded strap ends through the eye.
   */
  hook: {
    hookRadius: 0.15,
    /** Vertical stretch turning the wire circle into the J-hook profile. */
    hookScaleY: 1.9,
    hookTube: 0.034,
    barrel: { radius: 0.09, height: 0.24 },
    eye: { radius: 0.11, scaleX: 1.4, tube: 0.03 },
    crimp: { width: 0.5, height: 0.26, depth: 0.07 },
  },
  /** Woven strap halves rising from the crimp in a hanging ~30° V. */
  strap: { width: 0.47, thickness: 0.022, length: 2.6, spreadAngle: 0.26, backTilt: 0.1 },
  /** Default CSS px width of the virtual face (~300 dpi of the physical card). */
  resolution: 420,
} as const

/** Printable face aspect ratio (height / width). */
export const ID_CARD_FACE_ASPECT = ID_CARD.face.height / ID_CARD.face.width
