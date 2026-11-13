/** Narrowest viewport the workstation UI and first-person controls are designed for. */
export const MIN_WIDTH_PX = 900

export interface SupportEnv {
  hasWebGL2: boolean
  /** True when the device has a touch pointer and no mouse or trackpad. */
  coarsePointerOnly: boolean
  widthPx: number
}

export type SupportResult = { ok: true } | { ok: false; reason: 'no-webgl2' | 'desktop-required' }

export function checkSupport(env: SupportEnv): SupportResult {
  if (!env.hasWebGL2) return { ok: false, reason: 'no-webgl2' }
  if (env.coarsePointerOnly || env.widthPx < MIN_WIDTH_PX) {
    return { ok: false, reason: 'desktop-required' }
  }
  return { ok: true }
}

let webgl2Cache: boolean | undefined

function hasWebGL2(): boolean {
  if (webgl2Cache === undefined) {
    try {
      webgl2Cache = document.createElement('canvas').getContext('webgl2') !== null
    } catch {
      webgl2Cache = false
    }
  }
  return webgl2Cache
}

/** Reads the support inputs from the live browser environment. */
export function readSupportEnv(): SupportEnv {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const anyFine = window.matchMedia('(any-pointer: fine)').matches
  return {
    hasWebGL2: hasWebGL2(),
    coarsePointerOnly: coarse && !anyFine,
    widthPx: window.innerWidth,
  }
}
