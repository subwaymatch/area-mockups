/**
 * Monitor device dimensions.
 *
 * Proportions follow the Apple Studio Display (2nd generation, 2026 — the
 * 2022 enclosure unchanged: 623 x 478 x 168 mm on the tilt stand, 27" 5K
 * 5120x2880, ~20 mm flat-back aluminum enclosure, all-glass front with a
 * uniform black bezel and only a hairline of aluminum at the edge, centered
 * camera, 2x Thunderbolt 5 + 2x USB-C in a rear row, captive power cord, and
 * no power button) normalized to ~115 mm per world unit, so the enclosure is
 * 5.42 units wide. Origin sits at the panel center; the desk plane is
 * `standHeight` below it.
 *
 * The tilt stand is one continuous bent slab of aluminum, as on the real
 * product: a ~17 cm-wide arm leaves the lower back leaning ~30° forward,
 * rounds through the knee at the rear and runs forward as the flat foot
 * under the display.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */
export const MONITOR = {
  /** Aluminum enclosure (glass face). `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: 5.417, height: 3.128, depth: 0.19, radius: 0.09, bevel: 0.022 },
  /** Front cover glass — edge-to-edge, leaving only a hairline of aluminum.
   * The glass itself paints the uniform black bezel around the panel. */
  glass: { width: 5.373, height: 3.084, radius: 0.08 },
  /** Active display area. Content you pass as children maps onto this rect. */
  display: { width: 5.189, height: 2.919, radius: 0.03 },
  /** Default CSS px width of the virtual display (the 2560x1440 logical grid). */
  resolution: 2560,
  /** Distance from panel center down to the desk plane (stand height). */
  standHeight: 2.591,
  /**
   * Tilt stand: one continuous bent aluminum slab. The arm (width x
   * `thickness` cross-section) leans `leanDeg` degrees forward from vertical
   * and meets the panel back at `attachY`; the foot runs from `footFrontZ`
   * back through the knee (outer radius `outerKneeRadius`, inner fillet
   * `innerKneeRadius`). `footThickness` is the plate height off the desk.
   */
  stand: {
    width: 1.478,
    thickness: 0.105,
    leanDeg: 33,
    attachY: -0.7,
    footFrontZ: 0.24,
    footThickness: 0.096,
    outerKneeRadius: 0.38,
    innerKneeRadius: 0.32,
  },
} as const

/** Display aspect ratio (height / width) — the 16:9 5K panel. */
export const MONITOR_DISPLAY_ASPECT = MONITOR.display.height / MONITOR.display.width
