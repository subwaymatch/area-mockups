import * as THREE from 'three'

/**
 * A crisp canvas-drawn wordmark (e.g. the "SAMSUNG" imprint on a Galaxy back
 * panel) as a transparent texture. Draws white glyphs — tint via the material
 * `color` so one texture serves any colorway.
 */
export function createWordmarkTexture(
  text: string,
  { width = 1024, height = 160, weight = 700, letterSpacing = 0.32 }: {
    width?: number
    height?: number
    weight?: number
    /** Extra tracking as a fraction of the glyph size (Samsung's mark is wide-set). */
    letterSpacing?: number
  } = {}
): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const size = height * 0.72
  ctx.font = `${weight} ${size}px "Helvetica Neue", Arial, sans-serif`
  const spacing = size * letterSpacing
  // Manual tracking (ctx.letterSpacing isn't universal): lay glyphs out one by one.
  const widths = [...text].map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1)
  const scale = total > width * 0.96 ? (width * 0.96) / total : 1
  ctx.scale(scale, 1)
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'middle'
  let x = (width / scale - total) / 2
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i]!, x, height / 2)
    x += widths[i]! + spacing
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * A generic bitten-apple mark (the lid/back badge on the Apple-style devices)
 * drawn as a transparent white-on-clear texture — tint via material `color`.
 */
export function createAppleMarkTexture(size = 256): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size * 1.23
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const s = size / 200 // path authored on a 200 x 246 grid
  ctx.scale(s, s)
  ctx.fillStyle = '#ffffff'
  // Apple body: a squat superellipse with a waist, authored as two mirrored halves.
  ctx.beginPath()
  ctx.moveTo(100, 78)
  ctx.bezierCurveTo(88, 64, 66, 60, 50, 70)
  ctx.bezierCurveTo(22, 88, 16, 132, 34, 176)
  ctx.bezierCurveTo(44, 200, 60, 226, 82, 224)
  ctx.bezierCurveTo(92, 223, 94, 218, 100, 218)
  ctx.bezierCurveTo(106, 218, 108, 223, 118, 224)
  ctx.bezierCurveTo(140, 226, 156, 200, 166, 176)
  ctx.bezierCurveTo(184, 132, 178, 88, 150, 70)
  ctx.bezierCurveTo(134, 60, 112, 64, 100, 78)
  ctx.closePath()
  ctx.fill()
  // Leaf.
  ctx.beginPath()
  ctx.moveTo(104, 58)
  ctx.bezierCurveTo(102, 40, 112, 22, 130, 16)
  ctx.bezierCurveTo(134, 34, 122, 54, 104, 58)
  ctx.closePath()
  ctx.fill()
  // Bite out of the right side.
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(192, 132, 42, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
