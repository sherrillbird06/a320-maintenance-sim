export interface ModelCheckInput {
  /** Which model file is being checked; used in messages. */
  model: string
  /** Registry ids that this model file is expected to contain. */
  componentIds: string[]
  /** Every node name in the model file. */
  nodeNames: string[]
  /** Names of nodes the modeller marked as inspectable (glTF extras `inspectable: true`). */
  inspectableNodes: string[]
}

/**
 * The registry and a model file must agree in both directions: every component
 * has a mesh the player can select, and nothing is selectable without a record.
 * Returns one message per disagreement.
 */
export function checkModels({
  model,
  componentIds,
  nodeNames,
  inspectableNodes,
}: ModelCheckInput): string[] {
  const nodes = new Set(nodeNames)
  const inspectable = new Set(inspectableNodes)
  const registered = new Set(componentIds)
  const problems: string[] = []

  for (const id of componentIds) {
    if (!nodes.has(id)) {
      problems.push(`${id}: no node with this name in the ${model} model`)
    } else if (!inspectable.has(id)) {
      problems.push(`${id}: node is not marked inspectable in the ${model} model`)
    }
  }
  for (const name of inspectableNodes) {
    if (!registered.has(name)) {
      problems.push(`${name}: marked inspectable in the ${model} model but not in the registry`)
    }
  }
  return problems
}
