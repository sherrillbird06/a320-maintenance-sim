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
} as const
