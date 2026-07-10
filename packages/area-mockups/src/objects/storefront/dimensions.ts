/**
 * Storefront object dimensions — a single-unit shop façade.
 *
 * Proportions follow the classic high-street shopfront: a 6 m frontage,
 * 4.2 m to the parapet — painted timber surround, 600 mm stall riser, big
 * display window with a mullion, glazed door on the right, and the fascia
 * sign band above the glazing. Normalized to ~1100 mm per world unit so the
 * façade is 5.45 units wide.
 *
 * Live surfaces: the fascia sign (`children`) and a window poster.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the storefront. */
export const STOREFRONT_MM = 1 / 1100

export const STOREFRONT = {
  /** Overall façade: width (x), height (y), wall depth (z). */
  body: { width: 5.455, height: 3.818, depth: 0.26 },
  /** Fascia sign band (~550 mm) sitting directly above the window head. */
  fascia: { height: 0.5, y: 0.57 },
  /** Live sign area inset in the fascia. Content (`children`) maps here. */
  sign: { width: 4.9, height: 0.41, radius: 0.01 },
  /** Stall riser under the display window. */
  riser: { height: 0.545 },
  /** Display window band between riser and fascia (door bay on the right). */
  window: { top: 0.32, doorX: 1.6, doorWidth: 0.909, mullionX: -0.65 },
  /** Live A1-class window poster, pasted on the left glass bay at eye level. */
  poster: { width: 0.62, height: 0.88, x: -1.7, y: -0.62, radius: 0.006 },
  /** Distance from the façade center down to the pavement. */
  standHeight: 3.818 / 2,
  /** Default CSS px width of the virtual fascia sign. */
  resolution: 800,
} as const

/** Fascia sign aspect ratio (height / width). */
export const STOREFRONT_SIGN_ASPECT = STOREFRONT.sign.height / STOREFRONT.sign.width
