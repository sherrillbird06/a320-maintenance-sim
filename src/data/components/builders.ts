import type { Component, ModelId, Side, SystemId, ZoneId } from '../schema'

/** The fields needed to describe a component before its side or position is known. */
export interface Seed {
  id: string
  name: string
  zone: ZoneId
  ata: string
  systems: readonly SystemId[]
  model?: ModelId
}

function toComponent(seed: Seed, side?: Side): Component {
  const component: Component = {
    id: seed.id,
    name: seed.name,
    zone: seed.zone,
    ata: seed.ata,
    model: seed.model ?? 'exterior',
    systems: [...seed.systems],
  }
  if (side) component.side = side
  return component
}

/** One component that exists once on the aircraft. Pass a side for a one-sided part. */
export function single(seed: Seed, side?: Side): Component {
  return toComponent(seed, side)
}

/** A left and a right copy: `aileron` becomes `aileron_lh` and `aileron_rh`. */
export function mirrored(seed: Seed): Component[] {
  return [
    toComponent({ ...seed, id: `${seed.id}_lh`, name: `${seed.name}, left` }, 'LH'),
    toComponent({ ...seed, id: `${seed.id}_rh`, name: `${seed.name}, right` }, 'RH'),
  ]
}

/** A numbered series counted from 1: `slat` becomes `slat_1` … `slat_n`. */
export function numbered(seed: Seed, count: number): Component[] {
  return Array.from({ length: count }, (_, index) =>
    toComponent({ ...seed, id: `${seed.id}_${index + 1}`, name: `${seed.name} ${index + 1}` }),
  )
}

/**
 * Engine-mounted parts, once per engine: `fan` becomes `eng1_fan` and `eng2_fan`.
 * Engine 1 is on the left wing, engine 2 on the right.
 */
export function perEngine(seed: Seed): Component[] {
  return [
    toComponent({ ...seed, id: `eng1_${seed.id}`, name: `Engine 1 ${seed.name}` }, 'LH'),
    toComponent({ ...seed, id: `eng2_${seed.id}`, name: `Engine 2 ${seed.name}` }, 'RH'),
  ]
}

/** Shorthand for seeds that share a zone and model file. */
export function seedsFor(zone: ZoneId, model: ModelId = 'exterior') {
  return (id: string, name: string, ata: string, systems: readonly SystemId[] = []): Seed => ({
    id,
    name,
    zone,
    ata,
    systems,
    model,
  })
}
