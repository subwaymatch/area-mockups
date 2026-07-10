/**
 * DOOH totem object dimensions — a digital street kiosk / totem.
 *
 * Proportions follow the JCDecaux/Clear Channel digital 6-sheet class: a
 * ~1.3 m wide, ~2.8 m tall, ~0.35 m deep rounded enclosure on a low plinth,
 * holding a portrait 75"-class LCD (~940 x 1670 mm active area) behind
 * glass. Normalized to ~700 mm per world unit so the totem stands 4 units
 * tall. The screen is a live 540x960 DOM surface (a 1080x1920 grid at 2x).
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */

/** World units per millimeter for the DOOH totem. */
export const DOOH_TOTEM_MM = 1 / 700

export const DOOH_TOTEM = {
  /** Rounded enclosure. `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: 1.857, height: 4.0, depth: 0.5, radius: 0.24, bevel: 0.03 },
  /** Dark glass face inset into the enclosure front. */
  glass: { width: 1.66, height: 3.4, radius: 0.14 },
  /** Active display area (portrait 9:16). Content maps onto this rect. */
  display: { width: 1.343, height: 2.387, radius: 0.02 },
  /** Low plinth the enclosure stands on. */
  plinth: { width: 1.62, height: 0.12, depth: 0.44 },
  /** Distance from the enclosure center down to the pavement. */
  standHeight: 2.0 + 0.12,
  /** Default CSS px width of the virtual display (a 1080x1920 grid at 2x). */
  resolution: 540,
} as const

/** Display aspect ratio (height / width) — portrait 9:16. */
export const DOOH_TOTEM_ASPECT = DOOH_TOTEM.display.height / DOOH_TOTEM.display.width
