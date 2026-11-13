import { describe, expect, it } from 'vitest'
import { assetUrl, describeLoadError, failedAsset, modelUrl } from '../../src/world/loadModel'

describe('modelUrl', () => {
  it('resolves under the GitHub Pages sub-path', () => {
    expect(modelUrl('lookdev_tire', '/a320-maintenance-sim/')).toBe(
      '/a320-maintenance-sim/models/lookdev_tire.glb',
    )
  })

  it('resolves at the site root', () => {
    expect(modelUrl('lookdev_tire', '/')).toBe('/models/lookdev_tire.glb')
  })
})

describe('assetUrl', () => {
  it('joins a public-folder path onto the base without doubling slashes', () => {
    expect(assetUrl('/textures/floor.webp', '/a320-maintenance-sim/')).toBe(
      '/a320-maintenance-sim/textures/floor.webp',
    )
    expect(assetUrl('textures/floor.webp', '/')).toBe('/textures/floor.webp')
  })
})

describe('describeLoadError', () => {
  it('names the file that failed and keeps the underlying reason', () => {
    const result = describeLoadError(
      '/a320-maintenance-sim/models/lookdev_tire.glb',
      new Error('fetch for "lookdev_tire.glb" responded with 404'),
    )
    expect(result.title).toBe('Part of the simulator could not be loaded')
    expect(result.body).toContain('lookdev_tire.glb')
    expect(result.body).toContain('404')
  })

  it('copes with a failure that is not an Error object', () => {
    const result = describeLoadError('/textures/floor.webp', undefined)
    expect(result.body).toContain('floor.webp')
    expect(result.body).not.toContain('undefined')
  })
})

describe('failedAsset', () => {
  const urls = ['/app/models/lookdev_tire.glb', '/app/env/hangar_interior_1k.hdr']

  it('finds which known asset a loader error is about', () => {
    const error = new Error('Could not load /app/models/lookdev_tire.glb: Failed to fetch')
    expect(failedAsset(error, urls)).toBe('/app/models/lookdev_tire.glb')
  })

  it('returns undefined when the error names none of them', () => {
    expect(failedAsset(new Error('shader compile failed'), urls)).toBeUndefined()
    expect(failedAsset(null, urls)).toBeUndefined()
  })
})
