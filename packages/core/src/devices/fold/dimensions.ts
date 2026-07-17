/**
 * Galaxy Z Fold-style device dimensions — the Galaxy Z Fold 7.
 *
 * A book-fold foldable has two form factors, and this spec carries both so the
 * one device can render either:
 *
 * - `closed`: the folded candy-bar — a narrow, thick body with a tall cover
 *   display on the front, the camera pill on the back and the hinge spine
 *   capping the left edge.
 * - `open`: the unfolded tablet — a wide, thin body with the large, nearly
 *   square inner display (a faint crease runs down its center) and the
 *   recessed hinge spine on the back.
 *
 * Both share one world scale (the same ~36.66 mm per unit as the Galaxy phone
 * family) so a Fold sits at true relative size beside the S-series. Detail
 * geometry (buttons, camera plateau + pill, hinge, ports) was measured from a
 * reference 3D scan of the retail device. Pure, renderer-agnostic data.
 *
 * Real Galaxy Z Fold 7: unfolded 158.4 x 143.2 x 4.2 mm (8.0" 2184x1968 inner,
 * ratio ~1.11); folded 158.4 x 72.8 x 8.9 mm (6.5" 2520x1080 cover, ratio ~2.32).
 */

/** The rear camera cluster in one pose's own back-face coordinates. */
interface FoldRearCamera {
  /** Light pedestal plate under the pill (scan: 19.8 x 52.1 mm, 2.7 mm proud). */
  plateau: { x: number; y: number; width: number; height: number; radius: number; raise: number }
  /** Dark pill seating the lens column (scan: 15.2 x 48.6 mm, +2.2 mm more). */
  island: { x: number; y: number; width: number; height: number; radius: number; raise: number }
  /** Lens collars, top to bottom (r 7.9 mm on a 16.7 mm pitch). */
  rings: { y: number; r: number }[]
  flash: { x: number; y: number; r: number }
}

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
  /** Rear camera, given in each state's own back-face coordinates. */
  rearCamera: {
    closed: FoldRearCamera
    open: FoldRearCamera
  }
  /** Side keys on the right edge (same y in both poses): volume, then power. */
  buttons: { y: number; length: number }[]
  buttonProfile: { protrusion: number; thickness: number }
  /**
   * The hinge: open, a recessed spine channel down the center of the back;
   * closed, a flat band capping the left edge (protruding `overhang` beyond
   * the frame). `emboss` is the vertical SAMSUNG wordmark on the spine.
   */
  hinge: { width: number; overhang: number; emboss: { length: number } }
  /**
   * Bottom-edge machining per pose (x positions in that pose's coordinates).
   * Folded, the USB lives on the camera half (back slab) and the speaker on
   * the cover half (front slab) — `z` places each opening on its own slab.
   */
  bottomEdge: {
    closed: {
      usb: { x: number; width: number; height: number; z?: number }
      speaker: { x: number; width: number; height: number; z?: number }
    }
    open: {
      usb: { x: number; width: number; height: number; z?: number }
      speakers: { x: number; width: number; height: number; z?: number }[]
      mics?: { x: number; r: number }[]
    }
  }
  /** Antenna seams on the side rails: y positions, mirrored onto both edges. */
  antennaLines?: number[]
}

const FOLD7: FoldSpec = {
  closed: {
    body: { width: 1.942, height: 4.321, depth: 0.241, radius: 0.081, bevel: 0.018 },
    // 65.98 x 153.03 mm cover panel, centered, sharp scan-true corners.
    display: { width: 1.8, height: 4.174, radius: 0.06 },
    punchHole: { radius: 0.053, offsetY: 0.127 },
    resolution: 360,
  },
  open: {
    body: { width: 3.906, height: 4.321, depth: 0.115, radius: 0.081, bevel: 0.012 },
    // 136.64 x 151.61 mm inner panel.
    display: { width: 3.727, height: 4.136, radius: 0.06 },
    // Punch on the right half: (+34.9, 3.7 below the top display edge), r 2.4 mm.
    punchHole: { radius: 0.065, offsetX: 0.952, offsetY: 0.1 },
    resolution: 820,
  },
  rearCamera: {
    // Folded: pill toward the free (right) edge of the back.
    closed: {
      plateau: { x: 0.501, y: 1.281, width: 0.54, height: 1.421, radius: 0.266, raise: 0.073 },
      island: { x: 0.501, y: 1.281, width: 0.416, height: 1.325, radius: 0.208, raise: 0.059 },
      rings: [
        { y: 1.735, r: 0.214 },
        { y: 1.281, r: 0.214 },
        { y: 0.826, r: 0.214 },
      ],
      flash: { x: 0.047, y: 1.501, r: 0.058 },
    },
    // Unfolded: same module riding the camera half (right of the spine).
    open: {
      plateau: { x: 1.487, y: 1.281, width: 0.54, height: 1.421, radius: 0.266, raise: 0.073 },
      island: { x: 1.487, y: 1.281, width: 0.416, height: 1.325, radius: 0.208, raise: 0.059 },
      rings: [
        { y: 1.735, r: 0.214 },
        { y: 1.281, r: 0.214 },
        { y: 0.826, r: 0.214 },
      ],
      flash: { x: 1.033, y: 1.501, r: 0.058 },
    },
  },
  // Scan: volume 18.6 mm at +28.4, power 13.0 mm at +6.5 on the right edge.
  buttons: [
    { y: 0.775, length: 0.507 },
    { y: 0.177, length: 0.354 },
  ],
  buttonProfile: { protrusion: 0.012, thickness: 0.082 },
  // Spine channel 6.1 mm wide; folded it caps the left edge, 1.1 mm proud,
  // with the vertical 16.7 mm SAMSUNG emboss at mid-height.
  hinge: { width: 0.166, overhang: 0.03, emboss: { length: 0.456 } },
  bottomEdge: {
    closed: {
      // Both center on the folded width but sit on different slabs of the stack.
      usb: { x: 0, width: 0.264, height: 0.081, z: -0.069 },
      speaker: { x: 0, width: 0.366, height: 0.045, z: 0.069 },
    },
    open: {
      // USB on the camera half, speaker centered on the cover half.
      usb: { x: 0.953, width: 0.264, height: 0.081 },
      speakers: [{ x: -0.976, width: 0.366, height: 0.045 }],
      mics: [{ x: 1.693, r: 0.026 }, { x: -1.657, r: 0.023 }],
    },
  },
  antennaLines: [1.115],
}

export const FOLD_VARIANTS: Record<'fold7', FoldSpec> = {
  fold7: FOLD7,
}

export type FoldVariant = keyof typeof FOLD_VARIANTS

/** Back-compat / default device. */
export const FOLD = FOLD7

/** Inner (open) display aspect ratio (height / width). */
export const FOLD_OPEN_ASPECT = FOLD.open.display.height / FOLD.open.display.width
