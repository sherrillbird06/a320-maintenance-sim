import { Fragment, useState } from 'react'
import {
  STUDY_GUIDE,
  STUDY_TOPICS,
  chaptersForTopic,
  searchStudyTopics,
  studyArea,
  studyTopic,
  type StudyAreaId,
} from '../data/studyGuide'
import { STUDY_QUESTIONS, questionsForArea, questionsForTopic } from '../data/studyQuestions'
import { buildQuiz, missedQuestions, type QuizItem } from '../sim/quiz'
import { sourceById } from '../data/sources'
import { parseRich } from '../sim/richText'
import { useStudy } from '../state/study'
import { useView, view } from '../state/useSession'
import { ChapterLink } from './Library'
import { StudyQuiz } from './StudyQuiz'

/** Opens the study guide, at a topic when one is given. */
export function openStudyGuide(topicId?: string) {
  view.setState({ panel: 'study', studyTopic: topicId ?? view.getState().studyTopic })
}

/** A topic title that opens the study guide at that topic. */
export function StudyTopicLink({ topicId }: { topicId: string }) {
  const topic = studyTopic(topicId)
  if (!topic) return null
  return (
    <button type="button" className="link" onClick={() => openStudyGuide(topicId)}>
      {topic.title}
    </button>
  )
}

/** Guide text with its bold, italic and line breaks. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {parseRich(text).map((part, index) => {
        if ('lineBreak' in part) return <br key={index} />
        if (part.bold) return <b key={index}>{part.text}</b>
        if (part.italic) return <i key={index}>{part.text}</i>
        return <Fragment key={index}>{part.text}</Fragment>
      })}
    </>
  )
}

/** The A&P study guide: three test areas, every topic and point of the owner's guide. */
export function StudyGuide() {
  const topicId = useView((s) => s.studyTopic)
  const reviewed = useStudy((s) => s.reviewed)
  const toggleReviewed = useStudy((s) => s.toggleReviewed)
  const answers = useStudy((s) => s.answers)
  const [quiz, setQuiz] = useState<{ title: string; items: QuizItem[] } | null>(null)
  const [query, setQuery] = useState('')

  const topic = studyTopic(topicId) ?? STUDY_TOPICS[0]
  const [areaId, setAreaId] = useState<StudyAreaId>(topic?.area ?? 'general')
  if (!topic) return null

  const area = studyArea(areaId)
  const searching = query.trim() !== ''
  const listed = searching ? searchStudyTopics(query) : area.topics
  const topicArea = studyArea(topic.area)
  const chapters = chaptersForTopic(topic.id)
  const isReviewed = reviewed.includes(topic.id)
  const order = STUDY_TOPICS.findIndex((t) => t.id === topic.id)
  const previous = STUDY_TOPICS[order - 1]
  const next = STUDY_TOPICS[order + 1]

  const missed = missedQuestions(STUDY_QUESTIONS, answers)
  const start = (title: string, pool: typeof STUDY_QUESTIONS, count?: number) =>
    setQuiz({ title, items: buildQuiz(pool, Date.now(), count) })

  const show = (id: string) => {
    setQuiz(null)
    const target = studyTopic(id)
    if (target) setAreaId(target.area)
    view.setState({ studyTopic: id })
  }

  return (
    <div className="sheet sheet--library" role="dialog" aria-label="A&P study guide">
      <nav className="library__nav" aria-label="Study topics">
        <h1 className="sheet__heading">A&amp;P study guide</h1>
        <p className="study__count muted">
          {reviewed.length} of {STUDY_TOPICS.length} topics reviewed
        </p>
        <div className="study__areas" role="group" aria-label="Test areas">
          {STUDY_GUIDE.areas.map((a) => (
            <button
              key={a.id}
              type="button"
              className={
                a.id === areaId && !searching
                  ? 'button button--small study__area study__area--current'
                  : 'button button--small study__area'
              }
              aria-pressed={a.id === areaId && !searching}
              onClick={() => {
                setQuery('')
                setAreaId(a.id)
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
        <label className="study__search">
          <span className="muted">Search all topics</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. magneto, torque, CG"
          />
        </label>
        {searching && (
          <p className="study__count muted" role="status">
            {listed.length} {listed.length === 1 ? 'topic' : 'topics'} found
          </p>
        )}
        <ul>
          {listed.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className={
                  t.id === topic.id ? 'library__item library__item--current' : 'library__item'
                }
                aria-current={t.id === topic.id ? 'page' : undefined}
                onClick={() => show(t.id)}
              >
                <span className="study__mark" aria-hidden="true">
                  {reviewed.includes(t.id) ? '✓' : t.highPriority ? '●' : ''}
                </span>
                {t.title}
                {reviewed.includes(t.id) && <span className="visually-hidden"> (reviewed)</span>}
              </button>
            </li>
          ))}
        </ul>
        <p className="study__legend muted">● high priority · ✓ reviewed</p>

        <h2 className="sheet__heading">Practice questions</h2>
        <div className="study__practice">
          <button
            type="button"
            className="button button--small"
            onClick={() => start(`${area.label} practice`, questionsForArea(area.id), 10)}
          >
            {area.label}: 10 questions
          </button>
          <button
            type="button"
            className="button button--small"
            onClick={() => start('Mixed practice', STUDY_QUESTIONS, 15)}
          >
            All areas: 15 questions
          </button>
          <button
            type="button"
            className="button button--small"
            disabled={missed.length === 0}
            onClick={() => start('Missed questions', missed)}
          >
            Retry missed ({missed.length})
          </button>
        </div>
      </nav>

      {quiz && (
        <StudyQuiz
          key={quiz.items.map((item) => item.question.id).join()}
          title={quiz.title}
          items={quiz.items}
          onClose={(id) => (id ? show(id) : setQuiz(null))}
        />
      )}
      <article className="library__page" hidden={quiz !== null}>
        <p className="library__notice">
          Review notes for the FAA aviation mechanic knowledge tests, supplied by the project owner.
          General study material, not A320 maintenance data. Points marked “Corrected” have been
          checked against an FAA document; the rest has not yet been checked line by line.
        </p>

        <p className="study__area-label mono">{topicArea.label}</p>
        <p className="muted study__intro">{topicArea.intro}</p>

        <h2 className="sheet__title">
          {topic.title}{' '}
          {topic.highPriority && <span className="chip chip--caution">High priority</span>}{' '}
          {isReviewed && <span className="chip chip--done">Reviewed</span>}
        </h2>

        <ul className="library__list study__points">
          {topic.points.map((point, index) => (
            <li key={point}>
              <Rich text={point} />
              {topic.corrections
                .filter((c) => c.point === index)
                .map((c) => (
                  <p key={c.from} className="study__correction">
                    <span className="chip chip--active">Corrected</span> Checked against{' '}
                    <a href={sourceById(c.sourceId)?.url} target="_blank" rel="noreferrer">
                      {c.citation}
                    </a>
                    . The guide as supplied read: “{c.from}”.
                  </p>
                ))}
            </li>
          ))}
        </ul>

        {topic.formula && (
          <div className="study__formula">
            <h3 className="sheet__heading">{topic.formula.label}</h3>
            <p className="mono">
              <Rich text={topic.formula.body} />
            </p>
          </div>
        )}

        {chapters.length > 0 && (
          <>
            <h3 className="sheet__heading">See it on the aircraft</h3>
            <ul className="library__list">
              {chapters.map((chapter) => (
                <li key={chapter}>
                  <ChapterLink chapter={chapter} />
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="form__actions">
          <button
            type="button"
            className="button"
            onClick={() => start(topic.title, questionsForTopic(topic.id))}
          >
            Practice this topic
          </button>
          <button type="button" className="button" onClick={() => toggleReviewed(topic.id)}>
            {isReviewed ? 'Mark as not reviewed' : 'Mark as reviewed'}
          </button>
          {previous && (
            <button type="button" className="button" onClick={() => show(previous.id)}>
              Previous topic
            </button>
          )}
          {next && (
            <button type="button" className="button" onClick={() => show(next.id)}>
              Next topic
            </button>
          )}
          <button
            type="button"
            className="button button--primary"
            onClick={() => view.setState({ panel: 'none' })}
          >
            Close study guide
          </button>
        </div>

        <p className="study__about muted">
          <Rich text={STUDY_GUIDE.about} />
        </p>
      </article>
    </div>
  )
}
