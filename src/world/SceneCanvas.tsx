import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { RENDER_CONFIG } from './renderConfig'

interface SceneCanvasProps {
  children: ReactNode
  /** Where the camera starts, in metres. */
  cameraPosition?: [number, number, number]
}

/**
 * Browser tests run on a software renderer with no GPU, where the full scene takes seconds per
 * frame. Under ?e2e=1 the canvas draws only when something changes, at low resolution, without shadows.
 */
const TEST_MODE =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('e2e')

/** The single WebGL canvas, configured from RENDER_CONFIG. */
export function SceneCanvas({ children, cameraPosition = [6, 1.7, 10] }: SceneCanvasProps) {
  return (
    <Canvas
      className="scene"
      shadows={!TEST_MODE}
      dpr={TEST_MODE ? 0.35 : [1, 2]}
      frameloop={TEST_MODE ? 'demand' : 'always'}
      camera={{ position: cameraPosition, fov: 45, near: 0.05, far: 400 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = RENDER_CONFIG.toneMapping
        gl.toneMappingExposure = RENDER_CONFIG.exposure
      }}
    >
      {children}
    </Canvas>
  )
}
