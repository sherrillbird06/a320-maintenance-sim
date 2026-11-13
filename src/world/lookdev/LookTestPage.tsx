import { Suspense } from 'react'
import { AssetErrorBoundary } from '../../app/AssetErrorBoundary'
import { SceneCanvas } from '../SceneCanvas'
import LookTest, { LOOKDEV_ASSET_URLS } from './LookTest'

/** The look test with its canvas and load-failure handling; loaded only for ?scene=lookdev. */
export default function LookTestPage() {
  return (
    <AssetErrorBoundary urls={LOOKDEV_ASSET_URLS}>
      <SceneCanvas cameraPosition={[2.3, 1.25, 2.6]}>
        <Suspense fallback={null}>
          <LookTest />
        </Suspense>
      </SceneCanvas>
    </AssetErrorBoundary>
  )
}
