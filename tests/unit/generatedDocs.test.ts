import { describe, expect, it } from 'vitest'
import { renderAssetListDoc } from '../../src/data/assets'
import { renderSourcesDoc } from '../../src/data/sources'

// These documents are generated from data. Regenerate them with `npm run docs`.
describe('generated documents', () => {
  it('docs/asset-list.md matches the component registry and asset list', async () => {
    await expect(renderAssetListDoc()).toMatchFileSnapshot('../../docs/asset-list.md')
  })

  it('docs/sources.md matches the source list', async () => {
    await expect(renderSourcesDoc()).toMatchFileSnapshot('../../docs/sources.md')
  })
})
