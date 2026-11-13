import { describe, expect, it } from 'vitest'
import { ATA_CHAPTERS } from '../../src/data/ata'
import { ComponentSchema, type Component } from '../../src/data/schema'
import { SYSTEMS } from '../../src/data/systems'
import { ZONES } from '../../src/data/zones'

const slat: Component = {
  id: 'slat_3_lh',
  name: 'Slat 3, left wing',
  zone: 'B',
  ata: '27',
  side: 'LH',
  model: 'exterior',
  systems: ['flight-controls'],
}

describe('ComponentSchema', () => {
  it('accepts a well-formed component', () => {
    expect(ComponentSchema.parse(slat)).toEqual(slat)
  })

  it.each(['Slat-3', 'slat__3', '_slat', 'slat_', 'slat 3', ''])('rejects the id %j', (id) => {
    expect(ComponentSchema.safeParse({ ...slat, id }).success).toBe(false)
  })

  it('rejects an ATA reference that is not a two-digit chapter', () => {
    expect(ComponentSchema.safeParse({ ...slat, ata: '7' }).success).toBe(false)
    expect(ComponentSchema.safeParse({ ...slat, ata: '27-80-00' }).success).toBe(false)
  })

  it('rejects a system that is not one of the ten', () => {
    expect(ComponentSchema.safeParse({ ...slat, systems: ['avionics'] }).success).toBe(false)
  })
})

describe('reference tables', () => {
  const brief = ['05', '12', '21', '24', '27', '28', '29', '32', '49', '52', '53', '57', '72']
  const added = ['26', '33', '36', '55', '56', '71']

  it('marks exactly the chapters named in the brief', () => {
    const marked = ATA_CHAPTERS.filter((c) => c.fromBrief).map((c) => c.chapter)
    expect(marked.sort()).toEqual(brief)
  })

  it('gives a library page to the brief chapters and the six added ones', () => {
    const library = ATA_CHAPTERS.filter((c) => c.library).map((c) => c.chapter)
    expect(library.sort()).toEqual([...brief, ...added].sort())
  })

  it('lists chapters in ascending order without repeats', () => {
    const chapters = ATA_CHAPTERS.map((c) => c.chapter)
    expect(chapters).toEqual([...new Set(chapters)].sort())
  })

  it('has the six inspection zones A to F', () => {
    expect(ZONES.map((z) => z.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
  })

  it('has the ten systems, each tied to a known ATA chapter', () => {
    expect(SYSTEMS).toHaveLength(10)
    const chapters = new Set(ATA_CHAPTERS.map((c) => c.chapter))
    for (const system of SYSTEMS) expect(chapters.has(system.ata)).toBe(true)
  })
})
