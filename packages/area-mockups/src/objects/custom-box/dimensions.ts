/**
 * Custom box object dimensions — a rectangular box at ANY size you specify
 * in millimeters: shipper, carton, counter display, crate… whatever
 * rectangular volume your project needs.
 *
 * Like the custom panel, the box normalizes itself: the longest edge maps
 * to `CUSTOM_BOX.target` world units, so any size fills the default stage
 * while the mm dimensions set the true proportions.
 *
 * Live faces: front (`children`), back, left, right, top and bottom.
 */

export interface CustomBoxSizeMm {
  /** Box width in millimeters (x). */
  width: number
  /** Box height in millimeters (y). */
  height: number
  /** Box depth in millimeters (z). */
  depth: number
}

export const CUSTOM_BOX = {
  /** World units the longest edge normalizes to. */
  target: 4.4,
  /** Default CSS px width of the virtual front face; all faces share dpi. */
  resolution: 560,
} as const

/** World units per millimeter for a given box size. */
export function customBoxScale(size: CustomBoxSizeMm): number {
  return CUSTOM_BOX.target / Math.max(size.width, size.height, size.depth)
}
