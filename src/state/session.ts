import { createStore, type StoreApi } from 'zustand/vanilla'
import { DEFECT_TYPES } from '../data/defects'
import type { Finding, LogbookEntry, ScenarioTemplate } from '../data/schema'
import { SCENARIO_TEMPLATES } from '../data/scenarios'
import { checklistStatus, coverage } from '../sim/checklist'
import { gradeInspection, type InspectionResult } from '../sim/grading'
import { openEntry, signOff, type Technician } from '../sim/logbook'
import { generateScenario, type Scenario } from '../sim/scenario'

const STORAGE_KEY = 'a320-sim/v1'

/** A point on the aircraft the technician has singled out, in the model's coordinates. */
export interface Selection {
  componentId: string
  point: [number, number, number]
}

/** A signed-off inspection with how it was graded. */
export interface FiledEntry extends LogbookEntry {
  accuracy: number
  correct: number
  incorrect: number
  missed: number
  /** Added later than the fields above, so older saved entries may lack them. */
  templateId?: string
  level?: number
  /** Share of checklist items fully examined, 0 to 1. */
  coverage?: number
  /** Library chapters opened during the inspection. */
  consulted?: string[]
}

export interface SessionState {
  phase: 'idle' | 'inspecting' | 'debrief'
  technician: Technician
  template: ScenarioTemplate
  scenario: Scenario | null
  entry: LogbookEntry | null
  startedAtMs: number
  findings: Finding[]
  /** Components the technician has selected for a closer look during this inspection. */
  examined: string[]
  /** Library chapters opened during this inspection. */
  consulted: string[]
  selection: Selection | null
  result: InspectionResult | null
  logbook: FiledEntry[]
  error: string | null
  templates: ScenarioTemplate[]
  startAssignment: (technician: Technician, seed: number, templateId?: string) => void
  select: (selection: Selection | null) => void
  addFinding: (finding: Finding) => void
  removeFinding: (index: number) => void
  signOff: () => void
  closeDebrief: () => void
  noteReference: (chapter: string) => void
}

export type SessionStore = StoreApi<SessionState>

interface Dependencies {
  storage?: Pick<Storage, 'getItem' | 'setItem'> | undefined
  now?: () => number
}

interface Saved {
  technician: Technician
  logbook: FiledEntry[]
}

function load(storage: Dependencies['storage']): Saved {
  const empty: Saved = { technician: { name: '', id: '' }, logbook: [] }
  try {
    const raw = storage?.getItem(STORAGE_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as Partial<Saved>
    return {
      technician: parsed.technician ?? empty.technician,
      logbook: Array.isArray(parsed.logbook) ? parsed.logbook : [],
    }
  } catch {
    // Unreadable or blocked storage: start clean rather than fail to load.
    return empty
  }
}

function save(storage: Dependencies['storage'], saved: Saved) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(saved))
  } catch {
    // Storage full or unavailable: the session still works, it just is not remembered.
  }
}

export function createSessionStore({ storage, now = Date.now }: Dependencies = {}): SessionStore {
  const saved = load(storage)
  const template = SCENARIO_TEMPLATES[0]
  if (!template) throw new Error('No scenario templates are defined')

  return createStore<SessionState>((set, get) => ({
    phase: 'idle',
    technician: saved.technician,
    template,
    templates: SCENARIO_TEMPLATES,
    scenario: null,
    entry: null,
    startedAtMs: 0,
    findings: [],
    examined: [],
    consulted: [],
    selection: null,
    result: null,
    logbook: saved.logbook,
    error: null,

    startAssignment(technician, seed, templateId) {
      if (!technician.name.trim() || !technician.id.trim()) {
        set({ error: 'Enter your name and ID before taking a work order.' })
        return
      }
      const chosen = SCENARIO_TEMPLATES.find((t) => t.id === templateId) ?? get().template
      const scenario = generateScenario(chosen, DEFECT_TYPES, seed)
      const startedAtMs = now()
      set({
        phase: 'inspecting',
        technician,
        scenario,
        template: chosen,
        entry: openEntry(scenario, chosen, technician, new Date(startedAtMs).toISOString()),
        startedAtMs,
        findings: [],
        examined: [],
        consulted: [],
        selection: null,
        result: null,
        error: null,
      })
      save(storage, { technician, logbook: get().logbook })
    },

    select(selection) {
      const { examined, phase } = get()
      const id = selection?.componentId
      // Selecting a part for a closer look is what counts as having examined it.
      const next =
        id && phase === 'inspecting' && !examined.includes(id) ? [...examined, id] : examined
      set({ selection, examined: next })
    },

    noteReference(chapter) {
      const { consulted, phase } = get()
      if (phase === 'inspecting' && !consulted.includes(chapter))
        set({ consulted: [...consulted, chapter] })
    },

    addFinding(finding) {
      set({ findings: [...get().findings, finding], selection: null })
    },

    removeFinding(index) {
      set({ findings: get().findings.filter((_, i) => i !== index) })
    },

    signOff() {
      const { scenario, entry, findings, startedAtMs, technician, logbook, examined, consulted } =
        get()
      const chosen = get().template
      if (!scenario || !entry) return
      const result = gradeInspection(scenario, findings, DEFECT_TYPES)
      const seconds = Math.round((now() - startedAtMs) / 1000)
      const filed: FiledEntry = {
        ...signOff(entry, findings, seconds),
        accuracy: result.summary.accuracy,
        correct: result.summary.correct,
        incorrect: result.summary.incorrect,
        missed: result.summary.missed,
        templateId: chosen.id,
        level: chosen.level,
        coverage: coverage(checklistStatus(chosen, examined)),
        consulted: [...consulted],
      }
      const next = [...logbook, filed]
      set({ phase: 'debrief', result, entry: filed, logbook: next, selection: null })
      save(storage, { technician, logbook: next })
    },

    closeDebrief() {
      set({
        phase: 'idle',
        scenario: null,
        entry: null,
        findings: [],
        examined: [],
        consulted: [],
        result: null,
      })
    },
  }))
}
