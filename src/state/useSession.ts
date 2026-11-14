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

// Browser tests drive the inspection through the store, because a headless browser cannot
// capture the mouse to look around. Only exposed when the page is opened with ?e2e=1.
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('e2e')) {
  ;(window as unknown as { __session: typeof session }).__session = session
}

export function useSession<T>(selector: (state: SessionState) => T): T {
  return useStore(session, selector)
}

/** Which panel, if any, is covering the 3D view. */
export type Panel = 'none' | 'report' | 'workstation'

interface ViewState {
  /** Component under the crosshair. */
  hoverId: string | null
  /** True while the mouse is captured for looking around. */
  looking: boolean
  panel: Panel
  flashlight: boolean
}

/** Short-lived view state that changes many times a second and is never saved. */
export const view = createStore<ViewState>(() => ({
  hoverId: null,
  looking: false,
  panel: 'none',
  flashlight: false,
}))

export function useView<T>(selector: (state: ViewState) => T): T {
  return useStore(view, selector)
}
