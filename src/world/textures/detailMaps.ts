/**
 * Surface detail generated at load time instead of downloaded: panel seams and
 * rivet rows for painted skin. The functions here are pure so they can be
 * tested without a browser; the scene wraps their output in textures.
 */

export interface RivetRow {
  /** 'u' rows run along u at a fixed v; 'v' rows run along v at a fixed u. */
  axis: 'u' | 'v'
  /** Position of the row across the tile, 0..1. */
  at: number
  /** Distance between rivets in metres. The first rivet sits half a pitch in. */
  pitchM: number
}

export interface SkinLayout {
  /** Edge length of the square map in pixels. */
  sizePx: number
  /** Edge length of the area the map covers, in metres. */
  sizeM: number
  /** Seams at constant u (running along v), 0..1. */
  seamsU: number[]
  /** Seams at constant v (running along u), 0..1. */
  seamsV: number[]
  seamWidthM: number
  /** Depth of a seam as a fraction of full height, 0..1. */
  seamDepth: number
  rivetRows: RivetRow[]
  rivetRadiusM: number
  rivetDepth: number
}

/** Shortest distance between two positions on a tile that wraps at `size`. */
function wrapDistance(a: number, b: number, size: number): number {
  const d = Math.abs(a - b) % size
  return Math.min(d, size - d)
}

/**
 * Height field for a tile of aircraft skin: 1 is untouched surface, lower values
 * are seams and rivet dimples. Tiles seamlessly.
 */
export function paintSkinHeight(layout: SkinLayout): Float32Array {
  const { sizePx, sizeM } = layout
  const pxPerM = sizePx / sizeM
  const height = new Float32Array(sizePx * sizePx).fill(1)

  const lower = (x: number, y: number, value: number) => {
    const xi = ((x % sizePx) + sizePx) % sizePx
    const yi = ((y % sizePx) + sizePx) % sizePx
    const i = yi * sizePx + xi
    if (value < (height[i] as number)) height[i] = value
  }

  // Seams: a rounded groove across the whole tile.
  const half = Math.max((layout.seamWidthM * pxPerM) / 2, 0.5)
  const reach = Math.ceil(half)
  const groove = (distance: number) =>
    distance >= half ? 1 : 1 - layout.seamDepth * (1 - (distance / half) ** 2)
  for (const u of layout.seamsU) {
    const centre = u * sizePx
    for (let x = Math.floor(centre) - reach; x <= Math.ceil(centre) + reach; x++) {
      const value = groove(wrapDistance(x, centre, sizePx))
      if (value < 1) for (let y = 0; y < sizePx; y++) lower(x, y, value)
    }
  }
  for (const v of layout.seamsV) {
    const centre = v * sizePx
    for (let y = Math.floor(centre) - reach; y <= Math.ceil(centre) + reach; y++) {
      const value = groove(wrapDistance(y, centre, sizePx))
      if (value < 1) for (let x = 0; x < sizePx; x++) lower(x, y, value)
    }
  }

  // Rivets: shallow round dimples at a fixed pitch along each row.
  const radius = Math.max(layout.rivetRadiusM * pxPerM, 0.5)
  const rivetReach = Math.ceil(radius)
  for (const row of layout.rivetRows) {
    const across = row.at * sizePx
    const pitch = row.pitchM * pxPerM
    for (let along = pitch / 2; along < sizePx; along += pitch) {
      const cx = row.axis === 'u' ? along : across
      const cy = row.axis === 'u' ? across : along
      for (let y = Math.floor(cy) - rivetReach; y <= Math.ceil(cy) + rivetReach; y++) {
        for (let x = Math.floor(cx) - rivetReach; x <= Math.ceil(cx) + rivetReach; x++) {
          const distance = Math.hypot(x - cx, y - cy)
          if (distance < radius) lower(x, y, 1 - layout.rivetDepth * (1 - (distance / radius) ** 2))
        }
      }
    }
  }

  return height
}

/**
 * Converts a height field to a tangent-space normal map (RGBA, OpenGL
 * convention: +x red, +y green). Samples wrap, so a tileable height field gives
 * a tileable normal map.
 */
export function heightToNormal(
  height: Float32Array,
  width: number,
  heightPx: number,
  strength: number,
): Uint8ClampedArray {
  if (height.length !== width * heightPx) {
    throw new Error(`Height field has ${height.length} samples; expected ${width} x ${heightPx}`)
  }
  const out = new Uint8ClampedArray(width * heightPx * 4)
  const at = (x: number, y: number) =>
    height[((y + heightPx) % heightPx) * width + ((x + width) % width)] as number

  for (let y = 0; y < heightPx; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength
      const length = Math.hypot(dx, dy, 1)
      const i = (y * width + x) * 4
      out[i] = Math.round((-dx / length) * 127.5 + 127.5)
      out[i + 1] = Math.round((-dy / length) * 127.5 + 127.5)
      out[i + 2] = Math.round((1 / length) * 127.5 + 127.5)
      out[i + 3] = 255
    }
  }
  return out
}
