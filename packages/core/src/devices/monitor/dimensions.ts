/**
 * Monitor device dimensions.
 *
 * Proportions follow the Apple Studio Display (2nd generation, 2026): 27" 5K
 * 5120x2880 at 600 nits, 623 x 478 x 168 mm on the tilt stand, ~28 mm
 * flat-back aluminum enclosure, all-glass front with a uniform black bezel
 * and only a hairline of aluminum at the edge, centered camera, speaker
 * perforations along the bottom of the back, 2x Thunderbolt 5 + 2x USB-C in
 * a rear row, and no power button. Normalized to ~115 mm per world unit, so
 * the enclosure is 5.42 units wide. Origin sits at the panel center; the
 * desk plane is `standHeight` below it.
 *
 * The tilt stand matches the product's design: a narrow (~124 mm) arm hangs
 * from a visible hinge barrel a third of the way up the back, leans ~32°
 * back down to the knee and runs forward as a thin foot plate. A
 * stadium-shaped cable-routing hole passes through the arm, with the black
 * cable/power recess behind it in the enclosure back.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */
export const MONITOR = {
  /** Aluminum enclosure (glass face). `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: 5.417, height: 3.128, depth: 0.24, radius: 0.09, bevel: 0.022 },
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
   * Tilt stand. The arm (width x `thickness` cross-section) hangs from the
   * hinge barrel (`hingeRadius`, centered `attachY` up the back) leaning
   * `leanDeg` degrees, rounds through the knee at the rear (outer radius
   * `outerKneeRadius`, inner fillet `innerKneeRadius`) and runs forward as
   * the foot plate (`footThickness` tall, front lip at `footFrontZ`). The
   * `cableHole` stadium is punched through the arm, its top edge
   * `topOffset` below the hinge center along the arm.
   */
  stand: {
    width: 1.08,
    thickness: 0.1,
    leanDeg: 32,
    attachY: -0.37,
    footFrontZ: 0.1,
    footThickness: 0.062,
    outerKneeRadius: 0.34,
    innerKneeRadius: 0.28,
    hingeRadius: 0.078,
    /** The routing hole straddles the enclosure's bottom edge — its lower
     * arc peeks below the panel from the front, as on the product. */
    cableHole: { width: 0.34, height: 0.5, topOffset: 1.19 },
  },
} as const

/** Display aspect ratio (height / width) — the 16:9 5K panel. */
export const MONITOR_DISPLAY_ASPECT = MONITOR.display.height / MONITOR.display.width
