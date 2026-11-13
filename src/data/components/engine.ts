import type { Component } from '../schema'
import { perEngine, seedsFor } from './builders'

const b = seedsFor('B')

/**
 * Zone B — the two CFM56-5B power plants. Each record exists once per engine.
 * The fan's blades are child meshes of the fan, not separate records.
 */
export const ENGINES: Component[] = [
  ...perEngine(b('inlet_cowl', 'inlet cowl', '71', ['engine', 'pneumatic'])),
  ...perEngine(b('spinner', 'fan spinner', '72', ['engine'])),
  ...perEngine(b('fan', 'fan', '72', ['engine'])),
  ...perEngine(b('fan_cowl_inboard', 'fan cowl door, inboard', '71', ['engine'])),
  ...perEngine(b('fan_cowl_outboard', 'fan cowl door, outboard', '71', ['engine'])),
  ...perEngine(
    b('reverser_cowl_inboard', 'thrust reverser cowl, inboard', '78', ['engine', 'hydraulic']),
  ),
  ...perEngine(
    b('reverser_cowl_outboard', 'thrust reverser cowl, outboard', '78', ['engine', 'hydraulic']),
  ),
  ...perEngine(b('exhaust_nozzle', 'exhaust nozzle', '78', ['engine'])),
  ...perEngine(b('exhaust_plug', 'exhaust plug', '78', ['engine'])),
  ...perEngine(b('pylon', 'pylon', '54', ['engine', 'fire-protection'])),
  ...perEngine(b('drain_mast', 'drain mast', '71', ['engine'])),
]
