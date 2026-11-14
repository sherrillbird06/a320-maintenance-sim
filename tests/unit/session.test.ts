import { beforeEach, describe, expect, it } from 'vitest'
import { DEFECT_TYPES } from '../../src/data/defects'
import type { Finding } from '../../src/data/schema'
import { createSessionStore, type SessionStore } from '../../src/state/session'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    data,
  }
}

let storage: ReturnType<typeof memoryStorage>
let store: SessionStore
let now = 1_000_000

beforeEach(() => {
  storage = memoryStorage()
  now = 1_000_000
  store = createSessionStore({ storage, now: () => now })
})

const technician = { name: 'A. Technician', id: 'T-0042' }

function findingFor(index = 0): Finding {
  const defect = store.getState().scenario?.defects[index]
  if (!defect) throw new Error('no defect')
  const type = DEFECT_TYPES.find((t) => t.id === defect.defectTypeId)
  if (!type) throw new Error('no type')
  return {
    componentId: defect.componentId,
    taggedPoint: defect.position,
    ata: '32',
    category: type.category,
    condition: type.correctCondition,
    remarks: '',
  }
}

describe('session', () => {
  it('starts idle with an empty logbook', () => {
    expect(store.getState().phase).toBe('idle')
    expect(store.getState().logbook).toEqual([])
  })

  it('will not start an assignment without a technician name and ID', () => {
    store.getState().startAssignment({ name: ' ', id: '' }, 5)
    expect(store.getState().phase).toBe('idle')
    expect(store.getState().error).toMatch(/name and ID/i)
  })

  it('starts an assignment: scenario generated, entry opened, phase inspecting', () => {
    store.getState().startAssignment(technician, 5)
    const state = store.getState()
    expect(state.phase).toBe('inspecting')
    expect(state.scenario?.workOrder).toBe('WO-5')
    expect(state.entry?.technicianId).toBe('T-0042')
    expect(state.findings).toEqual([])
  })

  it('starts whichever assignment is chosen', () => {
    store.getState().startAssignment(technician, 5, 'engine_inlet_inspection')
    const state = store.getState()
    expect(state.template.id).toBe('engine_inlet_inspection')
    expect(state.entry?.assignment).toMatch(/Engine inspection/)
    for (const defect of state.scenario?.defects ?? []) {
      expect(defect.componentId).toMatch(/^eng[12]_(fan|inlet_cowl)$/)
    }
    expect(state.scenario?.defects.length).toBeGreaterThan(0)
  })

  it('records and removes findings', () => {
    store.getState().startAssignment(technician, 5)
    store.getState().addFinding(findingFor())
    expect(store.getState().findings).toHaveLength(1)
    store.getState().removeFinding(0)
    expect(store.getState().findings).toHaveLength(0)
  })

  it('clears the selection once its finding is recorded', () => {
    store.getState().startAssignment(technician, 5)
    store.getState().select({ componentId: 'mlg_tire_1', point: [1, 2, 3] })
    expect(store.getState().selection?.componentId).toBe('mlg_tire_1')
    store.getState().addFinding(findingFor())
    expect(store.getState().selection).toBeNull()
  })

  it('signs off: grades the inspection, times it, and files it in the logbook', () => {
    store.getState().startAssignment(technician, 5)
    const count = store.getState().scenario?.defects.length ?? 0
    for (let i = 0; i < count; i++) store.getState().addFinding(findingFor(i))
    now += 95_000
    store.getState().signOff()
    const state = store.getState()
    expect(state.phase).toBe('debrief')
    expect(state.result?.summary.accuracy).toBe(1)
    expect(state.logbook).toHaveLength(1)
    expect(state.logbook[0]).toMatchObject({
      signedOff: true,
      timeTakenSeconds: 95,
      workOrder: 'WO-5',
    })
    expect(state.logbook[0]?.accuracy).toBe(1)
  })

  it('keeps the logbook across sessions', () => {
    store.getState().startAssignment(technician, 5)
    store.getState().signOff()
    const next = createSessionStore({ storage, now: () => now })
    expect(next.getState().logbook).toHaveLength(1)
    expect(next.getState().technician).toEqual(technician)
  })

  it('starts clean when saved data is corrupt', () => {
    storage.setItem('a320-sim/v1', '{not json')
    const next = createSessionStore({ storage, now: () => now })
    expect(next.getState().logbook).toEqual([])
  })

  it('returns to idle after the debrief', () => {
    store.getState().startAssignment(technician, 5)
    store.getState().signOff()
    store.getState().closeDebrief()
    expect(store.getState().phase).toBe('idle')
    expect(store.getState().scenario).toBeNull()
  })
})
