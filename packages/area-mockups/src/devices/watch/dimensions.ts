/**
 * Watch device dimensions — Apple Watch Series 11 and Samsung Galaxy Watch 8.
 *
 * Both variants share one world scale (~17.7 mm per unit) so they keep true
 * relative sizes side by side:
 *
 * - Apple Watch Series 11, 46 mm: 46 x 39 x 9.7 mm squircle case, ~1.96"
 *   416x496 wide-angle OLED with heavily rounded corners, Digital Crown +
 *   flush side button on the right edge, 24 mm lug slots, Sport Band.
 * - Galaxy Watch 8, 44 mm: 46.0 x 43.7 x 8.6 mm "cushion" case (squircle
 *   aluminum armor with a flat top), fully ROUND 1.47" 480x480 sAMOLED under
 *   a flat crystal, two flat keys on the right edge, Dynamic Lug band mount.
 *
 * The wristband is worn: a closed teardrop loop behind the case (product
 * photos show ~72 mm tall x ~62 mm deep for the Sport Band, tapering ~45%
 * toward the back), with the case riding on the loop's front arc.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the watch family. */
export const WATCH_MM = 1 / 17.7

export interface WatchSpec {
  /** Per-family construction: Apple squircle+crown, or Galaxy cushion+round display. */
  style: 'apple' | 'galaxy'
  /** Case. `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: number; height: number; depth: number; radius: number; bevel: number }
  /** Cover crystal. For the round Galaxy display width==height and radius==width/2. */
  glass: { width: number; height: number; radius: number }
  /** Active display area. Content you pass as children maps onto this rect. */
  display: { width: number; height: number; radius: number }
  /** Default CSS px width of the virtual display (the logical pt/dp grid). */
  resolution: number
  /** Digital Crown on the right edge (Apple). */
  crown?: { y: number; radius: number; thickness: number }
  /** Flat keys on the right edge: Apple's side button, Galaxy's two keys. */
  buttons: { y: number; length: number }[]
  /**
   * Wristband. The closed teardrop loop is swept behind the case as if worn:
   * the vertical radius tapers from `ryFront` (at the case) to `ryBack`, `rz`
   * is the depth radius around `centerZ`, and the sweep starts/ends
   * `startAngle` degrees off the loop's front axis, buried inside the case.
   */
  band: {
    width: number
    thickness: number
    loop: { ryFront: number; ryBack: number; rz: number; centerZ: number; startAngle: number }
  }
}

/** Apple Watch Series 11, 46 mm. Logical resolution 208x248 pt. */
const SERIES_11: WatchSpec = {
  style: 'apple',
  body: { width: 2.203, height: 2.6, depth: 0.548, radius: 0.88, bevel: 0.12 },
  glass: { width: 2.02, height: 2.38, radius: 0.72 },
  display: { width: 1.808, height: 2.158, radius: 0.62 },
  resolution: 208,
  crown: { y: 0.48, radius: 0.198, thickness: 0.1 },
  buttons: [{ y: -0.18, length: 0.62 }],
  band: {
    width: 1.27,
    thickness: 0.165,
    loop: { ryFront: 2.0, ryBack: 1.2, rz: 1.35, centerZ: -1.2, startAngle: 25 },
  },
}

/** Galaxy Watch 8, 44 mm: cushion case, round 480x480 display (240 dp grid). */
const GALAXY_WATCH_8: WatchSpec = {
  style: 'galaxy',
  body: { width: 2.469, height: 2.599, depth: 0.486, radius: 0.92, bevel: 0.13 },
  glass: { width: 2.2, height: 2.2, radius: 1.1 },
  display: { width: 2.108, height: 2.108, radius: 1.054 },
  resolution: 240,
  buttons: [
    { y: 0.36, length: 0.54 },
    { y: -0.32, length: 0.54 },
  ],
  band: {
    width: 1.13,
    thickness: 0.15,
    loop: { ryFront: 2.0, ryBack: 1.2, rz: 1.35, centerZ: -1.2, startAngle: 27 },
  },
}

export const WATCH_VARIANTS: Record<'series11' | 'watch8', WatchSpec> = {
  series11: SERIES_11,
  watch8: GALAXY_WATCH_8,
}

export type WatchVariant = keyof typeof WATCH_VARIANTS

/** Back-compat: dimensions of the default device (Apple Watch Series 11, 46 mm). */
export const WATCH = SERIES_11

/** Display aspect ratio (height / width) of the default device. */
export const WATCH_DISPLAY_ASPECT = WATCH.display.height / WATCH.display.width
