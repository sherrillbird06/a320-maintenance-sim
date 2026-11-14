import raw from './generated/componentPositions.json'

/** Plan-view position of a component: metres aft of the nose, metres toward the aircraft left. */
export type PlanPosition = [x: number, y: number]

const TABLE: Record<string, number[]> = raw

/** Ids of every component that has a position on the diagram. */
export const POSITIONED_IDS = Object.keys(TABLE)

/**
 * Where a component sits in plan view. Positions are read from the exterior
 * model by `npm run docs`, so they follow the model; cockpit components have none.
 */
export function positionOf(id: string): PlanPosition | undefined {
  const entry = TABLE[id]
  const x = entry?.[0]
  const y = entry?.[1]
  return x === undefined || y === undefined ? undefined : [x, y]
}
