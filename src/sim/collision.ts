/** An axis-aligned box in the hangar, in metres: [x, y (up), z]. */
export interface Obstacle {
  min: [number, number, number]
  max: [number, number, number]
}

export interface Body {
  /** Radius of the technician's footprint. */
  radius: number
  /** Top of the head above the floor; lower when crouching. */
  height: number
}

export interface FloorPoint {
  x: number
  z: number
}

/** Anything whose top is below this can be stepped over. */
const STEP_HEIGHT_M = 0.15

/** True when a body standing at the point overlaps any obstacle. */
export function blocked(point: FloorPoint, body: Body, obstacles: readonly Obstacle[]): boolean {
  for (const { min, max } of obstacles) {
    if (max[1] < STEP_HEIGHT_M || min[1] >= body.height) continue
    const dx = point.x - Math.max(min[0], Math.min(point.x, max[0]))
    const dz = point.z - Math.max(min[2], Math.min(point.z, max[2]))
    if (dx * dx + dz * dz < body.radius * body.radius) return true
  }
  return false
}

/**
 * Where a step from one point toward another actually ends. A blocked step
 * slides along the obstacle where it can. A body that is already inside an
 * obstacle is never trapped: it may always move.
 */
export function resolveMove(
  from: FloorPoint,
  to: FloorPoint,
  body: Body,
  obstacles: readonly Obstacle[],
): FloorPoint {
  if (blocked(from, body, obstacles) || !blocked(to, body, obstacles)) return to
  const alongX = { x: to.x, z: from.z }
  const alongZ = { x: from.x, z: to.z }
  // Prefer the axis with the larger movement, so sliding follows the way the player is heading.
  const order =
    Math.abs(to.x - from.x) >= Math.abs(to.z - from.z) ? [alongX, alongZ] : [alongZ, alongX]
  for (const candidate of order) {
    if (!blocked(candidate, body, obstacles)) return candidate
  }
  return from
}
