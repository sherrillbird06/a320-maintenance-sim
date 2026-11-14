import { describe, expect, it } from 'vitest'
import { SCENARIO_TEMPLATES } from '../../src/data/scenarios'
import { checklistStatus, coverage } from '../../src/sim/checklist'
import { LEVELS, PASS_ACCURACY, summarize, type CompletedInspection } from '../../src/sim/progress'

const tires = SCENARIO_TEMPLATES.find((t) => t.id === 'lg_tire_inspection')
const engine = SCENARIO_TEMPLATES.find((t) => t.id === 'engine_inlet_inspection')
if (!tires || !engine) throw new Error('templates missing')

describe('checklist', () => {
  it('gives every assignment a checklist whose items name real work', () => {
    for (const template of SCENARIO_TEMPLATES) {
      expect(template.checklist.length, template.id).toBeGreaterThanOrEqual(2)
    }
  })

  it('starts with nothing examined', () => {
    const lines = checklistStatus(tires, [])
    expect(lines.every((line) => !line.examined)).toBe(true)
    expect(coverage(lines)).toBe(0)
  })

  it('marks an item examined only when every component in it has been looked at', () => {
    const one = checklistStatus(tires, ['nlg_tire_lh'])
    expect(one.find((l) => l.id === 'nose_tires')).toMatchObject({
      examined: false,
      done: 1,
      total: 2,
    })
    const both = checklistStatus(tires, ['nlg_tire_lh', 'nlg_tire_rh'])
    expect(both.find((l) => l.id === 'nose_tires')?.examined).toBe(true)
  })

  it('ignores components that are not on the checklist', () => {
    expect(coverage(checklistStatus(tires, ['rudder', 'eng1_fan']))).toBe(0)
  })

  it('reaches full coverage when everything is examined', () => {
    const all = tires.checklist.flatMap((item) => item.components)
    expect(coverage(checklistStatus(tires, all))).toBe(1)
  })
})

const run = (overrides: Partial<CompletedInspection>): CompletedInspection => ({
  level: 4,
  accuracy: 1,
  correct: 1,
  incorrect: 0,
  missed: 0,
  timeTakenSeconds: 120,
  ataReferences: ['32'],
  ...overrides,
})

describe('summarize', () => {
  it('reports an empty profile before any inspection', () => {
    const profile = summarize([], SCENARIO_TEMPLATES)
    expect(profile.completed).toBe(0)
    expect(profile.averageAccuracy).toBeNull()
    expect(profile.levels).toHaveLength(7)
    expect(profile.levels.map((l) => l.title)).toEqual(LEVELS.map((l) => l.title))
  })

  it('totals findings and averages accuracy and time', () => {
    const profile = summarize(
      [
        run({ accuracy: 1, correct: 2, timeTakenSeconds: 100 }),
        run({ accuracy: 0.5, correct: 1, incorrect: 1, missed: 1, timeTakenSeconds: 200 }),
      ],
      SCENARIO_TEMPLATES,
    )
    expect(profile.completed).toBe(2)
    expect(profile.averageAccuracy).toBe(0.75)
    expect(profile.averageTimeSeconds).toBe(150)
    expect(profile.totals).toEqual({ correct: 3, incorrect: 1, missed: 1 })
  })

  it('passes a level only at or above the pass accuracy', () => {
    const below = summarize([run({ accuracy: PASS_ACCURACY - 0.01 })], SCENARIO_TEMPLATES)
    const at = summarize([run({ accuracy: PASS_ACCURACY })], SCENARIO_TEMPLATES)
    expect(below.levels.find((l) => l.level === 4)).toMatchObject({ attempts: 1, passed: false })
    expect(at.levels.find((l) => l.level === 4)).toMatchObject({ attempts: 1, passed: true })
  })

  it('keeps the best result for a level across attempts', () => {
    const profile = summarize(
      [run({ accuracy: 0.4 }), run({ accuracy: 0.9 }), run({ accuracy: 0.6 })],
      SCENARIO_TEMPLATES,
    )
    expect(profile.levels.find((l) => l.level === 4)).toMatchObject({
      attempts: 3,
      best: 0.9,
      passed: true,
    })
  })

  it('shows which levels have an assignment to attempt', () => {
    const profile = summarize([], SCENARIO_TEMPLATES)
    expect(profile.levels.filter((l) => l.available).map((l) => l.level)).toEqual([4, 5, 6])
  })

  it('records practice per ATA chapter', () => {
    const profile = summarize(
      [run({}), run({ level: 6, ataReferences: ['71', '72'], accuracy: 0.5 })],
      SCENARIO_TEMPLATES,
    )
    expect(profile.chapters).toEqual([
      { chapter: '32', attempts: 1, best: 1 },
      { chapter: '71', attempts: 1, best: 0.5 },
      { chapter: '72', attempts: 1, best: 0.5 },
    ])
  })
})
