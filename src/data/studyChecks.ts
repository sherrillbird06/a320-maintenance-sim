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
export const STUDY_CHECKS: Record<string, Record<string, number[]>> = {
  // Aviation Maintenance Technician Handbook – General (FAA-H-8083-30B)
  basic_electricity: { faa_amt_general: [0, 1, 2] },
  aircraft_drawings_and_symbols: { faa_amt_general: [1, 2, 4, 5] },
  weight_and_balance: { faa_amt_general: [0, 1, 3] },
  fluid_lines_and_fittings: { faa_amt_general: [0, 3] },
  materials_and_processes: { faa_amt_general: [0] },
  fasteners_and_hardware: { faa_amt_general: [1] },
  cleaning_and_corrosion_control: { faa_amt_general: [4] },
  mathematics_and_physics_for_mechanics: { faa_amt_general: [2] },

  // Aviation Maintenance Technician Handbook – Airframe (FAA-H-8083-31B)
  wood_structures: { faa_amt_airframe: [4] },
  aircraft_covering_and_finishes: { faa_amt_airframe: [1] },
  composite_and_non_metallic_structures: { faa_amt_airframe: [0, 2, 3] },
  assembly_rigging_and_nondestructive_testing: { faa_amt_airframe: [0] },
  cabin_atmosphere_control: { faa_amt_airframe: [3] },
  communication_and_navigation_systems: { faa_amt_airframe: [0, 4] },
  electrical_systems_ac_dc_and_warning_systems: { faa_amt_airframe: [0] },

  // Aviation Maintenance Technician Handbook – Powerplant (FAA-H-8083-32B)
  reciprocating_engine_construction: { faa_amt_powerplant: [5] },
  reciprocating_engine_operating_principles: { faa_amt_powerplant: [0, 2, 3] },
  engine_power_compression_and_efficiency: { faa_amt_powerplant: [0, 2, 3, 4, 5] },
  engine_fuel_and_fuel_metering: { faa_amt_powerplant: [4] },
  induction_supercharging_and_turbocharging: { faa_amt_powerplant: [3] },
  exhaust_systems: { faa_amt_powerplant: [2] },
  ignition_systems: { faa_amt_powerplant: [3, 5] },
  lubrication_systems: { faa_amt_powerplant: [0, 4] },
  engine_cooling_systems: { faa_amt_powerplant: [1] },
  turbine_engine_theory_and_sections: { faa_amt_powerplant: [0] },
  turbine_engine_types: { faa_amt_powerplant: [1, 4] },
  propellers: { faa_amt_powerplant: [1] },
  engine_inspection_removal_and_maintenance: { faa_amt_powerplant: [0] },
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
