import { AIRCRAFT } from '../data/aircraft'
import type { ZoneId } from '../data/schema'

/**
 * Plan-view outline of the aircraft for the diagram, in metres: x aft from the
 * nose, y toward the aircraft's left. Built from the same measurements as the
 * 3D model (assets-src/blender/_fuselage.py and _surfaces.py), so the diagram
 * and the model agree.
 */
export type Point = [x: number, y: number]

export interface DiagramShape {
  id: string
  zone: ZoneId
  label: string
  points: Point[]
}

const D = AIRCRAFT.dimensions
const LENGTH = D.overallLength.value
const HALF_SPAN = D.wingspan.value / 2
const HALF_TAIL_SPAN = D.horizontalTailSpan.value / 2
const HALF_WIDTH = D.fuselageWidth.value / 2
const ENGINE_Y = D.engineCentrelineOffset.value
const INLET_X = D.noseToEngineInlet.value

/** Fuselage half-width at stations along its length. */
const HALF_WIDTHS: Point[] = [
  [0, 0.1], [0.2, 0.36], [0.5, 0.615], [1, 0.935], [1.5, 1.155], [2, 1.34], [2.5, 1.49], [3, 1.63],
  [3.5, 1.73], [4, 1.815], [4.5, 1.88], [5, 1.91], [5.5, 1.95], [6, HALF_WIDTH], [26, HALF_WIDTH],
  [27, 1.95], [28, 1.9], [29, 1.8], [30, 1.66], [31, 1.5], [32, 1.29], [33, 1.1], [34, 0.92],
  [35, 0.74], [36, 0.56], [37, 0.36], [37.5, 0.16], [LENGTH, 0.12],
] // prettier-ignore

/** Where the fuselage is divided between the forward, centre and rear zones. */
export const FORWARD_END_X = 12.5
export const REAR_START_X = 21.6
const COCKPIT_X: [number, number] = [1.4, 3.6]

function halfWidthAt(x: number): number {
  for (let i = 0; i < HALF_WIDTHS.length - 1; i++) {
    const [x0, w0] = HALF_WIDTHS[i] as Point
    const [x1, w1] = HALF_WIDTHS[i + 1] as Point
    if (x <= x1) return w0 + ((w1 - w0) * (x - x0)) / (x1 - x0)
  }
  return 0.12
}

/** A slice of the fuselage between two stations, as a closed outline. */
function fuselageSlice(from: number, to: number): Point[] {
  const stations = [from, ...HALF_WIDTHS.map(([x]) => x).filter((x) => x > from && x < to), to]
  const left = stations.map((x): Point => [x, halfWidthAt(x)])
  const right = stations.map((x): Point => [x, -halfWidthAt(x)]).reverse()
  return [...left, ...right]
}

const wingLe = (eta: number) => 13.18 + 0.518 * (eta - 2.5)
const wingTe = (eta: number) => 18.86 + 0.306 * Math.max(0, eta - 6.4)
const tailLe = (eta: number) => 32.88 + 0.648 * (eta - 2)
const tailTe = (eta: number) => 36.72 - 0.22 * (HALF_TAIL_SPAN - eta)

function wing(side: 1 | -1): Point[] {
  const root = HALF_WIDTH
  return [
    [wingLe(root), side * root],
    [wingLe(HALF_SPAN), side * HALF_SPAN],
    [wingTe(HALF_SPAN), side * HALF_SPAN],
    [wingTe(6.4), side * 6.4],
    [wingTe(root), side * root],
  ]
}

function tailplane(side: 1 | -1): Point[] {
  const root = 0.9
  return [
    [tailLe(root), side * root],
    [tailLe(HALF_TAIL_SPAN), side * HALF_TAIL_SPAN],
    [tailTe(HALF_TAIL_SPAN), side * HALF_TAIL_SPAN],
    [tailTe(root), side * root],
  ]
}

function engine(side: 1 | -1): Point[] {
  const y = side * ENGINE_Y
  const r = 1.16
  return [
    [INLET_X, y - r * 0.85], [INLET_X + 1.1, y - r], [INLET_X + 3.56, y - r * 0.8],
    [INLET_X + 4.8, y - 0.1], [INLET_X + 4.8, y + 0.1], [INLET_X + 3.56, y + r * 0.8],
    [INLET_X + 1.1, y + r], [INLET_X, y + r * 0.85],
  ] // prettier-ignore
}

/** Every outline on the diagram, back to front. */
export const DIAGRAM_SHAPES: DiagramShape[] = [
  { id: 'wing_lh', zone: 'B', label: 'Left wing', points: wing(1) },
  { id: 'wing_rh', zone: 'B', label: 'Right wing', points: wing(-1) },
  { id: 'tailplane_lh', zone: 'D', label: 'Left horizontal stabilizer', points: tailplane(1) },
  { id: 'tailplane_rh', zone: 'D', label: 'Right horizontal stabilizer', points: tailplane(-1) },
  { id: 'engine_1', zone: 'B', label: 'Engine 1', points: engine(1) },
  { id: 'engine_2', zone: 'B', label: 'Engine 2', points: engine(-1) },
  {
    id: 'fuselage_forward',
    zone: 'A',
    label: 'Forward fuselage',
    points: fuselageSlice(0, FORWARD_END_X),
  },
  {
    id: 'fuselage_centre',
    zone: 'B',
    label: 'Centre fuselage',
    points: fuselageSlice(FORWARD_END_X, REAR_START_X),
  },
  {
    id: 'fuselage_rear',
    zone: 'D',
    label: 'Rear fuselage',
    points: fuselageSlice(REAR_START_X, LENGTH),
  },
  { id: 'cockpit', zone: 'E', label: 'Cockpit', points: fuselageSlice(COCKPIT_X[0], COCKPIT_X[1]) },
]

/** Overall extent of the diagram, with a margin, for the drawing's view box. */
export const DIAGRAM_BOUNDS = {
  minX: -1,
  maxX: LENGTH + 1,
  minY: -HALF_SPAN - 1,
  maxY: HALF_SPAN + 1,
}

/** Outline as an SVG path. */
export function pathOf(points: readonly Point[]): string {
  return (
    points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ') +
    ' Z'
  )
}
