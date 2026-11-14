import { Environment, useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Suspense, useMemo } from 'react'
import { Box3 } from 'three'
import { AssetErrorBoundary } from '../../app/AssetErrorBoundary'
import { useSession } from '../../state/useSession'
import { InspectionUi } from '../../ui/InspectionUi'
import { applyAircraftMaterials } from '../aircraft/materials'
import { modelUrl } from '../loadModel'
import { Hangar, HANGAR_URL } from '../hangar/Hangar'
import { ENV_URL, Floor, FLOOR_URLS } from '../lookdev/LookTest'
import { RENDER_CONFIG } from '../renderConfig'
import { SceneCanvas } from '../SceneCanvas'
import { Defects } from './Defects'
import { Player } from './Player'

const EXTERIOR_URL = modelUrl('exterior')
const URLS = [EXTERIOR_URL, HANGAR_URL, ENV_URL, ...Object.values(FLOOR_URLS)]
const AIRCRAFT_ROOT = 'aircraft-root'
/** The model's X axis starts at the nose; this centres the aircraft on the floor. */
const AIRCRAFT_OFFSET: [number, number, number] = [-18, 0, 0]

function Aircraft() {
  const { scene } = useGLTF(EXTERIOR_URL)
  useMemo(() => applyAircraftMaterials(scene), [scene])
  return (
    <group name={AIRCRAFT_ROOT} position={AIRCRAFT_OFFSET}>
      <primitive object={scene} />
      <Defects />
    </group>
  )
}

/** A thin box around the selected component, so the technician can see what the tag is on. */
function SelectionBox() {
  const selection = useSession((s) => s.selection)
  const scene = useThree((s) => s.scene)
  const box = useMemo(() => {
    const object = selection && scene.getObjectByName(selection.componentId)
    return object ? new Box3().setFromObject(object) : null
  }, [selection, scene])
  return box ? <box3Helper args={[box, '#5b9bd5']} /> : null
}

/** The inspection: hangar floor, aircraft, the scenario's defects and the technician. */
export default function InspectionPage() {
  return (
    <AssetErrorBoundary urls={URLS}>
      <div className="inspection">
        <SceneCanvas cameraPosition={[-27, 1.7, 13]}>
          <Suspense fallback={null}>
            <Environment
              files={ENV_URL}
              background
              backgroundBlurriness={0.12}
              backgroundIntensity={0.6}
              environmentIntensity={RENDER_CONFIG.envIntensity}
            />
            <directionalLight
              position={[10, 40, 20]}
              intensity={2.2}
              castShadow
              shadow-mapSize={[4096, 4096]}
              shadow-camera-left={-30}
              shadow-camera-right={30}
              shadow-camera-top={30}
              shadow-camera-bottom={-30}
              shadow-camera-far={120}
              shadow-bias={-0.0005}
            />
            <hemisphereLight args={['#e8edf2', '#5a5d61', 0.55]} />
            <Floor />
            <Hangar />
            <Aircraft />
            <SelectionBox />
          </Suspense>
          <Player aircraftRoot={AIRCRAFT_ROOT} />
        </SceneCanvas>
        <InspectionUi />
      </div>
    </AssetErrorBoundary>
  )
}
