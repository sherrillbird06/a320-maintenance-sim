import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import type { AnswerRecord } from '../sim/quiz'

const KEY = 'a320-sim/study/v1'

interface StudyState {
  /** Ids of the study topics the candidate has marked as reviewed. */
  reviewed: string[]
  /** Latest result for each practice question answered. */
  answers: AnswerRecord
  toggleReviewed: (topicId: string) => void
  recordAnswer: (questionId: string, correct: boolean) => void
}

type Store = Pick<Storage, 'getItem' | 'setItem'>
type Saved = Pick<StudyState, 'reviewed' | 'answers'>

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []

function load(storage: Store | undefined): Saved {
  try {
    const saved: unknown = JSON.parse(storage?.getItem(KEY) ?? 'null')
    // The first version saved only the list of reviewed topics.
    if (Array.isArray(saved)) return { reviewed: strings(saved), answers: {} }
    if (saved && typeof saved === 'object') {
      const { reviewed, answers } = saved as { reviewed?: unknown; answers?: unknown }
      const kept: AnswerRecord = {}
      if (answers && typeof answers === 'object') {
        for (const [id, correct] of Object.entries(answers)) {
          if (typeof correct === 'boolean') kept[id] = correct
        }
      }
      return { reviewed: strings(reviewed), answers: kept }
    }
  } catch {
    // Unreadable: start again.
  }
  return { reviewed: [], answers: {} }
}

/** Study progress: topics reviewed and practice answers, kept between visits. */
export function createStudyStore(storage?: Store) {
  const save = (state: Saved) => {
    try {
      storage?.setItem(KEY, JSON.stringify({ reviewed: state.reviewed, answers: state.answers }))
    } catch {
      // Storage full or blocked: progress lasts for this visit only.
    }
  }
  return createStore<StudyState>((set, get) => ({
    ...load(storage),
    toggleReviewed: (topicId) => {
      const now = get().reviewed
      const reviewed = now.includes(topicId)
        ? now.filter((id) => id !== topicId)
        : [...now, topicId]
      set({ reviewed })
      save(get())
    },
    recordAnswer: (questionId, correct) => {
      set({ answers: { ...get().answers, [questionId]: correct } })
      save(get())
    },
  }))
}

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export const study = createStudyStore(typeof window === 'undefined' ? undefined : browserStorage())

export function useStudy<T>(selector: (state: StudyState) => T): T {
  return useStore(study, selector)
}
