import { AgXToneMapping, type ToneMapping } from 'three'

export interface RenderConfig {
  toneMapping: ToneMapping
  /** Linear exposure multiplier applied before tone mapping. */
  exposure: number
  /** Edge length in pixels of each shadow map. */
  shadowMapSize: number
  /** Multiplier on image-based lighting from the environment map. */
  envIntensity: number
}

/** One set of renderer settings shared by every scene, so assets judged in one look right in all. */
export const RENDER_CONFIG: RenderConfig = {
  toneMapping: AgXToneMapping,
  exposure: 1,
  shadowMapSize: 2048,
  envIntensity: 1,
}
