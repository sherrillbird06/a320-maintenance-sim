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

export const DEFECT_TYPES: DefectType[] = [
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
