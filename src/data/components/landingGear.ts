import type { Component, Side } from '../schema'
import { mirrored, numbered, seedsFor, single } from './builders'

const c = seedsFor('C')

const GEAR = ['landing-gear'] as const
const GEAR_HYD = ['landing-gear', 'hydraulic'] as const

/** Main wheels, tires and brakes are numbered 1–4 from left to right across the aircraft. */
function mainWheelSide(component: Component, index: number): Component {
  const side: Side = index < 2 ? 'LH' : 'RH'
  return { ...component, side }
}

/** Zone C — nose and main landing gear, their doors and bays, and the hydraulic service points. */
export const LANDING_GEAR: Component[] = [
  // Nose landing gear
  single(c('nlg_shock_strut', 'Nose gear shock strut', '32', GEAR)),
  single(c('nlg_torque_links', 'Nose gear torque links', '32', GEAR)),
  single(c('nlg_drag_strut', 'Nose gear drag strut', '32', GEAR)),
  single(c('nlg_steering_actuator', 'Nose wheel steering actuator', '32', GEAR_HYD)),
  ...mirrored(c('nlg_wheel', 'Nose wheel', '32', GEAR)),
  ...mirrored(c('nlg_tire', 'Nose wheel tire', '32', GEAR)),
  ...mirrored(c('nlg_door_fwd', 'Nose gear forward door', '32', GEAR_HYD)),
  ...mirrored(c('nlg_door_aft', 'Nose gear aft door', '32', GEAR)),
  single(c('nlg_bay', 'Nose gear bay', '32', GEAR)),
  single(c('apu_external_panel', 'External APU shutdown panel on the nose gear', '49', ['apu'])),

  // Main landing gear
  ...mirrored(c('mlg_shock_strut', 'Main gear shock strut', '32', GEAR)),
  ...mirrored(c('mlg_side_stay', 'Main gear side stay', '32', GEAR)),
  ...mirrored(c('mlg_torque_links', 'Main gear torque links', '32', GEAR)),
  ...mirrored(c('mlg_retraction_actuator', 'Main gear retraction actuator', '32', GEAR_HYD)),
  ...mirrored(c('mlg_brake_lines', 'Main gear brake hydraulic lines', '32', GEAR_HYD)),
  ...mirrored(c('mlg_door_main', 'Main gear door', '32', GEAR_HYD)),
  ...mirrored(c('mlg_door_hinged', 'Main gear hinged fairing door', '32', GEAR)),
  ...mirrored(c('mlg_bay', 'Main gear bay', '32', GEAR_HYD)),
  ...numbered(c('mlg_wheel', 'Main wheel', '32', GEAR), 4).map(mainWheelSide),
  ...numbered(c('mlg_tire', 'Main wheel tire', '32', GEAR), 4).map(mainWheelSide),
  ...numbered(c('mlg_brake', 'Brake assembly', '32', GEAR_HYD), 4).map(mainWheelSide),

  // Hydraulic servicing access
  single(c('hyd_service_panel_green', 'Green hydraulic system service panel', '29', ['hydraulic'])),
  single(
    c('hyd_service_panel_yellow', 'Yellow hydraulic system service panel', '29', ['hydraulic']),
  ),
  single(c('hyd_service_panel_blue', 'Blue hydraulic system service panel', '29', ['hydraulic'])),
]
