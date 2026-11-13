import { lazy, Suspense, useEffect, useState } from 'react'
import { Notice } from './app/Notice'
import { checkSupport, MIN_WIDTH_PX, readSupportEnv, type SupportResult } from './app/support'
import { SceneCanvas } from './world/SceneCanvas'

const LookTestPage = lazy(() => import('./world/lookdev/LookTestPage'))

export const TRAINING_BANNER = 'Training simulation — not approved maintenance data'

const UNSUPPORTED: Record<'no-webgl2' | 'desktop-required', { title: string; body: string }> = {
  'no-webgl2': {
    title: 'This browser cannot run the simulator',
    body: 'The simulator needs WebGL 2 for its 3D hangar. Use a current version of Chrome, Edge, Firefox or Safari with hardware acceleration turned on.',
  },
  'desktop-required': {
    title: 'A desktop or laptop is required',
    body: `The inspection uses a keyboard and mouse and needs a window at least ${MIN_WIDTH_PX} pixels wide. Open this page on a computer, or widen the window.`,
  },
}

function useSupport(): SupportResult {
  const [result, setResult] = useState(() => checkSupport(readSupportEnv()))
  useEffect(() => {
    const update = () => setResult(checkSupport(readSupportEnv()))
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return result
}

function EmptyHangarScene() {
  return (
    <>
      <color attach="background" args={['#15181c']} />
      <hemisphereLight args={['#dfe6ee', '#3a3d42', 1.2]} />
      <directionalLight position={[8, 14, 6]} intensity={1.5} castShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#6f7377" roughness={0.9} />
      </mesh>
      <gridHelper args={[120, 60, '#8a8f95', '#5c6166']} position={[0, 0.002, 0]} />
    </>
  )
}

export function App() {
  const support = useSupport()
  const scene = new URLSearchParams(window.location.search).get('scene')
  if (!support.ok) return <Notice {...UNSUPPORTED[support.reason]} />

  return (
    <div className="app">
      <header className="app__bar">
        <span className="app__title">A320 Maintenance &amp; Inspection Simulator</span>
        <span className="app__status">
          {scene === 'lookdev' ? 'Look test · materials and lighting' : 'Milestone 0 · foundations'}
        </span>
      </header>
      {scene === 'lookdev' ? (
        <Suspense fallback={<div className="scene" />}>
          <LookTestPage />
        </Suspense>
      ) : (
        <SceneCanvas>
          <EmptyHangarScene />
        </SceneCanvas>
      )}
      <footer className="app__banner">{TRAINING_BANNER}</footer>
    </div>
  )
}
