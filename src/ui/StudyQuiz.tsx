import { useState } from 'react'
import { STUDY_GUIDE, studyTopic } from '../data/studyGuide'
import type { QuizItem } from '../sim/quiz'
import { useStudy } from '../state/study'

interface Props {
  title: string
  items: QuizItem[]
  /** Leaves the quiz; with a topic id, opens that topic. */
  onClose: (topicId?: string) => void
}

/** One practice quiz: a question at a time, with the answer explained before moving on. */
export function StudyQuiz({ title, items, onClose }: Props) {
  const recordAnswer = useStudy((s) => s.recordAnswer)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<boolean[]>([])

  const item = items[index]

  if (!item) {
    const correct = results.filter(Boolean).length
    return (
      <article className="library__page" aria-label="Practice results">
        <h2 className="sheet__title">Practice results</h2>
        <p>
          {title}: <b className="mono">{correct}</b> of <b className="mono">{items.length}</b>{' '}
          correct.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Topic</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {items.map((entry, i) => (
              <tr key={entry.question.id}>
                <td>{entry.question.prompt}</td>
                <td>
                  <button
                    type="button"
                    className="link"
                    onClick={() => onClose(entry.question.topicId)}
                  >
                    {studyTopic(entry.question.topicId)?.title}
                  </button>
                </td>
                <td>
                  {results[i] ? (
                    <span className="chip chip--done">Correct</span>
                  ) : (
                    <span className="chip chip--fail">Incorrect</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted study__intro">
          Practice questions were written for this simulator from the study guide. They are not FAA
          test questions and a score here does not predict a test result.
        </p>
        <div className="form__actions">
          <button type="button" className="button button--primary" onClick={() => onClose()}>
            Back to the study guide
          </button>
        </div>
      </article>
    )
  }

  const topic = studyTopic(item.question.topicId)
  const area = STUDY_GUIDE.areas.find((a) => a.id === item.question.area)
  const right = picked === item.answer

  const check = () => {
    if (picked === null) return
    setChecked(true)
    setResults([...results, right])
    recordAnswer(item.question.id, right)
  }
  const next = () => {
    setIndex(index + 1)
    setPicked(null)
    setChecked(false)
  }

  return (
    <article className="library__page" aria-label="Practice question">
      <p className="study__area-label mono">
        {title} · question {index + 1} of {items.length}
      </p>
      <p className="muted study__intro">
        {area?.label} — {topic?.title}
      </p>
      <fieldset className="quiz">
        <legend className="quiz__prompt">{item.question.prompt}</legend>
        {item.choices.map((choice, i) => (
          <label
            key={choice}
            className={[
              'quiz__choice',
              checked && i === item.answer ? 'quiz__choice--right' : '',
              checked && i === picked && !right ? 'quiz__choice--wrong' : '',
            ].join(' ')}
          >
            <input
              type="radio"
              name="choice"
              checked={picked === i}
              disabled={checked}
              onChange={() => setPicked(i)}
            />
            <span>{choice}</span>
          </label>
        ))}
      </fieldset>

      {checked && (
        <div className="quiz__feedback" role="status">
          <p>
            <span className={right ? 'chip chip--done' : 'chip chip--fail'}>
              {right ? 'Correct' : 'Incorrect'}
            </span>{' '}
            {item.question.explanation}
          </p>
          <p className="muted">
            From the study guide:{' '}
            <button type="button" className="link" onClick={() => onClose(item.question.topicId)}>
              {topic?.title}
            </button>
          </p>
        </div>
      )}

      <div className="form__actions">
        {checked ? (
          <button type="button" className="button button--primary" onClick={next}>
            {index + 1 < items.length ? 'Next question' : 'See results'}
          </button>
        ) : (
          <button
            type="button"
            className="button button--primary"
            disabled={picked === null}
            onClick={check}
          >
            Check answer
          </button>
        )}
        <button type="button" className="button" onClick={() => onClose()}>
          End practice
        </button>
      </div>
    </article>
  )
}
