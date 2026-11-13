import type { Component } from '../schema'
import type { Seed } from './builders'
import { seedsFor, single } from './builders'

const e = seedsFor('E', 'cockpit')

/** A captain-side and a first-officer-side copy of a flight-deck item. */
function bothSeats(seed: Seed): Component[] {
  return [
    single({ ...seed, id: `${seed.id}_capt`, name: `${seed.name}, captain` }),
    single({ ...seed, id: `${seed.id}_fo`, name: `${seed.name}, first officer` }),
  ]
}

/** Zone E — the flight deck. Lives in its own model file, loaded when the player enters. */
export const COCKPIT: Component[] = [
  // Main instrument panel
  ...bothSeats(e('cockpit_pfd', 'Primary flight display', '31')),
  ...bothSeats(e('cockpit_nd', 'Navigation display', '31')),
  single(e('cockpit_ewd', 'Engine/warning display', '31', ['engine'])),
  single(e('cockpit_sd', 'System display', '31')),
  single(e('cockpit_standby_instruments', 'Standby instruments', '34')),
  single(e('cockpit_gear_lever', 'Landing gear lever', '32', ['landing-gear'])),
  single(
    e('cockpit_autobrake_panel', 'Landing gear indicator and autobrake panel', '32', [
      'landing-gear',
    ]),
  ),

  // Glareshield
  single(e('cockpit_glareshield', 'Glareshield', '31')),
  single(e('cockpit_fcu', 'Flight control unit', '22')),
  ...bothSeats(e('cockpit_efis_panel', 'EFIS control panel', '31')),

  // Overhead panel, by system
  single(e('cockpit_overhead_panel', 'Overhead panel', '31')),
  single(e('cockpit_ovhd_elec', 'Overhead ELEC panel', '24', ['electrical'])),
  single(e('cockpit_ovhd_hyd', 'Overhead HYD panel', '29', ['hydraulic'])),
  single(e('cockpit_ovhd_fuel', 'Overhead FUEL panel', '28', ['fuel'])),
  single(
    e('cockpit_ovhd_air_cond', 'Overhead AIR COND panel', '21', ['air-conditioning', 'pneumatic']),
  ),
  single(e('cockpit_ovhd_cabin_press', 'Overhead CABIN PRESS panel', '21', ['air-conditioning'])),
  single(e('cockpit_ovhd_apu', 'Overhead APU panel', '49', ['apu'])),
  single(e('cockpit_ovhd_fire', 'Overhead FIRE panel', '26', ['fire-protection'])),
  single(e('cockpit_ovhd_anti_ice', 'Overhead ANTI ICE panel', '30', ['pneumatic'])),
  single(e('cockpit_ovhd_ext_lights', 'Overhead EXT LT panel', '33', ['electrical'])),
  single(e('cockpit_ovhd_adirs', 'Overhead ADIRS panel', '34')),
  single(e('cockpit_ovhd_flt_ctl', 'Overhead FLT CTL panel', '27', ['flight-controls'])),

  // Centre pedestal
  single(e('cockpit_pedestal', 'Centre pedestal', '31')),
  ...bothSeats(e('cockpit_mcdu', 'Multipurpose control and display unit', '22')),
  ...bothSeats(e('cockpit_radio_panel', 'Radio management panel', '23')),
  single(e('cockpit_ecam_control_panel', 'ECAM control panel', '31')),
  single(e('cockpit_thrust_levers', 'Thrust levers', '76', ['engine'])),
  single(e('cockpit_engine_master_switches', 'Engine master switches', '76', ['engine'])),
  single(e('cockpit_flap_lever', 'Flap lever', '27', ['flight-controls'])),
  single(e('cockpit_speedbrake_lever', 'Speed brake lever', '27', ['flight-controls'])),
  single(e('cockpit_parking_brake', 'Parking brake handle', '32', ['landing-gear'])),

  // Controls, circuit breakers and furnishings
  ...bothSeats(e('cockpit_sidestick', 'Sidestick', '27', ['flight-controls'])),
  ...bothSeats(e('cockpit_rudder_pedals', 'Rudder pedals', '27', ['flight-controls'])),
  single(e('cockpit_cb_panel_overhead', 'Overhead circuit breaker panel', '24', ['electrical'])),
  single(e('cockpit_cb_panel_rear', 'Rear circuit breaker panel', '24', ['electrical'])),
  ...bothSeats(e('cockpit_seat', 'Pilot seat', '25')),
  single(e('cockpit_door', 'Flight deck door', '52')),
]
