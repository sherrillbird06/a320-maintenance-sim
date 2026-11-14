import { AIRCRAFT } from './aircraft'
import type { DefectAnchor, DefectType } from './schema'

/**
 * Defect anchors are in the aircraft model's glTF coordinates: X aft from the
 * nose, Y up from the floor, Z toward the left of the aircraft.
 */
type Vec3 = [number, number, number]

const MAIN_X = AIRCRAFT.dimensions.noseToNoseGear.value + AIRCRAFT.dimensions.wheelbase.value
const NOSE_X = AIRCRAFT.dimensions.noseToNoseGear.value
const TRACK = AIRCRAFT.dimensions.mainGearTrack.value / 2
const MAIN_SPACING = AIRCRAFT.dimensions.mainWheelSpacing.value / 2
const NOSE_SPACING = AIRCRAFT.dimensions.noseWheelSpacing.value / 2
const MAIN_RADIUS = AIRCRAFT.tires.main.diameterM / 2
const NOSE_RADIUS = AIRCRAFT.tires.nose.diameterM / 2

/** Tire id, wheel centre station, lateral position (+ is aircraft left) and radius. */
const TIRES: [id: string, x: number, z: number, radius: number][] = [
  ['mlg_tire_1', MAIN_X, TRACK + MAIN_SPACING, MAIN_RADIUS],
  ['mlg_tire_2', MAIN_X, TRACK - MAIN_SPACING, MAIN_RADIUS],
  ['mlg_tire_3', MAIN_X, -TRACK + MAIN_SPACING, MAIN_RADIUS],
  ['mlg_tire_4', MAIN_X, -TRACK - MAIN_SPACING, MAIN_RADIUS],
  ['nlg_tire_lh', NOSE_X, NOSE_SPACING, NOSE_RADIUS],
  ['nlg_tire_rh', NOSE_X, -NOSE_SPACING, NOSE_RADIUS],
]

/**
 * Spots on the tread that can be seen without moving the aircraft. Angles are
 * measured from straight ahead of the wheel, rising over the top toward the rear;
 * `lateral` shifts the spot across the tread as a fraction of the tire radius.
 */
function treadAnchors(anglesDeg: number[], lateral: number): DefectAnchor[] {
  return TIRES.flatMap(([componentId, x, z, radius]) =>
    anglesDeg.map((deg): DefectAnchor => {
      const a = (deg * Math.PI) / 180
      const normal: Vec3 = [-Math.cos(a), Math.sin(a), 0]
      return {
        componentId,
        position: [x + normal[0] * radius, radius + normal[1] * radius, z + lateral * radius],
        normal,
      }
    }),
  )
}

const REAL_WORLD =
  'In real maintenance the decision to keep or replace a tire is made only against the limits in the approved maintenance data for that aircraft.'
const SOURCE = '(General tire inspection: FAA-H-8083-31B, Aircraft Landing Gear Systems.)'

// --- Engines -------------------------------------------------------------------
// Geometry below mirrors assets-src/blender/_engine.py and exterior.py.
const INLET_X = AIRCRAFT.dimensions.noseToEngineInlet.value
const ENGINE_OFFSET = AIRCRAFT.dimensions.engineCentrelineOffset.value
const NACELLE_RADIUS = 1.16
const AXIS_HEIGHT = AIRCRAFT.dimensions.nacelleGroundClearance.value + NACELLE_RADIUS
const FAN_STATION = 0.92
/** Centre of each fan on its engine axis, in model coordinates. The fan turns about the X axis here. */
export const FAN_CENTRES: Record<string, [number, number, number]> = {
  eng1_fan: [INLET_X + FAN_STATION, AXIS_HEIGHT, ENGINE_OFFSET],
  eng2_fan: [INLET_X + FAN_STATION, AXIS_HEIGHT, -ENGINE_OFFSET],
}

/** Engine prefix and lateral position of its axis (+ is aircraft left). */
const ENGINES: [prefix: string, z: number][] = [
  ['eng1', ENGINE_OFFSET],
  ['eng2', -ENGINE_OFFSET],
]

/** Points on fan blade leading edges, at the given angles round the fan and radius from its axis. */
function bladeAnchors(anglesDeg: number[], radius: number): DefectAnchor[] {
  // Where the leading edge sits relative to the fan hub at this radius (see _blade_mesh).
  const t = (radius - 0.29) / 0.585
  const chord = 0.2 + 0.12 * t
  const stagger = ((26 + 36 * t) * Math.PI) / 180
  const ahead = 0.07 - (Math.cos(stagger) * chord) / 2
  const across = (-Math.sin(stagger) * chord) / 2
  return ENGINES.flatMap(([prefix, z]) =>
    anglesDeg.map((deg): DefectAnchor => {
      const a = (deg * Math.PI) / 180
      // Blade stands along +Z in the fan's frame and is turned about the engine axis by the angle.
      const lateral = across * Math.cos(a) - radius * Math.sin(a)
      const up = across * Math.sin(a) + radius * Math.cos(a)
      return {
        componentId: `${prefix}_fan`,
        position: [INLET_X + FAN_STATION + ahead - 0.004, AXIS_HEIGHT + up, z - lateral],
        normal: [-1, 0, 0],
      }
    }),
  )
}

/** Points on the inlet lip, at the given angles round it (0 is the outboard side of the right engine). */
function lipAnchors(anglesDeg: number[]): DefectAnchor[] {
  const lipRadius = 1.0
  return ENGINES.flatMap(([prefix, z]) =>
    anglesDeg.map((deg): DefectAnchor => {
      const a = (deg * Math.PI) / 180
      const length = Math.hypot(0.8, 0.6)
      return {
        componentId: `${prefix}_inlet_cowl`,
        position: [
          INLET_X + 0.02,
          AXIS_HEIGHT + lipRadius * Math.sin(a),
          z - lipRadius * Math.cos(a),
        ],
        normal: [-0.8 / length, (0.6 * Math.sin(a)) / length, (-0.6 * Math.cos(a)) / length],
      }
    }),
  )
}

const ENGINE_REAL_WORLD =
  'In real maintenance, damage to a fan blade or inlet is assessed only against the limits in the approved maintenance data for that engine and aircraft.'
const ENGINE_SOURCE = '(General turbine engine inspection: FAA-H-8083-32B.)'

// --- Hydraulic service panels -----------------------------------------------------
// The belly fairing underside, mirroring FAIRING_STATIONS and fairing_bottom_z in
// assets-src/blender/_fuselage.py: station, half width, depth below the keel.
const FAIRING: [x: number, halfWidth: number, depth: number][] = [
  [10.9, 0.05, 0.0], [11.2, 0.75, 0.05], [11.6, 1.3, 0.14], [12.1, 1.72, 0.26], [12.8, 2.02, 0.36],
  [13.6, 2.15, 0.41], [16.0, 2.18, 0.42], [18.8, 2.15, 0.41], [19.8, 2.0, 0.36], [20.6, 1.66, 0.25],
  [21.3, 1.15, 0.12], [21.8, 0.55, 0.04], [22.1, 0.05, 0.0],
] // prettier-ignore
const KEEL_HEIGHT = 1.79
const FAIRING_TOP = 2.95

function fairingUnderside(x: number, lateral: number): number {
  for (let i = 0; i < FAIRING.length - 1; i++) {
    const [x0, w0, d0] = FAIRING[i] as [number, number, number]
    const [x1, w1, d1] = FAIRING[i + 1] as [number, number, number]
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0)
      const halfWidth = w0 + (w1 - w0) * t
      const bottom = KEEL_HEIGHT - (d0 + (d1 - d0) * t)
      const centre = (FAIRING_TOP + bottom) / 2
      const halfHeight = (FAIRING_TOP - bottom) / 2
      const c = Math.min(Math.abs(lateral) / halfWidth, 1) ** (1 / 0.6)
      return centre - halfHeight * Math.sqrt(Math.max(0, 1 - c * c)) ** 0.6
    }
  }
  return KEEL_HEIGHT
}

/** A leak at the aft edge of a service panel, on the underside of the belly fairing. */
function panelLeak(system: 'green' | 'yellow' | 'blue'): DefectAnchor[] {
  const panel = AIRCRAFT.hydraulicServicePanels[system]
  // Aircraft left is +Z in model coordinates.
  const z = panel.side === 'LH' ? panel.offset : -panel.offset
  const x = panel.x + 0.12
  return [
    {
      componentId: `hyd_service_panel_${system}`,
      position: [x, fairingUnderside(x, z) - 0.02, z],
      normal: [0, -1, 0],
    },
  ]
}

const LEAK_EXPLANATION = (system: string) =>
  `Fresh hydraulic fluid is wet and shiny, leaves a coloured streak that runs with gravity and the airflow, and collects as drips at the lowest edge with a puddle beneath. Tracing the streak back to its wettest point gives the source: here it is the servicing door of the ${system} system, so that is the system written on the report. In real maintenance, how much leakage is allowed from a component is found only in the approved maintenance data for that aircraft. (General hydraulic system inspection: FAA-H-8083-31B.)`

const leak = (system: 'green' | 'yellow' | 'blue', name: string): DefectType => ({
  id: `hyd_leak_${system}`,
  category: 'hydraulic-leak',
  label: 'Hydraulic fluid leak',
  anchors: panelLeak(system),
  visual: { kind: 'drip', texture: 'hydraulic_streak', sizeM: 0.5 },
  correctCondition: 'Fresh fluid streak with drips from the panel edge',
  wrongConditions: [
    'Old dry stain with no fresh fluid',
    'Water droplets from condensation',
    'Panel unlatched with no fluid present',
  ],
  explanation: LEAK_EXPLANATION(name),
  libraryChapters: ['29'],
  hydraulicSystem: system,
})

export const DEFECT_TYPES: DefectType[] = [
  leak('green', 'Green'),
  leak('yellow', 'Yellow'),
  leak('blue', 'Blue'),
  {
    id: 'fan_blade_nick',
    category: 'foreign-object-damage',
    label: 'Fan blade damage — leading-edge nick',
    anchors: bladeAnchors([40, 150, 260], 0.62),
    visual: { kind: 'decal', texture: 'blade_nick', sizeM: 0.11 },
    correctCondition: 'Nick in the fan blade leading edge',
    wrongConditions: [
      'Normal blade leading-edge profile',
      'Surface dirt or staining on the blade',
      'Dent in the inlet lip skin',
    ],
    explanation: `An object drawn into the inlet strikes the fan first. It leaves a small sharp notch in a blade's leading edge, with bright exposed metal, on one blade while its neighbours are smooth. Comparing each blade with the ones beside it is how such damage is found. ${ENGINE_REAL_WORLD} ${ENGINE_SOURCE}`,
    libraryChapters: ['72'],
  },
  {
    id: 'inlet_lip_dent',
    category: 'foreign-object-damage',
    label: 'Inlet damage — lip dent',
    anchors: lipAnchors([20, 200, 300]),
    visual: { kind: 'decal', texture: 'lip_dent', sizeM: 0.22 },
    correctCondition: 'Dent in the inlet lip skin',
    wrongConditions: [
      'Paint scuff with no deformation',
      'Nick in the fan blade leading edge',
      'Normal lip surface',
    ],
    explanation: `The inlet lip is the first surface an object or a piece of ground equipment meets. A dent shows as a shadowed hollow that breaks the smooth reflection running round the lip, often with scraped metal at its centre. ${ENGINE_REAL_WORLD} ${ENGINE_SOURCE}`,
    libraryChapters: ['71'],
  },
  {
    id: 'tire_tread_cut',
    category: 'tire',
    label: 'Tire damage — cut',
    anchors: treadAnchors([20, 60, 130], 0.12),
    visual: { kind: 'decal', texture: 'tire_cut', sizeM: 0.16 },
    correctCondition: 'Cut in the tread with casing cords visible',
    wrongConditions: [
      'Normal tread groove',
      'Surface scuffing only, casing not visible',
      'Tread worn through to the casing cords',
    ],
    explanation: `A cut is a sharp-edged opening made by an object on the ground, usually running across the ribs rather than around the tire like a groove. Once the casing cords show at the bottom of a cut, the structure of the tire is exposed. ${REAL_WORLD} ${SOURCE}`,
    libraryChapters: ['32'],
  },
  {
    id: 'tire_tread_worn',
    category: 'tire',
    label: 'Tire wear — worn through',
    anchors: treadAnchors([35, 80, 115], -0.1),
    visual: { kind: 'decal', texture: 'tire_worn', sizeM: 0.24 },
    correctCondition: 'Tread worn through to the casing cords',
    wrongConditions: [
      'Even tread wear with grooves still visible',
      'Cut in the tread with casing cords visible',
      'Surface scuffing only, casing not visible',
    ],
    explanation: `Wear removes rubber over an area: the grooves fade out and the fabric of the casing begins to show as a lighter, woven-looking patch. A localized patch like this is often a flat spot from a skid. ${REAL_WORLD} ${SOURCE}`,
    libraryChapters: ['32'],
  },
]
