/**
 * Product box object dimensions — a standing retail carton.
 *
 * Proportions follow the classic retail-carton hero (cereal/software class):
 * 190 mm wide x 265 mm tall x 55 mm deep — a ~1:1.4 front with a shallow
 * side — normalized to ~62 mm per world unit so the box stands 4.27 units
 * tall on the default mockup stage. The tuck flap on the top face stops
 * short of the back edge, leaving the visible seam every real carton has.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the product box. */
export const PRODUCT_BOX_MM = 1 / 62

export const PRODUCT_BOX = {
  /** The carton: width (x), height (y), depth (z). `radius` is the fold-edge rounding. */
  body: { width: 3.065, height: 4.274, depth: 0.887, radius: 0.008 },
  /** Tuck flap on the top face: how far it stops short of the back edge, and its lift. */
  flap: { backGap: 0.1, lift: 0.008 },
  /** Default CSS px width of the virtual front face; other faces share its dpi. */
  resolution: 480,
} as const

/** Front face aspect ratio (height / width). */
export const PRODUCT_BOX_FRONT_ASPECT = PRODUCT_BOX.body.height / PRODUCT_BOX.body.width
