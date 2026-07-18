import * as React from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

/**
 * Scene-wide screen-occluder registry. A screen must hide behind ANY body
 * standing between it and the camera — with two phones side by side, one
 * phone's screen must not bleed through the other's back. Each mockup
 * registers its chassis meshes here and occludes its screen against the whole
 * scene's set, not just its own body.
 */

type OccluderStore = {
  refs: Set<React.RefObject<THREE.Mesh>>
  version: number
  listeners: Set<() => void>
}

const stores = new WeakMap<THREE.Scene, OccluderStore>()

function storeFor(scene: THREE.Scene): OccluderStore {
  let store = stores.get(scene)
  if (!store) {
    store = { refs: new Set(), version: 0, listeners: new Set() }
    stores.set(scene, store)
  }
  return store
}

/**
 * Register this mockup's chassis meshes as screen occluders and get back
 * every occluder registered in the scene (own meshes included). The returned
 * array is stable between mount changes, so it can be passed straight to
 * drei's `<Html occlude>`.
 */
export function useScreenOccluders(
  ...own: React.RefObject<THREE.Mesh>[]
): React.RefObject<THREE.Mesh>[] {
  const scene = useThree((state) => state.scene)

  React.useEffect(() => {
    const store = storeFor(scene)
    for (const ref of own) store.refs.add(ref)
    store.version++
    store.listeners.forEach((notify) => notify())
    return () => {
      for (const ref of own) store.refs.delete(ref)
      store.version++
      store.listeners.forEach((notify) => notify())
    }
    // The refs are stable useRef objects owned by the calling component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, ...own])

  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const store = storeFor(scene)
      store.listeners.add(onChange)
      return () => {
        store.listeners.delete(onChange)
      }
    },
    [scene]
  )
  const version = React.useSyncExternalStore(
    subscribe,
    () => storeFor(scene).version,
    () => 0
  )

  return React.useMemo(() => {
    void version
    return [...storeFor(scene).refs]
  }, [scene, version])
}

/**
 * The slice of a three-mesh-bvh `MeshBVH` the occlusion test uses. Machined
 * chassis geometries get a `boundsTree` attached by `cutGeometry` (the BVH
 * library is already in that bundle); everything else falls back to three's
 * built-in raycast, so small object mockups don't pay for the BVH code.
 */
interface BoundsTree {
  raycastFirst(ray: THREE.Ray, side: THREE.Side): { point: THREE.Vector3 } | null
}

/**
 * Multi-sample occlusion test for a DOM screen plane. A single ray to the
 * plane's center (what a naive raycast occluder checks) misses partial
 * overlaps, letting the screen pierce through chassis edges and silhouette
 * gaps; sampling the center plus four inset corners hides the screen as soon
 * as ANY line of sight is blocked by a registered body. Returns whether the
 * screen should hide.
 */
export function createScreenOcclusionTester(): (
  anchor: THREE.Object3D,
  width: number,
  height: number,
  occluders: React.RefObject<THREE.Mesh>[],
  camera: THREE.Camera
) => boolean {
  // Scratch values reused across frames — no per-frame allocation.
  const sample = new THREE.Vector3()
  const localRay = new THREE.Ray()
  const inverse = new THREE.Matrix4()
  const hitPoint = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()
  const intersections: THREE.Intersection[] = []
  const SAMPLES: readonly [number, number][] = [
    [0, 0],
    [-0.35, -0.35],
    [0.35, -0.35],
    [-0.35, 0.35],
    [0.35, 0.35],
  ]
  return (anchor, width, height, occluders, camera) => {
    for (const [sx, sy] of SAMPLES) {
      sample.set(sx * width, sy * height, 0)
      anchor.localToWorld(sample)
      raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld)
      raycaster.ray.direction.copy(sample).sub(raycaster.ray.origin)
      const distance = raycaster.ray.direction.length()
      raycaster.ray.direction.normalize()
      // Blocked only when a hit is meaningfully NEARER than the sample — the
      // screen's own cover glass just behind the plane never counts.
      raycaster.far = distance - 0.02
      for (const ref of occluders) {
        const mesh = ref.current
        if (!mesh?.geometry) continue
        const bvh = (mesh.geometry as THREE.BufferGeometry & { boundsTree?: BoundsTree }).boundsTree
        if (bvh) {
          inverse.copy(mesh.matrixWorld).invert()
          localRay.copy(raycaster.ray).applyMatrix4(inverse)
          const hit = bvh.raycastFirst(localRay, THREE.DoubleSide)
          if (hit) {
            hitPoint.copy(hit.point).applyMatrix4(mesh.matrixWorld)
            if (hitPoint.distanceTo(raycaster.ray.origin) < distance - 0.02) return true
          }
        } else {
          intersections.length = 0
          mesh.raycast(raycaster, intersections)
          if (intersections.length > 0) return true
        }
      }
    }
    return false
  }
}
