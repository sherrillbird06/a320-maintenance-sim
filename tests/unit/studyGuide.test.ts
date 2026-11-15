import { describe, expect, it } from 'vitest'
import { libraryPage } from '../../src/data/library'
import {
  STUDY_GUIDE,
  STUDY_TOPICS,
  STUDY_TOPIC_CHAPTERS,
  chaptersForTopic,
  searchStudyTopics,
  studyTopic,
  topicsForChapter,
} from '../../src/data/studyGuide'
import { parseRich } from '../../src/sim/richText'
import { createStudyStore } from '../../src/state/study'

const points = STUDY_TOPICS.flatMap((topic) => topic.points)

// The counts are those of the owner's guide. If one changes, material was dropped or added.
describe('A&P study guide content', () => {
  it('holds every area and topic of the guide', () => {
    expect(STUDY_GUIDE.areas.map((a) => [a.id, a.label, a.topics.length])).toEqual([
      ['general', 'General', 10],
      ['airframe', 'Airframe', 14],
      ['powerplant', 'Powerplant', 16],
    ])
  })

  it('holds every point, formula and priority mark of the guide', () => {
    expect(points).toHaveLength(219)
    expect(STUDY_TOPICS.filter((t) => t.formula)).toHaveLength(5)
    expect(STUDY_TOPICS.filter((t) => t.highPriority)).toHaveLength(17)
  })

  it('keeps each area introduction and the statement about the guide', () => {
    for (const area of STUDY_GUIDE.areas) expect(area.intro.length, area.id).toBeGreaterThan(100)
    expect(STUDY_GUIDE.about).toContain('This is a study aid, not a substitute')
    expect(STUDY_GUIDE.about).toContain('FAA-H-8083-32A')
  })

  it('has no empty topic and no duplicate id', () => {
    expect(new Set(STUDY_TOPICS.map((t) => t.id)).size).toBe(STUDY_TOPICS.length)
    for (const topic of STUDY_TOPICS) {
      expect(topic.points.length, topic.id).toBeGreaterThanOrEqual(5)
      for (const point of topic.points) expect(point.length, topic.id).toBeGreaterThan(40)
    }
  })

  it('contains no markup other than bold, italic and line breaks, and no entities', () => {
    const all = [
      STUDY_GUIDE.about,
      ...STUDY_GUIDE.areas.map((a) => a.intro),
      ...points,
      ...STUDY_TOPICS.flatMap((t) => (t.formula ? [t.formula.label, t.formula.body] : [])),
    ]
    for (const text of all) {
      expect(text.replace(/<\/?[bi]>|<br>/g, '')).not.toMatch(/<[a-z/]/i)
      expect(text).not.toMatch(/&[a-z0-9]+;/i)
    }
  })

  it('keeps the formulas whole', () => {
    expect(studyTopic('basic_electricity')?.formula?.body).toBe(
      'E = I × R<br>I = E / R<br>R = E / I<br>P = I × E',
    )
    expect(studyTopic('engine_power_compression_and_efficiency')?.formula?.body).toContain(
      'IHP = (P × L × A × N × K) ÷ 33,000',
    )
  })
})

describe('study topics and the technical library', () => {
  it('links only real topics to chapters that have a library page', () => {
    for (const [topicId, chapters] of Object.entries(STUDY_TOPIC_CHAPTERS)) {
      expect(studyTopic(topicId), topicId).toBeDefined()
      for (const chapter of chapters) expect(libraryPage(chapter), chapter).toBeDefined()
    }
  })

  it('finds topics from a chapter and chapters from a topic', () => {
    expect(topicsForChapter('32').map((t) => t.id)).toEqual(['landing_gear_systems'])
    expect(chaptersForTopic('hydraulic_and_pneumatic_power_systems')).toEqual(['29', '36'])
    expect(chaptersForTopic('propellers')).toEqual([])
  })
})

describe('study guide search', () => {
  it('returns everything for an empty query', () => {
    expect(searchStudyTopics('  ')).toHaveLength(40)
  })

  it('matches every word, in titles, points and formulas, whatever the case', () => {
    expect(searchStudyTopics('MAGNETO').map((t) => t.id)).toContain('ignition_systems')
    expect(searchStudyTopics('plank').map((t) => t.id)).toContain(
      'engine_power_compression_and_efficiency',
    )
    expect(searchStudyTopics('moment arm').map((t) => t.id)).toContain('weight_and_balance')
    expect(searchStudyTopics('zzzz')).toEqual([])
  })
})

describe('rich text', () => {
  it('splits bold, italic and line breaks into parts', () => {
    expect(parseRich('a <b>b</b> <i>c</i><br>d')).toEqual([
      { text: 'a ', bold: false, italic: false },
      { text: 'b', bold: true, italic: false },
      { text: ' ', bold: false, italic: false },
      { text: 'c', bold: false, italic: true },
      { lineBreak: true },
      { text: 'd', bold: false, italic: false },
    ])
  })

  it('leaves any other markup as plain text', () => {
    expect(parseRich('<script>x</script>')).toEqual([
      { text: '<script>x</script>', bold: false, italic: false },
    ])
  })
})

describe('reviewed topics', () => {
  it('marks and unmarks a topic and keeps the marks between visits', () => {
    const saved = new Map<string, string>()
    const storage = {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => void saved.set(key, value),
    }
    const first = createStudyStore(storage)
    first.getState().toggleReviewed('propellers')
    first.getState().toggleReviewed('basic_electricity')
    first.getState().toggleReviewed('propellers')
    expect(createStudyStore(storage).getState().reviewed).toEqual(['basic_electricity'])
  })

  it('starts empty when what was saved cannot be read', () => {
    const storage = { getItem: () => '{broken', setItem: () => undefined }
    expect(createStudyStore(storage).getState().reviewed).toEqual([])
  })
})
