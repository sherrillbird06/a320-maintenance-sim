import type { Component } from '../schema'
import { mirrored, numbered, seedsFor, single } from './builders'

const b = seedsFor('B')

const FLIGHT_CONTROL = ['flight-controls', 'hydraulic'] as const

/** Zone B — wings, centre fuselage and the service points on them. Engines are in engine.ts. */
export const WINGS: Component[] = [
  // Wing structure
  ...mirrored(b('wing_upper_skin', 'Wing upper surface', '57')),
  ...mirrored(b('wing_lower_skin', 'Wing lower surface', '57')),
  ...mirrored(b('wingtip_fence', 'Wing tip fence', '57')),
  ...mirrored(b('wing_access_panels', 'Wing lower access panels', '57', ['fuel'])),
  ...[2, 3, 4].flatMap((n) =>
    mirrored(b(`flap_track_fairing_${n}`, `Flap track fairing ${n}`, '57')),
  ),
  single(b('belly_fairing', 'Belly fairing', '53')),

  // Flight control surfaces
  ...numbered(b('slat', 'Slat', '27', FLIGHT_CONTROL), 5).flatMap(mirrored),
  ...mirrored(b('flap_inboard', 'Inboard flap', '27', FLIGHT_CONTROL)),
  ...mirrored(b('flap_outboard', 'Outboard flap', '27', FLIGHT_CONTROL)),
  ...numbered(b('spoiler', 'Spoiler', '27', FLIGHT_CONTROL), 5).flatMap(mirrored),
  ...mirrored(b('aileron', 'Aileron', '27', FLIGHT_CONTROL)),

  // Fuel
  single(b('refuel_coupling', 'Refuel/defuel coupling', '28', ['fuel']), 'RH'),
  single(b('refuel_panel', 'Refuel/defuel control panel', '28', ['fuel']), 'RH'),
  ...mirrored(b('gravity_refuel_cap', 'Overwing gravity refuel cap', '28', ['fuel'])),
  ...mirrored(b('fuel_vent_inlet', 'Fuel tank vent inlet', '28', ['fuel'])),
  ...mirrored(b('fuel_level_indicators', 'Magnetic fuel level indicators', '28', ['fuel'])),

  // Air conditioning and pneumatic
  ...mirrored(
    b('pack_ram_air_inlet', 'Air conditioning pack ram air inlet', '21', ['air-conditioning']),
  ),
  single(
    b('lp_ground_air_connection', 'Low-pressure ground air connection', '21', ['air-conditioning']),
  ),
  single(b('hp_ground_air_connection', 'High-pressure ground air connection', '36', ['pneumatic'])),

  // Hydraulic
  single(b('rat_door', 'Ram air turbine door', '29', ['hydraulic', 'electrical'])),

  // Doors
  ...mirrored(b('overwing_exit_fwd', 'Forward overwing emergency exit', '52')),
  ...mirrored(b('overwing_exit_aft', 'Aft overwing emergency exit', '52')),

  // Lights and static dischargers
  ...mirrored(b('nav_light', 'Wing navigation light', '33', ['electrical'])),
  ...mirrored(b('wing_strobe_light', 'Wing strobe light', '33', ['electrical'])),
  ...mirrored(b('landing_light', 'Retractable landing light', '33', ['electrical'])),
  ...mirrored(b('wing_scan_light', 'Wing and engine scan light', '33', ['electrical'])),
  ...mirrored(b('static_dischargers_wing', 'Wing static dischargers', '23')),
]
