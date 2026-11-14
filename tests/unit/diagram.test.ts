import { describe, expect, it } from 'vitest'
import { AIRCRAFT } from '../../src/data/aircraft'
import { COMPONENTS } from '../../src/data/components'
import { POSITIONED_IDS, positionOf } from '../../src/data/componentPositions'
import { DIAGRAM_BOUNDS, DIAGRAM_SHAPES, pathOf } from '../../src/sim/diagram'

const all = DIAGRAM_SHAPES.flatMap((shape) => shape.points)

describe('aircraft diagram outline', () => {
  it('is as long and as wide as the aircraft', () => {
    const xs = all.map(([x]) => x)
    const ys = all.map(([, y]) => y)
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(
      AIRCRAFT.dimensions.overallLength.value,
      1,
    )
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(AIRCRAFT.dimensions.wingspan.value, 1)
  })

  it('is symmetrical about the centreline', () => {
    const left = DIAGRAM_SHAPES.find((s) => s.id === 'wing_lh')?.points ?? []
    const right = DIAGRAM_SHAPES.find((s) => s.id === 'wing_rh')?.points ?? []
    expect(right).toEqual(left.map(([x, y]) => [x, -y]))
  })

  it('puts the engines at the published distance from the centreline', () => {
    const engine = DIAGRAM_SHAPES.find((s) => s.id === 'engine_1')?.points ?? []
    const ys = engine.map(([, y]) => y)
    expect((Math.max(...ys) + Math.min(...ys)) / 2).toBeCloseTo(
      AIRCRAFT.dimensions.engineCentrelineOffset.value,
      2,
    )
    expect(Math.min(...engine.map(([x]) => x))).toBeCloseTo(
      AIRCRAFT.dimensions.noseToEngineInlet.value,
      2,
    )
  })

  it('draws a shape for every zone that has an exterior', () => {
    expect(new Set(DIAGRAM_SHAPES.map((s) => s.zone))).toEqual(new Set(['A', 'B', 'D', 'E']))
  })

  it('writes outlines as closed SVG paths', () => {
    expect(
      pathOf([
        [0, 0],
        [1, 0],
        [1, 2.5],
      ]),
    ).toBe('M0.00 0.00 L1.00 0.00 L1.00 2.50 Z')
  })
})

describe('component positions', () => {
  const table = Object.fromEntries(POSITIONED_IDS.map((id) => [id, positionOf(id) ?? [NaN, NaN]]))

  it('has a position for every exterior component and nothing else', () => {
    const expected = COMPONENTS.filter((c) => c.model === 'exterior')
      .map((c) => c.id)
      .sort()
    expect(Object.keys(table).sort()).toEqual(expected)
  })

  it('places every component within the diagram', () => {
    for (const [id, [x, y]] of Object.entries(table)) {
      expect(x, id).toBeGreaterThan(DIAGRAM_BOUNDS.minX)
      expect(x, id).toBeLessThan(DIAGRAM_BOUNDS.maxX)
      expect(y, id).toBeGreaterThan(DIAGRAM_BOUNDS.minY)
      expect(y, id).toBeLessThan(DIAGRAM_BOUNDS.maxY)
    }
  })

  it('puts left-hand components on the left and right-hand ones on the right', () => {
    expect(table['aileron_lh']?.[1]).toBeGreaterThan(10)
    expect(table['aileron_rh']?.[1]).toBeLessThan(-10)
    expect(table['radome']?.[0]).toBeLessThan(1)
    expect(table['rudder']?.[0]).toBeGreaterThan(33)
  })
})
