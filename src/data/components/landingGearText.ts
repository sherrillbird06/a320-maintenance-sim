/**
 * What each landing gear component is, what it looks like when nothing is wrong,
 * and what a technician looks at during a general visual inspection.
 *
 * This is educational text. The layout of the gear follows the Airbus Aircraft
 * Characteristics document (source id airbus_ac_a320, section 2-9-0); the
 * inspection points are general practice from the FAA Aviation Maintenance
 * Technician Handbook – Airframe (faa_amt_airframe). It contains no limits and
 * is not an inspection procedure for any aircraft.
 */
export interface ComponentText {
  description: string
  normalCondition: string
  checks: string[]
}

const tire = (where: string): ComponentText => ({
  description: `A ${where} tire. It carries the aircraft on the ground and absorbs part of the landing load. Circumferential grooves in the tread clear water and show how much rubber remains.`,
  normalCondition:
    'Tread grooves visible all the way round, rubber free of cuts, bulges and embedded objects, sidewalls smooth with no cracking, and no casing fabric showing anywhere.',
  checks: [
    'Tread: wear pattern, cuts, embedded objects, flat spots',
    'Sidewalls: cuts, bulges, cracking, contamination by fluid',
    'Bead area at the wheel rim: damage, signs of slippage',
    'General inflation appearance compared with the other tire on the same axle',
  ],
})

const wheel = (where: string): ComponentText => ({
  description: `A ${where} wheel. It is made in two halves bolted together, which carry the tire and turn on bearings on the axle.`,
  normalCondition:
    'Paint intact, all tie bolts present, no cracks, corrosion or impact damage on the rim or wheel face, and no signs of overheating.',
  checks: [
    'Rim flanges and wheel face: cracks, dents, corrosion',
    'Tie bolts: all present, none visibly loose or damaged',
    'Signs of overheating such as discoloured or blistered paint',
    'Axle nut area: security, signs of grease loss',
  ],
})

const strut = (which: string): ComponentText => ({
  description: `The ${which} leg. Its upper part is the main fitting attached to the airframe; a sliding tube carrying the axle moves in and out of it, and the gas and oil inside absorb landing and taxi loads.`,
  normalCondition:
    'The exposed sliding tube is clean, bright and free of scoring. The seal area at the bottom of the main fitting is dry, and the paint and fittings on the leg are intact.',
  checks: [
    'Sliding tube: scoring, pitting, corrosion, dirt build-up',
    'Seal area: fluid leakage or wetness',
    'Main fitting: cracks, corrosion, damaged paint, damaged attachments',
    'General extension compared with the other gear legs',
  ],
})

const torqueLinks = (which: string): ComponentText => ({
  description: `Two hinged arms joining the sliding tube to the upper part of the ${which} leg. They let the leg compress and extend while stopping the lower part from turning.`,
  normalCondition:
    'Both arms straight and undamaged, hinge pins and their locking in place, with no visible looseness at the joints.',
  checks: [
    'Arms: cracks, distortion, corrosion',
    'Hinge pins and locking devices: present and secure',
    'Joints: signs of wear or play, lubrication',
  ],
})

const bay = (which: string): ComponentText => ({
  description: `The compartment the ${which} retracts into. It holds attachment structure, door mechanism, pipes and wiring, and it collects dirt and fluid thrown up from the ground.`,
  normalCondition:
    'Structure clean and free of corrosion, pipes and wiring clipped in place and undamaged, and no fluid running down the walls or pooling.',
  checks: [
    'Structure: corrosion, cracks, damaged protective finish',
    'Pipes, hoses and wiring: chafing, leaks, loose or missing clips',
    'Fluid traces: where they come from and which system they belong to',
    'Foreign objects left in the bay',
  ],
})

const servicePanel = (system: string): ComponentText => ({
  description: `Access door for ground servicing of the ${system} hydraulic system. The aircraft has three independent hydraulic systems, named Green, Blue and Yellow, each with its own servicing access.`,
  normalCondition:
    'Door closed and flush with the surrounding skin, all fasteners or latches engaged, and no fluid staining around its edges.',
  checks: [
    'Door: closed, latched, flush, undamaged',
    'Surrounding skin: fluid streaks or staining leading from the door',
    'Fasteners and latches: all present and secure',
  ],
})

/** Text keyed by component id with any side or position number removed. */
export const LANDING_GEAR_TEXT: Record<string, ComponentText> = {
  nlg_tire: tire('nose wheel'),
  mlg_tire: tire('main wheel'),
  nlg_wheel: wheel('nose'),
  mlg_wheel: wheel('main'),
  nlg_shock_strut: strut('nose gear'),
  mlg_shock_strut: strut('main gear'),
  nlg_torque_links: torqueLinks('nose gear'),
  mlg_torque_links: torqueLinks('main gear'),
  nlg_bay: bay('nose gear'),
  mlg_bay: bay('main gear leg'),
  hyd_service_panel_green: servicePanel('Green'),
  hyd_service_panel_yellow: servicePanel('Yellow'),
  hyd_service_panel_blue: servicePanel('Blue'),

  mlg_brake: {
    description:
      'A multi-disc brake mounted on the axle inside the wheel. Hydraulic pistons squeeze a stack of rotating and stationary discs together to slow the wheel.',
    normalCondition:
      'Brake housing dry and undamaged, hydraulic connections dry, and the wear indicator pins still protruding from the housing.',
    checks: [
      'Brake housing and pistons: hydraulic fluid leakage',
      'Wear indicator pins: how far they protrude',
      'Discs as far as visible: damage, missing pieces, heavy oxidation',
      'Hydraulic connections at the brake: security, chafing',
    ],
  },
  mlg_brake_lines: {
    description:
      'Rigid pipes down the gear leg and flexible hoses across to each brake, carrying hydraulic pressure to the brake pistons. The flexible sections allow for the movement of the leg.',
    normalCondition:
      'Pipes and hoses dry, clipped in place, free of chafing, kinks and twists, with fittings dry and undisturbed.',
    checks: [
      'Hoses: chafing, cracking, blistering, twisting',
      'Pipes: dents, corrosion, loose or missing clips',
      'Fittings: wetness or drips that would indicate a leak',
    ],
  },
  mlg_side_stay: {
    description:
      'The folding strut that braces the main gear leg sideways. When the gear is down it is held straight by a lock stay, which is what keeps the gear locked in the extended position.',
    normalCondition:
      'Both arms straight and undamaged, the stay fully straightened with the lock stay in its locked position, and all pins and their locking in place.',
    checks: [
      'Stay arms: cracks, distortion, corrosion',
      'Lock stay: fully in the locked position',
      'Pins and locking devices at each joint: present and secure',
      'Downlock actuator and springs: security, leakage',
    ],
  },
  mlg_retraction_actuator: {
    description:
      'The hydraulic cylinder that swings the main gear leg sideways into its bay on retraction and helps control it on extension.',
    normalCondition:
      'Cylinder body and rod undamaged, the exposed rod clean and bright, attachments secure and the unit dry.',
    checks: [
      'Rod: scoring, pitting, corrosion',
      'Rod seal and hydraulic connections: leakage',
      'End attachments: security, locking',
    ],
  },
  mlg_door_main: {
    description:
      'The large hydraulically operated door under the fuselage that covers the main wheel bay. It opens while the gear moves and closes again once the gear is down, so on the ground it is normally shut.',
    normalCondition:
      'Door closed and flush with the belly fairing, seal intact along its edges, and no fluid or impact damage on its outer surface.',
    checks: [
      'Outer surface: dents, cracks, delamination, fluid streaks',
      'Edges and seal: damage, missing sections',
      'Fit: closed and flush with the surrounding fairing',
    ],
  },
  mlg_door_hinged: {
    description:
      'The fairing door attached to the main gear leg. It moves with the leg and closes the opening under the wing when the gear is retracted.',
    normalCondition:
      'Fairing undamaged, attachments to the leg secure, and its edges free of cracks and impact damage.',
    checks: [
      'Surface and edges: cracks, dents, delamination',
      'Attachment links to the leg: security, wear',
      'Clearance from the tires and brake lines',
    ],
  },
  nlg_drag_strut: {
    description:
      'The folding brace that runs forward from the nose gear leg into the bay. It holds the leg against fore-and-aft loads and locks it in the extended position.',
    normalCondition:
      'Strut straight and undamaged, fully extended and locked, with all pins and their locking in place.',
    checks: [
      'Strut arms: cracks, distortion, corrosion',
      'Lock position with the gear down',
      'Pins and locking devices: present and secure',
    ],
  },
  nlg_steering_actuator: {
    description:
      'The hydraulic nose wheel steering unit on the nose gear leg. It turns the lower part of the leg, and with it the nose wheels, in response to the tiller and rudder pedals.',
    normalCondition:
      'Unit dry and undamaged, hydraulic connections dry and secure, and electrical connectors attached.',
    checks: [
      'Actuating cylinder and hydraulic connections: leakage',
      'Unit and its attachments: damage, security',
      'Electrical connectors and wiring: security, chafing',
    ],
  },
  nlg_door_fwd: {
    description:
      'One of the two forward nose gear doors. They are hydraulically operated: they open while the gear moves and close again once it is down, so on the ground they are normally shut.',
    normalCondition:
      'Door closed and flush with the nose skin, seal intact, and its surface free of dents and cracks.',
    checks: [
      'Outer surface: dents, cracks, delamination',
      'Fit: closed and flush with the surrounding skin',
      'Edges and seal: damage, missing sections',
    ],
  },
  nlg_door_aft: {
    description:
      'One of the two aft nose gear doors. They are linked mechanically to the leg, so they stay open beside it whenever the gear is down.',
    normalCondition:
      'Door undamaged, hinges and the link rods to the leg secure, with no cracks at the hinge or rod attachments.',
    checks: [
      'Surface and edges: dents, cracks, delamination',
      'Hinges: wear, corrosion, security',
      'Link rods to the leg: bent rods, missing locking',
    ],
  },
  apu_external_panel: {
    description:
      'A control panel on the nose gear from which ground crew can shut down the auxiliary power unit in an emergency.',
    normalCondition:
      'Panel secure and undamaged, the guard over its switch in place, and its markings readable.',
    checks: [
      'Panel and its attachment: damage, security',
      'Switch guard: present and closed',
      'Markings: readable',
    ],
  },
}

/** The text for a component id, ignoring its side suffix and position number. */
export function landingGearText(id: string): ComponentText | undefined {
  const base = id.replace(/_(lh|rh)$/, '').replace(/_\d+$/, '')
  return LANDING_GEAR_TEXT[id] ?? LANDING_GEAR_TEXT[base]
}
