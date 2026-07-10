/**
 * Shopping bag object dimensions — a kraft paper carrier with rope handles.
 *
 * Proportions follow the standard "cub" carrier: 320 mm wide x 420 mm tall
 * x 140 mm gusset, with twisted-rope handles arcing over the top edge.
 * Normalized to ~95 mm per world unit so the bag stands 4.42 units tall.
 *
 * Live faces: front (`children`) and back.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the shopping bag. */
export const SHOPPING_BAG_MM = 1 / 95

export const SHOPPING_BAG = {
  /** The bag: width (x), height (y), gusset depth (z). */
  body: { width: 3.368, height: 4.421, depth: 1.474, radius: 0.02 },
  /** Fold-over cuff at the top opening. */
  cuff: { height: 0.37 },
  /** Twisted-paper handles: half-width, cord radius, and vertical stretch of the U. */
  handle: { radius: 0.84, tube: 0.029, rise: 1.3 },
  /** Default CSS px width of the virtual front face. */
  resolution: 460,
} as const

/** Front face aspect ratio (height / width). */
export const SHOPPING_BAG_ASPECT = SHOPPING_BAG.body.height / SHOPPING_BAG.body.width
