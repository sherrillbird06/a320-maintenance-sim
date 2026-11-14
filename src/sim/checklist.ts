import type { ScenarioTemplate } from '../data/schema'

export interface ChecklistLine {
  id: string
  title: string
  /** True once every component in the item has been examined. */
  examined: boolean
  done: number
  total: number
}

/**
 * Where the inspection stands against its checklist. An item counts as examined
 * only when the technician has looked at every component it names; looking at
 * one of two tires does not tick the pair.
 */
export function checklistStatus(
  template: ScenarioTemplate,
  examinedComponentIds: readonly string[],
): ChecklistLine[] {
  const seen = new Set(examinedComponentIds)
  return template.checklist.map((item) => {
    const done = item.components.filter((id) => seen.has(id)).length
    return {
      id: item.id,
      title: item.title,
      examined: done === item.components.length,
      done,
      total: item.components.length,
    }
  })
}

/** Share of checklist items fully examined, from 0 to 1. */
export function coverage(lines: readonly ChecklistLine[]): number {
  if (lines.length === 0) return 1
  return lines.filter((line) => line.examined).length / lines.length
}
