/**
 * Coffee cup object dimensions — a disposable paper hot cup with a kraft
 * sleeve and a sip lid.
 *
 * Proportions follow the standard hot-cup blanks: a 12 oz cup is ~90 mm
 * across the lip, 60 mm across the base and 110 mm tall; the 16 oz shares
 * the same lip and base diameters and stretches to ~135 mm. The kraft
 * sleeve is a ~58 mm band sitting just below the middle. Normalized to
 * ~35 mm per world unit so the 12 oz cup is ~3.1 units tall.
 *
 * Live surface: the sleeve wrap. The wrap is CURVED — the model tiles it
 * from `facets` flat strips arranged as an inscribed prism around the
 * sleeve, each strip clipping one slice of a single unrolled artwork.
 * `resolution` is the CSS px width of that full unrolled wrap.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the coffee cup. */
export const COFFEE_CUP_MM = 1 / 35

export type CoffeeCupVariant = '12oz' | '16oz'

export interface CoffeeCupSpec {
  /** Marketing name. */
  name: string
  /** Cup body: radius at the lip, radius at the base, height. */
  topRadius: number
  bottomRadius: number
  height: number
  /** Rolled lip bead (torus tube radius). */
  lip: number
  /** Kraft sleeve band: distance from cup bottom to the sleeve's bottom edge,
   * band height, and the (cylindrical) sleeve radius. */
  sleeve: { bottom: number; height: number; radius: number }
}

export const COFFEE_CUP_VARIANTS: Record<CoffeeCupVariant, CoffeeCupSpec> = {
  // Dart/Solo 412WN-class: 90 mm rim, 58 mm base, 112 mm tall. The sleeve
  // (60 mm single-face E-flute band, one size fits both cups) sits low —
  // ~22 mm above the base, top edge ~30 mm below the rim.
  '12oz': {
    name: '12 oz hot cup',
    topRadius: 1.25,
    bottomRadius: 0.829,
    height: 3.2,
    lip: 0.036,
    sleeve: { bottom: 0.63, height: 1.714, radius: 1.206 },
  },
  // Dart/Solo 316W-class: same rim and base, stretched to 135 mm — the
  // shared sleeve reads mid-cup here (~38 mm above the base).
  '16oz': {
    name: '16 oz hot cup',
    topRadius: 1.25,
    bottomRadius: 0.829,
    height: 3.857,
    lip: 0.036,
    sleeve: { bottom: 1.086, height: 1.714, radius: 1.206 },
  },
}

export const COFFEE_CUP = {
  /** Flat strips tiling the curved sleeve (an inscribed prism). */
  facets: 16,
  /** Sip lid (92 mm dome sipper): base ring, dome plateau and spout heights. */
  lid: { ring: 0.2, dome: 0.17, spout: 0.08 },
  /** Default CSS px width of the full unrolled sleeve wrap. */
  resolution: 1024,
} as const

/** Sleeve wrap aspect ratio (band height / unrolled circumference), 12 oz. */
export const COFFEE_CUP_WRAP_ASPECT =
  COFFEE_CUP_VARIANTS['12oz'].sleeve.height /
  (2 * Math.PI * COFFEE_CUP_VARIANTS['12oz'].sleeve.radius)
