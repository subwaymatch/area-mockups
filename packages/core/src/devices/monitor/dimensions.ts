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
 * The tilt stand matches the product photography (front, side and rear
 * angles): a wide (~152 mm), thin sheet arm hangs from the hinge — whose
 * machined pivot caps show on the arm's sides — about three quarters of the
 * way down the back, leans a gentle ~13° back down to the knee and runs
 * forward as a thin foot plate on small rubber pads. A circular
 * cable-routing hole passes clean through the arm, straddling the
 * enclosure's bottom edge so its lower arc peeks below the panel with open
 * air behind it.
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
  standHeight: 2.573,
  /** The 2026 generation carries a large gloss-black Apple mark on the back,
   * centered, its center ~30% down the enclosure. */
  logo: { width: 0.84, height: 1.03, y: 0.57 },
  /**
   * Tilt stand, proportioned from the product photos. The arm (width x
   * `thickness` cross-section) hangs from the hinge barrel (`hingeRadius`,
   * centered `attachY` up the back) leaning `leanDeg` degrees, rounds
   * through the knee at the rear (outer radius `outerKneeRadius`, inner
   * fillet `innerKneeRadius`) and runs forward as the foot plate
   * (`footThickness` tall, front lip at `footFrontZ`). The circular
   * `cableHole` is punched through the arm, its center `edgeOffset` above
   * the enclosure's bottom edge so the lower arc shows below the panel.
   */
  stand: {
    width: 1.32,
    thickness: 0.07,
    leanDeg: 13,
    attachY: -0.826,
    footFrontZ: 0.55,
    footThickness: 0.062,
    outerKneeRadius: 0.34,
    innerKneeRadius: 0.28,
    hingeRadius: 0.11,
    cableHole: { r: 0.195, edgeOffset: 0.05 },
  },
} as const

/** Display aspect ratio (height / width) — the 16:9 5K panel. */
export const MONITOR_DISPLAY_ASPECT = MONITOR.display.height / MONITOR.display.width
