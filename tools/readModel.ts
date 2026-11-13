import { NodeIO } from '@gltf-transform/core'
import { getBounds } from '@gltf-transform/functions'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { MeshoptDecoder } from 'meshoptimizer'

export interface ModelSummary {
  nodeNames: string[]
  inspectableNodes: string[]
  triangles: number
  /** World-space bounding box of the whole model, in metres. */
  bounds: Box
  /** World-space bounding box of each named node. */
  nodeBounds: Record<string, Box>
}

export interface Box {
  min: [number, number, number]
  max: [number, number, number]
}

/** Reads a .glb from disk and reports its node names, inspectable nodes and triangle count. */
export async function readModel(path: string): Promise<ModelSummary> {
  await MeshoptDecoder.ready
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
  const document = await io.read(path)
  const root = document.getRoot()

  const nodeNames: string[] = []
  const inspectableNodes: string[] = []
  for (const node of root.listNodes()) {
    nodeNames.push(node.getName())
    if (node.getExtras().inspectable === true || node.getExtras().inspectable === 1) {
      inspectableNodes.push(node.getName())
    }
  }

  // Count triangles as drawn: once per node that uses a mesh, so shared meshes count each time.
  let triangles = 0
  for (const node of root.listNodes()) {
    const mesh = node.getMesh()
    if (!mesh) continue
    for (const primitive of mesh.listPrimitives()) {
      const indices = primitive.getIndices()
      const position = primitive.getAttribute('POSITION')
      const count = indices ? indices.getCount() : (position?.getCount() ?? 0)
      triangles += Math.floor(count / 3)
    }
  }

  const nodeBounds: Record<string, Box> = {}
  for (const node of root.listNodes()) nodeBounds[node.getName()] = getBounds(node)
  const scene = root.getDefaultScene() ?? root.listScenes()[0]
  const bounds: Box = scene ? getBounds(scene) : { min: [0, 0, 0], max: [0, 0, 0] }

  return { nodeNames, inspectableNodes, triangles, bounds, nodeBounds }
}
