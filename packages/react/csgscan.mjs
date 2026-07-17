import * as THREE from 'three'
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg'

function roundedRectShape(width, height, radius) {
  const s = new THREE.Shape()
  const w = width / 2, h = height / 2, r = radius
  s.moveTo(-w + r, -h)
  s.lineTo(w - r, -h)
  s.quadraticCurveTo(w, -h, w, -h + r)
  s.lineTo(w, h - r)
  s.quadraticCurveTo(w, h, w - r, h)
  s.lineTo(-w + r, h)
  s.quadraticCurveTo(-w, h, -w, h - r)
  s.lineTo(-w, -h + r)
  s.quadraticCurveTo(-w, -h, -w + r, -h)
  return s
}
const stadiumCutter = (w, h, d, radius = Math.min(w, h) / 2 - 0.0005) => {
  const g = new THREE.ExtrudeGeometry(roundedRectShape(w, h, radius), { depth: d * 2, bevelEnabled: false, curveSegments: 12 })
  g.translate(0, 0, -d); g.rotateX(-Math.PI / 2); return g
}
const holeCutter = (r, d) => {
  const g = new THREE.CylinderGeometry(r, r, d * 2, 20)
  g.rotateX(Math.PI / 2); g.rotateX(-Math.PI / 2); return g
}
function mergeSolids(solids) {
  const parts = solids.map((c) => (c.index ? c.toNonIndexed() : c))
  let total = 0
  for (const p of parts) total += p.attributes.position.count
  const pos = new Float32Array(total * 3), norm = new Float32Array(total * 3)
  let off = 0
  for (const p of parts) { pos.set(p.attributes.position.array, off); norm.set(p.attributes.normal.array, off); off += p.attributes.position.count * 3 }
  const m = new THREE.BufferGeometry()
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  m.setAttribute('normal', new THREE.BufferAttribute(norm, 3))
  return m
}

const body = { width: 1.956, height: 4.081, depth: 0.196, radius: 0.19, bevel: 0.02 }
const H2 = body.height / 2
function buildBase() {
  const shape = roundedRectShape(body.width - body.bevel * 2, body.height - body.bevel * 2, body.radius - body.bevel)
  const depth = body.depth - body.bevel * 2
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: body.bevel, bevelSize: body.bevel, bevelSegments: 4, curveSegments: 16 })
  g.translate(0, 0, -depth / 2)
  return g
}
function cutters() {
  return [
    stadiumCutter(0.251, 0.087, 0.15).translate(0, -H2, 0),
    stadiumCutter(0.465, 0.038, 0.06).translate(0.449, -H2, 0),
    holeCutter(0.015, 0.05).translate(-0.189, -H2, 0),
    holeCutter(0.015, 0.05).translate(0.169, -H2, 0),
  ]
}

function scan(label, geometry) {
  const a = geometry.attributes.position.array
  let below = 0, minY = Infinity
  const spots = []
  for (let i = 0; i < a.length; i += 9) {
    // triangle fully below the bottom plane (with tolerance)?
    const ys = [a[i + 1], a[i + 4], a[i + 7]]
    const y = Math.min(...ys)
    if (y < minY) minY = y
    if (Math.max(...ys) < -H2 - 1e-4) {
      below++
      if (spots.length < 6) spots.push([a[i], ys[0], a[i + 2]].map((v) => v.toFixed(3)).join(','))
    }
  }
  console.log(`${label}: tris fully below bottom=${below} minY=${minY.toFixed(4)} (bottom=-${H2.toFixed(4)})`, spots)
}

const ev = new Evaluator(); ev.useGroups = false; ev.attributes = ['position', 'normal']

// current approach: merged cutters, one op
{
  const a = new Brush(buildBase()); a.updateMatrixWorld()
  const b = new Brush(mergeSolids(cutters())); b.updateMatrixWorld()
  scan('merged single-op', ev.evaluate(a, b, SUBTRACTION).geometry)
}
// chained per-cutter ops
{
  let brush = new Brush(buildBase()); brush.updateMatrixWorld()
  for (const c of cutters()) { const b = new Brush(c); b.updateMatrixWorld(); brush = ev.evaluate(brush, b, SUBTRACTION) }
  scan('chained per-cutter', brush.geometry)
}
