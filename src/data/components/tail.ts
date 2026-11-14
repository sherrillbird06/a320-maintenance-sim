import type { Component } from '../schema'
import { mirrored, seedsFor, single } from './builders'
import { flightControlText } from './flightControlText'

const d = seedsFor('D')

const FLIGHT_CONTROL = ['flight-controls', 'hydraulic'] as const

/** Zone D — rear fuselage, aft doors, tail surfaces and the APU installation. */
const PARTS: Component[] = [
  // Structure
  ...mirrored(d('aft_fuselage_skin', 'Aft fuselage skin', '53')),
  single(d('aft_fuselage_belly', 'Aft fuselage lower skin', '53')),
  single(d('tail_cone', 'Tail cone', '53')),
  single(d('vertical_stabilizer', 'Vertical stabilizer', '55')),
  ...mirrored(d('horizontal_stabilizer', 'Horizontal stabilizer', '55', ['flight-controls'])),

  // Flight control surfaces
  single(d('rudder', 'Rudder', '27', FLIGHT_CONTROL)),
  ...mirrored(d('elevator', 'Elevator', '27', FLIGHT_CONTROL)),

  // Doors and compartments
  ...mirrored(d('pax_door_aft', 'Aft passenger/crew door', '52')),
  single(d('aft_cargo_door', 'Aft cargo door', '52'), 'RH'),
  single(d('bulk_cargo_door', 'Bulk cargo door', '52'), 'RH'),
  single(d('aft_cargo_compartment', 'Aft cargo compartment', '25', ['fire-protection'])),

  // APU
  single(d('apu_exhaust', 'APU exhaust', '49', ['apu'])),
  single(d('apu_air_inlet', 'APU air intake', '49', ['apu'])),
  ...mirrored(
    d('apu_access_door', 'APU compartment access door', '52', ['apu', 'fire-protection']),
  ),

  // Systems
  single(d('outflow_valve', 'Cabin pressure outflow valve', '21', ['air-conditioning'])),
  single(d('potable_water_service_panel', 'Potable water service panel', '38')),
  single(d('waste_service_panel', 'Waste service panel', '38')),
  single(d('drain_mast_aft', 'Aft drain mast', '38')),

  // Lights and static dischargers
  ...mirrored(d('logo_light', 'Logo light', '33', ['electrical'])),
  single(d('tail_nav_light', 'Tail navigation light', '33', ['electrical'])),
  single(d('tail_strobe_light', 'Tail strobe light', '33', ['electrical'])),
  single(d('static_dischargers_tail', 'Tail static dischargers', '23')),
]

/** With component information attached where it has been written. */
export const TAIL: Component[] = PARTS.map((part) => ({ ...part, ...flightControlText(part.id) }))
