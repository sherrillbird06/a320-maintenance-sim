import { STUDY_TOPICS, type StudyAreaId } from './studyGuide'

/**
 * Practice questions for the A&P study guide: three for every topic.
 *
 * Every question was written for this simulator and is answered by one point of
 * the study guide, which it names. None is taken from an FAA question bank or
 * from any test-preparation product. They check recall of the guide; they are
 * not a prediction of what the knowledge tests ask.
 */
export interface StudyQuestion {
  id: string
  topicId: string
  area: StudyAreaId
  /** Index of the point in the topic that answers the question. */
  point: number
  prompt: string
  /** Four choices. The first is the correct one; they are shuffled when asked. */
  choices: [string, string, string, string]
  explanation: string
}

type Row = [point: number, prompt: string, choices: StudyQuestion['choices'], explanation: string]

const BY_TOPIC: Record<string, [Row, Row, Row]> = {
  // --- General ------------------------------------------------------------------
  basic_electricity: [
    [
      0,
      'A circuit has 28 volts applied across a resistance of 14 ohms. What current flows?',
      ['2 amperes', '0.5 ampere', '14 amperes', '392 amperes'],
      'Ohm’s Law: I = E ÷ R, so 28 ÷ 14 = 2 amperes.',
    ],
    [
      1,
      'In a parallel circuit, how does the total resistance compare with the branch resistances?',
      [
        'It is less than the smallest branch resistance',
        'It equals the sum of the branch resistances',
        'It equals the largest branch resistance',
        'It equals the average of the branch resistances',
      ],
      'Each added branch gives the current another path, so total resistance falls below the smallest branch.',
    ],
    [
      3,
      'Which component stores energy in a magnetic field and opposes a change in current?',
      ['An inductor', 'A capacitor', 'A resistor', 'A diode'],
      'An inductor opposes a change in current; a capacitor stores energy in an electric field and opposes a change in voltage.',
    ],
  ],
  aircraft_drawings_and_symbols: [
    [
      1,
      'On an aircraft drawing, what does a phantom line show?',
      [
        'An alternate position of a part',
        'Detail hidden behind a surface',
        'An axis of symmetry',
        'A measurement between two points',
      ],
      'Phantom lines show alternate positions. Hidden detail is dashed, and centre lines mark axes of symmetry.',
    ],
    [
      2,
      'What does a cutting-plane line indicate?',
      [
        'Where the imaginary cut for a section view was made, and the direction of view',
        'The edge of a zone on the drawing grid',
        'The outline of a part that is visible',
        'The route of a wire bundle',
      ],
      'A section view cuts the part open; the cutting-plane line shows where, and which way you are looking.',
    ],
    [
      4,
      'Which kind of diagram shows function and connections rather than physical layout?',
      [
        'A schematic diagram',
        'An installation drawing',
        'A three-view orthographic drawing',
        'A section view',
      ],
      'A schematic shows how a system works and connects. An installation drawing shows where things physically are.',
    ],
  ],
  weight_and_balance: [
    [
      0,
      'An item weighing 50 pounds is installed 80 inches aft of the datum. What is its moment?',
      ['4,000 pound-inches', '130 pound-inches', '1.6 pound-inches', '30 pound-inches'],
      'Moment = Weight × Arm, so 50 × 80 = 4,000 pound-inches.',
    ],
    [
      1,
      'An aircraft weighs 2,000 pounds and its total moment is 170,000 pound-inches. Where is the center of gravity?',
      [
        '85 inches from the datum',
        '8.5 inches from the datum',
        '117.6 inches from the datum',
        '850 inches from the datum',
      ],
      'CG = Total Moment ÷ Total Weight, so 170,000 ÷ 2,000 = 85 inches.',
    ],
    [
      3,
      'Useful load is the difference between which two weights?',
      [
        'Maximum gross weight and empty weight',
        'Empty weight and the weight of unusable fuel',
        'Maximum gross weight and the weight of usable fuel',
        'Takeoff weight and landing weight',
      ],
      'Useful load is what can be added to the empty aircraft: crew, passengers, baggage and usable fuel.',
    ],
  ],
  fluid_lines_and_fittings: [
    [
      0,
      'What flare angle do aircraft AN flared tube fittings use?',
      ['37°', '45°', '30°', '60°'],
      'Aircraft AN fittings use a 37° flare. The 45° flare is automotive and industrial, and the two must not be mixed.',
    ],
    [
      1,
      'How does a flareless fitting grip the tube?',
      [
        'A compression sleeve bites into the tube',
        'A 37° flare seats against a cone',
        'The tube end is threaded into the fitting',
        'The tube is brazed into the fitting',
      ],
      'Flareless fittings use a sleeve that bites into the tube; they are common on steel and titanium lines.',
    ],
    [
      3,
      'How is a flexible hose identified?',
      [
        'By markings printed along its length',
        'By the colour of its end fittings',
        'By its outside diameter alone',
        'By a number stamped on the nut only',
      ],
      'The lay line carries the manufacturer, size, date of manufacture and pressure rating.',
    ],
  ],
  materials_and_processes: [
    [
      1,
      'What is the main alloying element of 7xxx-series aluminum alloys such as 7075?',
      ['Zinc', 'Copper', 'Magnesium and silicon', 'Manganese'],
      '7xxx alloys are alloyed with zinc and are the strongest; 2xxx use copper and 6xxx use magnesium and silicon.',
    ],
    [
      0,
      'What is Alclad?',
      [
        'Aluminum alloy sheet with a thin pure-aluminum surface layer for corrosion resistance',
        'Aluminum alloy sheet that has been anodized',
        'Steel sheet plated with cadmium',
        'Aluminum alloy sheet in the annealed condition',
      ],
      'The pure-aluminum cladding protects the stronger core alloy, which is why it must not be sanded through.',
    ],
    [
      3,
      'Which heat treatment softens a metal so that it can be formed?',
      ['Annealing', 'Tempering', 'Artificial aging', 'Normalizing'],
      'Annealing softens. Tempering reduces brittleness after hardening, aging develops strength, and normalizing relieves stress in steel.',
    ],
  ],
  fasteners_and_hardware: [
    [
      1,
      'What is the diameter of an AN3 bolt?',
      ['3/16 inch', '3/8 inch', '3/32 inch', '3/10 inch'],
      'The number gives the diameter in sixteenths of an inch, so AN3 is 3/16 inch.',
    ],
    [
      2,
      'Which solid rivet is the common field rivet, driven as received and identified by a dimple on its head?',
      ['2117-T4 (AD)', '2024 (DD)', '1100', '2017'],
      '2117-T4 AD rivets need no heat treatment before driving. 2017 and 2024 rivets age-harden quickly and are kept cold until driven.',
    ],
    [
      4,
      'Why is the torque wrench reading adjusted when an extension is used?',
      [
        'The extension changes the effective lever arm',
        'The extension adds friction to the threads',
        'The extension changes the thread pitch',
        'The extension puts the wrench out of calibration',
      ],
      'An extension that lengthens the lever arm applies more torque than the wrench shows, so the reading is corrected.',
    ],
  ],
  ground_operations_and_servicing: [
    [
      0,
      'When is the aircraft bonded to the fuel source during fueling?',
      [
        'Before any fuel cap is opened, and throughout fueling',
        'After the tanks are full',
        'Only when fueling with jet fuel',
        'Only in wet weather',
      ],
      'Bonding comes first so that static charge is dissipated before fuel vapour can meet a spark.',
    ],
    [
      1,
      'Where may jacks be placed to raise an aircraft?',
      [
        'Only at the manufacturer’s designated jack points',
        'Under any reinforced rib',
        'Anywhere along the main spar',
        'Under the lowest point of the fuselage',
      ],
      'Only the designated jack points are built to take the load; anywhere else risks structural damage.',
    ],
    [
      4,
      'What is the main purpose of a tool control system?',
      [
        'To keep tools from being left in engines and structure',
        'To record when each tool was bought',
        'To share tools between shifts',
        'To assign tool costs to work orders',
      ],
      'A tool left behind is foreign object debris. Tool control proves every tool came back out.',
    ],
  ],
  cleaning_and_corrosion_control: [
    [
      0,
      'When two dissimilar metals form a galvanic cell, which one corrodes?',
      [
        'The more anodic (active) metal',
        'The more noble (cathodic) metal',
        'Both, at the same rate',
        'Whichever is thicker',
      ],
      'The anodic metal corrodes preferentially and in doing so protects the more noble one.',
    ],
    [
      1,
      'Which type of corrosion appears as thread-like lines under a paint film?',
      ['Filiform', 'Fretting', 'Exfoliation', 'Stress corrosion cracking'],
      'Filiform corrosion spreads as fine threads beneath paint or other film.',
    ],
    [
      4,
      'What does anodizing do?',
      [
        'Builds a protective oxide layer on aluminum electrochemically',
        'Removes corrosion products with an acid etch',
        'Plates steel with cadmium',
        'Bonds a pure-aluminum layer to alloy sheet',
      ],
      'Anodizing grows a hard oxide film on aluminum as a corrosion-prevention finish.',
    ],
  ],
  mathematics_and_physics_for_mechanics: [
    [
      2,
      'One horsepower equals how much work per unit of time?',
      [
        '33,000 foot-pounds per minute',
        '550 foot-pounds per minute',
        '33,000 foot-pounds per second',
        '5,500 foot-pounds per second',
      ],
      'One horsepower is 33,000 ft-lb per minute, which is 550 ft-lb per second.',
    ],
    [
      3,
      'A force of 1,000 pounds acts on a piston with an area of 5 square inches. What is the pressure?',
      ['200 psi', '5,000 psi', '995 psi', '1,005 psi'],
      'Pressure = Force ÷ Area, so 1,000 ÷ 5 = 200 psi.',
    ],
    [
      4,
      'According to Bernoulli’s principle, what happens to air as it speeds up through a venturi throat?',
      [
        'Its pressure decreases',
        'Its pressure increases',
        'Its pressure stays the same',
        'It stops flowing',
      ],
      'As fluid speed rises its pressure falls. That is how a venturi, a carburetor and an airfoil work.',
    ],
  ],
  regulations_privileges_and_records: [
    [
      4,
      'When does a manufacturer’s service bulletin become mandatory?',
      [
        'When it is incorporated into an Airworthiness Directive by reference',
        'As soon as the manufacturer issues it',
        'When an inspector signs it',
        'Never',
      ],
      'Service bulletins are advisory. Airworthiness Directives are mandatory, and an AD can make a bulletin mandatory by referring to it.',
    ],
    [
      5,
      'Which form documents a major repair or major alteration?',
      ['FAA Form 337', 'FAA Form 8130-3', 'FAA Form 8610-2', 'FAA Form 8100-2'],
      'Form 337 records major repairs and major alterations.',
    ],
    [
      2,
      'Which privilege does an Inspection Authorization add to a mechanic certificate?',
      [
        'Performing annual inspections and approving major repairs and alterations for return to service',
        'Performing 100-hour inspections',
        'Approving preventive maintenance for return to service',
        'Issuing Airworthiness Directives',
      ],
      'The IA adds annual and progressive inspections and the approval of major repairs and major alterations.',
    ],
  ],

  // --- Airframe -----------------------------------------------------------------
  wood_structures: [
    [
      0,
      'Which wood is the reference species for aircraft structure?',
      ['Sitka spruce', 'Douglas fir', 'White pine', 'Birch'],
      'Sitka spruce is the reference; other species are used only according to published substitution tables.',
    ],
    [
      2,
      'Which joint is used to splice load-carrying wood members?',
      ['A scarf joint', 'A butt joint', 'A lap joint', 'A mortise-and-tenon joint'],
      'A long tapered scarf keeps the strength of the splice close to that of solid wood.',
    ],
    [
      4,
      'Why is casein glue not used for structural wood repairs today?',
      [
        'It is not durable enough for continued airworthiness',
        'It is so strong that it splits the wood',
        'It cures too quickly to position the parts',
        'It cannot be applied by brush',
      ],
      'Casein deteriorates in service. Resorcinol and approved epoxies are used instead.',
    ],
  ],
  aircraft_covering_and_finishes: [
    [
      1,
      'What is the main long-term threat to the strength of aircraft fabric?',
      ['Ultraviolet light from the sun', 'Rain erosion', 'Engine vibration', 'Low temperatures'],
      'Sunlight degrades fabric, which is why the finishing coats include ultraviolet protection.',
    ],
    [
      2,
      'How is the strength of installed fabric checked?',
      [
        'With a calibrated punch tester',
        'By tapping it with a coin',
        'By the colour of the finish',
        'By measuring the thickness of the dope',
      ],
      'Airworthiness depends on a measured minimum strength, not on how the fabric looks.',
    ],
    [
      0,
      'What is needed to re-cover an aircraft with a fabric or process different from the original?',
      [
        'A supplemental type certificate or field approval covering that process',
        'Only a logbook entry',
        'Nothing, provided the fabric is polyester',
        'A new type certificate',
      ],
      'A change of covering system is approved by an STC or a field approval for that specific process.',
    ],
  ],
  sheet_metal_structures: [
    [
      0,
      'The five basic stresses are tension, compression, shear, bending and which other?',
      ['Torsion', 'Fatigue', 'Strain', 'Creep'],
      'Torsion, a twisting load, is the fifth. Most members carry a combination of them.',
    ],
    [
      1,
      'In sheet metal layout, what is bend allowance?',
      [
        'The length of flat material consumed by the bend',
        'The distance from the bend tangent line to the mold line',
        'The inside radius of the bend',
        'The line within the bend that neither stretches nor compresses',
      ],
      'Bend allowance is the flat-pattern length the bend uses up. The other answers describe setback, bend radius and the neutral axis.',
    ],
    [
      3,
      'How does joint design try to load rivets?',
      ['In shear', 'In tension', 'In bending', 'In torsion'],
      'A rivet is strong across its shank and weak along its axis, so joints are designed to keep rivets in shear.',
    ],
  ],
  composite_and_non_metallic_structures: [
    [
      0,
      'Which property sets carbon (graphite) fiber apart from fiberglass and aramid?',
      [
        'It conducts electricity and can cause galvanic corrosion against aluminum',
        'It has the best impact resistance of the three',
        'It is the best electrical insulator of the three',
        'It is the hardest of the three to cut and sand',
      ],
      'Carbon fiber is very stiff for its weight but conductive, so it must be isolated from aluminum.',
    ],
    [
      2,
      'Which simple test is used to check a sandwich panel for core-to-skin disbond?',
      ['A coin tap test', 'A dye penetrant test', 'A magnetic particle test', 'A hardness test'],
      'A disbonded area sounds dull when tapped. Ultrasonic inspection is the more formal check.',
    ],
    [
      3,
      'How is prepreg material stored and cured?',
      [
        'Kept in cold storage, then cured in an autoclave or oven',
        'Kept at room temperature and cured by hand layup',
        'Kept sealed in dope until it is used',
        'It needs no special storage or cure',
      ],
      'Prepreg already contains resin, so it is kept cold to stop it curing early.',
    ],
  ],
  welding_brazing_and_soldering: [
    [
      0,
      'Which oxyacetylene flame is used for most steel welding?',
      [
        'A neutral flame',
        'A carburizing flame',
        'An oxidizing flame',
        'Any flame; the setting makes no difference',
      ],
      'A neutral flame has balanced oxygen and acetylene. The other two are used only for specific purposes.',
    ],
    [
      4,
      'Which filler melting temperature separates brazing from soldering?',
      ['800°F', '450°F', '1,200°F', '2,000°F'],
      'In the FAA Airframe handbook, brazing filler melts above 800°F but below the base metal, and soldering filler melts below 800°F.',
    ],
    [
      1,
      'What protects the weld from the air in TIG (gas tungsten arc) welding?',
      [
        'An inert shielding gas such as argon',
        'A flux coating on the electrode',
        'An excess of acetylene',
        'The melting of the tungsten electrode',
      ],
      'TIG uses a non-consumable tungsten electrode and an inert gas shield.',
    ],
  ],
  assembly_rigging_and_nondestructive_testing: [
    [
      3,
      'On which material can magnetic particle inspection be used?',
      [
        'Ferromagnetic material such as steel',
        'Aluminum alloy',
        'Any non-porous material',
        'Composite laminate',
      ],
      'The part must be magnetized, so the method works only on iron and steel.',
    ],
    [
      0,
      'What is used to measure control cable tension?',
      [
        'A calibrated tensiometer, corrected for cable size and temperature',
        'A protractor',
        'A torque wrench',
        'A dial indicator',
      ],
      'Travel is set with a protractor or rigging fixture and tension with a tensiometer. Both must be right.',
    ],
    [
      5,
      'Which inspection method uses high-frequency sound and needs a coupling medium?',
      ['Ultrasonic', 'Radiographic', 'Dye penetrant', 'Eddy current'],
      'Ultrasonic inspection sends sound into the part through a couplant to find internal flaws.',
    ],
  ],
  landing_gear_systems: [
    [
      1,
      'In an oleo shock strut, what provides the spring that extends the strut again?',
      [
        'Compressed nitrogen or air',
        'Hydraulic fluid passing through the orifice',
        'A steel coil spring',
        'Rubber discs',
      ],
      'Fluid forced through the orifice absorbs the load; the gas charge provides the spring return.',
    ],
    [
      2,
      'What does an anti-skid system do?',
      [
        'Modulates brake pressure so that a tire does not skid',
        'Locks the wheels at touchdown',
        'Applies the brakes automatically on landing',
        'Limits the nosewheel steering angle',
      ],
      'A skidding tire loses braking effectiveness, so the system releases and reapplies pressure.',
    ],
    [
      3,
      'Besides position indication, what does a retractable gear system always include?',
      [
        'A means of emergency extension',
        'A hand crank for retraction',
        'A second hydraulic pump',
        'A steering disconnect',
      ],
      'If the normal system fails there must still be a way to get the gear down.',
    ],
  ],
  hydraulic_and_pneumatic_power_systems: [
    [
      2,
      'What colour is Skydrol-type phosphate-ester hydraulic fluid?',
      ['Purple', 'Red', 'Blue', 'Green'],
      'Phosphate-ester fluid is purple. Petroleum-based MIL-PRF-5606 is red, and the two must never be mixed.',
    ],
    [
      1,
      'What does a hydraulic accumulator do?',
      [
        'Stores fluid under pressure against a gas charge, to damp surges and give emergency power',
        'Removes contamination from the fluid',
        'Cools the returning fluid',
        'Directs fluid to the correct side of an actuator',
      ],
      'The gas charge on the far side of the piston or diaphragm keeps the stored fluid under pressure.',
    ],
    [
      3,
      'Which valve allows flow in one direction only?',
      ['A check valve', 'A relief valve', 'A selector valve', 'A pressure regulator'],
      'A check valve is one-way. A relief valve protects from over-pressure and a selector valve directs flow.',
    ],
  ],
  cabin_atmosphere_control: [
    [
      1,
      'What is the primary control point for cabin pressure?',
      [
        'The outflow valve',
        'The engine bleed valve',
        'The air-cycle machine turbine',
        'The cabin temperature sensor',
      ],
      'Cabin pressure is controlled by how fast air is allowed to leave through the outflow valve.',
    ],
    [
      0,
      'Which value is the structural limit for a pressurized cabin?',
      [
        'Cabin differential pressure',
        'Cabin altitude',
        'Cabin rate of climb',
        'Outside air temperature',
      ],
      'The difference between cabin and outside pressure is what loads the structure.',
    ],
    [
      3,
      'How does an air-cycle machine cool bleed air?',
      [
        'By expanding it through a turbine that also drives a compressor',
        'By evaporating a refrigerant',
        'By passing it over a block of ice',
        'By mixing it with fuel vapour',
      ],
      'Air cools as it expands and does work in the turbine; no separate refrigerant loop is needed.',
    ],
  ],
  aircraft_instrument_systems: [
    [
      0,
      'Which instrument uses both pitot and static pressure?',
      [
        'The airspeed indicator',
        'The altimeter',
        'The vertical speed indicator',
        'The turn coordinator',
      ],
      'Airspeed compares pitot pressure with static pressure. The altimeter and vertical speed indicator use static only.',
    ],
    [
      1,
      'On which gyroscopic property does a turn coordinator depend?',
      ['Precession', 'Rigidity in space', 'Magnetic dip', 'Variation'],
      'The turn coordinator is a rate gyro and uses precession. Attitude and heading indicators use rigidity in space.',
    ],
    [
      3,
      'What is magnetic compass deviation?',
      [
        'Error caused by local magnetic interference in the aircraft',
        'The difference between true north and magnetic north',
        'Error caused by acceleration on east or west headings',
        'Error caused by turning near north or south headings',
      ],
      'Deviation comes from the aircraft itself and is recorded on a compass card. Variation is the true-to-magnetic difference.',
    ],
  ],
  communication_and_navigation_systems: [
    [
      1,
      'Which part of an ILS gives vertical guidance?',
      ['The glideslope', 'The localizer', 'The VOR', 'The transponder'],
      'The localizer gives lateral guidance and the glideslope gives vertical guidance.',
    ],
    [
      4,
      'What are static wicks for?',
      [
        'Discharging precipitation static so that it does not interfere with radios',
        'Grounding the aircraft during fueling',
        'Receiving navigation signals',
        'Heating the trailing edges',
      ],
      'They bleed accumulated static charge off the airframe.',
    ],
    [
      0,
      'Which type of modulation do VHF communication radios use?',
      [
        'Amplitude modulation (AM)',
        'Frequency modulation (FM)',
        'Pulse modulation',
        'No modulation',
      ],
      'Aircraft VHF communication is amplitude modulated, in the 118–136.975 MHz band.',
    ],
  ],
  aircraft_fuel_systems: [
    [
      1,
      'What is a likely result of a blocked fuel tank vent?',
      [
        'Fuel starvation, as a vacuum forms in the tank',
        'Fuel overflowing from the filler cap',
        'A fuel quantity gauge that reads high',
        'Fuel flowing between tanks',
      ],
      'Without a vent, drawing fuel out leaves a vacuum that stops the flow and can collapse the tank.',
    ],
    [
      3,
      'What does a capacitance-type fuel quantity system sense?',
      [
        'The dielectric difference between fuel and air',
        'The position of a float',
        'The pressure at the bottom of the tank',
        'The temperature of the fuel',
      ],
      'The probe is a capacitor whose value changes with how much of it is in fuel rather than air.',
    ],
    [
      2,
      'What does crossfeed allow?',
      [
        'An engine to draw fuel from a tank that normally feeds the opposite engine',
        'Fuel to be dumped overboard',
        'Two grades of fuel to be mixed',
        'Fuel vapour to return to the tank',
      ],
      'Crossfeed is for fuel management on multi-engine aircraft after an engine or tank problem.',
    ],
  ],
  ice_rain_and_fire_protection_systems: [
    [
      0,
      'How are pneumatic leading-edge boots classified?',
      [
        'As a deice system: they remove ice after it forms',
        'As an anti-ice system: they prevent ice from forming',
        'As a rain removal system',
        'As a fire protection system',
      ],
      'Boots inflate to crack ice off, so they deice. Anti-ice systems stop ice forming in the first place.',
    ],
    [
      2,
      'What can a continuous-loop fire detector do that a spot detector cannot?',
      [
        'Respond anywhere along its length',
        'Work without a warning circuit',
        'Discharge the extinguishing agent',
        'Trip at one fixed point',
      ],
      'A spot detector trips at its own location; a loop senses along its whole run.',
    ],
    [
      3,
      'Which materials are firewalls made from?',
      ['Stainless steel or titanium', 'Aluminum alloy', 'Magnesium alloy', 'Fiberglass'],
      'A firewall must be fire-resistant to slow the spread of fire from the engine compartment.',
    ],
  ],
  electrical_systems_ac_dc_and_warning_systems: [
    [
      0,
      'How does an alternator supply direct current?',
      [
        'It produces AC internally and rectifies it',
        'It uses a commutator',
        'It uses the battery to smooth its output',
        'It uses an inverter',
      ],
      'A DC generator uses a commutator; an alternator makes AC and rectifies it.',
    ],
    [
      3,
      'A circuit breaker trips repeatedly. What should be done?',
      [
        'Investigate the cause',
        'Keep resetting it until it holds',
        'Fit a breaker with a higher rating',
        'Hold it in during flight',
      ],
      'A breaker that keeps tripping is reporting a fault. Resetting it invites wiring damage or fire.',
    ],
    [
      1,
      'What does a voltage regulator do?',
      [
        'Holds generator or alternator output at the correct bus voltage as speed and load change',
        'Converts alternating current to direct current',
        'Disconnects the battery when the engine stops',
        'Opens a circuit that draws too much current',
      ],
      'It keeps bus voltage steady across engine speeds and electrical loads.',
    ],
  ],

  // --- Powerplant ---------------------------------------------------------------
  reciprocating_engine_construction: [
    [
      2,
      'Which connecting-rod arrangement do radial engines use?',
      [
        'Master-and-articulated rods',
        'Fork-and-blade rods',
        'Plain rods',
        'None; the pistons attach directly to the crankshaft',
      ],
      'Each row has one master rod, with articulated rods pinned to it.',
    ],
    [
      3,
      'What do oil-control rings do?',
      [
        'Meter the oil film on the cylinder wall and return the excess to the crankcase',
        'Seal combustion gas in the cylinder',
        'Hold the piston pin in place',
        'Cool the top of the piston',
      ],
      'Compression rings seal the gas; oil-control rings below them manage the oil film.',
    ],
    [
      4,
      'How is a typical air-cooled cylinder assembled?',
      [
        'A forged aluminum-alloy head shrink-fitted onto a steel barrel',
        'A steel head bolted onto an aluminum-alloy barrel',
        'A one-piece iron casting',
        'A titanium head welded onto a steel barrel',
      ],
      'The aluminum head conducts heat well and the steel barrel resists wear; the shrink fit makes the joint gas-tight.',
    ],
  ],
  reciprocating_engine_operating_principles: [
    [
      0,
      'How many degrees of crankshaft rotation complete one four-stroke cycle?',
      ['720°', '360°', '180°', '1,440°'],
      'Four strokes take two full revolutions of the crankshaft.',
    ],
    [
      2,
      'What is valve overlap?',
      [
        'The period near top dead centre when the intake and exhaust valves are both open',
        'The period when both valves are closed',
        'The interval between the spark and top dead centre',
        'The clearance between the valve stem and the rocker arm',
      ],
      'Overlap improves scavenging and volumetric efficiency and helps cool the cylinder.',
    ],
    [
      5,
      'How is the fuel ignited in a diesel-cycle aircraft engine?',
      [
        'By the heat of the compressed air when fuel is injected near top dead centre',
        'By a spark plug',
        'By a magneto firing an igniter',
        'By hot exhaust gas returned to the cylinder',
      ],
      'The engine compresses air alone; injected fuel ignites in the hot air, so no spark ignition is needed.',
    ],
  ],
  engine_power_compression_and_efficiency: [
    [
      0,
      'What does compression ratio compare?',
      [
        'Total cylinder volume with the piston at bottom dead centre to clearance volume at top dead centre',
        'Piston displacement to cylinder bore',
        'Manifold pressure to outside air pressure',
        'Indicated horsepower to brake horsepower',
      ],
      'A higher ratio gets more work from the charge but raises the risk of detonation.',
    ],
    [
      3,
      'How is brake horsepower related to indicated horsepower?',
      [
        'Brake horsepower is indicated horsepower minus friction horsepower',
        'Brake horsepower is indicated horsepower plus friction horsepower',
        'Brake horsepower is indicated horsepower multiplied by propeller efficiency',
        'They are always equal',
      ],
      'BHP = IHP − friction HP. It is the usable power delivered to the propeller shaft.',
    ],
    [
      5,
      'What is supercharging or turbocharging for?',
      [
        'Raising volumetric efficiency, and so power, above what a naturally aspirated engine can reach',
        'Raising the compression ratio',
        'Reducing cylinder head temperature',
        'Reducing fuel flow at idle',
      ],
      'Forcing more charge into the cylinder raises volumetric efficiency.',
    ],
  ],
  engine_fuel_and_fuel_metering: [
    [
      0,
      'What keeps the fuel level constant in a float-type carburetor?',
      [
        'A float and needle valve',
        'The venturi',
        'The throttle valve',
        'The carburetor heat valve',
      ],
      'The float closes the needle valve as the chamber fills, so metering stays consistent.',
    ],
    [
      1,
      'What is the standard remedy for carburetor ice?',
      [
        'Carburetor heat',
        'Leaning the mixture',
        'Switching on the boost pump',
        'Selecting one magneto',
      ],
      'Carburetor heat supplies heated, unfiltered air to melt or prevent ice.',
    ],
    [
      4,
      'What is FADEC?',
      [
        'Full Authority Digital Engine Control: electronic management of fuel scheduling and often ignition',
        'A hydromechanical fuel control unit',
        'A fire detection circuit',
        'A flow divider for fuel injection nozzles',
      ],
      'FADEC has supplemented or replaced hydromechanical fuel controls on turbine engines.',
    ],
  ],
  induction_supercharging_and_turbocharging: [
    [
      2,
      'What drives a turbocharger?',
      ['Exhaust gas energy', 'Gears from the crankshaft', 'An electric motor', 'Ram air'],
      'Exhaust gas spins a turbine that drives the compressor. A gear-driven supercharger takes power from the engine instead.',
    ],
    [
      3,
      'What does a manifold pressure gauge indicate?',
      [
        'The absolute pressure of the charge in the intake manifold',
        'Pressure in the manifold relative to cabin pressure',
        'Fuel pressure at the carburetor',
        'Exhaust back pressure',
      ],
      'Manifold pressure is absolute pressure, in inches of mercury, and is a primary power-setting reference.',
    ],
    [
      4,
      'What do turbocharger controllers regulate to hold manifold pressure?',
      [
        'Wastegate position',
        'Throttle plate position',
        'Mixture control position',
        'Propeller governor setting',
      ],
      'The wastegate decides how much exhaust gas passes through the turbine.',
    ],
  ],
  exhaust_systems: [
    [
      0,
      'Why is a muffler with a cabin heat shroud inspected closely for cracks?',
      [
        'A leak can put carbon monoxide into the cabin heat system',
        'A crack makes the engine louder',
        'A crack lowers manifold pressure',
        'A crack raises oil temperature',
      ],
      'Cabin heat air passes over the muffler, so any leak carries exhaust gas into the cabin.',
    ],
    [
      2,
      'Which turbine exhaust nozzle is used where supersonic exhaust velocity is required?',
      ['Convergent-divergent', 'Convergent', 'Divergent', 'Annular'],
      'A convergent nozzle gives subsonic exit velocity; convergent-divergent is needed for supersonic.',
    ],
    [
      4,
      'What is afterburning?',
      [
        'Burning additional fuel in the tailpipe downstream of the turbine for a large, short thrust increase',
        'Redirecting exhaust forward to slow the aircraft',
        'Using exhaust flow to draw cooling air through the cowling',
        'Recovering exhaust energy to drive a compressor',
      ],
      'Afterburning gives a large thrust increase at a heavy cost in fuel.',
    ],
  ],
  ignition_systems: [
    [
      0,
      'Why does magneto ignition need no battery once the engine is running?',
      [
        'A magneto is a self-contained generator: its rotating magnets induce the current',
        'The alternator powers it',
        'A capacitor stores enough energy for the flight',
        'The spark plugs stay hot enough to fire the charge',
      ],
      'The magneto generates and times its own ignition current.',
    ],
    [
      2,
      'What does an impulse coupling do?',
      [
        'Retards the spark and snaps the magneto round fast enough for a hot spark at cranking speed',
        'Advances the spark at high rpm',
        'Disconnects one magneto during the magneto check',
        'Grounds the magneto when the switch is off',
      ],
      'At cranking speed the magneto turns too slowly on its own; the coupling stores and releases spring energy.',
    ],
    [
      4,
      'What does carbon fouling of a spark plug suggest?',
      [
        'A rich mixture or prolonged idling',
        'Oil passing worn rings or valve guides',
        'Deposits from leaded fuel',
        'A mixture that is too lean',
      ],
      'Each kind of fouling points to a different cause: carbon to richness, oil to wear, lead to fuel deposits.',
    ],
  ],
  engine_starting_systems: [
    [
      1,
      'What does a starter-generator do?',
      [
        'Cranks the engine to start it, then generates electrical power once it is running',
        'Starts the engine with compressed air',
        'Stores cranking energy in a flywheel',
        'Starts the engine and then drives the fuel pump',
      ],
      'One unit does both jobs on many turbine engines.',
    ],
    [
      2,
      'Where can the air for an air turbine starter come from?',
      [
        'An APU, a ground cart, or bleed air from an engine that is already running',
        'The aircraft battery',
        'A hydraulic accumulator',
        'Ram air only',
      ],
      'Starting from a running engine’s bleed air is called a cross-bleed start.',
    ],
    [
      3,
      'How does an inertia starter store its energy?',
      [
        'In a spinning flywheel',
        'In a battery',
        'In a bottle of compressed air',
        'In a wound spring',
      ],
      'The flywheel is spun up by hand crank or electric motor, then engaged to crank the engine.',
    ],
  ],
  lubrication_systems: [
    [
      0,
      'Where does a dry-sump lubrication system store its oil?',
      [
        'In a separate external tank, returned there by scavenge pumps',
        'In a sump that is part of the engine',
        'In the oil cooler',
        'In the propeller hub',
      ],
      'A wet-sump engine carries its oil in the engine’s own sump.',
    ],
    [
      1,
      'What holds oil pressure within limits whatever the engine speed?',
      [
        'A pressure relief valve',
        'A thermostatic bypass valve',
        'A scavenge pump',
        'The oil filter',
      ],
      'The relief valve returns excess flow so that pressure does not rise with pump speed.',
    ],
    [
      4,
      'In spectrometric oil analysis, what matters most?',
      [
        'A rising trend across successive samples',
        'A single high reading',
        'The colour of the oil',
        'How much oil was added',
      ],
      'Wear shows up as a trend in wear-metal content, not in one data point.',
    ],
  ],
  engine_cooling_systems: [
    [
      0,
      'What are baffles in an air-cooled engine installation for?',
      [
        'Forcing cooling air across the cylinder fins instead of around the engine',
        'Reducing engine noise',
        'Supporting the cowling',
        'Warming the induction air',
      ],
      'Fins add surface area, but only air that is made to flow across them carries heat away.',
    ],
    [
      1,
      'When are cowl flaps normally open?',
      [
        'At low airspeed and high power, such as in a climb',
        'In cruise',
        'In a descent at idle power',
        'Only after shutdown',
      ],
      'Open gives more cooling when it is needed; closed reduces drag in cruise.',
    ],
    [
      3,
      'What does consistently high cylinder head temperature lead to?',
      [
        'Faster wear and a risk of detonation',
        'Better fuel economy',
        'Carbon-fouled spark plugs',
        'Lower oil consumption',
      ],
      'Cylinder head temperature is the limit the cooling system is managing.',
    ],
  ],
  turbine_engine_theory_and_sections: [
    [
      0,
      'On which thermodynamic cycle do gas turbine engines run?',
      ['The Brayton cycle', 'The Otto cycle', 'The Diesel cycle', 'The two-stroke cycle'],
      'The Brayton cycle has continuous combustion at constant pressure.',
    ],
    [
      3,
      'What does N1 refer to?',
      [
        'The speed of the low-pressure spool: the fan or low-pressure compressor and the turbine that drives it',
        'The speed of the high-pressure spool',
        'The speed of the accessory gearbox',
        'The speed of the starter',
      ],
      'N2 is the high-pressure spool. The spools are linked only by the gas flow.',
    ],
    [
      1,
      'In which order does air pass through the sections of a gas turbine engine?',
      [
        'Inlet, compressor, combustor, turbine, exhaust',
        'Inlet, turbine, combustor, compressor, exhaust',
        'Inlet, combustor, compressor, turbine, exhaust',
        'Inlet, compressor, turbine, combustor, exhaust',
      ],
      'Air is compressed, burned with fuel, then expanded through the turbine that drives the compressor.',
    ],
  ],
  turbine_engine_types: [
    [
      1,
      'What is the bypass ratio of a turbofan?',
      [
        'The ratio of bypass airflow to core airflow',
        'The ratio of fan speed to core speed',
        'The ratio of thrust to engine weight',
        'The ratio of exhaust pressure to inlet pressure',
      ],
      'The fan sends part of the air around the core; bypass ratio compares the two flows.',
    ],
    [
      3,
      'What does a turboshaft engine most notably drive?',
      [
        'A helicopter’s rotors, through a transmission',
        'A propeller, through a reduction gearbox',
        'A large bypass fan',
        'Nothing; all of its output is jet thrust',
      ],
      'A turboshaft is like a turboprop whose shaft drives something other than a propeller.',
    ],
    [
      4,
      'What does an APU supply?',
      [
        'Electrical power, bleed air, or both while the main engines are shut down',
        'Thrust for taxiing',
        'Hydraulic power only',
        'Oxygen for the cabin',
      ],
      'APU bleed air is used for engine starting and cabin air.',
    ],
  ],
  propellers: [
    [
      1,
      'How does a propeller governor hold the selected rpm?',
      [
        'It senses rpm and changes oil pressure to the hub to alter blade angle',
        'It moves the throttle',
        'It adjusts the mixture',
        'It changes the magneto timing',
      ],
      'Blade angle is changed to load or unload the engine as conditions change.',
    ],
    [
      2,
      'What does feathering a propeller do?',
      [
        'Turns the blades nearly parallel to the airflow to stop windmilling drag',
        'Turns the blades to produce reverse thrust',
        'Sets the blades to the lowest angle for takeoff',
        'Locks the propeller at cruise rpm',
      ],
      'A feathered propeller on a failed engine produces far less drag.',
    ],
    [
      5,
      'Where on a propeller blade is damage most critical?',
      [
        'On the leading edge and near the tip',
        'On the spinner',
        'On the trailing edge at the root',
        'On the blade face at mid-span',
      ],
      'The guide names the leading edge and the tip region as the places stress concentration is highest.',
    ],
  ],
  engine_instruments: [
    [
      1,
      'On a normally aspirated engine at full static power, what does manifold pressure read?',
      [
        'Close to, but not above, local atmospheric pressure',
        'Well above atmospheric pressure',
        'Close to zero',
        'The same as at idle',
      ],
      'Only a supercharged or turbocharged engine can show more than atmospheric pressure.',
    ],
    [
      2,
      'What is exhaust gas temperature mainly used for on a piston engine?',
      ['Leaning the mixture', 'Setting rpm', 'Detecting oil loss', 'Timing the magnetos'],
      'On turbines EGT or ITT is a limit; on piston engines it guides leaning.',
    ],
    [
      4,
      'What does a mechanic confirm about engine instrument range markings?',
      [
        'That they match the aircraft’s approved operating limitations',
        'Only that they can be read',
        'That they match another aircraft of the same type',
        'That they match the instrument maker’s catalogue',
      ],
      'The markings are part of the instrument’s airworthiness, not decoration.',
    ],
  ],
  engine_fire_protection: [
    [
      0,
      'On what basis are engine compartments divided into fire zones?',
      [
        'Airflow, ventilation and the presence of flammable fluids',
        'Engine horsepower',
        'The number of cylinders or stages',
        'The material of the cowling',
      ],
      'Detection and suppression requirements follow from that risk assessment.',
    ],
    [
      4,
      'What does a fire-detection system check consist of?',
      [
        'A continuity and functional test of the loops and warning circuits',
        'Discharging the extinguisher bottles',
        'Heating every detector with a torch',
        'Replacing the sensing loops',
      ],
      'The check proves the system will work on the one occasion it is needed.',
    ],
    [
      3,
      'How is a fixed engine fire-extinguishing system sized?',
      [
        'To reach an extinguishing concentration quickly for the zone’s volume and ventilation',
        'To discharge slowly for the rest of the flight',
        'To cool the engine to ambient temperature',
        'To cover the whole airframe',
      ],
      'The agent has to reach an effective concentration before ventilation carries it away.',
    ],
  ],
  engine_inspection_removal_and_maintenance: [
    [
      0,
      'What does a differential compression test compare?',
      [
        'The pressure held in the cylinder against a known applied pressure through a calibrated orifice',
        'The cranking speed of two cylinders',
        'The temperatures of two cylinders',
        'Manifold pressure against outside air pressure',
      ],
      'It estimates how well the rings and valves seal; listening for the leak path matters as much as the reading.',
    ],
    [
      2,
      'For a Part 91 operator, what is the status of the manufacturer’s time between overhauls?',
      [
        'Advisory, unless something specifically requires it, such as an Airworthiness Directive',
        'Always mandatory',
        'Set by the aircraft owner',
        'It applies to turbine engines only',
      ],
      'TBO is a recommendation for Part 91 unless an AD, operations specifications or an adopted program makes it binding.',
    ],
    [
      1,
      'What does a borescope allow?',
      [
        'Looking inside cylinders or a turbine hot section without disassembly',
        'Measuring cylinder compression',
        'Balancing the propeller',
        'Analysing an oil sample',
      ],
      'It is a main tool for judging internal condition between overhauls.',
    ],
  ],
}

export const STUDY_QUESTIONS: StudyQuestion[] = STUDY_TOPICS.flatMap((topic) =>
  (BY_TOPIC[topic.id] ?? []).map(([point, prompt, choices, explanation], index) => ({
    id: `${topic.id}_${index + 1}`,
    topicId: topic.id,
    area: topic.area,
    point,
    prompt,
    choices,
    explanation,
  })),
)

/** Topic ids that have questions written; a test checks this is every topic. */
export const QUESTION_TOPIC_IDS = Object.keys(BY_TOPIC)

export function questionsForTopic(topicId: string) {
  return STUDY_QUESTIONS.filter((question) => question.topicId === topicId)
}

export function questionsForArea(area: StudyAreaId) {
  return STUDY_QUESTIONS.filter((question) => question.area === area)
}
