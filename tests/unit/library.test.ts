import { describe, expect, it } from 'vitest'
import { ATA_CHAPTERS } from '../../src/data/ata'
import { COMPONENTS } from '../../src/data/components'
import { LIBRARY, libraryPage } from '../../src/data/library'
import { SCENARIO_TEMPLATES } from '../../src/data/scenarios'
import { SOURCES } from '../../src/data/sources'

const text = (page: (typeof LIBRARY)[number]) =>
  [page.covers, page.onThisAircraft, ...page.inspection, page.realManual].join(' ')

describe('technical library', () => {
  it('has exactly one page for every chapter marked as in the library', () => {
    const expected = ATA_CHAPTERS.filter((c) => c.library).map((c) => c.chapter)
    expect(LIBRARY.map((p) => p.chapter)).toEqual(expected)
  })

  it('has a page for every reference a work order gives', () => {
    for (const template of SCENARIO_TEMPLATES) {
      for (const chapter of template.referenceChapters)
        expect(libraryPage(chapter), chapter).toBeDefined()
    }
  })

  it.each(LIBRARY.map((p) => [p.chapter, p] as const))(
    'chapter %s is complete and sourced',
    (_c, page) => {
      expect(page.covers.length).toBeGreaterThan(60)
      expect(page.onThisAircraft.length).toBeGreaterThan(60)
      expect(page.inspection.length).toBeGreaterThanOrEqual(3)
      expect(page.sources.length).toBeGreaterThan(0)
      const ids = new Set(SOURCES.map((s) => s.id))
      for (const source of page.sources) expect(ids.has(source), source).toBe(true)
    },
  )

  it('states no limit, quantity, pressure or interval anywhere', () => {
    for (const page of LIBRARY) {
      expect(text(page), page.chapter).not.toMatch(
        /\d+(\.\d+)?\s?(mm|cm|in|inch|inches|psi|bar|%|hours|cycles|flights|litres|liters|quarts|nm|volts?|v|hz|kva)\b/i,
      )
    }
  })

  it('says on every page that the real manual is not reproduced', () => {
    for (const page of LIBRARY)
      expect(page.realManual, page.chapter).toMatch(/None of it is reproduced here/)
  })

  it('covers a chapter for most of the aircraft components', () => {
    const chapters = new Set(LIBRARY.map((p) => p.chapter))
    const covered = COMPONENTS.filter((c) => chapters.has(c.ata)).length
    expect(covered / COMPONENTS.length).toBeGreaterThan(0.7)
  })
})
