import { describe, expect, it } from 'vitest'
import { ENVIRONMENT_ASSETS } from '../../src/data/assets'
import { ATA_CHAPTERS } from '../../src/data/ata'
import { byId, COMPONENTS } from '../../src/data/components'
import { mirrored, numbered } from '../../src/data/components/builders'
import { SOURCES } from '../../src/data/sources'
import { validateRegistry } from '../../src/data/validate'
import { ZONES } from '../../src/data/zones'

describe('component builders', () => {
  const base = { id: 'aileron', name: 'Aileron', zone: 'B', ata: '27', systems: [] } as const

  it('mirrored() makes a left and a right record', () => {
    expect(mirrored(base).map((c) => [c.id, c.name, c.side])).toEqual([
      ['aileron_lh', 'Aileron, left', 'LH'],
      ['aileron_rh', 'Aileron, right', 'RH'],
    ])
  })

  it('numbered() makes one record per position, counted from 1', () => {
    expect(numbered({ ...base, id: 'slat', name: 'Slat' }, 3).map((c) => [c.id, c.name])).toEqual([
      ['slat_1', 'Slat 1'],
      ['slat_2', 'Slat 2'],
      ['slat_3', 'Slat 3'],
    ])
  })

  it('builders compose: numbered then mirrored', () => {
    const slats = numbered({ ...base, id: 'slat', name: 'Slat' }, 2).flatMap((c) => mirrored(c))
    expect(slats.map((c) => c.id)).toEqual(['slat_1_lh', 'slat_1_rh', 'slat_2_lh', 'slat_2_rh'])
  })
})

describe('COMPONENTS', () => {
  it('passes registry validation', () => {
    expect(
      validateRegistry({
        components: COMPONENTS,
        ata: ATA_CHAPTERS,
        zones: ZONES,
        sources: SOURCES,
      }),
    ).toEqual([])
  })

  it('holds between 150 and 300 inspectable components', () => {
    expect(COMPONENTS.length).toBeGreaterThanOrEqual(150)
    expect(COMPONENTS.length).toBeLessThanOrEqual(300)
  })

  it('has components in every inspection zone A to E', () => {
    for (const zone of ['A', 'B', 'C', 'D', 'E']) {
      expect(
        COMPONENTS.some((c) => c.zone === zone),
        `zone ${zone}`,
      ).toBe(true)
    }
  })

  // One or more records for every item the brief lists under areas A–E.
  const required: Record<string, string[]> = {
    'A radome and nose': ['radome', 'nose_skin_lh', 'nose_skin_rh'],
    'A cockpit windows': ['windshield_lh', 'windshield_rh', 'sliding_window_lh'],
    'A forward passenger door': ['pax_door_fwd_lh'],
    'A forward cargo compartment': ['fwd_cargo_door', 'fwd_cargo_compartment'],
    'A external lights': ['taxi_light', 'takeoff_light', 'runway_turnoff_light_lh', 'upper_beacon'],
    'A fuselage skin': ['fwd_fuselage_skin_lh', 'fwd_fuselage_skin_rh'],
    'B engine fan and inlet': ['eng1_fan', 'eng2_fan', 'eng1_inlet_cowl', 'eng2_inlet_cowl'],
    'B engine nacelles': ['eng1_fan_cowl_inboard', 'eng2_reverser_cowl_outboard', 'eng1_pylon'],
    'B wing surfaces': ['wing_upper_skin_lh', 'wing_lower_skin_rh'],
    'B slats': ['slat_1_lh', 'slat_5_lh', 'slat_1_rh', 'slat_5_rh'],
    'B flaps': ['flap_inboard_lh', 'flap_outboard_rh'],
    'B spoilers': ['spoiler_1_lh', 'spoiler_5_rh'],
    'B wing access panels': ['wing_access_panels_lh', 'wing_access_panels_rh'],
    'B fuel inspection areas': ['refuel_coupling', 'fuel_vent_inlet_lh', 'refuel_panel'],
    'C nose landing gear': ['nlg_shock_strut', 'nlg_tire_lh', 'nlg_tire_rh', 'nlg_wheel_lh'],
    'C main landing gear': ['mlg_shock_strut_lh', 'mlg_shock_strut_rh'],
    'C tires and wheels': ['mlg_tire_1', 'mlg_tire_4', 'mlg_wheel_1', 'mlg_wheel_4'],
    'C brakes': ['mlg_brake_1', 'mlg_brake_2', 'mlg_brake_3', 'mlg_brake_4'],
    'C gear doors': ['nlg_door_fwd_lh', 'mlg_door_main_lh', 'mlg_door_main_rh'],
    'C hydraulic components': ['mlg_brake_lines_lh', 'hyd_service_panel_green'],
    'D vertical stabilizer and rudder': ['vertical_stabilizer', 'rudder'],
    'D horizontal stabilizers and elevators': [
      'horizontal_stabilizer_lh',
      'elevator_lh',
      'elevator_rh',
    ],
    'D APU exhaust': ['apu_exhaust'],
    'D rear fuselage and door': ['aft_fuselage_skin_lh', 'pax_door_aft_lh'],
    'E displays': ['cockpit_pfd_capt', 'cockpit_nd_fo', 'cockpit_ewd', 'cockpit_sd'],
    'E overhead panel': ['cockpit_overhead_panel'],
    'E pedestal': ['cockpit_pedestal'],
    'E circuit breakers': ['cockpit_cb_panel_overhead', 'cockpit_cb_panel_rear'],
  }

  it.each(Object.entries(required))('covers the brief item: %s', (_item, ids) => {
    for (const id of ids) expect(byId(id), id).toBeDefined()
  })

  it('numbers the main wheels 1 to 4 from left to right', () => {
    expect([1, 2, 3, 4].map((n) => byId(`mlg_tire_${n}`)?.side)).toEqual(['LH', 'LH', 'RH', 'RH'])
  })

  it('does not register individual fan blades', () => {
    expect(COMPONENTS.filter((c) => c.id.includes('blade'))).toEqual([])
  })

  it('links every system to at least one component', () => {
    const linked = new Set(COMPONENTS.flatMap((c) => c.systems))
    expect([...linked].sort()).toEqual(
      [
        'air-conditioning',
        'apu',
        'electrical',
        'engine',
        'fire-protection',
        'flight-controls',
        'fuel',
        'hydraulic',
        'landing-gear',
        'pneumatic',
      ].sort(),
    )
  })
})

describe('ENVIRONMENT_ASSETS', () => {
  it('has unique ids', () => {
    const ids = ENVIRONMENT_ASSETS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers every asset group in the design', () => {
    const groups = new Set(ENVIRONMENT_ASSETS.map((a) => a.group))
    expect([...groups].sort()).toEqual(
      ['access', 'defects', 'gse', 'hangar', 'materials', 'people', 'props'].sort(),
    )
  })

  it('assigns every asset to a milestone from 1 to 8', () => {
    for (const asset of ENVIRONMENT_ASSETS) {
      expect(asset.milestone, asset.id).toBeGreaterThanOrEqual(1)
      expect(asset.milestone, asset.id).toBeLessThanOrEqual(8)
    }
  })
})
