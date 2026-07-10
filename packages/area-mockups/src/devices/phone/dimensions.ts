/**
 * Galaxy-style phone device dimensions — the full Galaxy S25 family.
 *
 * All variants share one world scale (~36.66 mm per unit, set so the base
 * S25's display is exactly 1.8 units wide), so the variants keep their true
 * relative sizes when shown side by side.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the Galaxy family. */
export const GALAXY_MM = 1 / 36.66

export interface GalaxyPhoneSpec {
  /** Aluminum/titanium frame + chassis. `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: number; height: number; depth: number; radius: number; bevel: number }
  /** Front cover glass (slightly larger than the active display — forms the bezel ring). */
  glass: { width: number; height: number; radius: number }
  /** Active display area. Content you pass as children is mapped onto this rect. */
  display: { width: number; height: number; radius: number }
  /** Front camera punch hole: circle radius + distance from the top display edge to its center. */
  punchHole: { radius: number; offsetY: number }
  /** Default CSS px width of the portrait virtual display (the device's logical dp width). */
  resolution: number
  /** Rear camera layout in front-view coordinates (mirrored on the back panel). */
  rearCamera: {
    /** x of the floating-ring column (front view; appears top-left from the back). */
    ringsX: number
    /** The individually "floating" lens rings, top to bottom. `x` overrides the column (Ultra's off-spine telephoto). */
    rings: { x?: number; y: number; r: number }[]
    flash: { x: number; y: number }
    /** Small auxiliary sensors (laser AF, extra flash dots…). */
    dots?: { x: number; y: number; r: number }[]
    /** Optional raised island behind the rings (Galaxy S25 Edge style). */
    island?: { x: number; y: number; width: number; height: number; radius: number }
  }
}

/**
 * Galaxy S25 — 146.9 x 70.5 x 7.2 mm, 6.2" 2340x1080 (19.5:9) flat display.
 * Logical resolution 360x780 (the panel at exactly one-third scale).
 */
const S25: GalaxyPhoneSpec = {
  body: { width: 1.92, height: 4.0, depth: 0.196, radius: 0.26, bevel: 0.02 },
  glass: { width: 1.86, height: 3.96, radius: 0.23 },
  display: { width: 1.8, height: 3.9, radius: 0.21 },
  punchHole: { radius: 0.05, offsetY: 0.12 },
  resolution: 360,
  rearCamera: {
    ringsX: 1.92 / 2 - 0.3,
    rings: [
      { y: 1.5, r: 0.13 },
      { y: 1.14, r: 0.13 },
      { y: 0.78, r: 0.13 },
    ],
    flash: { x: 1.92 / 2 - 0.3 - 0.27, y: 1.32 },
  },
}

/**
 * Galaxy S25+ — 158.4 x 75.8 x 7.3 mm, 6.7" 3120x1440 (19.5:9) flat display,
 * aluminum frame. Same design language as the S25, scaled up. Logical
 * resolution 384x832 (One UI's default FHD+ render at 450 dpi, confirmed on
 * the Ultra and shared by the QHD+ siblings).
 */
const S25_PLUS: GalaxyPhoneSpec = {
  body: { width: 2.068, height: 4.321, depth: 0.199, radius: 0.27, bevel: 0.02 },
  glass: { width: 2.008, height: 4.281, radius: 0.24 },
  display: { width: 1.9455, height: 4.2149, radius: 0.22 },
  punchHole: { radius: 0.05, offsetY: 0.12 },
  resolution: 384,
  rearCamera: {
    ringsX: 2.068 / 2 - 0.3,
    rings: [
      { y: 1.66, r: 0.13 },
      { y: 1.3, r: 0.13 },
      { y: 0.94, r: 0.13 },
    ],
    flash: { x: 2.068 / 2 - 0.3 - 0.27, y: 1.48 },
  },
}

/**
 * Galaxy S25 Ultra — 162.8 x 77.6 x 8.2 mm, 6.9" 3120x1440 display, titanium
 * frame with distinctly boxier corners. "Elevated Floating" five-element rear
 * array: a spine of three large rings (ultrawide, main, periscope), with the
 * smaller 3x telephoto ring + laser AF beside it and the flash at the bottom
 * of the cluster. Logical resolution 384x832 (One UI default FHD+ render at
 * 450 dpi, confirmed via build.prop).
 */
const S25_ULTRA: GalaxyPhoneSpec = {
  body: { width: 2.117, height: 4.441, depth: 0.2237, radius: 0.16, bevel: 0.02 },
  glass: { width: 2.057, height: 4.401, radius: 0.14 },
  display: { width: 2.0034, height: 4.3407, radius: 0.12 },
  punchHole: { radius: 0.05, offsetY: 0.12 },
  resolution: 384,
  rearCamera: {
    ringsX: 2.117 / 2 - 0.33,
    rings: [
      { y: 1.72, r: 0.145 },
      { y: 1.33, r: 0.145 },
      { y: 0.94, r: 0.145 },
      { x: 2.117 / 2 - 0.33 - 0.42, y: 1.475, r: 0.1 }, // 3x telephoto, off the spine
    ],
    flash: { x: 2.117 / 2 - 0.33 - 0.42, y: 1.12 },
    dots: [
      { x: 2.117 / 2 - 0.33 - 0.42, y: 1.72, r: 0.032 }, // laser AF
    ],
  },
}

/**
 * Galaxy S25 Edge — 158.2 x 75.6 x 5.8 mm (the thinnest Galaxy S), 6.7"
 * 3120x1440 display, titanium frame. Two lenses in a compact raised pill
 * island top-left with the flash flush-mounted inside the same island below
 * them. Logical resolution 384x832.
 */
const S25_EDGE: GalaxyPhoneSpec = {
  body: { width: 2.062, height: 4.315, depth: 0.158, radius: 0.27, bevel: 0.016 },
  glass: { width: 2.002, height: 4.275, radius: 0.24 },
  display: { width: 1.9455, height: 4.2149, radius: 0.22 },
  punchHole: { radius: 0.05, offsetY: 0.12 },
  resolution: 384,
  rearCamera: {
    ringsX: 2.062 / 2 - 0.42,
    rings: [
      { y: 1.76, r: 0.15 },
      { y: 1.38, r: 0.15 },
    ],
    flash: { x: 2.062 / 2 - 0.42, y: 1.08 },
    island: { x: 2.062 / 2 - 0.42, y: 1.44, width: 0.52, height: 1.12, radius: 0.26 },
  },
}

export const GALAXY_VARIANTS: Record<'s25' | 's25plus' | 's25ultra' | 's25edge', GalaxyPhoneSpec> = {
  s25: S25,
  s25plus: S25_PLUS,
  s25ultra: S25_ULTRA,
  s25edge: S25_EDGE,
}

export type GalaxyVariant = keyof typeof GALAXY_VARIANTS

/** Back-compat: dimensions of the default device (Galaxy S25). */
export const PHONE = S25

/** Display aspect ratio (height / width) of the default device — a 19.5:9 panel. */
export const PHONE_DISPLAY_ASPECT = PHONE.display.height / PHONE.display.width
