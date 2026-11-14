import { useEffect, useState, type FormEvent } from 'react'
import { AIRCRAFT } from '../data/aircraft'
import { ATA_CHAPTERS, ataTitle } from '../data/ata'
import { byId } from '../data/components'
import { DEFECT_TYPES } from '../data/defects'
import type { DefectCategory, Finding } from '../data/schema'
import { ZONES } from '../data/zones'
import { session, useSession, useView, view } from '../state/useSession'
import './inspection.css'

const CATEGORY_LABELS: Record<DefectCategory, string> = {
  tire: 'Tire damage or wear',
  'hydraulic-leak': 'Hydraulic fluid leak',
  'panel-damage': 'Panel or skin damage',
  fastener: 'Missing or damaged fastener',
  'foreign-object-damage': 'Foreign object damage',
  light: 'Damaged light',
  corrosion: 'Corrosion',
  seal: 'Damaged seal',
  'abnormal-condition': 'Abnormal component condition',
}

const zoneTitle = (id: string) => ZONES.find((z) => z.id === id)?.title ?? id
const componentName = (id: string) => byId(id)?.name ?? id
const ataLabel = (chapter: string) => `ATA ${chapter} — ${ataTitle(chapter) ?? 'Unknown'}`
const duration = (seconds: number) =>
  `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, '0')} s`
const percent = (value: number) => `${Math.round(value * 100)}%`

/** Every condition wording offered for a category, so the right one is not given away. */
function conditionsFor(category: DefectCategory): string[] {
  const all = DEFECT_TYPES.filter((t) => t.category === category).flatMap((t) => [
    t.correctCondition,
    ...t.wrongConditions,
  ])
  return [...new Set(all)].sort()
}

function AircraftBlock() {
  return (
    <dl className="facts">
      <dt>Registration</dt>
      <dd className="mono">{AIRCRAFT.registration.value}</dd>
      <dt>Model</dt>
      <dd>
        {AIRCRAFT.model}, {AIRCRAFT.engines}
      </dd>
      <dt>MSN</dt>
      <dd className="mono">{AIRCRAFT.msn.value}</dd>
    </dl>
  )
}

function Logbook() {
  const logbook = useSession((s) => s.logbook)
  if (logbook.length === 0) return <p className="muted">No inspections signed off yet.</p>
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Work order</th>
          <th>Date</th>
          <th>Assignment</th>
          <th>Technician</th>
          <th>Findings</th>
          <th>Accuracy</th>
          <th>Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {[...logbook].reverse().map((entry, i) => (
          <tr key={`${entry.workOrder}-${entry.openedAt}-${i}`}>
            <td className="mono">{entry.workOrder}</td>
            <td className="mono">{entry.openedAt.slice(0, 10)}</td>
            <td>{entry.assignment}</td>
            <td>
              {entry.technicianName} <span className="mono muted">{entry.technicianId}</span>
            </td>
            <td className="mono">{entry.findings.length}</td>
            <td className="mono">{percent(entry.accuracy)}</td>
            <td className="mono">{duration(entry.timeTakenSeconds)}</td>
            <td>
              <span className="chip chip--done">Signed off</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Before an inspection: the work order to accept, and the logbook of past ones. */
function StartPanel() {
  const template = useSession((s) => s.template)
  const saved = useSession((s) => s.technician)
  const error = useSession((s) => s.error)
  const [name, setName] = useState(saved.name)
  const [id, setId] = useState(saved.id)
  const [replay, setReplay] = useState('')

  const accept = (event: FormEvent) => {
    event.preventDefault()
    const typed = Number.parseInt(replay.replace(/\D/g, ''), 10)
    const seed = Number.isFinite(typed) ? typed : Math.floor(Date.now() % 90000) + 10000
    session.getState().startAssignment({ name, id }, seed)
  }

  return (
    <div className="sheet">
      <section className="sheet__section">
        <h1 className="sheet__title">Work order</h1>
        <p className="sheet__lead">{template.title}</p>
        <AircraftBlock />
        <dl className="facts">
          <dt>Inspection zone</dt>
          <dd>{template.zones.map((z) => `${z} — ${zoneTitle(z)}`).join(', ')}</dd>
          <dt>References</dt>
          <dd>{template.referenceChapters.map(ataLabel).join('; ')}</dd>
          <dt>Task</dt>
          <dd>
            Carry out a general visual inspection of the zone. Tag and report every discrepancy you
            find, then sign off. The work order does not say what is wrong or where.
          </dd>
        </dl>
        <form className="form" onSubmit={accept}>
          <label>
            Technician name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label>
            Technician ID
            <input value={id} onChange={(e) => setId(e.target.value)} className="mono" />
          </label>
          <label>
            Replay work order no. <span className="muted">(optional)</span>
            <input
              value={replay}
              onChange={(e) => setReplay(e.target.value)}
              className="mono"
              placeholder="WO-"
            />
          </label>
          {error && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button button--primary">
            Accept work order
          </button>
        </form>
      </section>
      <section className="sheet__section">
        <h2 className="sheet__heading">Maintenance logbook</h2>
        <Logbook />
      </section>
    </div>
  )
}

function useElapsed(startedAtMs: number): number {
  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return Math.max(0, Math.round((nowMs - startedAtMs) / 1000))
}

/** While inspecting: task strip, crosshair, what is under it, and the selected component. */
function Hud() {
  const scenario = useSession((s) => s.scenario)
  const template = useSession((s) => s.template)
  const findings = useSession((s) => s.findings)
  const selection = useSession((s) => s.selection)
  const startedAtMs = useSession((s) => s.startedAtMs)
  const looking = useView((s) => s.looking)
  const hoverId = useView((s) => s.hoverId)
  const flashlight = useView((s) => s.flashlight)
  const elapsed = useElapsed(startedAtMs)
  const component = selection ? byId(selection.componentId) : undefined

  return (
    <>
      <div className="strip">
        <span className="mono">{scenario?.workOrder}</span>
        <span>{template.title}</span>
        <span className="mono">{AIRCRAFT.registration.value}</span>
        <span className="strip__spacer" />
        <span>
          Findings <span className="mono">{findings.length}</span>
        </span>
        <span className="mono">{duration(elapsed)}</span>
      </div>

      {looking && <div className="crosshair" aria-hidden="true" />}
      {looking && hoverId && <div className="hover-label">{componentName(hoverId)}</div>}
      {!looking && (
        <div className="prompt">Click the view to look around. Press Esc to free the mouse.</div>
      )}

      <div className="legend">
        <span>
          <kbd>W A S D</kbd> walk
        </span>
        <span>
          <kbd>Shift</kbd> faster
        </span>
        <span>
          <kbd>C</kbd> crouch
        </span>
        <span>
          <kbd>Click</kbd> select part
        </span>
        <span>
          <kbd>Right-click</kbd> zoom
        </span>
        <span>
          <kbd>F</kbd> flashlight {flashlight ? 'on' : 'off'}
        </span>
        <span>
          <kbd>E</kbd> report
        </span>
        <span>
          <kbd>Tab</kbd> workstation
        </span>
      </div>

      {component && (
        <aside className="component">
          <p className="component__eyebrow">Selected component</p>
          <h2 className="component__name">{component.name}</h2>
          <dl className="facts">
            <dt>Identifier</dt>
            <dd className="mono">{component.id}</dd>
            <dt>ATA</dt>
            <dd>{ataLabel(component.ata)}</dd>
            <dt>Zone</dt>
            <dd>
              {component.zone} — {zoneTitle(component.zone)}
            </dd>
            {component.side && (
              <>
                <dt>Side</dt>
                <dd>{component.side === 'LH' ? 'Left' : 'Right'}</dd>
              </>
            )}
          </dl>
          <div className="component__actions">
            <button
              className="button button--primary"
              onClick={() => view.setState({ panel: 'report' })}
            >
              Report discrepancy
            </button>
            <button className="button" onClick={() => session.getState().select(null)}>
              Clear
            </button>
          </div>
        </aside>
      )}
    </>
  )
}

/** The discrepancy report for the tagged spot on the selected component. */
function ReportForm() {
  const selection = useSession((s) => s.selection)
  const component = selection ? byId(selection.componentId) : undefined
  const [ata, setAta] = useState('')
  const [category, setCategory] = useState<DefectCategory | ''>('')
  const [condition, setCondition] = useState('')
  const [remarks, setRemarks] = useState('')
  const close = () => view.setState({ panel: 'none' })
  if (!selection || !component) return null

  const conditions = category ? conditionsFor(category) : []
  const complete = ata !== '' && category !== '' && condition !== ''

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!complete) return
    const finding: Finding = {
      componentId: selection.componentId,
      taggedPoint: selection.point,
      ata,
      category,
      condition,
      remarks,
    }
    session.getState().addFinding(finding)
    close()
  }

  return (
    <div className="overlay" role="dialog" aria-label="Discrepancy report">
      <form className="sheet sheet--narrow" onSubmit={submit}>
        <section className="sheet__section">
          <h1 className="sheet__title">Discrepancy report</h1>
          <dl className="facts">
            <dt>Aircraft</dt>
            <dd className="mono">{AIRCRAFT.registration.value}</dd>
            <dt>Component</dt>
            <dd>
              {component.name} <span className="mono muted">{component.id}</span>
            </dd>
            <dt>Tagged at</dt>
            <dd className="mono">{selection.point.map((v) => v.toFixed(2)).join(', ')} m</dd>
          </dl>
          <div className="form">
            <label>
              ATA chapter
              <select value={ata} onChange={(e) => setAta(e.target.value)}>
                <option value="">Select…</option>
                {ATA_CHAPTERS.map((c) => (
                  <option key={c.chapter} value={c.chapter}>
                    {c.chapter} — {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Discrepancy type
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as DefectCategory | '')
                  setCondition('')
                }}
              >
                <option value="">Select…</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Observed condition
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                disabled={category === ''}
              >
                <option value="">{category === '' ? 'Choose a type first' : 'Select…'}</option>
                {conditions.map((text) => (
                  <option key={text} value={text}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
            {category !== '' && conditions.length === 0 && (
              <p className="muted">
                No standard wordings for this type in the current training set.
              </p>
            )}
            <label>
              Remarks <span className="muted">(recorded, not graded)</span>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
            </label>
            <div className="form__actions">
              <button type="submit" className="button button--primary" disabled={!complete}>
                Record finding
              </button>
              <button type="button" className="button" onClick={close}>
                Cancel
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}

/** The workstation: the work order, findings so far, and sign-off. */
function Workstation() {
  const scenario = useSession((s) => s.scenario)
  const template = useSession((s) => s.template)
  const entry = useSession((s) => s.entry)
  const findings = useSession((s) => s.findings)
  const [confirming, setConfirming] = useState(false)
  const close = () => view.setState({ panel: 'none' })

  return (
    <div className="overlay" role="dialog" aria-label="Workstation">
      <div className="sheet">
        <section className="sheet__section">
          <h1 className="sheet__title">
            Work order <span className="mono">{scenario?.workOrder}</span>
          </h1>
          <p className="sheet__lead">{template.title}</p>
          <AircraftBlock />
          <dl className="facts">
            <dt>Technician</dt>
            <dd>
              {entry?.technicianName} <span className="mono muted">{entry?.technicianId}</span>
            </dd>
            <dt>Zone</dt>
            <dd>{template.zones.map((z) => `${z} — ${zoneTitle(z)}`).join(', ')}</dd>
            <dt>Status</dt>
            <dd>
              <span className="chip chip--active">In progress</span>
            </dd>
          </dl>
        </section>
        <section className="sheet__section">
          <h2 className="sheet__heading">Findings recorded</h2>
          {findings.length === 0 ? (
            <p className="muted">
              None yet. Select a component on the aircraft and choose Report discrepancy.
            </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Component</th>
                  <th>ATA</th>
                  <th>Type</th>
                  <th>Observed condition</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {findings.map((finding, i) => (
                  <tr key={i}>
                    <td className="mono">{i + 1}</td>
                    <td>{componentName(finding.componentId)}</td>
                    <td className="mono">{finding.ata}</td>
                    <td>{CATEGORY_LABELS[finding.category]}</td>
                    <td>{finding.condition}</td>
                    <td>
                      <button
                        className="button button--small"
                        onClick={() => session.getState().removeFinding(i)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <section className="sheet__section sheet__section--actions">
          {confirming ? (
            <>
              <span>
                Sign off with {findings.length} finding{findings.length === 1 ? '' : 's'}? The
                inspection is graded and cannot be reopened.
              </span>
              <button
                className="button button--primary"
                onClick={() => {
                  session.getState().signOff()
                  close()
                }}
              >
                Confirm sign-off
              </button>
              <button className="button" onClick={() => setConfirming(false)}>
                Back
              </button>
            </>
          ) : (
            <>
              <button className="button button--primary" onClick={() => setConfirming(true)}>
                Sign off inspection
              </button>
              <button className="button" onClick={close}>
                Return to aircraft
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

const VERDICTS = {
  correct: ['Correct', 'chip--done'],
  partial: ['Partly correct', 'chip--caution'],
  incorrect: ['Incorrect', 'chip--fail'],
} as const

/** After sign-off: what was right, what was wrong, what was missed, and why. */
function Debrief() {
  const result = useSession((s) => s.result)
  const entry = useSession((s) => s.entry)
  if (!result || !entry) return null
  const { summary } = result

  return (
    <div className="sheet">
      <section className="sheet__section">
        <h1 className="sheet__title">
          Inspection review <span className="mono">{entry.workOrder}</span>
        </h1>
        <table className="table table--summary">
          <tbody>
            <tr>
              <th>Accuracy</th>
              <td className="mono">{percent(summary.accuracy)}</td>
              <th>Correct</th>
              <td className="mono">{summary.correct}</td>
              <th>Partly correct</th>
              <td className="mono">{summary.partial}</td>
            </tr>
            <tr>
              <th>Time taken</th>
              <td className="mono">{duration(entry.timeTakenSeconds)}</td>
              <th>Incorrect</th>
              <td className="mono">{summary.incorrect}</td>
              <th>Missed</th>
              <td className="mono">{summary.missed}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="sheet__section">
        <h2 className="sheet__heading">Your findings</h2>
        {result.findings.length === 0 && <p className="muted">You reported no discrepancies.</p>}
        {result.findings.map((graded, i) => {
          const [label, chip] = VERDICTS[graded.verdict]
          return (
            <article className="review" key={i}>
              <header className="review__head">
                <span className={`chip ${chip}`}>{label}</span>
                <strong>{componentName(graded.finding.componentId)}</strong>
                <span className="muted">{graded.finding.condition}</span>
              </header>
              <p>{graded.explanation}</p>
            </article>
          )
        })}
      </section>

      {result.missed.length > 0 && (
        <section className="sheet__section">
          <h2 className="sheet__heading">Discrepancies you did not report</h2>
          {result.missed.map((miss, i) => (
            <article className="review" key={i}>
              <header className="review__head">
                <span className="chip chip--fail">Missed</span>
                <strong>{componentName(miss.defect.componentId)}</strong>
                <span className="muted">{miss.label}</span>
              </header>
              <p>{miss.explanation}</p>
            </article>
          ))}
        </section>
      )}

      <section className="sheet__section sheet__section--actions">
        <button
          className="button button--primary"
          onClick={() => session.getState().closeDebrief()}
        >
          Close and return to work orders
        </button>
      </section>
    </div>
  )
}

/** Everything drawn over the 3D view, chosen by where the inspection has got to. */
export function InspectionUi() {
  const phase = useSession((s) => s.phase)
  const panel = useView((s) => s.panel)

  if (phase === 'idle') {
    return (
      <div className="overlay">
        <StartPanel />
      </div>
    )
  }
  if (phase === 'debrief') {
    return (
      <div className="overlay">
        <Debrief />
      </div>
    )
  }
  return (
    <>
      <Hud />
      {panel === 'report' && <ReportForm />}
      {panel === 'workstation' && <Workstation />}
    </>
  )
}
