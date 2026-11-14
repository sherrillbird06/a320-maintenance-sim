import { PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  MathUtils,
  Raycaster,
  Vector2,
  Vector3,
  type Object3D,
  type PerspectiveCamera,
  type SpotLight,
} from 'three'
import { byId } from '../../data/components'
import { session, useSession, useView, view } from '../../state/useSession'

const EYE_HEIGHT_M = 1.7
const CROUCH_HEIGHT_M = 0.95
const WALK_SPEED = 2.4
const FAST_SPEED = 5
const NORMAL_FOV = 50
const ZOOM_FOV = 16
/** How far the technician can reach to point at a part. */
const REACH_M = 12
/** Walkable area of the hangar floor, metres from its centre. */
const BOUNDS = { x: 34, z: 28 }

/** The registry component an object belongs to: the nearest ancestor whose name is a component id. */
function componentOf(object: Object3D | null): string | null {
  for (let node = object; node; node = node.parent) {
    if (byId(node.name)) return node.name
  }
  return null
}

interface PlayerProps {
  /** Name of the scene object that holds the aircraft model. */
  aircraftRoot: string
}

/**
 * First-person technician: walk with W A S D, crouch with C, look by capturing
 * the mouse, point at a part and click to select it.
 */
export function Player({ aircraftRoot }: PlayerProps) {
  const { camera, scene, gl } = useThree()
  const phase = useSession((s) => s.phase)
  const panel = useView((s) => s.panel)
  const flashlight = useView((s) => s.flashlight)
  const keys = useRef(new Set<string>())
  const zoom = useRef(false)
  const light = useRef<SpotLight>(null)
  const raycaster = useMemo(() => new Raycaster(), [])
  const active = phase === 'inspecting' && panel === 'none'

  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    camera.position.y = EYE_HEIGHT_M
    // Browser tests cannot capture the mouse, so under ?e2e=1 they move the camera directly.
    if (new URLSearchParams(window.location.search).has('e2e')) {
      Object.assign(window, { __camera: camera, __invalidate: invalidate })
    }
  }, [camera, invalidate])

  // Leave look mode whenever a panel opens or the inspection ends.
  useEffect(() => {
    if (!active && document.pointerLockElement) document.exitPointerLock()
    if (!active) keys.current.clear()
  }, [active])

  useEffect(() => {
    const pick = () => {
      const root = scene.getObjectByName(aircraftRoot)
      if (!root) return null
      raycaster.far = REACH_M
      raycaster.setFromCamera(new Vector2(0, 0), camera)
      const hit = raycaster.intersectObject(root, true)[0]
      const componentId = componentOf(hit?.object ?? null)
      if (!hit || !componentId) return null
      const point = root.worldToLocal(hit.point.clone())
      return { componentId, point: [point.x, point.y, point.z] as [number, number, number] }
    }

    const onKey = (event: KeyboardEvent) => {
      if (session.getState().phase !== 'inspecting') return
      const typing =
        event.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)
      if (typing) return
      const down = event.type === 'keydown'
      if (down && event.code === 'Tab') {
        event.preventDefault()
        view.setState({ panel: view.getState().panel === 'workstation' ? 'none' : 'workstation' })
        return
      }
      if (view.getState().panel !== 'none') return
      if (down && event.code === 'KeyF') view.setState({ flashlight: !view.getState().flashlight })
      if (down && event.code === 'KeyE' && session.getState().selection)
        view.setState({ panel: 'report' })
      if (down) keys.current.add(event.code)
      else keys.current.delete(event.code)
    }
    const onMouseDown = (event: MouseEvent) => {
      if (!document.pointerLockElement) return
      if (event.button === 2) zoom.current = true
      if (event.button === 0) session.getState().select(pick())
    }
    const onMouseUp = (event: MouseEvent) => {
      if (event.button === 2) zoom.current = false
    }
    const onLockChange = () => {
      const looking = document.pointerLockElement === gl.domElement
      view.setState({ looking })
      if (!looking) {
        keys.current.clear()
        zoom.current = false
      }
    }
    const noMenu = (event: Event) => event.preventDefault()
    // Capture the mouse only from a click on the 3D view itself, and only while inspecting with no panel open.
    const capture = () => {
      const inspecting =
        session.getState().phase === 'inspecting' && view.getState().panel === 'none'
      if (inspecting && !document.pointerLockElement) void gl.domElement.requestPointerLock()
    }
    const hover = window.setInterval(() => {
      if (!document.pointerLockElement) return
      const id = pick()?.componentId ?? null
      if (id !== view.getState().hoverId) view.setState({ hoverId: id })
    }, 120)

    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('pointerlockchange', onLockChange)
    gl.domElement.addEventListener('contextmenu', noMenu)
    gl.domElement.addEventListener('click', capture)
    return () => {
      window.clearInterval(hover)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('pointerlockchange', onLockChange)
      gl.domElement.removeEventListener('contextmenu', noMenu)
      gl.domElement.removeEventListener('click', capture)
    }
  }, [aircraftRoot, camera, gl, raycaster, scene])

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const pressed = keys.current
    const forward =
      Number(pressed.has('KeyW') || pressed.has('ArrowUp')) -
      Number(pressed.has('KeyS') || pressed.has('ArrowDown'))
    const strafe =
      Number(pressed.has('KeyD') || pressed.has('ArrowRight')) -
      Number(pressed.has('KeyA') || pressed.has('ArrowLeft'))

    if (active && (forward !== 0 || strafe !== 0)) {
      const heading = camera.getWorldDirection(new Vector3()).setY(0).normalize()
      const side = new Vector3(-heading.z, 0, heading.x)
      const speed = pressed.has('ShiftLeft') || pressed.has('ShiftRight') ? FAST_SPEED : WALK_SPEED
      const step = heading
        .multiplyScalar(forward)
        .add(side.multiplyScalar(strafe))
        .normalize()
        .multiplyScalar(speed * delta)
      camera.position.x = MathUtils.clamp(camera.position.x + step.x, -BOUNDS.x, BOUNDS.x)
      camera.position.z = MathUtils.clamp(camera.position.z + step.z, -BOUNDS.z, BOUNDS.z)
    }

    const height = pressed.has('KeyC') ? CROUCH_HEIGHT_M : EYE_HEIGHT_M
    camera.position.y = MathUtils.damp(camera.position.y, height, 10, delta)

    const lens = camera as PerspectiveCamera
    const fov = MathUtils.damp(lens.fov, zoom.current ? ZOOM_FOV : NORMAL_FOV, 12, delta)
    if (Math.abs(fov - lens.fov) > 0.01) {
      lens.fov = fov
      lens.updateProjectionMatrix()
    }

    if (light.current) {
      const direction = camera.getWorldDirection(new Vector3())
      light.current.position.copy(camera.position)
      light.current.target.position.copy(camera.position).addScaledVector(direction, 4)
      light.current.target.updateMatrixWorld()
    }
  })

  return (
    <>
      {/* The selector matches nothing on purpose: the library must not capture the mouse on its own. */}
      <PointerLockControls selector=".never-auto-lock" />
      <spotLight
        ref={light}
        visible={flashlight}
        intensity={60}
        angle={0.32}
        penumbra={0.45}
        distance={14}
        decay={1.6}
      />
    </>
  )
}
