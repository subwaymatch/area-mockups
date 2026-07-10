/**
 * iPhone device dimensions — the full iPhone 17 family.
 *
 * All variants share one world scale (~37.15 mm per unit, set so the base
 * iPhone 17's display is exactly 1.8 units wide), so the variants keep their
 * true relative sizes when shown side by side.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the iPhone family. */
export const IPHONE_MM = 1 / 37.15

export interface IPhoneSpec {
  /** Flat frame + chassis. `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: number; height: number; depth: number; radius: number; bevel: number }
  /** Front cover glass (slightly larger than the active display — forms the bezel ring). */
  glass: { width: number; height: number; radius: number }
  /** Active display area. Content you pass as children is mapped onto this rect. */
  display: { width: number; height: number; radius: number }
  /** Dynamic Island pill: size + distance from the top display edge to its center. */
  island: { width: number; height: number; offsetY: number }
  /** Default CSS px width of the portrait virtual display (the device's logical point grid). */
  resolution: number
  /** Rear camera architecture in front-view coordinates (mirrored on the back panel). */
  rearCamera: {
    /**
     * `pill`: vertical pill hugging the lenses (iPhone 17).
     * `bar`: full-width plateau across the top of the back (17 Air, 17 Pro/Pro Max).
     */
    style: 'pill' | 'bar'
    /** The raised pedestal. For `bar`, width spans nearly the full body. */
    frame: { x: number; y: number; width: number; height: number }
    /** Lens rings with absolute positions (triangular on the Pros). */
    lenses: { x: number; y: number; r: number }[]
    flash: { x: number; y: number }
    /** Small auxiliary dots (mic, LiDAR…). */
    dots?: { x: number; y: number; r: number }[]
  }
  /**
   * Ceramic Shield window on the lower back (the 17 Pro's aluminum unibody has
   * a separate glass rounded-rect for MagSafe/wireless charging).
   */
  backWindow?: { y: number; width: number; height: number; radius: number }
}

/**
 * iPhone 17 — 149.6 x 71.5 x 7.95 mm, 6.3" 2622x1206 display, Dynamic Island,
 * vertical two-lens camera pill. Logical resolution 402x874 pt.
 */
const IPHONE_17: IPhoneSpec = {
  body: { width: 1.925, height: 4.027, depth: 0.214, radius: 0.38, bevel: 0.02 },
  glass: { width: 1.865, height: 3.967, radius: 0.35 },
  display: { width: 1.8, height: 3.9134, radius: 0.32 },
  island: { width: 0.56, height: 0.17, offsetY: 0.225 },
  resolution: 402,
  rearCamera: {
    style: 'pill',
    frame: { x: 1.925 / 2 - 0.41, y: 4.027 / 2 - 0.72, width: 0.58, height: 1.2 },
    lenses: [
      { x: 1.925 / 2 - 0.41, y: 4.027 / 2 - 0.72 + 0.3, r: 0.225 },
      { x: 1.925 / 2 - 0.41, y: 4.027 / 2 - 0.72 - 0.3, r: 0.225 },
    ],
    flash: { x: 1.925 / 2 - 0.86, y: 4.027 / 2 - 0.42 },
    dots: [{ x: 1.925 / 2 - 0.86, y: 4.027 / 2 - 0.64, r: 0.018 }],
  },
}

/**
 * iPhone 17 Air — 156.2 x 74.7 x 5.64 mm (ultra-thin), 6.5" 2736x1260 display.
 * Single 48MP lens in a full-width bar across the top of the back; titanium
 * frame. Logical resolution 420x912 pt.
 */
const IPHONE_17_AIR: IPhoneSpec = {
  body: { width: 2.011, height: 4.205, depth: 0.152, radius: 0.38, bevel: 0.016 },
  glass: { width: 1.951, height: 4.145, radius: 0.35 },
  display: { width: 1.873, height: 4.066, radius: 0.32 },
  island: { width: 0.56, height: 0.17, offsetY: 0.225 },
  resolution: 420,
  rearCamera: {
    style: 'bar',
    frame: { x: 0, y: 4.205 / 2 - 0.49, width: 2.011 - 0.22, height: 0.7 },
    lenses: [{ x: 0.62, y: 4.205 / 2 - 0.49, r: 0.24 }],
    flash: { x: 0.27, y: 4.205 / 2 - 0.49 + 0.08 },
    dots: [{ x: 0.27, y: 4.205 / 2 - 0.49 - 0.14, r: 0.018 }],
  },
}

/**
 * iPhone 17 Pro — 150.0 x 71.9 x 8.75 mm, 6.3" 2622x1206 display (same panel
 * as the 17). Full-width camera plateau: triangular 48MP trio on the left
 * (viewed from the back), flash + LiDAR + mic on the right; aluminum unibody.
 * Logical resolution 402x874 pt.
 */
const IPHONE_17_PRO: IPhoneSpec = {
  body: { width: 1.935, height: 4.038, depth: 0.2355, radius: 0.38, bevel: 0.02 },
  glass: { width: 1.875, height: 3.978, radius: 0.35 },
  display: { width: 1.8, height: 3.9134, radius: 0.32 },
  island: { width: 0.56, height: 0.17, offsetY: 0.225 },
  resolution: 402,
  rearCamera: {
    style: 'bar',
    frame: { x: 0, y: 4.038 / 2 - 0.62, width: 1.935 - 0.2, height: 1.0 },
    lenses: [
      { x: 0.6, y: 4.038 / 2 - 0.62 + 0.25, r: 0.21 }, // main (top-left from the back)
      { x: 0.6, y: 4.038 / 2 - 0.62 - 0.25, r: 0.21 }, // ultra wide (bottom-left)
      { x: 0.22, y: 4.038 / 2 - 0.62, r: 0.21 }, // telephoto (middle-right of the cluster)
    ],
    flash: { x: -0.6, y: 4.038 / 2 - 0.62 + 0.25 },
    dots: [
      { x: -0.6, y: 4.038 / 2 - 0.62 - 0.25, r: 0.075 }, // LiDAR
      { x: -0.42, y: 4.038 / 2 - 0.62, r: 0.02 }, // mic
    ],
  },
  backWindow: { y: -0.65, width: 1.5, height: 2.4, radius: 0.34 },
}

/**
 * iPhone 17 Pro Max — 163.4 x 78.0 x 8.75 mm, 6.9" 2868x1320 display. Same
 * plateau architecture as the Pro, scaled to the larger body. Logical
 * resolution 440x956 pt.
 */
const IPHONE_17_PRO_MAX: IPhoneSpec = {
  body: { width: 2.1, height: 4.398, depth: 0.2355, radius: 0.4, bevel: 0.02 },
  glass: { width: 2.04, height: 4.338, radius: 0.37 },
  display: { width: 1.962, height: 4.263, radius: 0.34 },
  island: { width: 0.56, height: 0.17, offsetY: 0.225 },
  resolution: 440,
  rearCamera: {
    style: 'bar',
    frame: { x: 0, y: 4.398 / 2 - 0.62, width: 2.1 - 0.2, height: 1.0 },
    lenses: [
      { x: 0.66, y: 4.398 / 2 - 0.62 + 0.25, r: 0.21 },
      { x: 0.66, y: 4.398 / 2 - 0.62 - 0.25, r: 0.21 },
      { x: 0.26, y: 4.398 / 2 - 0.62, r: 0.21 },
    ],
    flash: { x: -0.66, y: 4.398 / 2 - 0.62 + 0.25 },
    dots: [
      { x: -0.66, y: 4.398 / 2 - 0.62 - 0.25, r: 0.075 },
      { x: -0.46, y: 4.398 / 2 - 0.62, r: 0.02 },
    ],
  },
  backWindow: { y: -0.72, width: 1.63, height: 2.62, radius: 0.36 },
}

export const IPHONE_VARIANTS: Record<'17' | 'air' | 'pro' | 'promax', IPhoneSpec> = {
  '17': IPHONE_17,
  air: IPHONE_17_AIR,
  pro: IPHONE_17_PRO,
  promax: IPHONE_17_PRO_MAX,
}

export type IPhoneVariant = keyof typeof IPHONE_VARIANTS

/** Back-compat: dimensions of the default device (iPhone 17). */
export const IPHONE = IPHONE_17

/** Display aspect ratio (height / width) of the default device. */
export const IPHONE_DISPLAY_ASPECT = IPHONE.display.height / IPHONE.display.width
