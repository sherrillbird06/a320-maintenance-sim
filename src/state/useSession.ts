import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'
import { createSessionStore, type SessionState } from './session'

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage
  } catch {
    // Storage can be blocked outright (private windows, strict settings).
    return undefined
  }
}

/** The one inspection session for this browser tab. */
export const session = createSessionStore({ storage: browserStorage() })

export function useSession<T>(selector: (state: SessionState) => T): T {
  return useStore(session, selector)
}

/** Which panel, if any, is covering the 3D view. */
export type Panel = 'none' | 'report' | 'workstation' | 'library' | 'diagram' | 'study'

interface ViewState {
  /** Component under the crosshair. */
  hoverId: string | null
  /** True while the mouse is captured for looking around. */
  looking: boolean
  panel: Panel
  flashlight: boolean
  /** Chapter the technical library is open at. */
  libraryChapter: string
  /** Topic the A&P study guide is open at; null opens at the first topic. */
  studyTopic: string | null
  /** How far each fan has been turned by hand, in radians, keyed by fan component id. */
  fanAngle: Record<string, number>
}

/** Short-lived view state that changes many times a second and is never saved. */
export const view = createStore<ViewState>(() => ({
  hoverId: null,
  looking: false,
  panel: 'none',
  flashlight: false,
  libraryChapter: '05',
  studyTopic: null,
  fanAngle: {},
}))

export function useView<T>(selector: (state: ViewState) => T): T {
  return useStore(view, selector)
}

// Browser tests drive the inspection through the store, because a headless browser cannot
// capture the mouse to look around. Only exposed when the page is opened with ?e2e=1.
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('e2e')) {
  ;(window as unknown as { __session: typeof session }).__session = session
  ;(window as unknown as { __view: typeof view }).__view = view
}
