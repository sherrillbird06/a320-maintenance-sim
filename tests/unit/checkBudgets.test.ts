import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { checkBudgets, type Budgets } from '../../tools/checkBudgets.ts'

const budgets: Budgets = {
  firstLoadBytes: 1000,
  triangles: { exterior: 400, cockpit: 150, hangar: 200 },
  targetFps: 60,
}

const atLimit = { firstLoadBytes: 1000, triangles: { exterior: 400, cockpit: 150, hangar: 200 } }

describe('checkBudgets', () => {
  it('passes exactly at every limit', () => {
    expect(checkBudgets(atLimit, budgets)).toEqual([])
  })

  it('fails one byte over the first-load budget, naming it', () => {
    expect(checkBudgets({ ...atLimit, firstLoadBytes: 1001 }, budgets)).toEqual([
      'first load: 1001 bytes is over the budget of 1000',
    ])
  })

  it.each(['exterior', 'cockpit', 'hangar'] as const)(
    'fails one triangle over the %s budget, naming it',
    (model) => {
      const triangles = { ...atLimit.triangles, [model]: budgets.triangles[model] + 1 }
      expect(checkBudgets({ ...atLimit, triangles }, budgets)).toEqual([
        `${model}: ${budgets.triangles[model] + 1} triangles is over the budget of ${budgets.triangles[model]}`,
      ])
    },
  )

  it('treats a model that is not built yet as zero triangles', () => {
    expect(checkBudgets({ firstLoadBytes: 0, triangles: {} }, budgets)).toEqual([])
  })
})

describe('budgets.json', () => {
  const file = JSON.parse(readFileSync('budgets.json', 'utf8')) as Budgets

  it('holds the budgets set in the design', () => {
    expect(file).toEqual({
      firstLoadBytes: 40 * 1024 * 1024,
      triangles: { exterior: 400_000, cockpit: 150_000, hangar: 200_000 },
      targetFps: 60,
    })
  })
})
