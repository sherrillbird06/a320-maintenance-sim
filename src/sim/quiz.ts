import type { StudyQuestion } from '../data/studyQuestions'
import type { StudyAreaId } from '../data/studyGuide'
import { createRng, shuffled } from './rng'

/** A question as it is put to the candidate: choices in a shuffled order. */
export interface QuizItem {
  question: StudyQuestion
  choices: string[]
  /** Index of the correct choice in `choices`. */
  answer: number
}

/**
 * Draws up to `count` questions from the pool, in a random order with the
 * choices of each shuffled. The same seed always gives the same quiz.
 */
export function buildQuiz(
  pool: readonly StudyQuestion[],
  seed: number,
  count?: number,
): QuizItem[] {
  const rng = createRng(seed)
  return shuffled(pool, rng)
    .slice(0, count ?? pool.length)
    .map((question) => {
      const correct = question.choices[0]
      const choices = shuffled(question.choices, rng)
      return { question, choices, answer: choices.indexOf(correct) }
    })
}

/** Latest result for each question that has been answered: true when it was correct. */
export type AnswerRecord = Record<string, boolean>

export interface AreaKnowledge {
  area: StudyAreaId
  /** Questions written for the area. */
  total: number
  attempted: number
  /** Questions whose latest answer was correct. */
  correct: number
}

/** How much of each test area has been practised and got right, from the latest answers. */
export function knowledgeByArea(
  questions: readonly StudyQuestion[],
  answers: AnswerRecord,
): AreaKnowledge[] {
  const areas: StudyAreaId[] = ['general', 'airframe', 'powerplant']
  return areas.map((area) => {
    const inArea = questions.filter((question) => question.area === area)
    const attempted = inArea.filter((question) => question.id in answers)
    return {
      area,
      total: inArea.length,
      attempted: attempted.length,
      correct: attempted.filter((question) => answers[question.id] === true).length,
    }
  })
}

/** Questions whose latest answer was wrong, for another try. */
export function missedQuestions(questions: readonly StudyQuestion[], answers: AnswerRecord) {
  return questions.filter((question) => answers[question.id] === false)
}
