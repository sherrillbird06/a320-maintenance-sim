import { describe, expect, it } from 'vitest'
import { blocked, resolveMove, type Obstacle } from '../../src/sim/collision'

const crate: Obstacle = { min: [2, 0, -1], max: [4, 1.2, 1] }
const beam: Obstacle = { min: [-1, 1.4, 5], max: [1, 4, 6] } // overhead: clear below 1.4 m
const tray: Obstacle = { min: [8, 0, 8], max: [9, 0.06, 9] } // low enough to step over
const body = { radius: 0.3, height: 1.8 }

describe('blocked', () => {
  it('is false in open floor', () => {
    expect(blocked({ x: 0, z: 0 }, body, [crate, beam, tray])).toBe(false)
  })

  it('is true inside an obstacle and when the body overlaps its edge', () => {
    expect(blocked({ x: 3, z: 0 }, body, [crate])).toBe(true)
    expect(blocked({ x: 1.8, z: 0 }, body, [crate])).toBe(true)
    expect(blocked({ x: 1.69, z: 0 }, body, [crate])).toBe(false)
  })

  it('lets a crouching technician pass under something a standing one hits', () => {
    expect(blocked({ x: 0, z: 5.5 }, body, [beam])).toBe(true)
    expect(blocked({ x: 0, z: 5.5 }, { radius: 0.3, height: 1.05 }, [beam])).toBe(false)
  })

  it('ignores things low enough to step over', () => {
    expect(blocked({ x: 8.5, z: 8.5 }, body, [tray])).toBe(false)
  })

  it('rounds corners: a diagonal near miss is not a hit', () => {
    expect(blocked({ x: 1.75, z: -1.25 }, body, [crate])).toBe(false)
    expect(blocked({ x: 1.85, z: -1.15 }, body, [crate])).toBe(true)
  })
})

describe('resolveMove', () => {
  it('allows a free move unchanged', () => {
    expect(resolveMove({ x: 0, z: 0 }, { x: 0.5, z: 0.5 }, body, [crate])).toEqual({
      x: 0.5,
      z: 0.5,
    })
  })

  it('slides along an obstacle instead of stopping dead', () => {
    // Walking diagonally into the crate's near face: forward motion is blocked, sideways is kept.
    const result = resolveMove({ x: 1.6, z: 0 }, { x: 1.9, z: 0.2 }, body, [crate])
    expect(result).toEqual({ x: 1.6, z: 0.2 })
  })

  it('stays put when both directions are blocked', () => {
    const corner: Obstacle[] = [crate, { min: [0, 0, 1], max: [2, 1.2, 3] }]
    const from = { x: 1.6, z: 0.6 }
    expect(resolveMove(from, { x: 1.9, z: 0.9 }, body, corner)).toEqual(from)
  })

  it('lets someone who starts inside an obstacle walk out', () => {
    const result = resolveMove({ x: 3, z: 0 }, { x: 3, z: 0.4 }, body, [crate])
    expect(result).toEqual({ x: 3, z: 0.4 })
  })
})
