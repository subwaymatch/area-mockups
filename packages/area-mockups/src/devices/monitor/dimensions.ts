/**
 * Monitor device dimensions.
 *
 * Proportions follow the Apple Studio Display (2nd generation, 2026 — the
 * 2022 enclosure unchanged: 623 x 478 x 168 mm on the tilt stand, 27" 5K
 * 5120x2880, ~20 mm flat-back aluminum enclosure, uniform black bezel,
 * centered camera, 2x Thunderbolt 5 + 2x USB-C in a rear row, captive power
 * cord, and no power button) normalized to ~115 mm per world unit, so the
 * enclosure is 5.42 units wide. Origin sits at the panel center; the desk
 * plane is `standHeight` below it.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */
export const MONITOR = {
  /** Aluminum enclosure (glass face). `radius` is the corner radius, `bevel` the back-edge rounding. */
  body: { width: 5.417, height: 3.128, depth: 0.19, radius: 0.09, bevel: 0.035 },
  /** Front cover glass (the uniform black bezel ring around the panel). */
  glass: { width: 5.365, height: 3.076, radius: 0.07 },
  /** Active display area. Content you pass as children maps onto this rect. */
  display: { width: 5.189, height: 2.919, radius: 0.03 },
  /** Default CSS px width of the virtual display (the 2560x1440 logical grid). */
  resolution: 2560,
  /** Distance from panel center down to the desk plane (stand height). */
  standHeight: 2.591,
  /** L-shaped tilt stand: arm width/thickness and the flat base plate. */
  stand: {
    armWidth: 0.64,
    armThickness: 0.075,
    base: { width: 1.783, depth: 1.478, thickness: 0.057 },
  },
} as const

/** Display aspect ratio (height / width) — the 16:9 5K panel. */
export const MONITOR_DISPLAY_ASPECT = MONITOR.display.height / MONITOR.display.width
