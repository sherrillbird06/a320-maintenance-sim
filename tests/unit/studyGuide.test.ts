import { describe, expect, it } from 'vitest'
import { libraryPage } from '../../src/data/library'
import { SOURCES } from '../../src/data/sources'
import { CHECKED_POINT_COUNT, STUDY_CHECKS, checksFor } from '../../src/data/studyChecks'
import { STUDY_CORRECTIONS } from '../../src/data/studyCorrections'
import { STUDY_GUIDE_AS_SUPPLIED } from '../../src/data/studyGuide'
import {
  STUDY_GUIDE,
  STUDY_TOPICS,
  STUDY_TOPIC_CHAPTERS,
  chaptersForTopic,
  searchStudyTopics,
  studyTopic,
  topicsForChapter,
} from '../../src/data/studyGuide'
import {
  QUESTION_TOPIC_IDS,
  STUDY_QUESTIONS,
  questionsForArea,
  questionsForTopic,
} from '../../src/data/studyQuestions'
import { buildQuiz, knowledgeByArea, missedQuestions } from '../../src/sim/quiz'
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

  it('keeps practice answers, latest result winning, alongside the reviewed marks', () => {
    const saved = new Map<string, string>()
    const storage = {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => void saved.set(key, value),
    }
    const first = createStudyStore(storage)
    first.getState().toggleReviewed('propellers')
    first.getState().recordAnswer('propellers_1', false)
    first.getState().recordAnswer('propellers_1', true)
    first.getState().recordAnswer('propellers_2', false)
    const again = createStudyStore(storage).getState()
    expect(again.reviewed).toEqual(['propellers'])
    expect(again.answers).toEqual({ propellers_1: true, propellers_2: false })
  })

  it('reads progress saved by the first version, which was only a list', () => {
    const storage = { getItem: () => '["propellers"]', setItem: () => undefined }
    const state = createStudyStore(storage).getState()
    expect(state.reviewed).toEqual(['propellers'])
    expect(state.answers).toEqual({})
  })

  it('starts empty when what was saved cannot be read', () => {
    const storage = { getItem: () => '{broken', setItem: () => undefined }
    expect(createStudyStore(storage).getState().reviewed).toEqual([])
  })
})

describe('practice questions', () => {
  it('has three questions for every topic, and none for a topic that does not exist', () => {
    expect(QUESTION_TOPIC_IDS.slice().sort()).toEqual(STUDY_TOPICS.map((t) => t.id).sort())
    for (const topic of STUDY_TOPICS) expect(questionsForTopic(topic.id), topic.id).toHaveLength(3)
    expect(STUDY_QUESTIONS).toHaveLength(120)
    expect(questionsForArea('general')).toHaveLength(30)
    expect(questionsForArea('airframe')).toHaveLength(42)
    expect(questionsForArea('powerplant')).toHaveLength(48)
  })

  it.each(STUDY_QUESTIONS.map((q) => [q.id, q] as const))('%s is well formed', (_id, question) => {
    const topic = studyTopic(question.topicId)
    expect(topic?.points[question.point], 'names a point of its topic').toBeDefined()
    expect(new Set(question.choices).size, 'four different choices').toBe(4)
    expect(question.prompt.length).toBeGreaterThan(10)
    expect(question.explanation.length).toBeGreaterThan(20)
    for (const text of [question.prompt, question.explanation, ...question.choices])
      expect(text).not.toMatch(/all of the above|none of the above|<|&[a-z]+;/i)
  })

  it('asks three different points in each topic and no question twice', () => {
    expect(new Set(STUDY_QUESTIONS.map((q) => q.prompt)).size).toBe(STUDY_QUESTIONS.length)
    for (const topic of STUDY_TOPICS)
      expect(new Set(questionsForTopic(topic.id).map((q) => q.point)).size, topic.id).toBe(3)
  })
})

describe('quizzes', () => {
  it('draws the number asked for, without repeats, the same way for the same seed', () => {
    const quiz = buildQuiz(STUDY_QUESTIONS, 7, 15)
    expect(quiz).toHaveLength(15)
    expect(new Set(quiz.map((item) => item.question.id)).size).toBe(15)
    expect(buildQuiz(STUDY_QUESTIONS, 7, 15)).toEqual(quiz)
    expect(buildQuiz(STUDY_QUESTIONS, 8, 15)).not.toEqual(quiz)
  })

  it('shuffles the choices and still knows which one is right', () => {
    const quiz = buildQuiz(STUDY_QUESTIONS, 3)
    expect(quiz).toHaveLength(120)
    for (const item of quiz) {
      expect(item.choices[item.answer]).toBe(item.question.choices[0])
      expect(item.choices.slice().sort()).toEqual(item.question.choices.slice().sort())
    }
    expect(new Set(quiz.map((item) => item.answer)).size).toBe(4)
  })

  it('reports knowledge by area from the latest answers', () => {
    const answers = { basic_electricity_1: true, basic_electricity_2: false, propellers_1: true }
    expect(knowledgeByArea(STUDY_QUESTIONS, answers)).toEqual([
      { area: 'general', total: 30, attempted: 2, correct: 1 },
      { area: 'airframe', total: 42, attempted: 0, correct: 0 },
      { area: 'powerplant', total: 48, attempted: 1, correct: 1 },
    ])
    expect(missedQuestions(STUDY_QUESTIONS, answers).map((q) => q.id)).toEqual([
      'basic_electricity_2',
    ])
  })
})

describe('study guide corrections', () => {
  const supplied = (topicId: string, point: number) =>
    STUDY_GUIDE_AS_SUPPLIED.areas.flatMap((a) => a.topics).find((t) => t.id === topicId)?.points[
      point
    ]

  it.each(STUDY_CORRECTIONS.map((c) => [`${c.topicId} point ${c.point}`, c] as const))(
    '%s replaces a phrase that is in the guide as supplied and names its source',
    (_name, correction) => {
      expect(supplied(correction.topicId, correction.point)).toContain(correction.from)
      const now = studyTopic(correction.topicId)?.points[correction.point]
      expect(now).toContain(correction.to)
      expect(now).not.toContain(correction.from)
      expect(SOURCES.map((s) => s.id)).toContain(correction.sourceId)
      expect(correction.citation.length).toBeGreaterThan(8)
    },
  )

  it('changes nothing else in the guide', () => {
    const corrected = new Set(STUDY_CORRECTIONS.map((c) => `${c.topicId}/${c.point}`))
    for (const topic of STUDY_GUIDE_AS_SUPPLIED.areas.flatMap((a) => a.topics)) {
      topic.points.forEach((point, index) => {
        if (!corrected.has(`${topic.id}/${index}`))
          expect(studyTopic(topic.id)?.points[index]).toBe(point)
      })
    }
    expect(studyTopic('propellers')?.corrections).toEqual([])
    expect(studyTopic('fasteners_and_hardware')?.corrections).toHaveLength(2)
    expect(STUDY_CORRECTIONS).toHaveLength(9)
  })
})

describe('study guide checks', () => {
  it('names only real topics, points and sources, each point once', () => {
    for (const [topicId, bySource] of Object.entries(STUDY_CHECKS)) {
      const topic = studyTopic(topicId)
      expect(topic, topicId).toBeDefined()
      for (const [sourceId, points] of Object.entries(bySource)) {
        expect(SOURCES.map((s) => s.id)).toContain(sourceId)
        expect(new Set(points).size, topicId).toBe(points.length)
        for (const point of points)
          expect(topic?.points[point], `${topicId}/${point}`).toBeDefined()
      }
    }
  })

  it('never marks a corrected point as agreeing with the source', () => {
    for (const correction of STUDY_CORRECTIONS)
      expect(checksFor(correction.topicId, correction.point)).toEqual([])
  })

  it('counts the checked points', () => {
    expect(CHECKED_POINT_COUNT).toBe(156)
    expect(checksFor('basic_electricity', 0)).toEqual(['faa_amt_general'])
    expect(checksFor('propellers', 0)).toEqual([])
  })
})
