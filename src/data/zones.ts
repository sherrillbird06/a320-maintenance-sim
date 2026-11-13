import type { Zone } from './schema'

/** Inspection areas from the owner's brief. Components live in A–E; F holds the system modules. */
export const ZONES: Zone[] = [
  { id: 'A', title: 'Forward fuselage' },
  { id: 'B', title: 'Wings and engines' },
  { id: 'C', title: 'Landing gear' },
  { id: 'D', title: 'Rear fuselage and tail' },
  { id: 'E', title: 'Cockpit' },
  { id: 'F', title: 'Aircraft systems' },
]

export const COCKPIT_ZONE = 'E'
export const SYSTEMS_ZONE = 'F'
