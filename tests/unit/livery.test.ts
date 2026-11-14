import { describe, expect, it } from 'vitest'
import { AIRCRAFT } from '../../src/data/aircraft'
import { LIVERY, tailBands } from '../../src/world/aircraft/livery'

describe('tailBands', () => {
  const bands = tailBands(11)

  it('covers the tail from bottom to top with no gaps or overlaps', () => {
    expect(bands[0]?.from).toBe(0)
    expect(bands.at(-1)?.to).toBe(1)
    for (let i = 1; i < bands.length; i++)
      expect(bands[i]?.from).toBeCloseTo(bands[i - 1]?.to ?? -1, 10)
  })

  it('never puts two bands of the same colour next to each other', () => {
    for (let i = 1; i < bands.length; i++) expect(bands[i]?.colour).not.toBe(bands[i - 1]?.colour)
  })

  it('uses only the three livery colours', () => {
    const used = new Set(bands.map((b) => b.colour))
    expect([...used].sort()).toEqual([LIVERY.blue, LIVERY.red, LIVERY.silver].sort())
  })
})

describe('LIVERY', () => {
  it('carries the fictional registration and no airline name', () => {
    expect(LIVERY.registration).toBe(AIRCRAFT.registration.value)
    expect(JSON.stringify(LIVERY).toLowerCase()).not.toContain('american')
  })
})
