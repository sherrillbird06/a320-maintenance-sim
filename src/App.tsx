import { lazy, Suspense, useEffect, useState } from 'react'
import { Notice } from './app/Notice'
import { checkSupport, MIN_WIDTH_PX, readSupportEnv, type SupportResult } from './app/support'

const LookTestPage = lazy(() => import('./world/lookdev/LookTestPage'))
const AircraftView = lazy(() => import('./world/aircraft/AircraftView'))
const InspectionPage = lazy(() => import('./world/inspection/InspectionPage'))

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

export function App() {
  const support = useSupport()
  const scene = new URLSearchParams(window.location.search).get('scene')
  if (!support.ok) return <Notice {...UNSUPPORTED[support.reason]} />

  return (
    <div className="app">
      <header className="app__bar">
        <span className="app__title">A320 Maintenance &amp; Inspection Simulator</span>
        <span className="app__status">
          {scene === 'lookdev'
            ? 'Look test · materials and lighting'
            : scene === 'aircraft'
              ? 'Aircraft viewer · model in progress'
              : 'Training build · aircraft model in progress'}
        </span>
      </header>
      <Suspense fallback={<div className="scene" />}>
        {scene === 'lookdev' ? (
          <LookTestPage />
        ) : scene === 'aircraft' ? (
          <AircraftView />
        ) : (
          <InspectionPage />
        )}
      </Suspense>
      <footer className="app__banner">{TRAINING_BANNER}</footer>
    </div>
  )
}
