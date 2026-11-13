import { Canvas } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { RENDER_CONFIG } from './renderConfig'

interface SceneCanvasProps {
  children: ReactNode
}

/** The single WebGL canvas, configured from RENDER_CONFIG. */
export function SceneCanvas({ children }: SceneCanvasProps) {
  return (
    <Canvas
      className="scene"
      shadows
      dpr={[1, 2]}
      camera={{ position: [6, 1.7, 10], fov: 50, near: 0.05, far: 400 }}
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
