import { ataTitle } from '../data/ata'
import { SCENARIO_TEMPLATES } from '../data/scenarios'
import { studyArea } from '../data/studyGuide'
import { STUDY_QUESTIONS } from '../data/studyQuestions'
import { checklistStatus } from '../sim/checklist'
import { PASS_ACCURACY, summarize, type CompletedInspection } from '../sim/progress'
import { knowledgeByArea } from '../sim/quiz'
import { useStudy } from '../state/study'
import { useSession } from '../state/useSession'
import { ChapterLink } from './Library'

const percent = (value: number) => `${Math.round(value * 100)}%`
const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)} min ${String(Math.round(seconds % 60)).padStart(2, '0')} s`

/** The inspection checklist with what has been examined so far. */
export function Checklist() {
  const template = useSession((s) => s.template)
  const examined = useSession((s) => s.examined)
  const lines = checklistStatus(template, examined)
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Inspection item</th>
          <th>Examined</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line) => (
          <tr key={line.id}>
            <td>{line.title}</td>
            <td className="mono">
              {line.done} of {line.total}
            </td>
            <td>
              {line.examined ? (
                <span className="chip chip--done">Examined</span>
              ) : (
                <span className="chip chip--caution">Not examined</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** After sign-off: what the inspection required that was not looked at, and what was consulted. */
export function CoverageReview() {
  const template = useSession((s) => s.template)
  const examined = useSession((s) => s.examined)
  const consulted = useSession((s) => s.consulted)
  const lines = checklistStatus(template, examined)
  const skipped = lines.filter((line) => !line.examined)
  const readAny = template.referenceChapters.some((chapter) => consulted.includes(chapter))

  return (
    <section className="sheet__section">
      <h2 className="sheet__heading">Inspection coverage</h2>
      <Checklist />
      {skipped.length > 0 ? (
        <p className="review__note">
          {skipped.length} of {lines.length} checklist item{lines.length === 1 ? '' : 's'} not fully
          examined. An inspection that is signed off states that everything on it was looked at; a
          defect on a part you did not examine is missed however carefully you checked the rest.
        </p>
      ) : (
        <p className="review__note">Every item on the checklist was examined.</p>
      )}
      <p className="review__note">
        References consulted:{' '}
        {consulted.length === 0
          ? 'none.'
          : consulted
              .map((chapter) => `ATA ${chapter} ${ataTitle(chapter) ?? ''}`.trim())
              .join('; ') + '.'}{' '}
        {!readAny &&
          'The work order listed references for this task; reading them first tells you what to look for.'}
      </p>
    </section>
  )
}

/** The technician's training record, built from the signed-off inspections in the logbook. */
export function Profile() {
  const logbook = useSession((s) => s.logbook)
  const technician = useSession((s) => s.technician)
  const inspections: CompletedInspection[] = logbook.map((entry) => ({
    // Entries saved before levels were recorded are matched to their assignment by title.
    level: entry.level ?? SCENARIO_TEMPLATES.find((t) => t.title === entry.assignment)?.level ?? 0,
    accuracy: entry.accuracy,
    correct: entry.correct,
    incorrect: entry.incorrect,
    missed: entry.missed,
    timeTakenSeconds: entry.timeTakenSeconds,
    ataReferences: entry.ataReferences,
  }))
  const profile = summarize(inspections, SCENARIO_TEMPLATES)
  const knowledge = knowledgeByArea(
    STUDY_QUESTIONS,
    useStudy((s) => s.answers),
  )

  return (
    <>
      <dl className="facts">
        <dt>Technician</dt>
        <dd>
          {technician.name || '—'} <span className="mono muted">{technician.id}</span>
        </dd>
        <dt>Inspections signed off</dt>
        <dd className="mono">{profile.completed}</dd>
        <dt>Average accuracy</dt>
        <dd className="mono">
          {profile.averageAccuracy === null ? '—' : percent(profile.averageAccuracy)}
        </dd>
        <dt>Average time</dt>
        <dd className="mono">
          {profile.averageTimeSeconds === null ? '—' : duration(profile.averageTimeSeconds)}
        </dd>
        <dt>Findings to date</dt>
        <dd>
          <span className="mono">{profile.totals.correct}</span> correct,{' '}
          <span className="mono">{profile.totals.incorrect}</span> incorrect,{' '}
          <span className="mono">{profile.totals.missed}</span> missed
        </dd>
      </dl>

      <table className="table">
        <thead>
          <tr>
            <th>Level</th>
            <th>Training stage</th>
            <th>Attempts</th>
            <th>Best accuracy</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {profile.levels.map((level) => (
            <tr key={level.level}>
              <td className="mono">{level.level}</td>
              <td>{level.title}</td>
              <td className="mono">{level.attempts}</td>
              <td className="mono">{level.best === null ? '—' : percent(level.best)}</td>
              <td>
                {level.passed ? (
                  <span className="chip chip--done">Passed</span>
                ) : !level.available ? (
                  <span className="muted">No assignment yet</span>
                ) : level.attempts > 0 ? (
                  <span className="chip chip--caution">Below {percent(PASS_ACCURACY)}</span>
                ) : (
                  <span className="chip chip--active">Available</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="table" aria-label="A&P knowledge practice">
        <thead>
          <tr>
            <th>A&amp;P knowledge practice</th>
            <th>Questions tried</th>
            <th>Correct at last try</th>
            <th>Of all questions</th>
          </tr>
        </thead>
        <tbody>
          {knowledge.map((row) => (
            <tr key={row.area}>
              <td>{studyArea(row.area).label}</td>
              <td className="mono">
                {row.attempted} of {row.total}
              </td>
              <td className="mono">{row.correct}</td>
              <td className="mono">{percent(row.total === 0 ? 0 : row.correct / row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {profile.chapters.length > 0 && (
        <p className="review__note">
          ATA chapters practised:{' '}
          {profile.chapters.map((c, i) => (
            <span key={c.chapter}>
              {i > 0 && '; '}
              <ChapterLink chapter={c.chapter} /> ({c.attempts}×, best {percent(c.best)})
            </span>
          ))}
        </p>
      )}
    </>
  )
}
