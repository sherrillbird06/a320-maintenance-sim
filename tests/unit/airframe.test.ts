import { describe, expect, it } from 'vitest'
import { AIRCRAFT } from '../../src/data/aircraft'
import { readModel } from '../../tools/readModel'

// The airframe model is built from the Airbus dimension figure. Blender's X (aft), Y (right)
// and Z (up) arrive in glTF as X, -Z and Y.
describe('airframe.glb matches the sourced dimensions', async () => {
  const model = await readModel('public/models/airframe.glb')
  const size = (axis: 0 | 1 | 2) => model.bounds.max[axis] - model.bounds.min[axis]
  const d = AIRCRAFT.dimensions

  it('is the published overall length', () => {
    expect(size(0)).toBeCloseTo(d.overallLength.value, 1)
  })

  it('is the published wingspan', () => {
    expect(size(2)).toBeCloseTo(d.wingspan.value, 1)
  })

  it('stands on the ground with its nose at the origin', () => {
    expect(model.bounds.min[0]).toBeCloseTo(0, 1)
    expect(model.bounds.min[1]).toBeCloseTo(0, 1)
  })

  it('has the fin top 5.87 m above the fuselage crown', () => {
    const crown = model.nodeBounds['fuselage']?.max[1] ?? 0
    expect(model.bounds.max[1] - crown).toBeCloseTo(d.finHeightAboveFuselage.value, 1)
  })

  it('has a fuselage of the published width and height', () => {
    const fuselage = model.nodeBounds['fuselage']
    expect(fuselage).toBeDefined()
    if (!fuselage) return
    expect(fuselage.max[2] - fuselage.min[2]).toBeCloseTo(d.fuselageWidth.value, 1)
    expect(fuselage.max[1] - fuselage.min[1]).toBeGreaterThan(d.fuselageHeight.value - 0.15)
  })

  it('places the engines at the published distance from the centreline', () => {
    for (const name of ['eng1_nacelle', 'eng2_nacelle']) {
      const b = model.nodeBounds[name]
      expect(b, name).toBeDefined()
      if (!b) continue
      expect(Math.abs((b.min[2] + b.max[2]) / 2)).toBeCloseTo(d.engineCentrelineOffset.value, 1)
      expect(b.min[0]).toBeCloseTo(d.noseToEngineInlet.value, 1)
    }
  })

  it('places the gear at the published wheelbase and track', () => {
    const nose = model.nodeBounds['nlg']
    const left = model.nodeBounds['mlg_lh']
    const right = model.nodeBounds['mlg_rh']
    expect(nose && left && right).toBeTruthy()
    if (!nose || !left || !right) return
    const centre = (b: typeof nose, axis: 0 | 2) => (b.min[axis] + b.max[axis]) / 2
    expect(centre(nose, 0)).toBeCloseTo(d.noseToNoseGear.value, 1)
    expect(centre(left, 0) - centre(nose, 0)).toBeCloseTo(d.wheelbase.value, 1)
    expect(Math.abs(centre(left, 2) - centre(right, 2))).toBeCloseTo(d.mainGearTrack.value, 1)
  })

  it('stays within the exterior triangle budget', () => {
    expect(model.triangles).toBeLessThan(400_000)
  })
})
