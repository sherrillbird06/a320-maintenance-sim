/** A measured fact about the aircraft, with the public document and figure it was read from. */
export interface SourcedDimension {
  value: number
  unit: 'm'
  /** Id of an entry in SOURCES. */
  source: string
  /** Where in the source the value is printed. */
  ref: string
  note?: string
}

const AC = 'airbus_ac_a320'
const DIMENSIONS_FIG = 'Figure 2-2-0-991-004-A01, General Aircraft Dimensions – Wing Tip Fence'
const DOORS_FIG = 'Figures 2-7-0-991-003-A01 and 2-7-0-991-022-A01 to -028-A01, Door Location and Clearances'
const CLEARANCES_FIG =
  'Figure 2-3-0-991-004-A01, Ground Clearances – Wing Tip Fence, empty weight for maintenance'

/**
 * The one aircraft in the hangar. Dimensions were read from the Airbus document
 * on 2026-11-13; heights are for the aircraft standing empty in maintenance
 * configuration, which is how it sits in the hangar.
 */
export const AIRCRAFT = {
  model: 'A320-214',
  modelSource: 'easa_tcds_a064',
  engines: 'CFM56-5B',
  wingtips: 'Wing tip fences',
  /** Paint scheme is inspired by an airline livery; no airline marks are used. */
  operatorStyle: 'American Airlines-inspired, unbranded',
  /** Contains the letter I, which the FAA never issues, so it cannot match a real aircraft. */
  registration: { value: 'N320IS', fictional: true },
  /** Real Airbus serial numbers are numeric. */
  msn: { value: 'TS0320', fictional: true },
  dimensions: {
    overallLength: { value: 37.57, unit: 'm', source: AC, ref: `${DIMENSIONS_FIG}, sheet 2` },
    wingspan: { value: 34.1, unit: 'm', source: AC, ref: `${DIMENSIONS_FIG}, sheet 1` },
    horizontalTailSpan: { value: 12.45, unit: 'm', source: AC, ref: `${DIMENSIONS_FIG}, sheet 1` },
    fuselageWidth: { value: 3.95, unit: 'm', source: AC, ref: `${DIMENSIONS_FIG}, sheet 2` },
    fuselageHeight: { value: 4.14, unit: 'm', source: AC, ref: `${DIMENSIONS_FIG}, sheet 1` },
    wheelbase: { value: 12.64, unit: 'm', source: AC, ref: `${DIMENSIONS_FIG}, sheet 1` },
    noseToNoseGear: { value: 5.07, unit: 'm', source: AC, ref: `${DIMENSIONS_FIG}, sheet 1` },
    mainGearTrack: { value: 7.59, unit: 'm', source: AC, ref: `${DIMENSIONS_FIG}, sheet 1` },
    mainWheelSpacing: { value: 0.93, unit: 'm', source: AC, ref: `${DIMENSIONS_FIG}, sheet 1` },
    noseWheelSpacing: { value: 0.5, unit: 'm', source: AC, ref: `${DIMENSIONS_FIG}, sheet 1` },
    engineCentrelineOffset: {
      value: 5.75,
      unit: 'm',
      source: AC,
      ref: `${DIMENSIONS_FIG}, sheet 2`,
      note: 'Engine centreline to aircraft centreline.',
    },
    noseToEngineInlet: {
      value: 11.19,
      unit: 'm',
      source: AC,
      ref: `${DIMENSIONS_FIG}, sheet 2`,
      note: 'CFM56 installation.',
    },
    finHeightAboveFuselage: {
      value: 5.87,
      unit: 'm',
      source: AC,
      ref: `${DIMENSIONS_FIG}, sheet 1`,
    },
    tailHeight: {
      value: 12.08,
      unit: 'm',
      source: AC,
      ref: `${CLEARANCES_FIG}, sheet 3 (VT)`,
      note: 'Top of the vertical tail above the ground. Varies with weight and balance.',
    },
    horizontalTailHeight: {
      value: 5.56,
      unit: 'm',
      source: AC,
      ref: `${CLEARANCES_FIG}, sheet 3 (HT)`,
    },
    apuExhaustHeight: {
      value: 4.84,
      unit: 'm',
      source: AC,
      ref: `${CLEARANCES_FIG}, sheet 3 (AP)`,
    },
    nacelleGroundClearance: {
      value: 0.67,
      unit: 'm',
      source: AC,
      ref: `${CLEARANCES_FIG}, sheet 3 (N1, CFM 5B nacelle low point)`,
    },
  } satisfies Record<string, SourcedDimension>,
  /** Door and exit positions and clear opening sizes, in metres. x is measured aft from the nose to the door centre. */
  doors: {
    pax_door_fwd: { x: 5.04, width: 0.81, height: 1.85, source: AC, ref: DOORS_FIG },
    pax_door_aft: { x: 29.64, width: 0.81, height: 1.85, source: AC, ref: DOORS_FIG },
    overwing_exit_fwd: { x: 14.43, width: 0.5, height: 0.9, source: AC, ref: DOORS_FIG },
    overwing_exit_aft: { x: 15.28, width: 0.5, height: 0.9, source: AC, ref: DOORS_FIG },
    fwd_cargo_door: { x: 8.16, width: 1.82, height: 1.24, source: AC, ref: DOORS_FIG },
    aft_cargo_door: { x: 22.69, width: 1.82, height: 1.23, source: AC, ref: DOORS_FIG },
    bulk_cargo_door: { x: 26.29, width: 0.95, height: 0.77, source: AC, ref: DOORS_FIG },
  },
} as const
