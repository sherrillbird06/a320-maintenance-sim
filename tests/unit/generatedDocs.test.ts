import { describe, expect, it } from 'vitest'
import { renderSourcesDoc } from '../../src/data/sources'

// These documents are generated from data. Regenerate them with `npm run docs`.
describe('generated documents', () => {
  it('docs/sources.md matches the source list', async () => {
    await expect(renderSourcesDoc()).toMatchFileSnapshot('../../docs/sources.md')
  })
})
