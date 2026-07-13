/**
 * Galaxy Z Fold-style device dimensions — the Galaxy Z Fold 7.
 *
 * A book-fold foldable has two form factors, and this spec carries both so the
 * one device can render either:
 *
 * - `closed`: the folded candy-bar — a narrow, thick body with a tall cover
 *   display on the front and the rear triple camera on the back.
 * - `open`: the unfolded tablet — a wide, thin body with the large, nearly
 *   square inner display (a faint crease runs down its center).
 *
 * Both share one world scale (the same ~36.66 mm per unit as the Galaxy phone
 * family) so a Fold sits at true relative size beside the S-series. Pure,
 * renderer-agnostic data — the 3D model consumes it today and a future 2D
 * renderer can consume the same numbers.
 *
 * Real Galaxy Z Fold 7: unfolded 158.4 x 143.2 x 4.2 mm (8.0" 2184x1968 inner,
 * ratio ~1.11); folded 158.4 x 72.8 x 8.9 mm (6.5" 2520x1080 cover, ratio ~2.27).
 */

export interface FoldSpec {
  /** Folded candy-bar: narrow, thick body with a tall cover screen. */
  closed: {
    body: { width: number; height: number; depth: number; radius: number; bevel: number }
    /** Cover display (content maps here when closed). */
    display: { width: number; height: number; radius: number }
    /** Centered front-camera punch hole on the cover screen. */
    punchHole: { radius: number; offsetY: number }
    /** Default CSS px width of the portrait cover display. */
    resolution: number
  }
  /** Unfolded tablet: wide, thin body with the big inner display. */
  open: {
    body: { width: number; height: number; depth: number; radius: number; bevel: number }
    /** Inner display (content maps here when open). */
    display: { width: number; height: number; radius: number }
    /** Inner-display punch hole; `offsetX` is signed distance from center. */
    punchHole: { radius: number; offsetX: number; offsetY: number }
    /** Default CSS px width of the portrait inner display. */
    resolution: number
  }
  /**
   * Rear triple camera, given in each state's own back-face coordinates
   * (origin at that state's body center). A vertical pill island seats the
   * three stacked lenses; the flash sits on the flat back beside it.
   */
  rearCamera: {
    closed: RearCamera
    open: RearCamera
  }
}

interface RearCamera {
  island: { x: number; y: number; width: number; height: number; radius: number }
  rings: { y: number; r: number }[]
  flash: { x: number; y: number }
}

const FOLD7: FoldSpec = {
  closed: {
    body: { width: 1.986, height: 4.321, depth: 0.243, radius: 0.17, bevel: 0.018 },
    display: { width: 1.847, height: 4.185, radius: 0.12 },
    punchHole: { radius: 0.048, offsetY: 0.14 },
    resolution: 360,
  },
  open: {
    body: { width: 3.906, height: 4.321, depth: 0.115, radius: 0.11, bevel: 0.012 },
    display: { width: 3.743, height: 4.157, radius: 0.08 },
    punchHole: { radius: 0.044, offsetX: 1.55, offsetY: 0.14 },
    resolution: 820,
  },
  rearCamera: {
    // Folded: cluster near the top, offset toward the hinge side.
    closed: {
      island: { x: 0.6, y: 1.5, width: 0.46, height: 1.42, radius: 0.23 },
      rings: [
        { y: 1.9, r: 0.16 },
        { y: 1.5, r: 0.16 },
        { y: 1.1, r: 0.16 },
      ],
      flash: { x: 0.17, y: 1.9 },
    },
    // Unfolded: same module, riding the back of the camera half.
    open: {
      island: { x: 1.57, y: 1.5, width: 0.46, height: 1.42, radius: 0.23 },
      rings: [
        { y: 1.9, r: 0.16 },
        { y: 1.5, r: 0.16 },
        { y: 1.1, r: 0.16 },
      ],
      flash: { x: 1.14, y: 1.9 },
    },
  },
}

export const FOLD_VARIANTS: Record<'fold7', FoldSpec> = {
  fold7: FOLD7,
}

export type FoldVariant = keyof typeof FOLD_VARIANTS

/** Back-compat / default device. */
export const FOLD = FOLD7

/** Inner (open) display aspect ratio (height / width). */
export const FOLD_OPEN_ASPECT = FOLD.open.display.height / FOLD.open.display.width
