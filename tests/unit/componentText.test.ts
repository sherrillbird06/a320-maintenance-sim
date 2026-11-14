import { describe, expect, it } from 'vitest'
import { COMPONENTS } from '../../src/data/components'

const gear = COMPONENTS.filter((c) => c.zone === 'C' || /^eng\d_/.test(c.id))

describe('landing gear and engine component information', () => {
  it.each(gear.map((c) => [c.id, c] as const))(
    '%s has a description, a normal condition and checks',
    (_id, c) => {
      expect(c.description?.length ?? 0).toBeGreaterThan(40)
      expect(c.normalCondition?.length ?? 0).toBeGreaterThan(30)
      expect(c.checks?.length ?? 0).toBeGreaterThanOrEqual(2)
    },
  )

  it('gives left and right twins the same information', () => {
    const lh = gear.find((c) => c.id === 'mlg_side_stay_lh')
    const rh = gear.find((c) => c.id === 'mlg_side_stay_rh')
    expect(lh?.description).toBe(rh?.description)
    expect(lh?.checks).toEqual(rh?.checks)
  })

  it('gives both engines the same information', () => {
    const one = gear.find((c) => c.id === 'eng1_fan')
    const two = gear.find((c) => c.id === 'eng2_fan')
    expect(one?.description).toBe(two?.description)
    expect(one?.checks).toEqual(two?.checks)
  })

  it('states no limit, pressure, quantity or interval', () => {
    for (const c of gear) {
      const text = [c.description, c.normalCondition, ...(c.checks ?? [])].join(' ')
      expect(text, c.id).not.toMatch(
        /\d+(\.\d+)?\s?(mm|cm|in|inch|inches|psi|bar|%|hours|cycles|flights|litres|liters|quarts|nm)\b/i,
      )
    }
  })

  it('never tells the technician a part is serviceable or within limits', () => {
    for (const c of gear) {
      const text = [c.description, c.normalCondition, ...(c.checks ?? [])].join(' ')
      expect(text, c.id).not.toMatch(/within limits|is serviceable|acceptable to fly/i)
    }
  })
})
