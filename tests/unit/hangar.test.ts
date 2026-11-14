import { describe, expect, it } from 'vitest'
import { AIRCRAFT } from '../../src/data/aircraft'
import { readModel } from '../../tools/readModel'

// The hangar model is centred on the floor origin. The aircraft is placed in it with its nose
// 18 m forward of centre, so it occupies X from -18 to about +19.6.
describe('hangar.glb', async () => {
  const model = await readModel('public/models/hangar.glb')
  const AIRCRAFT_NOSE_X = -18

  it('encloses the aircraft with working room on every side', () => {
    const shell = model.nodeBounds['hangar_shell']
    expect(shell).toBeDefined()
    if (!shell) return
    const length = AIRCRAFT.dimensions.overallLength.value
    const halfSpan = AIRCRAFT.dimensions.wingspan.value / 2
    expect(shell.min[0]).toBeLessThan(AIRCRAFT_NOSE_X - 10)
    expect(shell.max[0]).toBeGreaterThan(AIRCRAFT_NOSE_X + length + 10)
    expect(shell.min[2]).toBeLessThan(-halfSpan - 8)
    expect(shell.max[2]).toBeGreaterThan(halfSpan + 8)
  })

  it('has a roof clear of the fin', () => {
    const structure = model.nodeBounds['hangar_roof_structure']
    expect(structure?.min[1] ?? 0).toBeGreaterThan(AIRCRAFT.dimensions.tailHeight.value + 2)
  })

  it.each([
    'hangar_shell',
    'hangar_roof_structure',
    'hangar_doors',
    'hangar_lights',
    'hangar_floor_markings',
    'door_stairs',
    'engine_stand',
    'tail_lift',
    'toolbox_roll_cab_1',
    'toolbox_roll_cab_2',
    'workbench',
    'documentation_station',
    'ground_power_unit',
    'fire_extinguisher',
    'drip_tray_1',
    'drip_tray_2',
  ])('contains %s', (name) => {
    expect(model.nodeNames).toContain(name)
  })

  it('has cones and chocks set out around the aircraft', () => {
    expect(
      model.nodeNames.filter((n) => n.startsWith('safety_cone_')).length,
    ).toBeGreaterThanOrEqual(6)
    expect(
      model.nodeNames.filter((n) => n.startsWith('wheel_chock_')).length,
    ).toBeGreaterThanOrEqual(6)
  })

  it('puts the door stairs at the forward left door', () => {
    const stairs = model.nodeBounds['door_stairs']
    expect(stairs).toBeDefined()
    if (!stairs) return
    const doorX = AIRCRAFT_NOSE_X + AIRCRAFT.doors.pax_door_fwd.x
    expect(stairs.min[0]).toBeLessThan(doorX)
    expect(stairs.max[0]).toBeGreaterThan(doorX)
    // Aircraft left is +Z in glTF.
    expect(stairs.min[2]).toBeGreaterThan(1.5)
  })

  it('marks nothing as an aircraft component', () => {
    expect(model.inspectableNodes).toEqual([])
  })

  it('stays within the hangar triangle budget', () => {
    expect(model.triangles).toBeLessThan(200_000)
  })
})
