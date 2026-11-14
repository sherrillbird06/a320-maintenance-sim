import {
  CanvasTexture,
  DataTexture,
  DoubleSide,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NoColorSpace,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
  Vector2,
  type Object3D,
} from 'three'
import { heightToNormal, paintSkinHeight, type SkinLayout } from '../textures/detailMaps'
import { LIVERY, tailBands } from './livery'

/** One 2 m tile of skin: lap seams with double rivet rows, plus frame and stringer rows. */
const SKIN: SkinLayout = {
  sizePx: 2048,
  sizeM: 2,
  seamsU: [0.02],
  seamsV: [0.5],
  seamWidthM: 0.003,
  seamDepth: 1,
  rivetRows: [
    { axis: 'v', at: 0.008, pitchM: 0.022 },
    { axis: 'v', at: 0.032, pitchM: 0.022 },
    { axis: 'u', at: 0.488, pitchM: 0.022 },
    { axis: 'u', at: 0.512, pitchM: 0.022 },
    ...[0.27, 0.52, 0.77].map((at) => ({ axis: 'v' as const, at, pitchM: 0.03 })),
    ...[0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9].map((at) => ({
      axis: 'u' as const,
      at,
      pitchM: 0.03,
    })),
  ],
  rivetRadiusM: 0.003,
  rivetDepth: 0.35,
}

function skinNormalMap(): DataTexture {
  const { sizePx } = SKIN
  const data = heightToNormal(paintSkinHeight(SKIN), sizePx, sizePx, 1.6)
  const texture = new DataTexture(data, sizePx, sizePx, RGBAFormat, UnsignedByteType)
  texture.colorSpace = NoColorSpace
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.generateMipmaps = true
  texture.minFilter = LinearMipmapLinearFilter
  texture.magFilter = LinearFilter
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function canvas(width: number, height: number) {
  const element = document.createElement('canvas')
  element.width = width
  element.height = height
  const context = element.getContext('2d')
  if (!context) throw new Error('2D canvas is not available')
  return { element, context }
}

/** Striped tail: the model maps v from the bottom of the fin to the top. */
function tailTexture(): CanvasTexture {
  const { element, context } = canvas(64, 1024)
  for (const band of tailBands(11)) {
    context.fillStyle = band.colour
    // Canvas y runs downward; the bottom band belongs at the bottom of the image.
    const top = Math.round((1 - band.to) * 1024)
    context.fillRect(0, top, 64, Math.ceil((band.to - band.from) * 1024))
  }
  const texture = new CanvasTexture(element)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  // glTF UVs have v pointing down the image; the model's v points up the fin.
  texture.flipY = false
  return texture
}

function registrationTexture(): CanvasTexture {
  const { element, context } = canvas(1024, 256)
  context.clearRect(0, 0, 1024, 256)
  context.fillStyle = '#2a2f36'
  context.font = '700 190px Arial, Helvetica, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(LIVERY.registration, 512, 136)
  const texture = new CanvasTexture(element)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

// Low metalness: a strongly metallic paint takes on the colour of whatever surrounds it.
/** A cabin window: grey frame, rounded dark glass with a faint sky gradient, clear corners. */
function windowTexture(): CanvasTexture {
  const { element, context } = canvas(128, 192)
  const round = (x: number, y: number, w: number, h: number, r: number) => {
    context.beginPath()
    context.roundRect(x, y, w, h, r)
    context.fill()
  }
  context.clearRect(0, 0, 128, 192)
  context.fillStyle = '#5d646b'
  round(6, 8, 116, 176, 46)
  context.fillStyle = '#1d2227'
  round(13, 15, 102, 162, 40)
  const glass = context.createLinearGradient(0, 20, 0, 172)
  glass.addColorStop(0, '#2b3a49')
  glass.addColorStop(0.5, '#10161c')
  glass.addColorStop(1, '#070a0d')
  context.fillStyle = glass
  round(19, 21, 90, 150, 35)
  const texture = new CanvasTexture(element)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

const PAINT = { metalness: 0.12, roughness: 0.4, clearcoat: 1, clearcoatRoughness: 0.07 }

/**
 * Replaces the model's plain materials with the simulator's: painted skin with
 * seams and rivets where the mesh has a skin UV layout, the striped tail, and
 * the registration. Materials are matched by the names the model scripts give them.
 */
export function applyAircraftMaterials(root: Object3D): void {
  const skinPaint = new MeshPhysicalMaterial({
    color: LIVERY.silver,
    ...PAINT,
    normalMap: skinNormalMap(),
    normalScale: new Vector2(0.55, 0.55),
  })
  const smoothPaint = new MeshPhysicalMaterial({ color: LIVERY.silver, ...PAINT })
  const tail = new MeshPhysicalMaterial({ map: tailTexture(), ...PAINT, metalness: 0.15 })
  const registration = new MeshStandardMaterial({
    map: registrationTexture(),
    transparent: true,
    roughness: 0.5,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  })

  const cabinWindow = new MeshPhysicalMaterial({
    map: windowTexture(),
    transparent: true,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  })

  const swap = (mesh: Mesh, material: MeshStandardMaterial) => {
    switch (material.name) {
      case 'cabin_window':
        return cabinWindow
      case 'panel_gap':
        // Gap walls are single sheets that can be seen from either side.
        material.side = DoubleSide
        return material
      case 'fuselage_paint':
        return mesh.geometry.hasAttribute('uv') ? skinPaint : smoothPaint
      case 'tail_livery':
        return tail
      case 'decal_registration':
        return registration
      default:
        return material
    }
  }

  root.traverse((object) => {
    if (!(object instanceof Mesh)) return
    object.castShadow = true
    object.receiveShadow = true
    const current = object.material as MeshStandardMaterial | MeshStandardMaterial[]
    object.material = Array.isArray(current)
      ? current.map((material) => swap(object, material))
      : swap(object, current)
  })
}
