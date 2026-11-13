import type { Component } from '../schema'
import { COCKPIT } from './cockpit'
import { ENGINES } from './engine'
import { FORWARD_FUSELAGE } from './forwardFuselage'
import { LANDING_GEAR } from './landingGear'
import { TAIL } from './tail'
import { WINGS } from './wing'

/**
 * Every inspectable component on the aircraft. A component's id is also the
 * name of its mesh in the model file, which is how data and 3D stay in step.
 */
export const COMPONENTS: Component[] = [
  ...FORWARD_FUSELAGE,
  ...WINGS,
  ...ENGINES,
  ...LANDING_GEAR,
  ...TAIL,
  ...COCKPIT,
]

const INDEX = new Map(COMPONENTS.map((component) => [component.id, component]))

export function byId(id: string): Component | undefined {
  return INDEX.get(id)
}
