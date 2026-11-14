/**
 * The technical library: one page per ATA chapter the simulator covers.
 *
 * Every page is original educational text. Facts about this aircraft come from
 * the Airbus Aircraft Characteristics document; general knowledge comes from the
 * FAA handbooks named on each page. No maintenance manual content is reproduced,
 * and no page contains a limit, quantity, interval or procedure.
 */
export interface LibraryPage {
  chapter: string
  /** What the chapter is about, in a sentence or two. */
  covers: string
  /** How this subject appears on the A320 in the hangar. */
  onThisAircraft: string
  /** General points a technician keeps in mind when inspecting this area. */
  inspection: string[]
  /** What the real maintenance manual chapter holds. Described, never reproduced. */
  realManual: string
  /** Ids in SOURCES that this page draws on. */
  sources: string[]
}

const AC = 'airbus_ac_a320'
const GENERAL = 'faa_amt_general'
const AIRFRAME = 'faa_amt_airframe'
const POWERPLANT = 'faa_amt_powerplant'
const PRACTICES = 'faa_ac_43_13_1b'

const manual = (holds: string) =>
  `In an aircraft maintenance manual this chapter holds ${holds}. Each task there applies to particular aircraft and is revised regularly. None of it is reproduced here.`

export const LIBRARY: LibraryPage[] = [
  {
    chapter: '05',
    covers:
      'Time limits and maintenance checks: when things are due. It lists the scheduled inspections and the life limits of parts, and the unscheduled checks required after events such as a hard landing or a lightning strike.',
    onThisAircraft:
      'Every inspection assignment in this simulator stands in for a scheduled check. The work order tells you the zone to inspect, not what you will find.',
    inspection: [
      'An inspection is defined by its scope: which zones, to what depth, with which panels open.',
      'A general visual inspection looks for obvious damage, failure or irregularity from within touching distance, with ordinary lighting, a mirror or a flashlight.',
      'An unscheduled event changes what must be looked at; the event is part of the record.',
      'What was inspected, by whom and when is recorded even when nothing is found.',
    ],
    realManual: manual(
      'the scheduled check lists, life-limited part limits and the conditional inspections',
    ),
    sources: [GENERAL],
  },
  {
    chapter: '12',
    covers:
      'Servicing: replenishing what the aircraft uses up, such as fuel, oil, hydraulic fluid, tire and strut gas, water and oxygen, and the routine cleaning and lubrication that goes with it.',
    onThisAircraft:
      'Service points are grouped behind access doors: hydraulic servicing doors on the belly fairing for the Green, Yellow and Blue systems, the refuel coupling under the right wing, a refuel panel on the belly fairing, and water and waste panels under the aft fuselage.',
    inspection: [
      'A service panel left open, or closed but not latched, is a finding in its own right.',
      'Fluid streaks leading from a service door suggest a leaking coupling or an overfilled system.',
      'Only the fluid specified for a system goes into it; mixing fluids is a serious error.',
      'Caps and covers removed for servicing are accounted for afterwards.',
    ],
    realManual: manual(
      'the servicing procedures, fluid specifications and quantities for each system',
    ),
    sources: [AC, GENERAL],
  },
  {
    chapter: '21',
    covers:
      'Air conditioning: supplying the cabin and flight deck with air at a comfortable temperature and pressure, and cooling the electronic equipment.',
    onThisAircraft:
      'Two air conditioning packs sit in the belly fairing and draw outside cooling air through ram air inlets on its underside. Cabin pressure is released through an outflow valve in the lower aft fuselage. A ground connection lets a ground cart supply conditioned air.',
    inspection: [
      'Ram air inlets and outlets: blockage, foreign objects, damaged flaps or ducts.',
      'The outflow valve area: damage and staining, since everything leaving the cabin passes it.',
      'Ground connection doors: closed and latched after use.',
      'Heat damage or discolouration on panels near the packs.',
    ],
    realManual: manual(
      'system descriptions, component locations, and the tests and removal tasks for packs, valves and controllers',
    ),
    sources: [AC, AIRFRAME],
  },
  {
    chapter: '24',
    covers:
      'Electrical power: generating alternating and direct current, and distributing and protecting it. Generators on the engines and APU, batteries, and the circuit breakers that protect each circuit.',
    onThisAircraft:
      'On the ground the aircraft can be powered through an external power receptacle behind a door under the nose. Circuit breaker panels are in the flight deck, overhead and behind the seats.',
    inspection: [
      'External power receptacle: bent or burnt pins, damaged door.',
      'Wiring anywhere on the aircraft: chafing, loose clips, heat damage, contamination by fluid.',
      'Bonding straps between parts: present, secure and not corroded.',
      'A tripped circuit breaker is information; why it tripped is found before it is reset.',
    ],
    realManual: manual(
      'power source descriptions, the load distribution, and the tests and removal tasks for generators, batteries and contactors',
    ),
    sources: [AC, AIRFRAME],
  },
  {
    chapter: '26',
    covers:
      'Fire protection: detecting fire, overheat and smoke, and extinguishing it. Detection loops around the engines and APU, smoke detectors in cargo compartments and lavatories, and extinguisher bottles.',
    onThisAircraft:
      'The engines, their pylons and the APU compartment are protected areas, as are the cargo compartments. Fire controls are on the flight deck overhead panel.',
    inspection: [
      'Detection loops: secure in their clips, not kinked, crushed or chafed.',
      'Extinguisher discharge indicators, where fitted: intact.',
      'Fire seals around compartments: complete, not torn or hardened.',
      'Signs of past heat: discoloured or blistered paint, distorted panels.',
    ],
    realManual: manual(
      'the detection and extinguishing system descriptions, tests of the loops and the bottle weight and pressure checks',
    ),
    sources: [AIRFRAME, POWERPLANT],
  },
  {
    chapter: '27',
    covers:
      'Flight controls: the surfaces that steer and trim the aircraft, and the systems that move them. Ailerons, elevators and rudder; and the flaps, slats and spoilers that change the lift and drag of the wing.',
    onThisAircraft:
      'Each wing carries five slats along its leading edge, inboard and outboard flaps and an aileron along its trailing edge, and five spoilers on its upper surface. The tail carries the rudder and two elevators on a trimmable horizontal stabilizer. All are moved hydraulically.',
    inspection: [
      'Surface skins and edges: dents, cracks, delamination, lightning strike marks.',
      'Hinges and attachments: wear, corrosion, missing locking.',
      'Hydraulic leaks at the actuators that move each surface.',
      'Gaps and alignment with the neighbouring structure when the surface is at rest.',
      'Static dischargers on trailing edges: present and unbroken.',
    ],
    realManual: manual(
      'the control system descriptions, rigging and travel checks, and the tests and removal tasks for actuators and computers',
    ),
    sources: [AC, AIRFRAME],
  },
  {
    chapter: '28',
    covers:
      'Fuel: storing fuel in the wings and centre section, venting the tanks, delivering fuel to the engines and APU, and measuring how much is on board.',
    onThisAircraft:
      'The wings are the fuel tanks, reached through access panels on their lower surface. The refuel coupling is under the right wing, with a control panel on the belly fairing, and each wing has an overwing gravity refuel cap. Vents under the outer wings let the tanks breathe, and magnetic level indicators under the wings allow a manual quantity check.',
    inspection: [
      'Wing lower surface: fuel stains or wet patches, which mark a leak path.',
      'Tank access panels: all fasteners present, no seepage round the edges.',
      'Vent inlets: clear of blockage and damage.',
      'Refuel coupling and caps: closed, sealed, undamaged.',
      'The aircraft is electrically bonded to ground before fuel is moved.',
    ],
    realManual: manual(
      'tank and system descriptions, leak classification and limits, and the tests and removal tasks for pumps, valves and quantity probes',
    ),
    sources: [AC, AIRFRAME],
  },
  {
    chapter: '29',
    covers:
      'Hydraulic power: generating, storing and distributing hydraulic pressure for the systems that use it, such as flight controls, landing gear and brakes.',
    onThisAircraft:
      'There are three independent hydraulic systems, named Green, Blue and Yellow, so that losing one leaves the others working. Each has its own servicing access on the belly fairing. A ram air turbine can be deployed into the airflow to provide emergency power.',
    inspection: [
      'A leak is traced back to its source: the wettest point, and which pipe, hose or component it comes from.',
      'Which system a leaking component belongs to is part of the finding.',
      'Hoses: chafing, blistering, kinks, twisting. Pipes: dents, corrosion, loose clips.',
      'Hydraulic fluid attacks paint, seals and wiring insulation, so its trail matters as well as its source.',
      'Actuator rods: clean, bright and unscored.',
    ],
    realManual: manual(
      'the three system descriptions, leak limits, reservoir servicing, and the tests and removal tasks for pumps, accumulators and valves',
    ),
    sources: [AC, AIRFRAME],
  },
  {
    chapter: '32',
    covers:
      'Landing gear: the legs, wheels, tires and brakes that carry the aircraft on the ground, the mechanism that retracts and extends them, their doors, and nose wheel steering.',
    onThisAircraft:
      'A twin-wheel nose gear retracts forward into the nose. Each twin-wheel main gear retracts sideways toward the centreline. Each main gear leg is braced sideways by a folding side stay that locks it down. The four main wheels have multi-disc brakes; the nose wheels are steered and unbraked.',
    inspection: [
      'Tires: cuts, wear, bulges, embedded objects, anything showing the casing.',
      'Shock strut sliding tubes: clean, bright, unscored and dry at the seal.',
      'Brakes: leaks, wear indicators, damaged discs.',
      'Down-locks: stays straight and locked, locking devices in place.',
      'Hydraulic lines and hoses on the legs: chafing and leaks.',
      'Doors and their linkages: damage, security, clearance from the tires.',
    ],
    realManual: manual(
      'gear descriptions, tire and brake wear limits, strut servicing, and the tests and removal tasks for the gear, wheels, brakes and steering',
    ),
    sources: [AC, AIRFRAME],
  },
  {
    chapter: '33',
    covers:
      'Lights: exterior lights that make the aircraft visible and light its way, and interior lighting for the flight deck, cabin and compartments.',
    onThisAircraft:
      'Navigation lights are at the wing tips and tail, with white strobes beside them and red anti-collision beacons above and below the fuselage. Taxi, take-off and runway turn-off lights are on the nose gear, retractable landing lights are under the wings, scan lights on the fuselage light the wings and engines, and logo lights on the tailplane light the fin.',
    inspection: [
      'Lenses: cracks, crazing, moisture inside, missing pieces.',
      'Housings and their sealing: security, damage.',
      'Heat discolouration round a light fitting.',
      'Each light is checked in the position and colour it is meant to have.',
    ],
    realManual: manual(
      'the lighting system descriptions and the tests and replacement tasks for each light',
    ),
    sources: [AC],
  },
  {
    chapter: '36',
    covers:
      'Pneumatic: taking hot compressed air from the engines or APU and distributing it to the systems that use it, such as air conditioning, engine starting and wing anti-icing.',
    onThisAircraft:
      'Bleed air comes from each engine and from the APU. A high-pressure ground connection on the belly fairing lets a ground cart supply the system, for example to start an engine.',
    inspection: [
      'Ducts and their clamps: security, cracks, signs of hot air leakage.',
      'Heat damage on structure or panels next to a duct is evidence of a leak.',
      'Insulation blankets: in place and undamaged.',
      'Ground connection door: closed and latched after use.',
    ],
    realManual: manual(
      'the bleed system descriptions, leak checks, and the tests and removal tasks for valves, ducts and sensors',
    ),
    sources: [AC, AIRFRAME],
  },
  {
    chapter: '49',
    covers:
      'Airborne auxiliary power: the small gas turbine that supplies electrical power and compressed air when the main engines are not running.',
    onThisAircraft:
      'The APU is in the tail cone. Air enters through an intake with a flap-type door ahead of the compartment and the exhaust leaves through the end of the tail cone. It is reached through doors under the tail, and it can be shut down from a panel on the nose gear.',
    inspection: [
      'Intake door and exhaust: obstruction, damage, heat distress.',
      'Compartment doors: closed, latched, with no oil or fuel streaks from their edges or drains.',
      'Inside the compartment: leaks, loose clamps, chafed lines, fire detection loop security.',
      'Soot or heat marks on the tail cone that are uneven or new.',
    ],
    realManual: manual(
      'the APU and its system descriptions, oil servicing, and the tests and removal tasks for the unit and its accessories',
    ),
    sources: [AC, POWERPLANT],
  },
  {
    chapter: '52',
    covers:
      'Doors: passenger and crew doors, emergency exits, cargo doors and the access doors to equipment compartments, with their mechanisms, seals and warning systems.',
    onThisAircraft:
      'There are two passenger and crew doors on each side, forward and aft, and two emergency exits over each wing. The forward, aft and bulk cargo doors are all on the right side. Smaller doors give access to the avionics compartment and the APU.',
    inspection: [
      'Seals: torn, flattened, hardened or missing sections.',
      'Door skins and edges: dents, cracks, impact damage from ground equipment.',
      'Hinges, latches and stops: wear, corrosion, missing parts.',
      'Fit when closed: flush, with even gaps.',
      'Sill and surround structure: damage and corrosion, where water collects.',
    ],
    realManual: manual(
      'door and mechanism descriptions, rigging and seal checks, and the removal tasks for doors, slides and their components',
    ),
    sources: [AC, AIRFRAME],
  },
  {
    chapter: '53',
    covers:
      'Fuselage: the main body structure. Skin, frames and stringers, the pressure bulkheads, the floor structure, and fairings such as the radome and the wing-to-fuselage fairing.',
    onThisAircraft:
      'The fuselage is a pressurized shell of skin panels riveted to frames and stringers. The radome at the nose covers the weather radar, and the belly fairing under the centre section covers the wing junction, the air conditioning packs and the main gear bays.',
    inspection: [
      'Skin: dents, scratches, cracks, bulges, lightning strike marks.',
      'Fasteners: missing, loose, or showing smoke-like trails that indicate movement.',
      'Corrosion: blistered paint, white or grey powder, pitting, especially low on the fuselage and around doors.',
      'Stains and streaks: each has a source, such as a drain, a leak or a seal.',
      'Drain holes: clear.',
    ],
    realManual: manual(
      'structural descriptions and identification; damage limits and repairs are in the separate structural repair manual',
    ),
    sources: [AIRFRAME, PRACTICES],
  },
  {
    chapter: '55',
    covers:
      'Stabilizers: the fixed tail surfaces that keep the aircraft steady in pitch and yaw. The horizontal and vertical stabilizers and their attachment to the fuselage.',
    onThisAircraft:
      'The vertical stabilizer carries the rudder, and the horizontal stabilizer carries the two elevators. The horizontal stabilizer is trimmable: the whole surface pivots to trim the aircraft.',
    inspection: [
      'Leading edges: dents, erosion, bird strike damage.',
      'Skins: cracks, delamination, lightning strike marks, especially near the tips.',
      'The gap where the trimmable stabilizer meets the fuselage: clear, seals intact.',
      'Static dischargers: present and unbroken.',
    ],
    realManual: manual(
      'stabilizer structure descriptions and the inspection and removal tasks for the surfaces and their attachments',
    ),
    sources: [AIRFRAME],
  },
  {
    chapter: '56',
    covers:
      'Windows: the flight deck windshields and side windows, the cabin windows and the small windows in doors, with their seals and heating.',
    onThisAircraft:
      'The flight deck has two windshields, two sliding side windows and two fixed side windows. Cabin windows run along both sides, and each passenger door has a small viewing window.',
    inspection: [
      'Panes: cracks, chips, scratches, crazing.',
      'Laminated panes: delamination, which shows as a cloudy or silvery area, and bubbles.',
      'Heated windshields: burn marks or discolouration near the edges and terminals.',
      'Seals round each pane: complete, not lifting or eroded.',
    ],
    realManual: manual(
      'window descriptions, damage limits and the removal and installation tasks for each window',
    ),
    sources: [AIRFRAME],
  },
  {
    chapter: '57',
    covers:
      'Wings: the wing structure itself. Spars, ribs and skins, the wing tips, and the fixed leading and trailing edge structure that the moving surfaces attach to.',
    onThisAircraft:
      'The wing is swept, with a fence at each tip, and it is also the fuel tank. Flap track fairings under the trailing edge cover the mechanisms that carry the flaps. The engines hang from pylons under the wings.',
    inspection: [
      'Lower surface: fuel leaks, which show as stains or wet patches.',
      'Upper and lower skins: dents, cracks, missing fasteners.',
      'Leading edge: dents, erosion, bird strike damage.',
      'Access panels: all fasteners present and flush.',
      'Wing tips and fences: impact and lightning strike damage.',
    ],
    realManual: manual(
      'wing structure descriptions and identification; damage limits and repairs are in the separate structural repair manual',
    ),
    sources: [AC, AIRFRAME],
  },
  {
    chapter: '71',
    covers:
      'Power plant: the engine as installed on the aircraft. The cowls round it, its mounts, the drains, and the wiring and pipework that connect it to the airframe.',
    onThisAircraft:
      'Each engine is enclosed by an inlet cowl at the front, two fan cowl doors, and two thrust reverser cowls behind them. The doors hinge at the top by the pylon and latch underneath. A drain mast under the engine vents its drain lines.',
    inspection: [
      'Inlet lip and lining: dents, gouges, lifted or missing lining.',
      'Cowl latches: every one closed and flush. An unlatched cowl can be lost in flight.',
      'Cowl skins: dents, cracks, missing fasteners, fluid streaks.',
      'Drain mast: what is dripping and from which drain.',
      'Nothing loose in the inlet or lying on the ground ahead of it.',
    ],
    realManual: manual(
      'power plant descriptions, cowl opening and closing procedures, and engine removal and installation',
    ),
    sources: [AC, POWERPLANT],
  },
  {
    chapter: '72',
    covers:
      'Engine: the gas turbine itself. The fan, compressors, combustion section and turbines, and the gearbox that drives the accessories.',
    onThisAircraft:
      'This aircraft has two CFM56-5B turbofan engines. The fan at the front of each is the only rotating stage that can be seen without opening the engine, and it produces most of the thrust.',
    inspection: [
      'Fan blades: each leading edge compared with its neighbours for nicks, dents and tears.',
      'Blade tips and the rub strip round them: scoring, missing material.',
      'The fan is turned by hand so that every blade is seen.',
      'Spinner: damage and security.',
      'Looking through the fan to the stators behind it: damage, missing pieces, foreign objects.',
      'Exhaust: cracks, distortion, uneven streaking.',
    ],
    realManual: manual(
      'engine module descriptions, blade damage limits, borescope inspections and the module removal tasks',
    ),
    sources: [POWERPLANT],
  },
]

export function libraryPage(chapter: string): LibraryPage | undefined {
  return LIBRARY.find((page) => page.chapter === chapter)
}
