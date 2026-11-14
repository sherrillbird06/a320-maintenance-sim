import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import { AssetErrorBoundary } from '../../app/AssetErrorBoundary'
import { modelUrl } from '../loadModel'
import { ENV_URL, Floor, FLOOR_URLS } from '../lookdev/LookTest'
import { RENDER_CONFIG } from '../renderConfig'
import { SceneCanvas } from '../SceneCanvas'

const AIRFRAME_URL = modelUrl('exterior')
const URLS = [AIRFRAME_URL, ENV_URL, ...Object.values(FLOOR_URLS)]

function Airframe() {
  const { scene } = useGLTF(AIRFRAME_URL)
  useMemo(() => {
    scene.traverse((object) => {
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])
  // The model's X axis runs aft from the nose; centre it over the floor.
  return <primitive object={scene} position={[-18, 0, 0]} />
}

function vectorParam(name: string, fallback: [number, number, number]): [number, number, number] {
  const raw = new URLSearchParams(window.location.search).get(name)
  const parts = raw?.split(',').map(Number)
  if (parts?.length === 3 && parts.every(Number.isFinite)) return parts as [number, number, number]
  return fallback
}

/** The aircraft on the hangar floor, free to orbit. In-progress view of Milestone 1. */
export default function AircraftView() {
  return (
    <AssetErrorBoundary urls={URLS}>
      <SceneCanvas cameraPosition={vectorParam('cam', [-26, 7, 24])}>
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
          <Floor />
          <Airframe />
        </Suspense>
        <OrbitControls
          target={vectorParam('look', [0, 3.5, 0])}
          maxPolarAngle={Math.PI / 2 - 0.02}
          maxDistance={70}
        />
      </SceneCanvas>
    </AssetErrorBoundary>
  )
}
