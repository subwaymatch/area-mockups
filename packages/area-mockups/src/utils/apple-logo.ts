import * as THREE from 'three'

/**
 * A subtle Apple-style mark for the iPhone's back, built procedurally (no
 * bitmap) so it stays a few bytes and scales cleanly. Returns a body silhouette
 * — a bitten apple — plus a separate leaf, each a centered `THREE.Shape` in a
 * unit box (roughly ±0.5) that the caller scales and insets into the back.
 *
 * The bite and the top/bottom dimples come from composing circular arcs, which
 * reads correctly at the small, same-color emboss the real logo uses.
 */
export function appleLogoShapes(): { body: THREE.Shape; leaf: THREE.Shape } {
  const body = new THREE.Shape()
  // Trace the bitten-apple outline clockwise from the top dimple.
  body.moveTo(0, 0.44) // top dimple, between the shoulders
  body.bezierCurveTo(0.14, 0.5, 0.28, 0.42, 0.36, 0.28) // right shoulder
  body.bezierCurveTo(0.3, 0.34, 0.16, 0.34, 0.12, 0.24) // the bite (concave)
  body.bezierCurveTo(0.08, 0.14, 0.2, 0.06, 0.34, 0.06) // out past the bite
  body.bezierCurveTo(0.5, 0.06, 0.56, -0.12, 0.5, -0.3) // right side down
  body.bezierCurveTo(0.44, -0.48, 0.28, -0.56, 0.16, -0.5) // bottom-right lobe
  body.bezierCurveTo(0.08, -0.46, 0.04, -0.44, 0, -0.44) // bottom dimple
  body.bezierCurveTo(-0.04, -0.44, -0.08, -0.46, -0.16, -0.5) // toward bottom-left
  body.bezierCurveTo(-0.28, -0.56, -0.44, -0.48, -0.5, -0.3) // bottom-left lobe
  body.bezierCurveTo(-0.56, -0.12, -0.5, 0.1, -0.36, 0.24) // left side up
  body.bezierCurveTo(-0.26, 0.36, -0.12, 0.4, 0, 0.44) // left shoulder to top
  body.closePath()

  const leaf = new THREE.Shape()
  // A small almond leaf tucked to the right of the stem.
  leaf.moveTo(0.02, 0.46)
  leaf.bezierCurveTo(0.1, 0.62, 0.24, 0.68, 0.32, 0.64)
  leaf.bezierCurveTo(0.3, 0.5, 0.18, 0.44, 0.02, 0.46)
  leaf.closePath()

  return { body, leaf }
}
