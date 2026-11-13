import { describe, expect, it } from 'vitest'
import {
  heightToNormal,
  paintSkinHeight,
  type SkinLayout,
} from '../../src/world/textures/detailMaps'

function pixel(data: Uint8ClampedArray, width: number, x: number, y: number) {
  const i = (y * width + x) * 4
  return [data[i], data[i + 1], data[i + 2], data[i + 3]]
}

describe('heightToNormal', () => {
  it('turns a flat surface into the straight-up normal', () => {
    const normal = heightToNormal(new Float32Array(16).fill(0.5), 4, 4, 2)
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) expect(pixel(normal, 4, x, y)).toEqual([128, 128, 255, 255])
    }
  })

  it('tilts the normal toward -x where the surface rises in +x', () => {
    const width = 8
    const height = new Float32Array(width * width)
    for (let y = 0; y < width; y++)
      for (let x = 0; x < width; x++) height[y * width + x] = x / width
    const [r, g, b] = pixel(heightToNormal(height, width, width, 4), width, 3, 3)
    expect(r).toBeLessThan(128)
    expect(g).toBe(128)
    expect(b).toBeGreaterThan(128)
  })

  it('tilts the normal toward -y where the surface rises in +y', () => {
    const width = 8
    const height = new Float32Array(width * width)
    for (let y = 0; y < width; y++)
      for (let x = 0; x < width; x++) height[y * width + x] = y / width
    const [r, g] = pixel(heightToNormal(height, width, width, 4), width, 3, 3)
    expect(r).toBe(128)
    expect(g).toBeLessThan(128)
  })

  it('wraps at the edges so the map tiles without a seam', () => {
    // A single raised column at x = 0 must tilt its neighbour across the wrap, at x = width - 1.
    const width = 8
    const height = new Float32Array(width * width)
    for (let y = 0; y < width; y++) height[y * width] = 1
    const [r] = pixel(heightToNormal(height, width, width, 4), width, width - 1, 4)
    expect(r).toBeLessThan(128)
  })

  it('rejects a height field whose length does not match its size', () => {
    expect(() => heightToNormal(new Float32Array(10), 4, 4, 1)).toThrow(/4 x 4/)
  })
})

describe('paintSkinHeight', () => {
  const layout: SkinLayout = {
    sizePx: 256,
    sizeM: 1,
    seamsU: [0.5],
    seamsV: [],
    seamWidthM: 0.004,
    seamDepth: 1,
    rivetRows: [],
    rivetRadiusM: 0.003,
    rivetDepth: 0.3,
  }

  it('leaves untouched skin at full height', () => {
    const height = paintSkinHeight(layout)
    expect(height[128 * 256 + 20]).toBe(1)
  })

  it('cuts a seam where the layout places one', () => {
    const height = paintSkinHeight(layout)
    expect(height[128 * 256 + 128]).toBeLessThan(0.2)
  })

  it('dimples the skin at each rivet along a row', () => {
    const height = paintSkinHeight({
      ...layout,
      seamsU: [],
      rivetRows: [{ axis: 'u', at: 0.25, pitchM: 0.1 }],
    })
    // Row runs along u at v = 0.25; rivets sit every 0.1 m starting half a pitch in.
    const row = Math.round(0.25 * 256)
    const onRivet = height[row * 256 + Math.round(0.05 * 256)] as number
    const betweenRivets = height[row * 256 + Math.round(0.1 * 256)] as number
    expect(onRivet).toBeLessThan(1)
    expect(betweenRivets).toBe(1)
  })
})
