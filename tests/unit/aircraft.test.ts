import { describe, expect, it } from 'vitest'
import { AIRCRAFT } from '../../src/data/aircraft'
import { ATA_CHAPTERS } from '../../src/data/ata'
import { SourceSchema } from '../../src/data/schema'
import { SOURCES } from '../../src/data/sources'
import { validateRegistry } from '../../src/data/validate'
import { ZONES } from '../../src/data/zones'

describe('SOURCES', () => {
  it('is a valid, duplicate-free, https-only list', () => {
    for (const source of SOURCES) expect(SourceSchema.safeParse(source).success).toBe(true)
    expect(
      validateRegistry({ components: [], ata: ATA_CHAPTERS, zones: ZONES, sources: SOURCES }),
    ).toEqual([])
  })

  it.each([
    'airbus_ac_a320',
    'easa_tcds_a064',
    'faa_amt_general',
    'faa_amt_airframe',
    'faa_amt_powerplant',
    'faa_ac_43_13_1b',
    'faa_jasc',
  ])('includes the required source %s', (id) => {
    expect(SOURCES.some((s) => s.id === id)).toBe(true)
  })
})

describe('AIRCRAFT', () => {
  const sourceIds = new Set(SOURCES.map((s) => s.id))

  it('cites a known source and a figure reference for every dimension', () => {
    const dimensions = Object.entries(AIRCRAFT.dimensions)
    expect(dimensions.length).toBeGreaterThanOrEqual(6)
    for (const [name, dimension] of dimensions) {
      expect(sourceIds.has(dimension.source), `${name} cites ${dimension.source}`).toBe(true)
      expect(dimension.ref.length, `${name} has a figure reference`).toBeGreaterThan(0)
      expect(dimension.value).toBeGreaterThan(0)
      expect(dimension.unit).toBe('m')
    }
  })

  it('has the dimensions the model is built from', () => {
    expect(Object.keys(AIRCRAFT.dimensions)).toEqual(
      expect.arrayContaining([
        'overallLength',
        'wingspan',
        'fuselageWidth',
        'wheelbase',
        'mainGearTrack',
        'tailHeight',
      ]),
    )
  })

  it('cites a known source for the model designation', () => {
    expect(sourceIds.has(AIRCRAFT.modelSource)).toBe(true)
  })

  it('marks the registration and serial number as fictional', () => {
    expect(AIRCRAFT.registration.fictional).toBe(true)
    expect(AIRCRAFT.msn.fictional).toBe(true)
  })

  it('uses a registration the FAA can never issue, so it cannot match a real aircraft', () => {
    // FAA N-numbers never contain the letters I or O.
    expect(AIRCRAFT.registration.value).toMatch(/^N[0-9A-Z]{1,5}$/)
    expect(AIRCRAFT.registration.value.slice(1)).toMatch(/[IO]/)
  })
})
