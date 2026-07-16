/**
 * Tablet device dimensions — iPad Pro (M5) and Galaxy Tab S11 families.
 *
 * All variants share one world scale (~64 mm per unit, set so the 13" iPad
 * Pro's portrait body is 4.4 units tall), so tablets keep their true relative
 * sizes side by side. Coordinates are portrait-first; `orientation` handles
 * landscape.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the tablet family. */
export const TABLET_MM = 1 / 64

export interface TabletSpec {
  /** Ultra-thin flat slab. `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: number; height: number; depth: number; radius: number; bevel: number }
  /** Front cover glass (slightly larger than the active display — forms the bezel ring). */
  glass: { width: number; height: number; radius: number }
  /** Active display area (portrait). Content you pass as children maps onto this rect. */
  display: { width: number; height: number; radius: number }
  /** Default CSS px width of the portrait virtual display (logical pt/dp grid). */
  resolution: number
  /** Optional front-camera display notch (Galaxy Tab Ultra), portrait top edge. */
  notch?: { width: number; height: number; radius: number }
  /** Rear camera, front-view coordinates (mirrored on the back panel). */
  rearCamera:
    | {
        /** iPad-style rounded-square pod with wide lens + flash + LiDAR. */
        style: 'pod'
        x: number
        y: number
        size: number
        radius: number
      }
    | {
        /** Galaxy-Tab-style individual floating ring(s) + flash dot. */
        style: 'rings'
        rings: { x: number; y: number; r: number }[]
        flash: { x: number; y: number }
      }
  /**
   * Stylus attachment strip on the portrait right edge (the landscape-top
   * long edge): the iPad Pencil charging strip, or the Tab S11 magnetic
   * side-mount for the octagonal S Pen (this generation retired the
   * back-panel charging strip; the pen clips to the long sides). `offsetY`
   * shifts the strip along the edge, clear of the buttons.
   */
  stylus: { length: number; offsetY: number }
  /** Keyboard-cover pogo pins on the back, near the portrait left edge (Galaxy Tab). */
  pogo?: { x: number; spacing: number }
}

/**
 * iPad Pro 13" (M5, 2025 — M4 chassis unchanged): 281.6 x 215.5 x 5.1 mm,
 * 13" 2752x2064 tandem OLED. Logical resolution 1032x1376 pt.
 */
const IPAD_PRO_13: TabletSpec = {
  body: { width: 3.367, height: 4.4, depth: 0.08, radius: 0.22, bevel: 0.01 },
  glass: { width: 3.31, height: 4.343, radius: 0.2 },
  display: { width: 3.095, height: 4.128, radius: 0.17 },
  resolution: 1032,
  rearCamera: { style: 'pod', x: 3.367 / 2 - 0.36, y: 4.4 / 2 - 0.36, size: 0.42, radius: 0.13 },
  stylus: { length: 1.6, offsetY: 0 },
}

/**
 * iPad Pro 11" (M5, 2025): 249.7 x 177.5 x 5.3 mm, 11" 2420x1668. Logical
 * resolution 834x1210 pt.
 */
const IPAD_PRO_11: TabletSpec = {
  body: { width: 2.773, height: 3.902, depth: 0.083, radius: 0.2, bevel: 0.01 },
  glass: { width: 2.716, height: 3.845, radius: 0.18 },
  display: { width: 2.508, height: 3.639, radius: 0.15 },
  resolution: 834,
  rearCamera: { style: 'pod', x: 2.773 / 2 - 0.34, y: 3.902 / 2 - 0.34, size: 0.4, radius: 0.12 },
  stylus: { length: 1.5, offsetY: 0 },
}

/**
 * Galaxy Tab S11 (11") — 253.8 x 165.3 x 5.5 mm, 11" 2560x1600 (16:10)
 * AMOLED, no notch (bezel front camera on the landscape-top edge), single
 * 13MP rear ring + flash, octagonal S Pen on the long side, keyboard pogo
 * pins on the back, quad speakers. Logical resolution 800x1280 dp (xhdpi).
 */
const TAB_S11: TabletSpec = {
  body: { width: 2.583, height: 3.966, depth: 0.086, radius: 0.2, bevel: 0.01 },
  glass: { width: 2.53, height: 3.913, radius: 0.18 },
  display: { width: 2.314, height: 3.702, radius: 0.14 },
  resolution: 800,
  rearCamera: {
    style: 'rings',
    rings: [{ x: 2.583 / 2 - 0.3, y: 3.966 / 2 - 0.3, r: 0.11 }],
    flash: { x: 2.583 / 2 - 0.3, y: 3.966 / 2 - 0.6 },
  },
  stylus: { length: 1.3, offsetY: -0.5 },
  pogo: { x: -2.583 / 2 + 0.16, spacing: 0.1 },
}

/**
 * Galaxy Tab S11 Ultra (14.6") — 326.3 x 208.5 x 5.1 mm, 14.6" 2960x1848
 * (16:10) AMOLED with a small droplet notch (single 12MP front camera) on
 * the landscape-top edge (the portrait right edge), dual protruding rear
 * rings + flash, octagonal S Pen on the long side, keyboard pogo pins.
 * Logical resolution 924x1480 dp (xhdpi estimate).
 */
const TAB_S11_ULTRA: TabletSpec = {
  body: { width: 3.258, height: 5.098, depth: 0.08, radius: 0.2, bevel: 0.01 },
  glass: { width: 3.205, height: 5.045, radius: 0.18 },
  display: { width: 3.068, height: 4.914, radius: 0.14 },
  resolution: 924,
  notch: { width: 0.21, height: 0.095, radius: 0.09 },
  rearCamera: {
    style: 'rings',
    rings: [
      { x: 3.258 / 2 - 0.3, y: 5.098 / 2 - 0.3, r: 0.11 },
      { x: 3.258 / 2 - 0.3, y: 5.098 / 2 - 0.58, r: 0.11 },
    ],
    flash: { x: 3.258 / 2 - 0.3, y: 5.098 / 2 - 0.84 },
  },
  stylus: { length: 1.5, offsetY: -0.6 },
  pogo: { x: -3.258 / 2 + 0.16, spacing: 0.1 },
}

export const TABLET_VARIANTS: Record<
  'ipadpro13' | 'ipadpro11' | 'tabs11' | 'tabs11ultra',
  TabletSpec
> = {
  ipadpro13: IPAD_PRO_13,
  ipadpro11: IPAD_PRO_11,
  tabs11: TAB_S11,
  tabs11ultra: TAB_S11_ULTRA,
}

export type TabletVariant = keyof typeof TABLET_VARIANTS

/** Back-compat: dimensions of the default device (iPad Pro 13"). */
export const TABLET = IPAD_PRO_13

/** Display aspect ratio (height / width) of the default device. */
export const TABLET_DISPLAY_ASPECT = TABLET.display.height / TABLET.display.width
