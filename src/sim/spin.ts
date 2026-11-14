export type Point = [number, number, number]

/** Turns a point about an axis parallel to X through `centre`, by `angle` radians. */
export function spin(point: Point, centre: Point, angle: number): Point {
  const y = point[1] - centre[1]
  const z = point[2] - centre[2]
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return [point[0], centre[1] + y * cos - z * sin, centre[2] + y * sin + z * cos]
}

/**
 * Where a point on a turned fan was before the fan was turned. Defects are
 * recorded at the fan's rest position, so a tag made on a turned fan is carried
 * back to rest before it is compared with them.
 */
export function unspin(point: Point, centre: Point, angle: number): Point {
  return spin(point, centre, -angle)
}
