import { describe, expect, it } from 'vitest'
import type { AtaChapter, Component, Source, Zone } from '../../src/data/schema'
import { validateRegistry } from '../../src/data/validate'

const ata: AtaChapter[] = [
  { chapter: '27', title: 'Flight Controls', fromBrief: true, library: true },
  { chapter: '31', title: 'Indicating/Recording Systems', fromBrief: false, library: false },
  { chapter: '71', title: 'Power Plant', fromBrief: false, library: true },
]
const zones: Zone[] = [
  { id: 'B', title: 'Wings and engines' },
  { id: 'E', title: 'Cockpit' },
  { id: 'F', title: 'Aircraft systems' },
]
const sources: Source[] = [
  {
    id: 'example',
    title: 'Example',
    publisher: 'Example',
    url: 'https://example.com/doc',
    licence: 'Public',
    usedFor: 'Tests',
  },
]

function component(overrides: Partial<Component> & { id: string }): Component {
  return { name: overrides.id, zone: 'B', ata: '27', model: 'exterior', systems: [], ...overrides }
}

const clean: Component[] = [
  component({ id: 'slat_1_lh', side: 'LH' }),
  component({ id: 'slat_1_rh', side: 'RH' }),
  component({ id: 'eng1_fan', side: 'LH', ata: '71' }),
  component({ id: 'eng2_fan', side: 'RH', ata: '71' }),
  component({ id: 'rudder' }),
  component({ id: 'cockpit_pedestal', zone: 'E', ata: '31', model: 'cockpit' }),
]

function problems(
  components: Component[],
  extra: Partial<Parameters<typeof validateRegistry>[0]> = {},
) {
  return validateRegistry({ components, ata, zones, sources, ...extra })
}

describe('validateRegistry', () => {
  it('returns no problems for a clean registry', () => {
    expect(problems(clean)).toEqual([])
  })

  it('names a duplicated id', () => {
    expect(problems([...clean, component({ id: 'rudder' })])).toEqual(['rudder: duplicate id'])
  })

  it('names a record whose id is malformed', () => {
    const result = problems([...clean, component({ id: 'Bad-Id' })])
    expect(result).toHaveLength(1)
    expect(result[0]).toMatch(/^Bad-Id: /)
  })

  it('names a record with an unknown ATA chapter', () => {
    expect(problems([...clean, component({ id: 'aileron_trim', ata: '99' })])).toEqual([
      'aileron_trim: unknown ATA chapter "99"',
    ])
  })

  it('names a record in a zone that is not defined', () => {
    expect(problems([...clean, component({ id: 'radome', zone: 'A' })])).toEqual([
      'radome: unknown zone "A"',
    ])
  })

  it('rejects a component filed under the systems zone F', () => {
    expect(problems([...clean, component({ id: 'hyd_schematic', zone: 'F' })])).toEqual([
      'hyd_schematic: zone F holds system modules, not components',
    ])
  })

  it('requires cockpit-zone components to use the cockpit model', () => {
    expect(
      problems([...clean, component({ id: 'cockpit_sidestick', zone: 'E', model: 'exterior' })]),
    ).toEqual(['cockpit_sidestick: zone E components must use the cockpit model'])
  })

  it('requires components outside the cockpit zone to use the exterior model', () => {
    expect(problems([...clean, component({ id: 'elevator', model: 'cockpit' })])).toEqual([
      'elevator: only zone E components may use the cockpit model',
    ])
  })

  it('names a left-hand component with no right-hand twin', () => {
    expect(problems([...clean, component({ id: 'aileron_lh', side: 'LH' })])).toEqual([
      'aileron_lh: missing twin "aileron_rh"',
    ])
  })

  it('names a right-hand component with no left-hand twin', () => {
    expect(problems([...clean, component({ id: 'aileron_rh', side: 'RH' })])).toEqual([
      'aileron_rh: missing twin "aileron_lh"',
    ])
  })

  it('names an engine 1 component with no engine 2 twin', () => {
    expect(problems([...clean, component({ id: 'eng1_pylon', side: 'LH', ata: '71' })])).toEqual([
      'eng1_pylon: missing twin "eng2_pylon"',
    ])
  })

  it('requires the side field to agree with the id', () => {
    const swapped = clean.map((c) => (c.id === 'slat_1_lh' ? { ...c, side: 'RH' as const } : c))
    expect(problems(swapped)).toEqual(['slat_1_lh: side "RH" does not match the id (expected LH)'])
  })

  it('names a duplicated ATA chapter, zone or source', () => {
    const result = problems(clean, {
      ata: [...ata, ata[0] as AtaChapter],
      zones: [...zones, zones[0] as Zone],
      sources: [...sources, sources[0] as Source],
    })
    expect(result).toEqual([
      'ATA 27: duplicate chapter',
      'zone B: duplicate zone',
      'source example: duplicate id',
    ])
  })

  it('names a source whose link is not https', () => {
    const insecure = [{ ...(sources[0] as Source), id: 'old', url: 'http://example.com' }]
    expect(problems(clean, { sources: insecure })).toEqual(['source old: URL must use https'])
  })
})
