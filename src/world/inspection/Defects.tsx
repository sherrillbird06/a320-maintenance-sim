import { useMemo } from 'react'
import { CanvasTexture, Quaternion, SRGBColorSpace, Vector3 } from 'three'
import { DEFECT_TYPES } from '../../data/defects'
import { useSession } from '../../state/useSession'
import { createRng } from '../../sim/rng'

type Painter = (context: CanvasRenderingContext2D, size: number, rng: () => number) => void

/** A cut: a jagged dark slit across the tread with pale casing cords showing in it. */
const paintCut: Painter = (context, size, rng) => {
  const mid = size / 2
  const points: [number, number][] = []
  for (let i = 0; i <= 10; i++) {
    points.push([size * (0.12 + 0.076 * i), mid + (rng() - 0.5) * size * 0.14])
  }
  const stroke = (width: number, style: string) => {
    context.lineWidth = width
    context.strokeStyle = style
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    points.forEach(([x, y], i) => (i === 0 ? context.moveTo(x, y) : context.lineTo(x, y)))
    context.stroke()
  }
  stroke(size * 0.11, 'rgba(8, 8, 9, 0.55)')
  stroke(size * 0.07, 'rgba(3, 3, 4, 0.95)')
  // Cords at the bottom of the cut.
  context.strokeStyle = 'rgba(176, 164, 140, 0.9)'
  context.lineWidth = size * 0.008
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i] as [number, number]
    for (let k = -1; k <= 1; k++) {
      context.beginPath()
      context.moveTo(x + k * size * 0.018, y - size * 0.022)
      context.lineTo(x + k * size * 0.018 + size * 0.012, y + size * 0.022)
      context.stroke()
    }
  }
}

/** Worn through: a soft-edged patch where the rubber is gone and woven casing shows. */
const paintWorn: Painter = (context, size, rng) => {
  const mid = size / 2
  const fade = context.createRadialGradient(mid, mid, size * 0.08, mid, mid, size * 0.46)
  fade.addColorStop(0, 'rgba(96, 92, 84, 0.95)')
  fade.addColorStop(0.6, 'rgba(58, 56, 53, 0.8)')
  fade.addColorStop(1, 'rgba(30, 30, 30, 0)')
  context.fillStyle = fade
  context.save()
  context.translate(mid, mid)
  context.scale(1, 0.62)
  context.beginPath()
  context.arc(0, 0, size * 0.46, 0, Math.PI * 2)
  context.fill()
  context.restore()
  // Cross-ply cords, visible only toward the middle of the patch.
  context.lineWidth = size * 0.006
  for (let i = -24; i <= 24; i++) {
    for (const lean of [1, -1]) {
      const x = mid + i * size * 0.014
      const reach = size * 0.16 * Math.max(0, 1 - Math.abs(i) / 24) + rng() * size * 0.01
      context.strokeStyle = `rgba(178, 168, 146, ${0.45 * Math.max(0, 1 - Math.abs(i) / 22)})`
      context.beginPath()
      context.moveTo(x - lean * reach * 0.3, mid - reach)
      context.lineTo(x + lean * reach * 0.3, mid + reach)
      context.stroke()
    }
  }
}

/** A nick: a small sharp notch with bright torn metal around a dark centre. */
const paintNick: Painter = (context, size, rng) => {
  const mid = size / 2
  context.fillStyle = 'rgba(8, 8, 9, 0.95)'
  context.beginPath()
  context.moveTo(mid - size * 0.3, mid - size * 0.2)
  context.lineTo(mid + size * 0.12 + rng() * size * 0.05, mid - size * 0.03)
  context.lineTo(mid + size * 0.05, mid + size * 0.06)
  context.lineTo(mid - size * 0.3, mid + size * 0.22)
  context.closePath()
  context.fill()
  context.strokeStyle = 'rgba(236, 238, 242, 0.95)'
  context.lineWidth = size * 0.035
  context.lineJoin = 'round'
  context.stroke()
}

/** A dent: a shadowed hollow with a bright rim on one side and scrapes through the middle. */
const paintDent: Painter = (context, size, rng) => {
  const mid = size / 2
  const hollow = context.createRadialGradient(mid, mid, size * 0.03, mid, mid, size * 0.42)
  hollow.addColorStop(0, 'rgba(20, 20, 22, 0.8)')
  hollow.addColorStop(0.7, 'rgba(40, 40, 42, 0.35)')
  hollow.addColorStop(1, 'rgba(60, 60, 60, 0)')
  context.fillStyle = hollow
  context.beginPath()
  context.ellipse(mid, mid, size * 0.42, size * 0.3, 0.3, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = 'rgba(245, 246, 248, 0.7)'
  context.lineWidth = size * 0.02
  context.beginPath()
  context.ellipse(mid, mid, size * 0.34, size * 0.23, 0.3, Math.PI * 1.05, Math.PI * 1.75)
  context.stroke()
  context.strokeStyle = 'rgba(215, 218, 222, 0.75)'
  context.lineWidth = size * 0.008
  for (let i = 0; i < 6; i++) {
    const y = mid + (rng() - 0.5) * size * 0.2
    context.beginPath()
    context.moveTo(mid - size * 0.2, y)
    context.lineTo(mid + size * 0.2, y + (rng() - 0.5) * size * 0.06)
    context.stroke()
  }
}

const PAINTERS: Record<string, Painter> = {
  tire_cut: paintCut,
  tire_worn: paintWorn,
  blade_nick: paintNick,
  lip_dent: paintDent,
}

function defectTexture(name: string, seed: number): CanvasTexture {
  const size = 256
  const element = document.createElement('canvas')
  element.width = element.height = size
  const context = element.getContext('2d')
  if (!context) throw new Error('2D canvas is not available')
  PAINTERS[name]?.(context, size, createRng(seed))
  const texture = new CanvasTexture(element)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

const FACING = new Vector3(0, 0, 1)

/**
 * Draws the scenario's defects on the aircraft. They carry no labels and take no
 * clicks: the technician has to notice them and tag the part they are on.
 */
export function Defects() {
  const scenario = useSession((s) => s.scenario)
  const marks = useMemo(() => {
    if (!scenario) return []
    return scenario.defects.flatMap((defect, index) => {
      const type = DEFECT_TYPES.find((t) => t.id === defect.defectTypeId)
      if (!type || type.visual.kind !== 'decal') return []
      const normal = new Vector3(...defect.normal).normalize()
      return [
        {
          key: `${defect.componentId}-${index}`,
          size: type.visual.sizeM,
          position: new Vector3(...defect.position).addScaledVector(normal, 0.006),
          quaternion: new Quaternion().setFromUnitVectors(FACING, normal),
          texture: defectTexture(type.visual.texture, scenario.seed * 31 + index),
        },
      ]
    })
  }, [scenario])

  return (
    <>
      {marks.map((mark) => (
        <mesh
          key={mark.key}
          position={mark.position}
          quaternion={mark.quaternion}
          raycast={() => null}
        >
          <planeGeometry args={[mark.size, mark.size]} />
          <meshStandardMaterial
            map={mark.texture}
            transparent
            roughness={0.9}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-4}
          />
        </mesh>
      ))}
    </>
  )
}
