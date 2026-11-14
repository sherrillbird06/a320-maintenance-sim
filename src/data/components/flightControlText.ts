import type { ComponentText } from './landingGearText'

/**
 * What each flight control surface is, what it looks like when nothing is wrong,
 * and what a technician looks at during a general visual inspection.
 *
 * Educational text. Which surfaces the aircraft has comes from the Airbus
 * Aircraft Characteristics document (airbus_ac_a320); inspection points are
 * general practice from the FAA Airframe handbook (faa_amt_airframe). It
 * contains no limits and is not an inspection procedure for any aircraft.
 */
const SURFACE_CHECKS = [
  'Skin, upper and lower: dents, cracks, scratches through the paint',
  'Trailing edge: delamination, lifted or split skin, impact damage',
  'Hinges and actuator attachments: wear, corrosion, missing locking',
  'Hydraulic fluid at the actuators that move the surface',
]

export const FLIGHT_CONTROL_TEXT: Record<string, ComponentText> = {
  slat: {
    description:
      'One of five movable sections along the leading edge of each wing. Slats slide forward and down on tracks for take-off and landing, letting the wing fly more slowly.',
    normalCondition:
      'Leading edge smooth and evenly curved, with no dents or erosion. Retracted slat sitting flush against the wing with an even gap along its length.',
    checks: [
      'Leading edge: dents, bird strike damage, erosion',
      'Fit when retracted: even gap, flush with its neighbours',
      'Lower edge and seal: damage, missing sections',
      'Tracks, as far as visible: damage, debris, fluid',
    ],
  },
  flap: {
    description:
      'A large movable section of the wing trailing edge. Flaps run aft and down on tracks for take-off and landing to increase lift and drag. Each wing has an inboard and an outboard flap.',
    normalCondition:
      'Skins undamaged, trailing edge straight and unbroken, and the retracted flap sitting flush with the wing and its neighbours.',
    checks: [
      'Lower skin: dents and impact marks from stones and debris thrown up by the wheels',
      'Trailing edge: delamination, lifted or split skin',
      'Fit when retracted: flush, even gaps',
      'Flap tracks and their fairings: damage, fluid, security',
    ],
  },
  spoiler: {
    description:
      'One of five panels on the upper surface of each wing, hinged at the front. They rise to reduce lift and add drag: in flight to help roll and slow the aircraft, and on landing to put the weight on the wheels.',
    normalCondition:
      'Panel undamaged and lying flush with the wing surface, trailing edge unbroken, with no fluid running from under it.',
    checks: [
      'Panel skin and trailing edge: dents, cracks, delamination',
      'Fit when retracted: flush with the wing and flap',
      'Fluid from the actuator under the panel',
      'Hinges: wear, corrosion, security',
    ],
  },
  aileron: {
    description:
      'The movable surface at the outer trailing edge of each wing. The two ailerons move in opposite directions to roll the aircraft.',
    normalCondition:
      'Skins and trailing edge undamaged, surface aligned with the wing at rest, and static dischargers present along the trailing edge.',
    checks: SURFACE_CHECKS,
  },
  elevator: {
    description:
      'One of the two movable surfaces at the trailing edge of the horizontal stabilizer. Together they pitch the nose up and down.',
    normalCondition:
      'Skins and trailing edge undamaged, both elevators at the same position at rest, and static dischargers present.',
    checks: SURFACE_CHECKS,
  },
  rudder: {
    description:
      'The movable surface at the trailing edge of the vertical stabilizer. It yaws the nose left and right.',
    normalCondition:
      'Skins and trailing edge undamaged, surface aligned with the fin at rest, and static dischargers present.',
    checks: SURFACE_CHECKS,
  },
}

/** The text for a flight control surface id such as `slat_3_lh` or `flap_outboard_rh`. */
export function flightControlText(id: string): ComponentText | undefined {
  const base = id
    .replace(/_(lh|rh)$/, '')
    .replace(/_\d+$/, '')
    .replace(/^flap_(inboard|outboard)$/, 'flap')
  return FLIGHT_CONTROL_TEXT[base]
}
