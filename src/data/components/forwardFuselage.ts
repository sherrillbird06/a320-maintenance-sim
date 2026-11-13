import type { Component } from '../schema'
import { mirrored, numbered, seedsFor, single } from './builders'

const a = seedsFor('A')

/** Zone A — forward fuselage: nose, flight-deck windows, forward doors, probes, antennas, lights. */
export const FORWARD_FUSELAGE: Component[] = [
  // Structure
  single(a('radome', 'Radome', '53')),
  ...mirrored(a('nose_skin', 'Nose skin', '53')),
  ...mirrored(a('fwd_fuselage_skin', 'Forward fuselage skin', '53')),
  single(a('fwd_fuselage_belly', 'Forward fuselage lower skin', '53')),

  // Windows
  ...mirrored(a('windshield', 'Windshield', '56')),
  ...mirrored(a('sliding_window', 'Sliding side window', '56')),
  ...mirrored(a('fixed_side_window', 'Fixed side window', '56')),
  ...mirrored(a('cabin_windows', 'Cabin windows', '56')),

  // Doors and access
  ...mirrored(a('pax_door_fwd', 'Forward passenger/crew door', '52')),
  single(a('fwd_cargo_door', 'Forward cargo door', '52'), 'RH'),
  single(a('fwd_cargo_compartment', 'Forward cargo compartment', '25')),
  single(a('avionics_bay_access_door', 'Avionics compartment access door', '52')),
  single(a('external_power_door', 'External power receptacle door', '24', ['electrical'])),

  // Air data probes and sensors
  ...numbered(a('pitot_probe', 'Pitot probe', '34'), 3),
  ...mirrored(a('static_probe_1', 'Static probe 1', '34')),
  ...mirrored(a('static_probe_2', 'Static probe 2', '34')),
  ...mirrored(a('static_probe_stby', 'Standby static probe', '34')),
  ...numbered(a('aoa_sensor', 'Angle-of-attack sensor', '34'), 3),
  ...numbered(a('tat_probe', 'Total air temperature probe', '34'), 2),

  // Antennas
  ...numbered(a('vhf_antenna', 'VHF antenna', '23'), 3),
  single(a('tcas_antenna_top', 'TCAS antenna, upper', '34')),
  single(a('tcas_antenna_bottom', 'TCAS antenna, lower', '34')),

  // Exterior lights
  single(a('taxi_light', 'Taxi light', '33', ['electrical'])),
  single(a('takeoff_light', 'Take-off light', '33', ['electrical'])),
  ...mirrored(a('runway_turnoff_light', 'Runway turn-off light', '33', ['electrical'])),
  single(a('upper_beacon', 'Upper anti-collision beacon', '33', ['electrical'])),
  single(a('lower_beacon', 'Lower anti-collision beacon', '33', ['electrical'])),

  // Drains
  single(a('drain_mast_fwd', 'Forward drain mast', '38')),
]
