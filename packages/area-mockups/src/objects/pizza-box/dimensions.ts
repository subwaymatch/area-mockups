/**
 * Pizza box object dimensions — a corrugated 14" carryout box in the
 * classic chain-store shape: flat lid, a 45° beveled band across the front
 * top edge, chamfered front corners, and the lid's front flap tucking
 * INSIDE the base's low front wall. Closed on the counter, or flipped open
 * with a procedural pizza inside.
 *
 * Proportions follow the standard B-flute blank: 356×356 mm footprint,
 * 45 mm tall. Normalized to ~78 mm per world unit (the same tabletop scale
 * as the mailer box) so the box is ~4.6 units square.
 *
 * Live surfaces: the lid top (`children`), the beveled front band
 * (`bevel`), the base's front wall strip (`front`), and the inside of the
 * lid (visible when `open`).
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
  lid: { thickness: 0.05, flap: { height: 0.3, thickness: 0.035 } },
  /** The 45° beveled band folding the lid down to the front wall. */
  bevel: { drop: 0.26, run: 0.26 },
  /** 45° chamfered front corners on the base. */
  chamfer: { width: 0.52 },
  /** How far the lid leans past vertical when open (radians past 90°). */
  openLean: 0.35,
  /** The pizza: overall radius, crust band width, slab thickness. A 14"
   * box carries its pie nearly wall to wall — the corner cuts exist
   * precisely to stop it sliding. */
  pizza: { radius: 2.15, crust: 0.24, height: 0.09 },
  /** Live strip on the base's low front wall, between the corner chamfers. */
  front: { width: 3.8, height: 0.26, radius: 0.008 },
  /** Live strip on the beveled front band of the lid. */
  bevelFace: { width: 4.2, height: 0.3, radius: 0.006 },
  /** Default CSS px width of the virtual lid top; other faces share its dpi. */
  resolution: 560,
} as const

/** Lid top aspect ratio (printable depth / width). */
export const PIZZA_BOX_TOP_ASPECT =
  (PIZZA_BOX.body.depth - PIZZA_BOX.bevel.run) / PIZZA_BOX.body.width
