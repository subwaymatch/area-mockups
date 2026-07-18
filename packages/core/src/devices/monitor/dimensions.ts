/**
 * Monitor device dimensions.
 *
 * Proportions follow the Apple Studio Display (2nd generation, March 2026 —
 * the 2022 enclosure carried over unchanged): 27" 5K 5120x2880 at 600 nits,
 * 623 x 478 x 168 mm on the tilt stand, ~19.5 mm flat-back aluminum slab
 * (362 mm tall bare), all-glass front with a uniform ~13 mm black bezel and
 * only a hairline of aluminum at the edge, centered camera, speaker
 * perforations along the bottom of the back, 2x Thunderbolt 5 + 2x USB-C in
 * a tight rear row (left of center seen from behind), the captive power
 * cord's circular recess centered low on the back, and no power button.
 * Normalized to ~115 mm per world unit, so the enclosure is 5.42 units wide.
 * Origin sits at the panel center; the desk plane is `standHeight` below it.
 *
 * The tilt stand matches the product photography (front, side and rear
 * angles): a wide (~152 mm), thin sheet arm hangs from the hinge — whose
 * machined pivot caps show on the arm's sides — about three quarters of the
 * way down the back, leans a gentle ~13° back down to the knee and runs
 * forward as a thin foot plate on small rubber pads. A circular
 * cable-routing hole passes clean through the arm just above the
 * enclosure's bottom edge, framing the captive power cord's recess behind
 * it — the full dark circle the rear photography shows on the column.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */
export const MONITOR = {
  /** Aluminum enclosure (glass face). `radius` is the corner radius, `bevel` the edge rounding. */
  body: { width: 5.417, height: 3.128, depth: 0.17, radius: 0.09, bevel: 0.022 },
  /** Front cover glass — edge-to-edge, leaving only a hairline of aluminum.
   * The glass itself paints the uniform black bezel around the panel. */
  glass: { width: 5.373, height: 3.084, radius: 0.08 },
  /** Active display area. Content you pass as children maps onto this rect. */
  display: { width: 5.189, height: 2.919, radius: 0.03 },
  /** Default CSS px width of the virtual display (the 2560x1440 logical grid). */
  resolution: 2560,
  /** Distance from panel center down to the desk plane (stand height). */
  standHeight: 2.573,
  /** Gloss-black Apple mark on the back, centered horizontally — measured
   * from the official rear photography: ~66 mm wide, glyph center ~130 mm
   * below the enclosure's top edge. */
  logo: { width: 0.56, height: 0.688, y: 0.48 },
  /**
   * Rear port row — 2x Thunderbolt 5 + 2x USB-C machined as a tight cluster
   * of VERTICAL pill slots near the bottom, left of center seen from the
   * back (the official rear photography shows four upright slots). FRONT-view
   * coordinates: `x` is the first slot's center (subsequent slots step
   * `spacing` toward the center), `y` is above the bottom edge; each slot is
   * `slot.width` x `slot.height` (~3.5 x 8.8 mm, centers ~14.5 mm apart,
   * ~29 mm up — photo-measured).
   */
  ports: { x: 5.417 / 2 - 0.808, spacing: 0.126, y: 0.252, slot: { width: 0.03, height: 0.078 } },
  /** The captive power cord's circular recess: centered horizontally on the
   * back, ~31 mm across, the same ~29 mm above the bottom edge as the ports. */
  power: { r: 0.135, y: 0.252 },
  /**
   * Tilt stand, proportioned from the product photos. The arm (width x
   * `thickness` cross-section) hangs from the hinge barrel (`hingeRadius`,
   * centered `attachY` up the back) leaning `leanDeg` degrees, rounds
   * through the knee at the rear (outer radius `outerKneeRadius`, inner
   * fillet `innerKneeRadius`) and runs forward as the foot plate
   * (`footThickness` tall, front lip at `footFrontZ`). The circular
   * `cableHole` is punched through the arm, its center `edgeOffset` above
   * the enclosure's bottom edge, looking onto the power recess behind.
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
    cableHole: { r: 0.13, edgeOffset: 0.28 },
  },
} as const

/** Display aspect ratio (height / width) — the 16:9 5K panel. */
export const MONITOR_DISPLAY_ASPECT = MONITOR.display.height / MONITOR.display.width
