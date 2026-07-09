/**
 * Laptop device dimensions.
 *
 * Proportions follow the Apple MacBook Air 13" (M5, 2026) — 30.41 x 21.5 x
 * 1.13 cm closed, 13.6" 2560x1664 Liquid Retina display with a notch, uniform
 * side bezels and a deeper chin — normalized so the active display is exactly
 * 4.0 x 2.6 world units (~72.4 mm per unit). The M5 generation reuses the M4
 * chassis unchanged, so these numbers describe both.
 *
 * This is pure, renderer-agnostic data: the 3D model consumes it today and a
 * future 2D (CSS/SVG) renderer can consume the same numbers.
 */
export const LAPTOP = {
  /** Footprint shared by the base and the lid. `radius` is the corner radius. */
  footprint: { width: 4.2, depth: 2.97, radius: 0.16 },
  /** Bottom half: main chassis with the keyboard deck. */
  base: { thickness: 0.1, bevel: 0.012 },
  /** Top half: the display lid. When open it stands `footprint.depth` tall. */
  lid: { thickness: 0.05, bevel: 0.008 },
  /**
   * Active display area within the open lid. `offsetY` is the distance from
   * the lid's vertical center to the display center — the chin below the panel
   * is deeper than the top bezel, so the panel sits slightly high.
   */
  display: { width: 4.0, height: 2.6, radius: [0.09, 0.09, 0, 0] as const, offsetY: 0.085 },
  /** Camera notch: sits at the top-center of the display, menu-bar deep. */
  notch: { width: 0.48, height: 0.095, radius: 0.045 },
  /** Keyboard well (recessed area) and key grid on the deck, hinge side. */
  keyboard: { width: 3.78, depth: 1.5, offsetZ: -0.6 },
  /** Force Touch trackpad, centered between keyboard and front edge. */
  trackpad: { width: 1.78, depth: 1.12, offsetZ: 0.78 },
  /** Default lid angle (degrees between deck and screen; 90 = upright). */
  openAngle: 110,
} as const

/** Display aspect ratio (height / width) — the 13.6" 2560x1664 panel. */
export const LAPTOP_DISPLAY_ASPECT = LAPTOP.display.height / LAPTOP.display.width
