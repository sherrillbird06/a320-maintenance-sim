import type { ScenarioTemplate } from '../data/schema'

/** The training levels from the brief, in order. */
export const LEVELS = [
  { level: 1, title: 'Aircraft Familiarization' },
  { level: 2, title: 'General Aircraft Inspection' },
  { level: 3, title: 'Airframe Inspection' },
  { level: 4, title: 'Landing Gear Inspection' },
  { level: 5, title: 'Aircraft Systems Familiarization' },
  { level: 6, title: 'Engine Inspection' },
  { level: 7, title: 'Advanced Troubleshooting Scenarios' },
] as const

/** Accuracy an inspection must reach for its level to count as passed. */
export const PASS_ACCURACY = 0.8

/** What the progress summary needs to know about one signed-off inspection. */
export interface CompletedInspection {
  level: number
  accuracy: number
  correct: number
  incorrect: number
  missed: number
  timeTakenSeconds: number
  ataReferences: string[]
}

export interface LevelProgress {
  level: number
  title: string
  /** Whether any assignment exists at this level yet. */
  available: boolean
  attempts: number
  best: number | null
  passed: boolean
}

export interface Profile {
  completed: number
  averageAccuracy: number | null
  averageTimeSeconds: number | null
  totals: { correct: number; incorrect: number; missed: number }
  levels: LevelProgress[]
  chapters: { chapter: string; attempts: number; best: number }[]
}

const mean = (values: number[]) =>
  values.length === 0 ? null : values.reduce((sum, v) => sum + v, 0) / values.length

/** Builds the technician's training record from the inspections they have signed off. */
export function summarize(
  inspections: readonly CompletedInspection[],
  templates: readonly ScenarioTemplate[],
): Profile {
  const levels = LEVELS.map(({ level, title }): LevelProgress => {
    const runs = inspections.filter((i) => i.level === level)
    const best = runs.length === 0 ? null : Math.max(...runs.map((r) => r.accuracy))
    return {
      level,
      title,
      available: templates.some((t) => t.level === level),
      attempts: runs.length,
      best,
      passed: best !== null && best >= PASS_ACCURACY,
    }
  })

  const byChapter = new Map<string, { attempts: number; best: number }>()
  for (const inspection of inspections) {
    for (const chapter of inspection.ataReferences) {
      const entry = byChapter.get(chapter) ?? { attempts: 0, best: 0 }
      byChapter.set(chapter, {
        attempts: entry.attempts + 1,
        best: Math.max(entry.best, inspection.accuracy),
      })
    }
  }

  return {
    completed: inspections.length,
    averageAccuracy: mean(inspections.map((i) => i.accuracy)),
    averageTimeSeconds: mean(inspections.map((i) => i.timeTakenSeconds)),
    totals: {
      correct: inspections.reduce((sum, i) => sum + i.correct, 0),
      incorrect: inspections.reduce((sum, i) => sum + i.incorrect, 0),
      missed: inspections.reduce((sum, i) => sum + i.missed, 0),
    },
    levels,
    chapters: [...byChapter.entries()]
      .map(([chapter, entry]) => ({ chapter, ...entry }))
      .sort((a, b) => a.chapter.localeCompare(b.chapter)),
  }
}
