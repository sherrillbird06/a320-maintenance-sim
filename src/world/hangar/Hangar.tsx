import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import { Color, DoubleSide, Mesh, type MeshStandardMaterial } from 'three'
import { modelUrl } from '../loadModel'

export const HANGAR_URL = modelUrl('hangar')

/** Parts of the building itself: they enclose the scene, so they must not shadow everything in it. */
const BUILDING = /^hangar_(shell|roof_structure|columns|doors|lights)/

const GLOW: Record<string, [colour: string, intensity: number]> = {
  lamp_emissive: ['#fff4dc', 6],
  screen_emissive: ['#9fc4e6', 1.2],
  hangar_glazing: ['#b9d3e8', 0.9],
}

/** The maintenance hangar and its equipment, built by assets-src/blender/hangar.py. */
export function Hangar() {
  const { scene } = useGLTF(HANGAR_URL)
  useMemo(() => {
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return
      let building = false
      for (let node: typeof object.parent = object; node; node = node.parent) {
        if (BUILDING.test(node.name)) building = true
      }
      object.castShadow = !building
      object.receiveShadow = true
      const materials = (
        Array.isArray(object.material) ? object.material : [object.material]
      ) as MeshStandardMaterial[]
      for (const material of materials) {
        // Walls and roof are single sheets seen from inside.
        if (building) material.side = DoubleSide
        const glow = GLOW[material.name]
        if (glow) {
          material.emissive = new Color(glow[0])
          material.emissiveIntensity = glow[1]
        }
      }
    })
  }, [scene])
  return <primitive object={scene} />
}
