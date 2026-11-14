import { ataTitle } from '../data/ata'
import { COMPONENTS } from '../data/components'
import { LIBRARY, libraryPage } from '../data/library'
import { sourceById } from '../data/sources'
import { useView, view } from '../state/useSession'

/** Opens the library at a chapter, from anywhere in the interface. */
export function openLibrary(chapter?: string) {
  view.setState({ panel: 'library', libraryChapter: chapter ?? view.getState().libraryChapter })
}

/** A chapter reference that opens its library page, or plain text when the chapter has no page. */
export function ChapterLink({ chapter }: { chapter: string }) {
  const label = `ATA ${chapter} — ${ataTitle(chapter) ?? 'Unknown'}`
  if (!libraryPage(chapter)) return <>{label}</>
  return (
    <button type="button" className="link" onClick={() => openLibrary(chapter)}>
      {label}
    </button>
  )
}

/** Component names in a chapter, with left/right and numbered copies collapsed to one line each. */
function componentsIn(chapter: string): string[] {
  const names = COMPONENTS.filter((c) => c.ata === chapter).map((c) =>
    c.name
      .replace(/, (left|right|captain|first officer)$/, '')
      .replace(/^Engine [12] /, 'Engine ')
      .replace(/ \d+$/, ''),
  )
  return [...new Set(names)].sort()
}

/** The technical library: chapters down the side, one page at a time. */
export function Library() {
  const chapter = useView((s) => s.libraryChapter)
  const page = libraryPage(chapter) ?? LIBRARY[0]
  if (!page) return null
  const components = componentsIn(page.chapter)

  return (
    <div className="sheet sheet--library" role="dialog" aria-label="Technical library">
      <nav className="library__nav" aria-label="ATA chapters">
        <h1 className="sheet__heading">Technical library</h1>
        <ul>
          {LIBRARY.map((p) => (
            <li key={p.chapter}>
              <button
                type="button"
                className={
                  p.chapter === page.chapter
                    ? 'library__item library__item--current'
                    : 'library__item'
                }
                aria-current={p.chapter === page.chapter ? 'page' : undefined}
                onClick={() => view.setState({ libraryChapter: p.chapter })}
              >
                <span className="mono">{p.chapter}</span> {ataTitle(p.chapter)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <article className="library__page">
        <p className="library__notice">
          Educational reference written for this simulator. Not a maintenance manual and not
          approved maintenance data.
        </p>
        <h2 className="sheet__title">
          <span className="mono">ATA {page.chapter}</span> {ataTitle(page.chapter)}
        </h2>

        <h3 className="sheet__heading">What the chapter covers</h3>
        <p>{page.covers}</p>

        <h3 className="sheet__heading">On this aircraft</h3>
        <p>{page.onThisAircraft}</p>

        <h3 className="sheet__heading">What a technician looks for</h3>
        <ul className="library__list">
          {page.inspection.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>

        {components.length > 0 && (
          <>
            <h3 className="sheet__heading">Components in this chapter on the aircraft</h3>
            <p className="library__components">{components.join(' · ')}</p>
          </>
        )}

        <h3 className="sheet__heading">In the real maintenance manual</h3>
        <p>{page.realManual}</p>

        <h3 className="sheet__heading">Sources</h3>
        <ul className="library__list">
          {page.sources.map((id) => {
            const source = sourceById(id)
            return source ? (
              <li key={id}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title}
                </a>{' '}
                <span className="muted">— {source.publisher}</span>
              </li>
            ) : null
          })}
        </ul>

        <div className="form__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => view.setState({ panel: 'none' })}
          >
            Close library
          </button>
        </div>
      </article>
    </div>
  )
}
