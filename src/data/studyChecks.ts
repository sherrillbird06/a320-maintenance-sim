/**
 * Points of the study guide whose stated fact was found in an FAA handbook.
 *
 * A point is listed only when its specific claim (a figure, a name, a
 * definition) was located in the handbook text and agreed with it. A point that
 * is absent has not been checked; it has not been found wrong. Points that
 * disagreed with a source are in `studyCorrections.ts` instead.
 *
 * Shape: topic id → source id → indexes of the points confirmed by that source.
 */
const GENERAL = 'faa_amt_general'
const AIRFRAME = 'faa_amt_airframe'
const POWERPLANT = 'faa_amt_powerplant'

export const STUDY_CHECKS: Record<string, Record<string, number[]>> = {
  // Aviation Maintenance Technician Handbook – General (FAA-H-8083-30B)
  basic_electricity: { [GENERAL]: [0, 1, 2, 3] },
  aircraft_drawings_and_symbols: { [GENERAL]: [0, 1, 2, 3, 4, 5] },
  weight_and_balance: { [GENERAL]: [0, 1, 3, 5] },
  fluid_lines_and_fittings: { [GENERAL]: [0, 1, 2, 3, 4] },
  materials_and_processes: { [GENERAL]: [0, 1, 3, 4] },
  fasteners_and_hardware: { [GENERAL]: [1, 4, 5] },
  ground_operations_and_servicing: { [GENERAL]: [0, 3] },
  cleaning_and_corrosion_control: { [GENERAL]: [0, 1, 2, 3, 4] },
  mathematics_and_physics_for_mechanics: { [GENERAL]: [1, 2, 3, 4, 5] },
  regulations_privileges_and_records: { [GENERAL]: [2, 3, 4] },

  // Aviation Maintenance Technician Handbook – Airframe (FAA-H-8083-31B)
  wood_structures: { [AIRFRAME]: [0, 1, 3, 4] },
  aircraft_covering_and_finishes: { [AIRFRAME]: [0, 1, 2, 4] },
  sheet_metal_structures: { [AIRFRAME]: [3, 4] },
  composite_and_non_metallic_structures: { [AIRFRAME]: [0, 1, 2, 3, 4] },
  welding_brazing_and_soldering: { [AIRFRAME]: [0, 1, 2] },
  // The inspection methods are described in the General handbook.
  assembly_rigging_and_nondestructive_testing: { [AIRFRAME]: [0, 1], [GENERAL]: [2, 3, 4] },
  landing_gear_systems: { [AIRFRAME]: [0, 1, 2, 3] },
  hydraulic_and_pneumatic_power_systems: { [AIRFRAME]: [0, 2, 3, 4] },
  cabin_atmosphere_control: { [AIRFRAME]: [0, 1, 2, 3, 4] },
  aircraft_instrument_systems: { [AIRFRAME]: [0, 3, 4] },
  communication_and_navigation_systems: { [AIRFRAME]: [0, 1, 2, 3, 4] },
  aircraft_fuel_systems: { [AIRFRAME]: [0, 2, 4] },
  ice_rain_and_fire_protection_systems: { [AIRFRAME]: [1, 2] },
  electrical_systems_ac_dc_and_warning_systems: { [AIRFRAME]: [0, 1] },

  // Aviation Maintenance Technician Handbook – Powerplant (FAA-H-8083-32B)
  reciprocating_engine_construction: { [POWERPLANT]: [1, 2, 3, 4, 5] },
  reciprocating_engine_operating_principles: { [POWERPLANT]: [0, 1, 2, 3, 4, 5] },
  engine_power_compression_and_efficiency: { [POWERPLANT]: [0, 1, 2, 3, 4, 5] },
  engine_fuel_and_fuel_metering: { [POWERPLANT]: [0, 2, 3, 4] },
  induction_supercharging_and_turbocharging: { [POWERPLANT]: [0, 1, 3, 4] },
  exhaust_systems: { [POWERPLANT]: [0, 1, 2, 4] },
  ignition_systems: { [POWERPLANT]: [0, 2, 3, 4, 5] },
  engine_starting_systems: { [POWERPLANT]: [0, 1, 2, 3, 4] },
  lubrication_systems: { [POWERPLANT]: [0, 1, 2, 3, 4] },
  engine_cooling_systems: { [POWERPLANT]: [0, 1, 2] },
  turbine_engine_theory_and_sections: { [POWERPLANT]: [0, 2, 3, 5] },
  turbine_engine_types: { [POWERPLANT]: [0, 1, 3, 4] },
  propellers: { [POWERPLANT]: [1, 2, 5] },
  engine_fire_protection: { [POWERPLANT]: [3, 4] },
  engine_inspection_removal_and_maintenance: { [POWERPLANT]: [0, 3, 4, 5] },
}

/** Source ids that confirm a point, if any. */
export function checksFor(topicId: string, point: number): string[] {
  return Object.entries(STUDY_CHECKS[topicId] ?? {})
    .filter(([, points]) => points.includes(point))
    .map(([sourceId]) => sourceId)
}

export const CHECKED_POINT_COUNT = Object.values(STUDY_CHECKS)
  .flatMap((bySource) => Object.values(bySource))
  .reduce((sum, points) => sum + points.length, 0)
