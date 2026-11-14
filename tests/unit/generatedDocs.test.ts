import { describe, expect, it } from 'vitest'
import { renderAssetListDoc } from '../../src/data/assets'
import { COMPONENTS } from '../../src/data/components'
import { renderSourcesDoc } from '../../src/data/sources'
import { readModel } from '../../tools/readModel'

// These documents are generated from data. Regenerate them with `npm run docs`.
describe('generated documents', () => {
  it('docs/asset-list.md matches the component registry and asset list', async () => {
    await expect(renderAssetListDoc()).toMatchFileSnapshot('../../docs/asset-list.md')
  })

  it('docs/sources.md matches the source list', async () => {
    await expect(renderSourcesDoc()).toMatchFileSnapshot('../../docs/sources.md')
  })

  // Where each exterior component sits in plan view, for the aircraft diagram: metres aft of the
  // nose and metres toward the aircraft's left. Read from the model so the two cannot drift.
  it('src/data/generated/componentPositions.json matches the exterior model', async () => {
    const model = await readModel('public/models/exterior.glb')
    const table: Record<string, [number, number]> = {}
    for (const component of COMPONENTS.filter((c) => c.model === 'exterior')) {
      const box = model.nodeBounds[component.id]
      if (!box) throw new Error(`${component.id} is missing from the exterior model`)
      const round = (value: number) => Math.round(value * 100) / 100
      // glTF Z points to the aircraft's left.
      table[component.id] = [
        round((box.min[0] + box.max[0]) / 2),
        round((box.min[2] + box.max[2]) / 2),
      ]
    }
    await expect(JSON.stringify(table, null, 1) + '\n').toMatchFileSnapshot(
      '../../src/data/generated/componentPositions.json',
    )
  })
})
