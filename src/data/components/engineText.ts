import type { ComponentText } from './landingGearText'

/**
 * What each power plant component is, what it looks like when nothing is wrong,
 * and what a technician looks at during a general visual inspection.
 *
 * Educational text. General turbofan knowledge is from the FAA Aviation
 * Maintenance Technician Handbook – Powerplant (faa_amt_powerplant). It contains
 * no limits and is not an inspection procedure for any engine.
 */
const cowlDoor = (which: string, extra: string): ComponentText => ({
  description: `One of the two ${which} doors on each engine. They are hinged at the top by the pylon and latched together underneath, and open upward for access to the engine. ${extra}`,
  normalCondition:
    'Door closed and flush with its neighbours, every latch underneath closed and flush, and the skin free of dents, cracks and fluid streaks.',
  checks: [
    'Latches along the bottom: all closed and flush',
    'Skin: dents, cracks, delamination, missing fasteners',
    'Fit with adjacent cowls: gaps, steps, signs of rubbing',
    'Fluid streaks from the joints or drains, and where they lead from',
  ],
})

/** Text keyed by the component id with its engine prefix removed. */
export const ENGINE_TEXT: Record<string, ComponentText> = {
  inlet_cowl: {
    description:
      'The ring at the front of the nacelle that guides air smoothly into the fan. Its leading edge, the lip, is heated with engine bleed air to prevent ice forming, and the inside is lined with sound-absorbing panels.',
    normalCondition:
      'Lip smooth and evenly curved all the way round, with an unbroken reflection. Inner lining intact, with no loose, lifted or missing sections and nothing lying in the inlet.',
    checks: [
      'Lip: dents, gouges, cracks, impact marks',
      'Inner acoustic lining: lifted, delaminated or missing areas',
      'Loose objects in the inlet before anything else is done',
      'Outer skin and attachment to the fan case: damage, missing fasteners',
    ],
  },
  spinner: {
    description:
      'The cone at the centre of the fan. It smooths the airflow into the fan hub and helps shed ice. A mark on it lets ground crew see from a distance whether the engine is turning.',
    normalCondition:
      'Cone smooth and undamaged, securely attached with all its fasteners, and its rotation mark visible.',
    checks: [
      'Surface: dents, cracks, erosion',
      'Attachment fasteners: all present and secure',
      'Rotation mark: present and visible',
    ],
  },
  fan: {
    description:
      'The large first stage of the engine: a ring of blades on a hub that produces most of the thrust. Everything the engine takes in passes through it first, so it is where damage from ingested objects shows.',
    normalCondition:
      'Every blade has the same smooth leading-edge shape as its neighbours, with no nicks, bends, cracks or missing material, and the fan turns freely by hand.',
    checks: [
      'Leading edge of each blade, compared with the blades beside it: nicks, dents, tears',
      'Blade tips and surfaces: bending, cracks, missing material, erosion',
      'Blade roots and platforms: damage, shifted or missing parts',
      'Fan case rub strip around the blade tips: scoring or missing sections',
    ],
  },
  fan_cowl_inboard: cowlDoor(
    'fan cowl',
    'They cover the fan case and the accessories mounted on it.',
  ),
  fan_cowl_outboard: cowlDoor(
    'fan cowl',
    'They cover the fan case and the accessories mounted on it.',
  ),
  reverser_cowl_inboard: cowlDoor(
    'thrust reverser cowl',
    'Each carries pivoting doors that swing out on landing to turn the fan airflow forward.',
  ),
  reverser_cowl_outboard: cowlDoor(
    'thrust reverser cowl',
    'Each carries pivoting doors that swing out on landing to turn the fan airflow forward.',
  ),
  exhaust_nozzle: {
    description:
      'The duct at the rear of the engine core through which the hot gas leaves. It shapes the exhaust flow and runs very hot in service.',
    normalCondition:
      'Nozzle round and undistorted, free of cracks, with even heat discolouration and no loose or missing fasteners.',
    checks: [
      'Skin and welds: cracks, buckling, burn-through',
      'Shape: distortion, dents',
      'Attachment: missing or loose fasteners',
      'Fluid or soot streaks that are uneven round the nozzle',
    ],
  },
  exhaust_plug: {
    description:
      'The cone in the centre of the exhaust nozzle. Together with the nozzle it forms the passage the hot gas flows out through.',
    normalCondition:
      'Cone undistorted and securely attached, free of cracks, with even heat discolouration.',
    checks: [
      'Skin: cracks, buckling, burn-through',
      'Attachment: security',
      'Oil wetting or pooling inside the cone',
    ],
  },
  pylon: {
    description:
      'The structure that attaches the engine to the wing. It carries the engine loads and routes fuel, hydraulic, electrical and bleed air connections between the two.',
    normalCondition:
      'Skin panels and fairings secure and undamaged, access panels closed, and no fluid running from its joints or drain points.',
    checks: [
      'Skin and fairings: cracks, dents, missing fasteners',
      'Access panels: closed and secure',
      'Fluid leaking from joints or drains, and what kind it is',
      'Signs of heat damage on the lower surfaces',
    ],
  },
  drain_mast: {
    description:
      'A small fin under the engine where drain lines from the engine and its accessories come together and vent overboard. Fluid seen here points back to a particular drain and component.',
    normalCondition: 'Mast undamaged and its outlets clear, with no fluid dripping from it.',
    checks: [
      'Mast: damage, security',
      'Outlets: blocked or dripping',
      'Any fluid: what kind it is and which outlet it comes from',
    ],
  },
}

/** The text for an engine component id such as `eng1_fan`. */
export function engineText(id: string): ComponentText | undefined {
  return ENGINE_TEXT[id.replace(/^eng\d_/, '')]
}
