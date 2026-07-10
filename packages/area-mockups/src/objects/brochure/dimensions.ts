/**
 * Brochure object dimensions — a standing tri-fold.
 *
 * Proportions follow a US letter tri-fold: an 8.5" x 11" sheet folded into
 * three 93 x 216 mm panels, normalized to ~60 mm per world unit so the
 * standing brochure is 3.6 units tall. The stock thickness is exaggerated a
 * little (0.7 mm) so the paper edge reads at mockup scale.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the brochure. */
export const BROCHURE_MM = 1 / 60

export const BROCHURE = {
  /** One folded panel. Content you pass per panel maps onto this rect. */
  panel: { width: 1.552, height: 3.598, thickness: 0.012, radius: 0.008 },
  /** Number of panels in the fold. */
  panels: 3,
  /** Default zig-zag fold angle in degrees (0 would be a flat unfolded sheet). */
  foldAngle: 24,
  /** Default CSS px width of one virtual panel. */
  resolution: 360,
} as const

/** Panel aspect ratio (height / width). */
export const BROCHURE_PANEL_ASPECT = BROCHURE.panel.height / BROCHURE.panel.width
