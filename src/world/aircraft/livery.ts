import { AIRCRAFT } from '../../data/aircraft'

/**
 * Paint scheme inspired by a silver airline livery with a striped tail. It uses
 * no airline name, logo or wordmark; the only marking is the fictional registration.
 */
export const LIVERY = {
  silver: '#b7bcc1',
  red: '#a3262e',
  blue: '#1d3f73',
  registration: AIRCRAFT.registration.value,
} as const

export interface Band {
  /** Start and end of the band up the tail, 0 at the bottom and 1 at the top. */
  from: number
  to: number
  colour: string
}

/** Equal horizontal bands for the fin, cycling blue, silver, red, silver. */
export function tailBands(count: number): Band[] {
  const cycle = [LIVERY.blue, LIVERY.silver, LIVERY.red, LIVERY.silver]
  return Array.from({ length: count }, (_, i) => ({
    from: i / count,
    to: i === count - 1 ? 1 : (i + 1) / count,
    colour: cycle[i % cycle.length] as string,
  }))
}
