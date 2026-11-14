import { describe, expect, it } from 'vitest'
import { COMPONENTS } from '../../src/data/components'
import { DEFECT_TYPES } from '../../src/data/defects'
import { DefectTypeSchema, ScenarioTemplateSchema, type Finding } from '../../src/data/schema'
import { SCENARIO_TEMPLATES } from '../../src/data/scenarios'
import { gradeInspection, TAG_RADIUS_M } from '../../src/sim/grading'
import { openEntry, signOff } from '../../src/sim/logbook'
import { createRng } from '../../src/sim/rng'
import { generateScenario, type Scenario } from '../../src/sim/scenario'

const template = SCENARIO_TEMPLATES[0]
if (!template) throw new Error('no scenario templates')

describe('createRng', () => {
  it('gives the same sequence for the same seed and a different one for another seed', () => {
    const a = createRng(42)
    const b = createRng(42)
    const c = createRng(43)
    const seqA = [a(), a(), a()]
    expect([b(), b(), b()]).toEqual(seqA)
    expect([c(), c(), c()]).not.toEqual(seqA)
    for (const value of seqA) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('scenario data', () => {
  const ids = new Set(COMPONENTS.map((c) => c.id))

  it('is valid and anchors every defect to a real component', () => {
    for (const defect of DEFECT_TYPES) {
      expect(DefectTypeSchema.safeParse(defect).success, defect.id).toBe(true)
      for (const anchor of defect.anchors)
        expect(ids.has(anchor.componentId), anchor.componentId).toBe(true)
    }
    for (const t of SCENARIO_TEMPLATES)
      expect(ScenarioTemplateSchema.safeParse(t).success, t.id).toBe(true)
  })

  it('never states a limit, measurement or interval in an explanation', () => {
    for (const defect of DEFECT_TYPES) {
      const text = [defect.explanation, defect.correctCondition, ...defect.wrongConditions].join(
        ' ',
      )
      expect(text, defect.id).not.toMatch(
        /\d+(\.\d+)?\s?(mm|in|inch|psi|bar|%|hours|cycles|flights)\b/i,
      )
    }
  })
})

describe('engine defect anchors', () => {
  const INLET_X = 11.19
  const AXIS = { y: 0.67 + 1.16, z: 5.75 }

  it('puts fan blade nicks on the fan disc, inside the inlet duct', () => {
    const nick = DEFECT_TYPES.find((d) => d.id === 'fan_blade_nick')
    for (const anchor of nick?.anchors ?? []) {
      const [x, y, z] = anchor.position
      const radius = Math.hypot(y - AXIS.y, Math.abs(z) - AXIS.z)
      expect(x).toBeGreaterThan(INLET_X + 0.7)
      expect(x).toBeLessThan(INLET_X + 1.1)
      expect(radius).toBeGreaterThan(0.3)
      expect(radius).toBeLessThan(0.88)
    }
    expect(nick?.anchors.length).toBe(6)
  })

  it('puts inlet dents on the lip at the front of each nacelle', () => {
    const dent = DEFECT_TYPES.find((d) => d.id === 'inlet_lip_dent')
    for (const anchor of dent?.anchors ?? []) {
      const [x, y, z] = anchor.position
      expect(x).toBeCloseTo(INLET_X, 1)
      expect(Math.hypot(y - AXIS.y, Math.abs(z) - AXIS.z)).toBeCloseTo(1.0, 1)
    }
  })
})

describe('generateScenario', () => {
  it('is reproducible from its seed', () => {
    expect(generateScenario(template, DEFECT_TYPES, 1234)).toEqual(
      generateScenario(template, DEFECT_TYPES, 1234),
    )
  })

  it('varies with the seed', () => {
    const variants = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8].map((seed) =>
        JSON.stringify(
          generateScenario(template, DEFECT_TYPES, seed).defects.map((d) => [
            d.defectTypeId,
            d.anchorIndex,
          ]),
        ),
      ),
    )
    expect(variants.size).toBeGreaterThan(1)
  })

  it('places a number of defects within the template range, each on a different component', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const scenario = generateScenario(template, DEFECT_TYPES, seed)
      expect(scenario.defects.length).toBeGreaterThanOrEqual(template.defectCount.min)
      expect(scenario.defects.length).toBeLessThanOrEqual(template.defectCount.max)
      const components = scenario.defects.map((d) => d.componentId)
      expect(new Set(components).size).toBe(components.length)
    }
  })

  it('only uses defect categories from the template pool', () => {
    const scenario = generateScenario(template, DEFECT_TYPES, 99)
    for (const placed of scenario.defects) {
      const type = DEFECT_TYPES.find((d) => d.id === placed.defectTypeId)
      expect(template.defectPool).toContain(type?.category)
    }
  })

  it('puts the seed in the work order number so a scenario can be replayed', () => {
    expect(generateScenario(template, DEFECT_TYPES, 1234).workOrder).toContain('1234')
  })
})

describe('gradeInspection', () => {
  const scenario: Scenario = generateScenario(template, DEFECT_TYPES, 7)
  const placed = scenario.defects[0]
  if (!placed) throw new Error('scenario has no defects')
  const type = DEFECT_TYPES.find((d) => d.id === placed.defectTypeId)
  if (!type) throw new Error('unknown defect type')

  const perfect: Finding = {
    componentId: placed.componentId,
    taggedPoint: placed.position,
    ata: type.libraryChapters[0] as string,
    category: type.category,
    condition: type.correctCondition,
    remarks: '',
  }
  const allPerfect = scenario.defects.map((d): Finding => {
    const t = DEFECT_TYPES.find((x) => x.id === d.defectTypeId)
    if (!t) throw new Error('unknown defect type')
    return {
      ...perfect,
      componentId: d.componentId,
      taggedPoint: d.position,
      category: t.category,
      condition: t.correctCondition,
      ata: t.libraryChapters[0] as string,
    }
  })

  it('scores a complete, accurate inspection at 100%', () => {
    const result = gradeInspection(scenario, allPerfect, DEFECT_TYPES)
    expect(result.summary).toEqual({
      correct: scenario.defects.length,
      partial: 0,
      incorrect: 0,
      missed: 0,
      accuracy: 1,
    })
  })

  it('lists every defect as missed when nothing is reported, each with its explanation', () => {
    const result = gradeInspection(scenario, [], DEFECT_TYPES)
    expect(result.summary.missed).toBe(scenario.defects.length)
    expect(result.summary.accuracy).toBe(0)
    for (const miss of result.missed) expect(miss.explanation.length).toBeGreaterThan(20)
  })

  it('accepts a tag just inside the radius and rejects one just outside it', () => {
    const [x, y, z] = placed.position
    const inside = gradeInspection(
      scenario,
      [{ ...perfect, taggedPoint: [x + TAG_RADIUS_M - 0.01, y, z] }],
      DEFECT_TYPES,
    )
    const outside = gradeInspection(
      scenario,
      [{ ...perfect, taggedPoint: [x + TAG_RADIUS_M + 0.01, y, z] }],
      DEFECT_TYPES,
    )
    expect(inside.findings[0]?.verdict).toBe('correct')
    expect(outside.findings[0]?.verdict).toBe('incorrect')
  })

  it('marks a located defect with a wrong write-up as partial and says which field was wrong', () => {
    const wrong = { ...perfect, condition: type.wrongConditions[0] as string }
    const result = gradeInspection(scenario, [wrong], DEFECT_TYPES)
    expect(result.findings[0]?.verdict).toBe('partial')
    expect(result.findings[0]?.checks).toEqual({
      location: true,
      ata: true,
      category: true,
      condition: false,
    })
    expect(result.findings[0]?.explanation).toContain(type.correctCondition)
  })

  it('marks a finding on a sound component as incorrect', () => {
    const sound = {
      ...perfect,
      componentId: 'rudder',
      taggedPoint: [0, 0, 0] as [number, number, number],
    }
    const result = gradeInspection(scenario, [sound], DEFECT_TYPES)
    expect(result.findings[0]?.verdict).toBe('incorrect')
    expect(result.summary.incorrect).toBe(1)
  })

  it('counts a defect once even when it is reported twice', () => {
    const result = gradeInspection(scenario, [perfect, perfect], DEFECT_TYPES)
    expect(result.summary.correct).toBe(1)
    expect(result.summary.incorrect).toBe(1)
  })
})

describe('hydraulic leak grading', () => {
  const leakTemplate = SCENARIO_TEMPLATES.find((t) => t.id === 'hydraulic_leak_inspection')
  if (!leakTemplate) throw new Error('no hydraulic template')
  const scenario = generateScenario(leakTemplate, DEFECT_TYPES, 11)
  const placed = scenario.defects[0]
  if (!placed) throw new Error('no leak placed')
  const type = DEFECT_TYPES.find((d) => d.id === placed.defectTypeId)
  if (!type?.hydraulicSystem) throw new Error('leak has no system')
  const report: Finding = {
    componentId: placed.componentId,
    taggedPoint: placed.position,
    ata: '29',
    category: 'hydraulic-leak',
    condition: type.correctCondition,
    remarks: '',
    hydraulicSystem: type.hydraulicSystem,
  }

  it('places leaks only at the hydraulic service panels, under the belly fairing', () => {
    for (const defect of scenario.defects) {
      expect(defect.componentId).toMatch(/^hyd_service_panel_(green|yellow|blue)$/)
      expect(defect.position[1]).toBeGreaterThan(1.2)
      expect(defect.position[1]).toBeLessThan(1.8)
    }
  })

  it('ties each leak to the system its panel serves', () => {
    for (const defect of DEFECT_TYPES.filter((d) => d.category === 'hydraulic-leak')) {
      expect(defect.anchors[0]?.componentId).toBe(`hyd_service_panel_${defect.hydraulicSystem}`)
    }
  })

  it('is correct when the right system is named', () => {
    const result = gradeInspection(scenario, [report], DEFECT_TYPES)
    expect(result.findings[0]?.verdict).toBe('correct')
    expect(result.findings[0]?.checks?.system).toBe(true)
  })

  it('is only partly correct when the wrong system is named, and says which is right', () => {
    const wrong = type.hydraulicSystem === 'green' ? 'blue' : 'green'
    const result = gradeInspection(scenario, [{ ...report, hydraulicSystem: wrong }], DEFECT_TYPES)
    expect(result.findings[0]?.verdict).toBe('partial')
    expect(result.findings[0]?.checks?.system).toBe(false)
    expect(result.findings[0]?.explanation.toLowerCase()).toContain(
      `should be ${type.hydraulicSystem}`,
    )
  })

  it('is only partly correct when no system is named', () => {
    const unnamed: Finding = { ...report }
    delete unnamed.hydraulicSystem
    const result = gradeInspection(scenario, [unnamed], DEFECT_TYPES)
    expect(result.findings[0]?.verdict).toBe('partial')
  })
})

describe('logbook', () => {
  const scenario = generateScenario(template, DEFECT_TYPES, 7)
  const technician = { name: 'A. Technician', id: 'T-0042' }

  it('opens an entry from the work order with the aircraft identity', () => {
    const entry = openEntry(scenario, template, technician, '2026-11-13T10:00:00.000Z')
    expect(entry).toMatchObject({
      workOrder: scenario.workOrder,
      registration: 'N320IS',
      model: 'A320-214',
      status: 'in-progress',
      signedOff: false,
      technicianId: 'T-0042',
    })
  })

  it('signs off with the findings and time taken', () => {
    const entry = openEntry(scenario, template, technician, '2026-11-13T10:00:00.000Z')
    const done = signOff(entry, [], 312)
    expect(done).toMatchObject({ status: 'completed', signedOff: true, timeTakenSeconds: 312 })
    expect(entry.signedOff).toBe(false)
  })

  it('refuses to sign off without a technician name and ID', () => {
    const entry = openEntry(scenario, template, { name: '', id: '' }, '2026-11-13T10:00:00.000Z')
    expect(() => signOff(entry, [], 10)).toThrow(/technician/i)
  })
})
