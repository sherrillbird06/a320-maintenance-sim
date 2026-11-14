import { useState } from 'react'
import { COMPONENTS } from '../data/components'
import { positionOf } from '../data/componentPositions'
import type { Component, ZoneId } from '../data/schema'
import { ZONES } from '../data/zones'
import { DIAGRAM_BOUNDS, DIAGRAM_SHAPES, pathOf } from '../sim/diagram'
import { useSession, view } from '../state/useSession'
import { ChapterLink } from './Library'

const ZONE_COLOURS: Record<ZoneId, string> = {
  A: '#4f7fae',
  B: '#5f8f6a',
  C: '#a8762b',
  D: '#8a5f9e',
  E: '#b0554f',
  F: '#6b737b',
}

export function openDiagram() {
  view.setState({ panel: 'diagram' })
}

/**
 * Plan view of the aircraft by inspection zone. It shows where components are
 * and what the current work order requires; it never shows where defects are.
 */
export function Diagram() {
  const phase = useSession((s) => s.phase)
  const template = useSession((s) => s.template)
  const examined = useSession((s) => s.examined)
  const inspecting = phase === 'inspecting'
  const [zone, setZone] = useState<ZoneId>(inspecting ? (template.zones[0] ?? 'A') : 'A')
  const [picked, setPicked] = useState<string | null>(null)

  const required = new Set(inspecting ? template.checklist.flatMap((item) => item.components) : [])
  const seen = new Set(examined)
  const inZone = COMPONENTS.filter((c) => c.zone === zone)
  const pickedComponent = COMPONENTS.find((c) => c.id === picked)
  const { minX, maxX, minY, maxY } = DIAGRAM_BOUNDS

  const dot = (component: Component) => {
    const position = positionOf(component.id)
    if (!position) return null
    const isRequired = required.has(component.id)
    const isSeen = seen.has(component.id)
    const current = component.zone === zone
    return (
      <circle
        key={component.id}
        cx={position[0]}
        cy={position[1]}
        r={picked === component.id ? 0.42 : isRequired ? 0.34 : 0.2}
        className={[
          'diagram__dot',
          isRequired ? 'diagram__dot--required' : '',
          isSeen ? 'diagram__dot--seen' : '',
          picked === component.id ? 'diagram__dot--picked' : '',
        ].join(' ')}
        fill={ZONE_COLOURS[component.zone]}
        opacity={current ? 1 : 0.25}
        onClick={() => {
          setZone(component.zone)
          setPicked(component.id)
        }}
      >
        <title>{component.name}</title>
      </circle>
    )
  }

  return (
    <div className="sheet sheet--diagram" role="dialog" aria-label="Aircraft diagram">
      <section className="sheet__section">
        <h1 className="sheet__title">Aircraft diagram</h1>
        <p className="muted diagram__lead">
          Plan view, nose to the left. Select a zone or a marker.{' '}
          {inspecting
            ? 'Ringed markers are on this work order; filled rings have been examined.'
            : 'The diagram shows where components are, never where a defect is.'}
        </p>
        <svg
          className="diagram"
          viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
          role="img"
          aria-label="Plan view of the aircraft by inspection zone"
        >
          {DIAGRAM_SHAPES.map((shape) => (
            <path
              key={shape.id}
              d={pathOf(shape.points)}
              className={
                shape.zone === zone ? 'diagram__shape diagram__shape--current' : 'diagram__shape'
              }
              stroke={ZONE_COLOURS[shape.zone]}
              fill={ZONE_COLOURS[shape.zone]}
              onClick={() => {
                setZone(shape.zone)
                setPicked(null)
              }}
            >
              <title>
                Zone {shape.zone}: {shape.label}
              </title>
            </path>
          ))}
          {COMPONENTS.map(dot)}
        </svg>
        <div className="diagram__zones" role="group" aria-label="Inspection zones">
          {ZONES.filter((z) => z.id !== 'F').map((z) => (
            <button
              key={z.id}
              type="button"
              className={
                z.id === zone
                  ? 'button diagram__zone diagram__zone--current'
                  : 'button diagram__zone'
              }
              aria-pressed={z.id === zone}
              onClick={() => {
                setZone(z.id)
                setPicked(null)
              }}
            >
              <span className="diagram__swatch" style={{ background: ZONE_COLOURS[z.id] }} />
              <span className="mono">{z.id}</span> {z.title}
            </button>
          ))}
        </div>
      </section>

      <section className="sheet__section">
        <h2 className="sheet__heading">
          Zone {zone} — {ZONES.find((z) => z.id === zone)?.title} ({inZone.length} components)
        </h2>
        {pickedComponent && (
          <dl className="facts">
            <dt>Selected marker</dt>
            <dd>
              {pickedComponent.name} <span className="mono muted">{pickedComponent.id}</span>
            </dd>
            <dt>ATA</dt>
            <dd>
              <ChapterLink chapter={pickedComponent.ata} />
            </dd>
          </dl>
        )}
        <table className="table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Identifier</th>
              <th>ATA</th>
              {inspecting && <th>This work order</th>}
            </tr>
          </thead>
          <tbody>
            {inZone.map((component) => (
              <tr
                key={component.id}
                className={picked === component.id ? 'diagram__row--picked' : undefined}
                onClick={() => setPicked(component.id)}
              >
                <td>{component.name}</td>
                <td className="mono">{component.id}</td>
                <td className="mono">{component.ata}</td>
                {inspecting && (
                  <td>
                    {!required.has(component.id) ? (
                      <span className="muted">—</span>
                    ) : seen.has(component.id) ? (
                      <span className="chip chip--done">Examined</span>
                    ) : (
                      <span className="chip chip--caution">To examine</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sheet__section sheet__section--actions">
        <button
          type="button"
          className="button button--primary"
          onClick={() => view.setState({ panel: 'none' })}
        >
          Close diagram
        </button>
      </section>
    </div>
  )
}
