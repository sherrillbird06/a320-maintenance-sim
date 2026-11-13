export type BudgetedModel = 'exterior' | 'cockpit' | 'hangar'

export interface Budgets {
  /** Bytes downloaded before the player can start; the cockpit loads later and is excluded. */
  firstLoadBytes: number
  triangles: Record<BudgetedModel, number>
  targetFps: number
}

export interface Measured {
  firstLoadBytes: number
  /** Triangles per model; a model that is not built yet may be left out. */
  triangles: Partial<Record<BudgetedModel, number>>
}

/** Returns one message per budget that is exceeded; empty when everything fits. */
export function checkBudgets(measured: Measured, budgets: Budgets): string[] {
  const problems: string[] = []
  if (measured.firstLoadBytes > budgets.firstLoadBytes) {
    problems.push(
      `first load: ${measured.firstLoadBytes} bytes is over the budget of ${budgets.firstLoadBytes}`,
    )
  }
  for (const model of Object.keys(budgets.triangles) as BudgetedModel[]) {
    const count = measured.triangles[model] ?? 0
    if (count > budgets.triangles[model]) {
      problems.push(
        `${model}: ${count} triangles is over the budget of ${budgets.triangles[model]}`,
      )
    }
  }
  return problems
}
