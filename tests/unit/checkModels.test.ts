import { describe, expect, it } from 'vitest'
import { checkModels } from '../../tools/checkModels'

describe('checkModels', () => {
  const componentIds = ['radome', 'rudder']

  it('passes when every component has a node and every inspectable node has a record', () => {
    expect(
      checkModels({
        model: 'exterior',
        componentIds,
        nodeNames: ['radome', 'rudder', 'fuselage_frame'],
        inspectableNodes: ['radome', 'rudder'],
      }),
    ).toEqual([])
  })

  it('names a component that has no node in the model', () => {
    expect(
      checkModels({
        model: 'exterior',
        componentIds,
        nodeNames: ['radome'],
        inspectableNodes: ['radome'],
      }),
    ).toEqual(['rudder: no node with this name in the exterior model'])
  })

  it('names a node marked inspectable that has no registry record', () => {
    expect(
      checkModels({
        model: 'cockpit',
        componentIds,
        nodeNames: ['radome', 'rudder', 'cup_holder'],
        inspectableNodes: ['radome', 'rudder', 'cup_holder'],
      }),
    ).toEqual(['cup_holder: marked inspectable in the cockpit model but not in the registry'])
  })

  it('names a component whose node exists but is not marked inspectable', () => {
    expect(
      checkModels({
        model: 'exterior',
        componentIds,
        nodeNames: ['radome', 'rudder'],
        inspectableNodes: ['radome'],
      }),
    ).toEqual(['rudder: node is not marked inspectable in the exterior model'])
  })
})
