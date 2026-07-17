import * as THREE from 'three'

const WORLD_UP = new THREE.Vector3(0, 1, 0)

/**
 * Free orbital tumble around a fixed center — the camera motion behind every
 * mockup's drag-to-rotate.
 *
 * Horizontal drags spin the stage like a turntable (about the world's
 * vertical axis); vertical drags tumble the camera straight over the top and
 * bottom, carrying its up vector along, so rotation is a full, unclamped 360°
 * in every direction — unlike a spherical orbit, which locks at the poles.
 * The rotation center stays fixed at the target and motion is damped with the
 * same feel as the classic orbit controls.
 */
export class TumbleOrbit {
  /** The fixed rotation center. */
  readonly target = new THREE.Vector3()

  private pendingYaw = 0
  private pendingPitch = 0
  private readonly offset = new THREE.Vector3()
  private readonly quat = new THREE.Quaternion()
  private readonly right = new THREE.Vector3()

  constructor(
    public dampingFactor = 0.08,
    public minDistance = 0.5,
    public maxDistance = 60
  ) {}

  /**
   * Queue a rotation in radians: `dx` spins the turntable, `dy` tumbles
   * vertically. Damping spreads the motion over the following frames.
   */
  rotate(dx: number, dy: number): void {
    this.pendingYaw += dx
    this.pendingPitch += dy
  }

  /** Multiply the camera's distance to the target by `factor` (clamped). */
  zoomBy(camera: THREE.Camera, factor: number): void {
    this.offset.copy(camera.position).sub(this.target)
    const length = Math.min(
      this.maxDistance,
      Math.max(this.minDistance, this.offset.length() * factor)
    )
    this.offset.setLength(length)
    camera.position.copy(this.target).add(this.offset)
  }

  /**
   * Advance one frame. `autoRotateStep` is an extra turntable angle (radians)
   * for auto-rotation. Returns whether the camera moved.
   */
  update(camera: THREE.Camera, autoRotateStep = 0): boolean {
    const yaw = this.pendingYaw * this.dampingFactor + autoRotateStep
    const pitch = this.pendingPitch * this.dampingFactor
    this.pendingYaw *= 1 - this.dampingFactor
    this.pendingPitch *= 1 - this.dampingFactor
    if (Math.abs(yaw) < 1e-7 && Math.abs(pitch) < 1e-7) return false

    this.offset.copy(camera.position).sub(this.target)

    // Turntable spin about the world's vertical. The up vector rides along so
    // the spin stays coherent even while the camera is upside down mid-tumble.
    this.quat.setFromAxisAngle(WORLD_UP, -yaw)
    this.offset.applyQuaternion(this.quat)
    camera.up.applyQuaternion(this.quat)

    // Vertical tumble about the camera's right axis — up is carried along, so
    // the motion continues smoothly across the poles instead of clamping.
    this.right.crossVectors(camera.up, this.offset).normalize()
    this.quat.setFromAxisAngle(this.right, pitch)
    this.offset.applyQuaternion(this.quat)
    camera.up.applyQuaternion(this.quat)

    // Keep up orthogonal to the view direction so tiny numeric drift never
    // accumulates into roll.
    const viewDir = this.offset.clone().normalize()
    camera.up.addScaledVector(viewDir, -camera.up.dot(viewDir)).normalize()

    camera.position.copy(this.target).add(this.offset)
    camera.lookAt(this.target)
    return true
  }
}

/** The per-frame turntable step for auto-rotation (one revolution per minute at speed 1). */
export function tumbleAutoRotateStep(deltaSeconds: number, speed: number): number {
  return ((2 * Math.PI) / 60) * speed * deltaSeconds
}
