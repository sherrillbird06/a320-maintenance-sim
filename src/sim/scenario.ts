import type { DefectType, ScenarioTemplate } from '../data/schema'
import { createRng, shuffled } from './rng'

/** One defect as it exists on the aircraft in a particular scenario. */
export interface PlacedDefect {
  defectTypeId: string
  componentId: string
  anchorIndex: number
  /** Where the defect is, in the aircraft model's own coordinates (metres). */
  position: [number, number, number]
  normal: [number, number, number]
}

export interface Scenario {
  seed: number
  templateId: string
  /** Work order number. It carries the seed, so quoting it is enough to replay the scenario. */
  workOrder: string
  defects: PlacedDefect[]
}

/**
 * Builds a scenario from a template. Everything random comes from the seed, so
 * the same seed always produces the same aircraft condition.
 */
export function generateScenario(
  template: ScenarioTemplate,
  defectTypes: readonly DefectType[],
  seed: number,
): Scenario {
  const rng = createRng(seed)
  const { min, max } = template.defectCount
  const wanted = min + Math.floor(rng() * (max - min + 1))

  const candidates = defectTypes
    .filter((type) => template.defectPool.includes(type.category))
    .flatMap((type) => type.anchors.map((anchor, anchorIndex) => ({ type, anchor, anchorIndex })))

  const defects: PlacedDefect[] = []
  const used = new Set<string>()
  for (const { type, anchor, anchorIndex } of shuffled(candidates, rng)) {
    if (defects.length >= wanted) break
    // One defect per component keeps each finding unambiguous.
    if (used.has(anchor.componentId)) continue
    used.add(anchor.componentId)
    defects.push({
      defectTypeId: type.id,
      componentId: anchor.componentId,
      anchorIndex,
      position: anchor.position,
      normal: anchor.normal,
    })
  }

  return { seed, templateId: template.id, workOrder: `WO-${seed}`, defects }
}
