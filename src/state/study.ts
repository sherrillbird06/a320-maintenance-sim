import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'

const KEY = 'a320-sim/study/v1'

interface StudyState {
  /** Ids of the study topics the candidate has marked as reviewed. */
  reviewed: string[]
  toggleReviewed: (topicId: string) => void
}

type Store = Pick<Storage, 'getItem' | 'setItem'>

function load(storage: Store | undefined): string[] {
  try {
    const saved: unknown = JSON.parse(storage?.getItem(KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

/** Which study topics have been marked as reviewed, kept between visits. */
export function createStudyStore(storage?: Store) {
  return createStore<StudyState>((set, get) => ({
    reviewed: load(storage),
    toggleReviewed: (topicId) => {
      const now = get().reviewed
      const reviewed = now.includes(topicId)
        ? now.filter((id) => id !== topicId)
        : [...now, topicId]
      set({ reviewed })
      try {
        storage?.setItem(KEY, JSON.stringify(reviewed))
      } catch {
        // Storage full or blocked: the mark lasts for this visit only.
      }
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
