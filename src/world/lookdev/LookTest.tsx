import { Environment, OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import {
  DataTexture,
  DoubleSide,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  type MeshStandardMaterial,
  NoColorSpace,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  Vector2,
  type Texture,
} from 'three'
import { AIRCRAFT } from '../../data/aircraft'
import { assetUrl, modelUrl } from '../loadModel'
import { RENDER_CONFIG } from '../renderConfig'
import { heightToNormal, paintSkinHeight, type SkinLayout } from '../textures/detailMaps'

export const ENV_URL = assetUrl('env/hangar_interior_1k.hdr')
const TIRE_URL = modelUrl('lookdev_tire')
export const FLOOR_URLS = {
  map: assetUrl('textures/floor/hangar_concrete_floor_diff_2k.webp'),
  normalMap: assetUrl('textures/floor/hangar_concrete_floor_nor_gl_2k.webp'),
  arm: assetUrl('textures/floor/hangar_concrete_floor_arm_2k.webp'),
}

/** Every file this scene downloads; used to name the culprit if one fails. */
export const LOOKDEV_ASSET_URLS = [ENV_URL, TIRE_URL, ...Object.values(FLOOR_URLS)]

const FLOOR_SIZE_M = 60
/** The floor scan covers a 2 m square. */
const FLOOR_TILE_M = 2

const SKIN_TILE_M = 2
/** One 2 m tile of fuselage skin: lap seams, frame and stringer rivet rows. */
const SKIN_LAYOUT: SkinLayout = {
  sizePx: 2048,
  sizeM: SKIN_TILE_M,
  seamsU: [0.02],
  seamsV: [0.5],
  seamWidthM: 0.003,
  seamDepth: 1,
  rivetRows: [
    // Double rows either side of each seam.
    { axis: 'v', at: 0.008, pitchM: 0.022 },
    { axis: 'v', at: 0.032, pitchM: 0.022 },
    { axis: 'u', at: 0.488, pitchM: 0.022 },
    { axis: 'u', at: 0.512, pitchM: 0.022 },
    // Frames.
    ...[0.27, 0.52, 0.77].map((at) => ({ axis: 'v' as const, at, pitchM: 0.03 })),
    // Stringers.
    ...[0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9].map((at) => ({
      axis: 'u' as const,
      at,
      pitchM: 0.03,
    })),
  ],
  rivetRadiusM: 0.003,
  rivetDepth: 0.35,
}

function useSkinNormalMap(): DataTexture {
  return useMemo(() => {
    const { sizePx } = SKIN_LAYOUT
    const normal = heightToNormal(paintSkinHeight(SKIN_LAYOUT), sizePx, sizePx, 1.6)
    const texture = new DataTexture(normal, sizePx, sizePx, RGBAFormat, UnsignedByteType)
    texture.colorSpace = NoColorSpace
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.generateMipmaps = true
    texture.minFilter = LinearMipmapLinearFilter
    texture.magFilter = LinearFilter
    texture.anisotropy = 8
    texture.needsUpdate = true
    return texture
  }, [])
}

function tile(texture: Texture, repeat: number) {
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(repeat, repeat)
  texture.anisotropy = 8
}

export function Floor() {
  const textures = useTexture(FLOOR_URLS)
  const repeat = FLOOR_SIZE_M / FLOOR_TILE_M
  textures.map.colorSpace = SRGBColorSpace
  tile(textures.map, repeat)
  tile(textures.normalMap, repeat)
  tile(textures.arm, repeat)
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[FLOOR_SIZE_M, FLOOR_SIZE_M]} />
      {/* The ARM map packs ambient occlusion, roughness and metalness in R, G and B. */}
      <meshStandardMaterial
        map={textures.map}
        normalMap={textures.normalMap}
        aoMap={textures.arm}
        roughnessMap={textures.arm}
        roughness={0.8}
        normalScale={new Vector2(0.7, 0.7)}
        envMapIntensity={1}
      />
    </mesh>
  )
}

/** A painted safety line on the floor. */
function FloorLine() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 1.4]} receiveShadow>
      <planeGeometry args={[12, 0.12]} />
      <meshStandardMaterial
        color="#c9a227"
        roughness={0.55}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  )
}

function Tire() {
  const { scene } = useGLTF(TIRE_URL)
  useMemo(() => {
    scene.traverse((object) => {
      object.castShadow = true
      object.receiveShadow = true
      // Rubber is nearly matte: keep the bright hangar from greying it out.
      if (object instanceof Mesh && object.name === 'lookdev_tire') {
        const material = object.material as MeshStandardMaterial
        material.envMapIntensity = 0.35
      }
    })
  }, [scene])
  // The model's origin is the wheel centre; lift it so the tread rests on the floor.
  return <primitive object={scene} position={[0, (46 * 0.0254) / 2, 0]} rotation={[0, -1.15, 0]} />
}

/** A section of fuselage side skin at the aircraft's real radius. */
function FuselagePanel() {
  const normalMap = useSkinNormalMap()
  const radius = AIRCRAFT.dimensions.fuselageWidth.value / 2
  const arc = 1.1
  const length = 4
  const repeat = useMemo(
    () => new Vector2((radius * arc) / SKIN_TILE_M, length / SKIN_TILE_M),
    [radius],
  )
  normalMap.repeat.copy(repeat)
  return (
    <mesh position={[0.2, 1.75, -1.9]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, length, 96, 1, true, -arc / 2, arc]} />
      <meshPhysicalMaterial
        color="#a9afb5"
        metalness={0.55}
        roughness={0.42}
        clearcoat={1}
        clearcoatRoughness={0.07}
        normalMap={normalMap}
        normalScale={new Vector2(0.6, 0.6)}
        side={DoubleSide}
        envMapIntensity={1.1}
      />
    </mesh>
  )
}

/** Painted skin, tire rubber and hangar floor under the lighting every later scene uses. */
export default function LookTest() {
  return (
    <>
      <Environment
        files={ENV_URL}
        background
        backgroundBlurriness={0.12}
        backgroundIntensity={0.6}
        environmentIntensity={RENDER_CONFIG.envIntensity}
      />
      <directionalLight
        position={[5, 11, 7]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[RENDER_CONFIG.shadowMapSize, RENDER_CONFIG.shadowMapSize]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
      <Floor />
      <FloorLine />
      <Tire />
      <FuselagePanel />
      <OrbitControls
        target={[0.1, 0.8, -0.5]}
        maxPolarAngle={Math.PI / 2 - 0.03}
        minDistance={0.6}
        maxDistance={14}
      />
    </>
  )
}
