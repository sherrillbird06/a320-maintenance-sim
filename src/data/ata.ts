import type { AtaChapter } from './schema'

/** Chapters the owner's brief asks the simulator to cover. */
const FROM_BRIEF = new Set([
  '05',
  '12',
  '21',
  '24',
  '27',
  '28',
  '29',
  '32',
  '49',
  '52',
  '53',
  '57',
  '72',
])

/** Chapters added because the brief's own component list falls under them. */
const ADDED_TO_LIBRARY = new Set(['26', '33', '36', '55', '56', '71'])

/**
 * ATA chapter numbers and titles as used across the industry (see the FAA JASC
 * code table in sources). The full list is kept so that every component carries
 * its true chapter and the discrepancy form offers realistic choices; only some
 * chapters have a library page.
 */
const TITLES: [chapter: string, title: string][] = [
  ['05', 'Time Limits / Maintenance Checks'],
  ['06', 'Dimensions and Areas'],
  ['07', 'Lifting and Shoring'],
  ['08', 'Leveling and Weighing'],
  ['09', 'Towing and Taxiing'],
  ['10', 'Parking, Mooring, Storage and Return to Service'],
  ['11', 'Placards and Markings'],
  ['12', 'Servicing'],
  ['20', 'Standard Practices – Airframe'],
  ['21', 'Air Conditioning'],
  ['22', 'Auto Flight'],
  ['23', 'Communications'],
  ['24', 'Electrical Power'],
  ['25', 'Equipment / Furnishings'],
  ['26', 'Fire Protection'],
  ['27', 'Flight Controls'],
  ['28', 'Fuel'],
  ['29', 'Hydraulic Power'],
  ['30', 'Ice and Rain Protection'],
  ['31', 'Indicating / Recording Systems'],
  ['32', 'Landing Gear'],
  ['33', 'Lights'],
  ['34', 'Navigation'],
  ['35', 'Oxygen'],
  ['36', 'Pneumatic'],
  ['38', 'Water / Waste'],
  ['49', 'Airborne Auxiliary Power'],
  ['51', 'Standard Practices and Structures – General'],
  ['52', 'Doors'],
  ['53', 'Fuselage'],
  ['54', 'Nacelles / Pylons'],
  ['55', 'Stabilizers'],
  ['56', 'Windows'],
  ['57', 'Wings'],
  ['71', 'Power Plant'],
  ['72', 'Engine'],
  ['73', 'Engine Fuel and Control'],
  ['74', 'Ignition'],
  ['75', 'Air'],
  ['76', 'Engine Controls'],
  ['77', 'Engine Indicating'],
  ['78', 'Exhaust'],
  ['79', 'Oil'],
  ['80', 'Starting'],
]

export const ATA_CHAPTERS: AtaChapter[] = TITLES.map(([chapter, title]) => ({
  chapter,
  title,
  fromBrief: FROM_BRIEF.has(chapter),
  library: FROM_BRIEF.has(chapter) || ADDED_TO_LIBRARY.has(chapter),
}))

export function ataTitle(chapter: string): string | undefined {
  return ATA_CHAPTERS.find((c) => c.chapter === chapter)?.title
}
