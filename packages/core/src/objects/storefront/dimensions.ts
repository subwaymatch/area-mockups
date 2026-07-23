/**
 * Storefront object dimensions — a free-standing single-unit corner shop.
 *
 * Proportions follow the classic high-street shopfront: a 6 m frontage,
 * 4.2 m to the parapet, ~4.4 m deep — painted timber surround, 600 mm stall
 * riser, big display window with a mullion, glazed door on the right, and
 * the fascia sign band above the glazing. Normalized to ~1100 mm per world
 * unit so the façade is 5.45 units wide.
 *
 * The building has four real elevations plus a capped roof:
 * - front (+Z): the full shopfront with the door;
 * - windowed side (+X): the same composition, windows only — no door —
 *   with its own fascia sign;
 * - brick side (−X) and rear (−Z): plain running-bond brickwork, each
 *   carrying an optional painted-wall mural area.
 *
 * Live surfaces: the front fascia sign (`children`), the front window
 * poster, the side fascia sign, and the two wall murals — every elevation
 * is mockup-able (the roof is not).
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the storefront. */
export const STOREFRONT_MM = 1 / 1100

export const STOREFRONT = {
  /** Overall building: width (x), height (y), depth (z). */
  body: { width: 5.455, height: 3.818, depth: 4.0 },
  /** Fascia sign band (~550 mm) sitting directly above the window head. */
  fascia: { height: 0.5, y: 0.57 },
  /** Live sign area inset in the front fascia. Content (`children`) maps here. */
  sign: { width: 4.9, height: 0.41, radius: 0.01 },
  /** Live sign area inset in the windowed side's fascia. */
  sideSign: { width: 3.45, height: 0.41, radius: 0.01 },
  /** Stall riser under the display windows (front and windowed side). */
  riser: { height: 0.545 },
  /** Display window band between riser and fascia (door bay on the right). */
  window: { top: 0.32, doorX: 1.6, doorWidth: 0.909, mullionX: -0.65 },
  /** Live A1-class window poster, pasted on the left glass bay at eye level. */
  poster: { width: 0.62, height: 0.88, x: -1.7, y: -0.62, radius: 0.006 },
  /** Painted-wall mural area on the brick side (−X). Sized along the depth. */
  sideMural: { width: 3.4, height: 2.5, y: -0.05, radius: 0.01 },
  /** Painted-wall mural area on the rear (−Z). Sized along the width. */
  rearMural: { width: 4.6, height: 2.5, y: -0.05, radius: 0.01 },
  /** Flat roof cap overhanging the parapet line. */
  roof: { thickness: 0.07, overhang: 0.03 },
  /** Distance from the building center down to the pavement. */
  standHeight: 3.818 / 2,
  /** Default CSS px width of the virtual fascia sign. */
  resolution: 800,
  /** Default CSS px width of the virtual wall murals. */
  muralResolution: 700,
} as const

/** Fascia sign aspect ratio (height / width). */
export const STOREFRONT_SIGN_ASPECT = STOREFRONT.sign.height / STOREFRONT.sign.width
