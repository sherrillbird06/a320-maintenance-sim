import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { COMPONENTS } from '../../src/data/components'
import type { ModelId } from '../../src/data/schema'
import { checkModels } from '../../tools/checkModels'
import { readModel } from '../../tools/readModel'

const MODELS: ModelId[] = ['exterior', 'cockpit']

describe('the model pipeline output', () => {
  it('lookdev_tire.glb holds the tire and wheel as named nodes', async () => {
    const model = await readModel('public/models/lookdev_tire.glb')
    expect(model.nodeNames).toEqual(expect.arrayContaining(['lookdev_tire', 'lookdev_wheel']))
    expect(model.inspectableNodes).toEqual([])
    expect(model.triangles).toBeGreaterThan(5_000)
    expect(model.triangles).toBeLessThan(40_000)
  })
})

// The aircraft models arrive in later milestones. Until a file exists its check is
// reported as skipped; once it exists it must agree with the registry exactly.
describe('model files agree with the component registry', () => {
  for (const model of MODELS) {
    const path = `public/models/${model}.glb`
    it.skipIf(!existsSync(path))(`${model}.glb`, async () => {
      const { nodeNames, inspectableNodes } = await readModel(path)
      const componentIds = COMPONENTS.filter((c) => c.model === model).map((c) => c.id)
      expect(checkModels({ model, componentIds, nodeNames, inspectableNodes })).toEqual([])
    })
  }
})
