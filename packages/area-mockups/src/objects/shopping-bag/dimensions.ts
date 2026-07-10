/**
 * Shopping bag object dimensions — a kraft paper carrier with rope handles.
 *
 * Proportions follow a large fashion-carrier blank: 320 mm wide x 420 mm tall
 * x 140 mm gusset, with twisted-rope handles arcing over the top edge.
 * Normalized to ~95 mm per world unit so the bag stands 4.42 units tall.
 *
 * The bag is HOLLOW: four walls and a floor, an open rectangular mouth, a
 * machine-cut top edge, and side gussets that crease inward down their
 * vertical centerline like a real standing bag.
 *
 * Live faces: front (`children`) and back — full bleed, edge to edge.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the shopping bag. */
export const SHOPPING_BAG_MM = 1 / 95

export const SHOPPING_BAG = {
  /** The bag: width (x), height (y), gusset depth (z). */
  body: { width: 3.368, height: 4.421, depth: 1.474, radius: 0.02 },
  /** Wall stock thickness (visual). */
  wall: 0.014,
  /** How far the side-gusset crease pulls inward at its vertical centerline. */
  gusset: 0.09,
  /** Twisted-paper handles: half-width, cord radius, vertical stretch of the
   * U, and the glued reinforcement patch inside the mouth. */
  handle: { radius: 0.84, tube: 0.046, rise: 1.3, patch: { width: 0.5, height: 0.42 } },
  /** Default CSS px width of the virtual front face. */
  resolution: 460,
} as const

/** Front face aspect ratio (height / width). */
export const SHOPPING_BAG_ASPECT = SHOPPING_BAG.body.height / SHOPPING_BAG.body.width
