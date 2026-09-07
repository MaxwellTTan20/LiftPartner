import { Component, Suspense, useMemo, type ReactNode } from 'react'
import { Canvas, useLoader, type ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { MUSCLES } from '../data/muscles'
import type { ScoreMap } from '../types'

// If the selfie texture fails to load (bad URL, offline, etc.) this stops
// the failure from taking down the whole 3D canvas - it just quietly skips
// the photo.
class SelfieErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error('Selfie texture failed to load:', error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const UP = new THREE.Vector3(0, 1, 0)
const GRAY = new THREE.Color('#6b6b6d')
const RED = new THREE.Color('#e0473a')

function degToRad(d: number) {
  return (d * Math.PI) / 180
}

function scoreColor(score: number): THREE.Color {
  const t = Math.max(0, Math.min(1, score / 100))
  return GRAY.clone().lerp(RED, t)
}

function bakeVertexShading(geometry: THREE.BufferGeometry, brightnessFn: (v: THREE.Vector3) => number) {
  const posAttr = geometry.attributes.position
  const colors = new Float32Array(posAttr.count * 3)
  const v = new THREE.Vector3()
  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i)
    const b = brightnessFn(v)
    colors[i * 3] = b
    colors[i * 3 + 1] = b
    colors[i * 3 + 2] = b
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
}

function useSharedGeometries() {
  return useMemo(() => {
    const sphereGeo = new THREE.SphereGeometry(1, 20, 16)
    bakeVertexShading(sphereGeo, (v) => 0.72 + 0.28 * (1 - Math.abs(v.y)))

    const domePoints: THREE.Vector2[] = []
    const DOME_SEGMENTS = 12
    for (let i = 0; i <= DOME_SEGMENTS; i++) {
      const t = (i / DOME_SEGMENTS) * (Math.PI / 2)
      domePoints.push(new THREE.Vector2(Math.cos(t), Math.sin(t)))
    }
    const domeGeo = new THREE.LatheGeometry(domePoints, 24)
    bakeVertexShading(domeGeo, (v) => 0.68 + 0.42 * Math.min(v.y, 1))

    return { sphereGeo, domeGeo }
  }, [])
}

interface SkeletonPart {
  key: string
  geometry: THREE.BufferGeometry
  position: [number, number, number]
  rotationZ: number
  scale: [number, number, number]
}

function useSkeletonParts(): SkeletonPart[] {
  return useMemo(() => {
    const parts: SkeletonPart[] = []
    let i = 0
    const add = (
      geometry: THREE.BufferGeometry,
      position: [number, number, number],
      rotationZ = 0,
      scale: [number, number, number] = [1, 1, 1],
    ) => {
      parts.push({ key: `bone-${i++}`, geometry, position, rotationZ, scale })
    }
    add(new THREE.SphereGeometry(0.095, 16, 12), [0, 0.77, 0])
    add(new THREE.CylinderGeometry(0.025, 0.03, 0.09, 10), [0, 0.63, -0.01])
    add(new THREE.CylinderGeometry(0.02, 0.03, 0.58, 10), [0, 0.33, -0.06])
    add(new THREE.SphereGeometry(1, 14, 10), [0, 0.42, -0.01], 0, [0.13, 0.16, 0.09])
    add(new THREE.CylinderGeometry(0.09, 0.06, 0.16, 12), [0, 0.02, -0.01])
    for (const s of [1, -1]) {
      add(new THREE.CylinderGeometry(0.014, 0.016, 0.16, 8), [0.11 * s, 0.55, 0.02], -8 * s)
      add(new THREE.CylinderGeometry(0.02, 0.024, 0.26, 10), [0.22 * s, 0.4, 0], 0.4 * s)
      add(new THREE.CylinderGeometry(0.016, 0.02, 0.26, 10), [0.275 * s, 0.14, 0.01], -6 * s)
      add(new THREE.BoxGeometry(0.035, 0.08, 0.02), [0.295 * s, -0.03, 0.03])
      add(new THREE.CylinderGeometry(0.03, 0.025, 0.4, 12), [0.09 * s, -0.22, 0])
      add(new THREE.CylinderGeometry(0.022, 0.018, 0.36, 12), [0.09 * s, -0.62, 0])
      add(new THREE.BoxGeometry(0.05, 0.03, 0.16), [0.09 * s, -0.84, 0.05])
      add(new THREE.SphereGeometry(0.028, 10, 8), [0.15 * s, 0.53, 0.01])
      add(new THREE.SphereGeometry(0.026, 10, 8), [0.245 * s, 0.27, 0.005])
      add(new THREE.SphereGeometry(0.021, 10, 8), [0.278 * s, 0.0, 0.02])
      add(new THREE.SphereGeometry(0.05, 10, 8), [0.09 * s, -0.01, 0])
      add(new THREE.SphereGeometry(0.032, 10, 8), [0.09 * s, -0.42, 0])
      add(new THREE.SphereGeometry(0.024, 10, 8), [0.09 * s, -0.8, 0.01])
    }
    return parts
  }, [])
}

function Skeleton() {
  const parts = useSkeletonParts()
  return (
    <group>
      {parts.map((p) => (
        <mesh key={p.key} geometry={p.geometry} position={p.position} rotation={[0, 0, p.rotationZ]} scale={p.scale}>
          <meshStandardMaterial color="#e8e2d2" roughness={0.6} metalness={0.05} transparent opacity={0.45} />
        </mesh>
      ))}
    </group>
  )
}

interface MuscleInstance {
  key: string
  muscleId: string
  isDome: boolean
  position: [number, number, number]
  scale: [number, number, number]
  quaternion: THREE.Quaternion
}

function useMuscleInstances(): MuscleInstance[] {
  return useMemo(() => {
    const list: MuscleInstance[] = []
    for (const def of MUSCLES) {
      const sides = def.side === 'both' ? [1, -1] : [1]
      for (const sign of sides) {
        const position: [number, number, number] = [def.pos[0] * sign, def.pos[1], def.pos[2]]
        let quaternion: THREE.Quaternion
        if (def.normal) {
          const n = new THREE.Vector3(def.normal[0] * sign, def.normal[1], def.normal[2]).normalize()
          quaternion = new THREE.Quaternion().setFromUnitVectors(UP, n)
        } else {
          const rot = def.rot ?? [0, 0, 0]
          quaternion = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(degToRad(rot[0]), degToRad(rot[1]) * sign, degToRad(rot[2]) * sign),
          )
        }
        list.push({
          key: `${def.id}-${sign > 0 ? 'r' : 'l'}`,
          muscleId: def.id,
          isDome: def.shape === 'dome',
          position,
          scale: def.scale,
          quaternion,
        })
      }
    }
    return list
  }, [])
}

interface MusclesProps {
  scores: ScoreMap
  selectedId: string | null
  onSelect?: (id: string | null) => void
}

function Muscles({ scores, selectedId, onSelect }: MusclesProps) {
  const instances = useMuscleInstances()
  const { sphereGeo, domeGeo } = useSharedGeometries()

  return (
    <group>
      {instances.map((inst) => {
        const score = scores[inst.muscleId] ?? 0
        const selected = inst.muscleId === selectedId
        return (
          <mesh
            key={inst.key}
            geometry={inst.isDome ? domeGeo : sphereGeo}
            position={inst.position}
            scale={inst.scale}
            quaternion={inst.quaternion}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation()
              onSelect?.(inst.muscleId)
            }}
          >
            <meshStandardMaterial
              color={scoreColor(score)}
              vertexColors
              roughness={0.6}
              metalness={0.02}
              emissive={selected ? '#ff5a36' : '#000000'}
              emissiveIntensity={selected ? 0.5 : 0}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function SelfiePhoto({ url }: { url: string }) {
  const texture = useLoader(THREE.TextureLoader, url, (loader) => {
    loader.setCrossOrigin('anonymous')
  })
  // Textures default to a linear color interpretation; a normal photo (JPEG,
  // sRGB) needs to be tagged as sRGB or it renders dim/washed out next to
  // everything else. This is the "full capacity color" fix.
  texture.colorSpace = THREE.SRGBColorSpace
  // The skeleton and muscles are ALL flagged transparent:true (even at full
  // opacity, so the isolate/dim effect works), which puts every one of them
  // in three.js's "transparent" render queue - and that whole queue renders
  // after the opaque queue, on top of it, blending as it goes. Since the
  // photo's own material was opaque (transparent:false), it was rendering
  // in the earlier opaque pass, and the entire body was then painted over
  // it afterward at ~45% opacity, which is exactly the washed-out "same
  // capacity as the rest of the body" look.
  //
  // Fix: put the photo in the transparent queue too (transparent=true, even
  // though opacity is 1) with a renderOrder higher than everything else, so
  // it's sorted to draw dead last - after the body - with depthTest/Write
  // off so nothing about the geometry underneath can affect it. At alpha=1
  // that's a full overwrite: 100% solid photo, unaffected by anything
  // behind it.
  return (
    <group position={[0, 0.75, 0.10]} rotation={[0, 0, degToRad(-8)]} renderOrder={999}>
      <mesh renderOrder={999}>
        <planeGeometry args={[0.15, 0.19]} />
        <meshBasicMaterial
          map={texture}
          toneMapped={false}
          side={THREE.DoubleSide}
          transparent
          opacity={1}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-0.075, 0.085, 0.001]} rotation={[0, 0, degToRad(-35 + 90)]} renderOrder={1000}>
        <planeGeometry args={[0.05, 0.022]} />
        <meshBasicMaterial
          color="#f2e9c9"
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.075, 0.085, 0.001]} rotation={[0, 0, degToRad(35 + 90)]} renderOrder={1000}>
        <planeGeometry args={[0.05, 0.022]} />
        <meshBasicMaterial
          color="#f2e9c9"
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export interface BodyModelProps {
  scores: ScoreMap
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  selfieURL?: string | null
  interactive?: boolean
  className?: string
}

export default function BodyModel({
  scores,
  selectedId = null,
  onSelect,
  selfieURL,
  interactive = true,
  className,
}: BodyModelProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ fov: 42, position: [0, 0.05, 3.1], near: 0.1, far: 100 }}
        onPointerMissed={() => onSelect?.(null)}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#111114']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[1.5, 2, 2]} intensity={0.85} />
        <directionalLight position={[-1.5, 1, -1.5]} intensity={0.35} />
        <directionalLight position={[0, 1, -2.5]} intensity={0.25} />
        <Skeleton />
        <Muscles scores={scores} selectedId={selectedId} onSelect={onSelect} />
        {selfieURL ? (
          <SelfieErrorBoundary>
            <Suspense fallback={null}>
              <SelfiePhoto url={selfieURL} />
            </Suspense>
          </SelfieErrorBoundary>
        ) : null}
        {interactive ? (
          <OrbitControls target={[0, 0, 0]} enableDamping dampingFactor={0.08} minDistance={0.6} maxDistance={7} />
        ) : null}
      </Canvas>
    </div>
  )
}
