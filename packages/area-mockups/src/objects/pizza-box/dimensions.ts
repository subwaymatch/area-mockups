/**
 * Pizza box object dimensions — a corrugated 14" pizza box, closed or
 * flipped open with a procedural pizza inside.
 *
 * Proportions follow the standard B-flute blank: 356×356 mm footprint,
 * 45 mm tall, with the lid's front tuck flap overlapping the front rim.
 * Normalized to ~78 mm per world unit (the same tabletop scale as the
 * mailer box) so the box is ~4.6 units square.
 *
 * Live surfaces: the lid top (`children`), the front rim strip, and the
 * inside of the lid (visible when `open`).
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the pizza box. */
export const PIZZA_BOX_MM = 1 / 78

export const PIZZA_BOX = {
  /** The closed box: width (x), height (y), depth (z). */
  body: { width: 4.564, height: 0.577, depth: 4.564, radius: 0.02 },
  /** Lid slab thickness and the front flap that tucks inside the base wall. */
  lid: { thickness: 0.05, flap: { height: 0.4, thickness: 0.035 } },
  /** How far the lid leans past vertical when open (radians past 90°). */
  openLean: 0.35,
  /** The pizza: overall radius, crust band width, slab thickness. */
  pizza: { radius: 1.92, crust: 0.24, height: 0.09 },
  /** Live strip on the base's front wall, between the corner chamfers. */
  front: { width: 4.0, height: 0.4, radius: 0.008 },
  /** Default CSS px width of the virtual lid top; other faces share its dpi. */
  resolution: 560,
} as const

/** Lid top aspect ratio (depth / width — square). */
export const PIZZA_BOX_TOP_ASPECT = PIZZA_BOX.body.depth / PIZZA_BOX.body.width
