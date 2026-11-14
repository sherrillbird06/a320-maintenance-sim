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
    const crown = model.nodeBounds['fwd_fuselage_skin_rh']?.max[1] ?? 0
    expect(model.bounds.max[1] - crown).toBeCloseTo(d.finHeightAboveFuselage.value, 1)
  })

  it('has a fuselage of the published width and height', () => {
    const left = model.nodeBounds['fwd_fuselage_skin_lh']
    const right = model.nodeBounds['fwd_fuselage_skin_rh']
    const belly = model.nodeBounds['fwd_fuselage_belly']
    expect(left && right && belly).toBeTruthy()
    if (!left || !right || !belly) return
    const width = Math.max(left.max[2], right.max[2]) - Math.min(left.min[2], right.min[2])
    expect(width).toBeCloseTo(d.fuselageWidth.value, 1)
    expect(right.max[1] - belly.min[1]).toBeGreaterThan(d.fuselageHeight.value - 0.15)
  })

  it.each(Object.entries(AIRCRAFT.doors))('places %s at its published station and width', (id, door) => {
    const mirrored = id.startsWith('pax_door') || id.startsWith('overwing')
    for (const name of mirrored ? [id + '_lh', id + '_rh'] : [id]) {
      const b = model.nodeBounds[name]
      expect(b, name).toBeDefined()
      if (!b) continue
      expect((b.min[0] + b.max[0]) / 2).toBeCloseTo(door.x, 1)
      expect(b.max[0] - b.min[0]).toBeCloseTo(door.width, 1)
      expect(model.inspectableNodes).toContain(name)
    }
  })

  it('puts the cargo doors on the right side only', () => {
    for (const name of ['fwd_cargo_door', 'aft_cargo_door', 'bulk_cargo_door']) {
      // Aircraft right is +Y in the model, which is -Z in glTF.
      expect(model.nodeBounds[name]?.max[2] ?? 1).toBeLessThan(0)
    }
  })

  it.each([
    'radome', 'nose_skin_lh', 'nose_skin_rh', 'fwd_fuselage_skin_lh', 'aft_fuselage_skin_rh',
    'aft_fuselage_belly', 'tail_cone', 'belly_fairing', 'apu_exhaust', 'cabin_windows_lh',
    'cabin_windows_rh', 'windshield_lh', 'windshield_rh', 'sliding_window_lh', 'fixed_side_window_rh',
  ])('has the fuselage component %s as an inspectable node', (name) => {
    expect(model.nodeNames).toContain(name)
    expect(model.inspectableNodes).toContain(name)
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

describe('airframe.glb wing and tail surfaces', async () => {
  const model = await readModel('public/models/airframe.glb')
  const sides = ['lh', 'rh']
  const names = sides.flatMap((s) => [
    ...[1, 2, 3, 4, 5].flatMap((n) => [`slat_${n}_${s}`, `spoiler_${n}_${s}`]),
    ...[2, 3, 4].map((n) => `flap_track_fairing_${n}_${s}`),
    `flap_inboard_${s}`,
    `flap_outboard_${s}`,
    `aileron_${s}`,
    `wing_upper_skin_${s}`,
    `wing_lower_skin_${s}`,
    `wingtip_fence_${s}`,
    `horizontal_stabilizer_${s}`,
    `elevator_${s}`,
  ])

  it.each([...names, 'vertical_stabilizer', 'rudder'])('has %s as an inspectable node', (name) => {
    expect(model.nodeNames).toContain(name)
    expect(model.inspectableNodes).toContain(name)
  })

  const lateral = (name: string) => {
    const b = model.nodeBounds[name]
    return b ? Math.abs((b.min[2] + b.max[2]) / 2) : NaN
  }
  const station = (name: string) => {
    const b = model.nodeBounds[name]
    return b ? (b.min[0] + b.max[0]) / 2 : NaN
  }

  it.each(sides)('numbers slats and spoilers from the fuselage outward (%s)', (s) => {
    for (const part of ['slat', 'spoiler']) {
      const positions = [1, 2, 3, 4, 5].map((n) => lateral(`${part}_${n}_${s}`))
      expect(positions).toEqual([...positions].sort((a, b) => a - b))
    }
  })

  it.each(sides)('orders the trailing edge inboard flap, outboard flap, aileron (%s)', (s) => {
    expect(lateral(`flap_inboard_${s}`)).toBeLessThan(lateral(`flap_outboard_${s}`))
    expect(lateral(`flap_outboard_${s}`)).toBeLessThan(lateral(`aileron_${s}`))
  })

  it.each(sides)('puts slats ahead of spoilers ahead of flaps (%s)', (s) => {
    expect(station(`slat_3_${s}`)).toBeLessThan(station(`spoiler_3_${s}`))
    expect(station(`spoiler_1_${s}`)).toBeLessThan(station(`flap_inboard_${s}`))
  })

  it('hinges the rudder and elevators behind their fixed surfaces', () => {
    expect(station('rudder')).toBeGreaterThan(station('vertical_stabilizer'))
    expect(station('elevator_lh')).toBeGreaterThan(station('horizontal_stabilizer_lh'))
  })
})
