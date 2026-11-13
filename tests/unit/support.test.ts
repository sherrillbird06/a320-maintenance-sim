import { describe, expect, it } from 'vitest'
import { checkSupport } from '../../src/app/support'

const desktop = { hasWebGL2: true, coarsePointerOnly: false, widthPx: 1440 }

describe('checkSupport', () => {
  it('accepts a desktop browser with WebGL2', () => {
    expect(checkSupport(desktop)).toEqual({ ok: true })
  })

  it('accepts the minimum supported width of 900 px', () => {
    expect(checkSupport({ ...desktop, widthPx: 900 })).toEqual({ ok: true })
  })

  it('requires a desktop when the viewport is narrower than 900 px', () => {
    expect(checkSupport({ ...desktop, widthPx: 899 })).toEqual({
      ok: false,
      reason: 'desktop-required',
    })
  })

  it('requires a desktop when the only pointer is touch', () => {
    expect(checkSupport({ ...desktop, coarsePointerOnly: true })).toEqual({
      ok: false,
      reason: 'desktop-required',
    })
  })

  it('reports missing WebGL2 on a desktop', () => {
    expect(checkSupport({ ...desktop, hasWebGL2: false })).toEqual({
      ok: false,
      reason: 'no-webgl2',
    })
  })

  it('reports missing WebGL2 ahead of the desktop requirement', () => {
    expect(checkSupport({ hasWebGL2: false, coarsePointerOnly: true, widthPx: 400 })).toEqual({
      ok: false,
      reason: 'no-webgl2',
    })
  })
})
