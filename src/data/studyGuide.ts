import raw from './generated/studyGuide.json'

/**
 * The A&P study guide: review notes for the FAA aviation mechanic knowledge
 * tests, in the three test areas (General, Airframe, Powerplant).
 *
 * The text is the project owner's guide, imported whole by
 * `scripts/import-study-guide.mjs` and never edited by hand here. It is general
 * study material about aircraft of every kind. It is not A320 maintenance data
 * and is kept apart from the inspection exercises, which contain no limits,
 * quantities or procedures.
 */
export type StudyAreaId = 'general' | 'airframe' | 'powerplant'

export interface StudyFormula {
  label: string
  /** May contain `<br>` between lines. */
  body: string
}

export interface StudyTopic {
  id: string
  title: string
  /** Marked in the guide as high priority for the knowledge test. */
  highPriority: boolean
  /** Review points. May contain `<b>`, `<i>` and `<br>`. */
  points: string[]
  formula?: StudyFormula
}

export interface StudyArea {
  id: StudyAreaId
  label: string
  intro: string
  topics: StudyTopic[]
}

export interface StudyGuide {
  title: string
  /** The guide's own statement of what it is drawn from and what it is not. */
  about: string
  areas: StudyArea[]
}

export const STUDY_GUIDE = raw as StudyGuide

export const STUDY_TOPICS: (StudyTopic & { area: StudyAreaId })[] = STUDY_GUIDE.areas.flatMap(
  (area) => area.topics.map((topic) => ({ ...topic, area: area.id })),
)

export function studyTopic(id: string | null | undefined) {
  return STUDY_TOPICS.find((topic) => topic.id === id)
}

export function studyArea(id: StudyAreaId): StudyArea {
  const area = STUDY_GUIDE.areas.find((a) => a.id === id)
  if (!area) throw new Error(`No study area ${id}`)
  return area
}

/**
 * Which technical library chapters a study topic bears on, so a candidate can go
 * from the general principle to the same system on the aircraft in the hangar.
 * Topics with no entry (wood structures, propellers, reciprocating engines and so
 * on) have no counterpart on this aircraft or no library page yet.
 */
export const STUDY_TOPIC_CHAPTERS: Record<string, string[]> = {
  basic_electricity: ['24'],
  fluid_lines_and_fittings: ['29'],
  ground_operations_and_servicing: ['12'],
  cleaning_and_corrosion_control: ['53', '57'],
  regulations_privileges_and_records: ['05'],
  sheet_metal_structures: ['53', '57'],
  composite_and_non_metallic_structures: ['55'],
  assembly_rigging_and_nondestructive_testing: ['27'],
  landing_gear_systems: ['32'],
  hydraulic_and_pneumatic_power_systems: ['29', '36'],
  cabin_atmosphere_control: ['21'],
  aircraft_fuel_systems: ['28'],
  ice_rain_and_fire_protection_systems: ['26'],
  electrical_systems_ac_dc_and_warning_systems: ['24', '33'],
  turbine_engine_theory_and_sections: ['71', '72', '49'],
  turbine_engine_types: ['72'],
  engine_fire_protection: ['26'],
  engine_inspection_removal_and_maintenance: ['05', '71', '72'],
}

export function chaptersForTopic(topicId: string): string[] {
  return STUDY_TOPIC_CHAPTERS[topicId] ?? []
}

export function topicsForChapter(chapter: string) {
  return STUDY_TOPICS.filter((topic) => chaptersForTopic(topic.id).includes(chapter))
}

const plain = (text: string) => text.replace(/<[^>]+>/g, ' ').toLowerCase()

/** Topics whose title, points or formula mention every word of the query. */
export function searchStudyTopics(query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return STUDY_TOPICS
  return STUDY_TOPICS.filter((topic) => {
    const text = plain(
      [topic.title, ...topic.points, topic.formula?.label ?? '', topic.formula?.body ?? ''].join(
        ' ',
      ),
    )
    return words.every((word) => text.includes(word))
  })
}
