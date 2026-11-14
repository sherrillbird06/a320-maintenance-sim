import { describe, expect, it } from 'vitest'
import { spin, unspin, type Point } from '../../src/sim/spin'

const centre: Point = [12, 2, 5]

describe('spin', () => {
  it('leaves the position along the axis unchanged', () => {
    expect(spin([12.3, 2.5, 5], centre, 1.1)[0]).toBe(12.3)
  })

  it('carries a point a quarter turn round the axis', () => {
    const [x, y, z] = spin([12, 2.5, 5], centre, Math.PI / 2)
    expect(x).toBe(12)
    expect(y).toBeCloseTo(2, 10)
    expect(z).toBeCloseTo(5.5, 10)
  })

  it('keeps the point the same distance from the axis', () => {
    const [, y, z] = spin([12, 2.4, 5.3], centre, 0.77)
    expect(Math.hypot(y - 2, z - 5)).toBeCloseTo(0.5, 10)
  })
})

describe('unspin', () => {
  it('undoes a spin, so a tag on a turned fan lands on the defect at rest', () => {
    const defect: Point = [12.05, 2.4, 5.45]
    const seen = spin(defect, centre, 2.3)
    const [x, y, z] = unspin(seen, centre, 2.3)
    expect(x).toBeCloseTo(defect[0], 10)
    expect(y).toBeCloseTo(defect[1], 10)
    expect(z).toBeCloseTo(defect[2], 10)
  })
})
