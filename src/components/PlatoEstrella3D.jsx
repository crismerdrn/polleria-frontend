import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Lightformer, OrbitControls, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const MEAT = '#b45309'
const MEAT_DARK = '#7c2d12'

function Drumstick({ position, rotation, scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow scale={[1, 0.78, 0.82]}>
        <sphereGeometry args={[0.55, 48, 48]} />
        <meshStandardMaterial color={MEAT} roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh castShadow position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.12, 0.6, 32]} />
        <meshStandardMaterial color={MEAT_DARK} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.98, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.4, 16]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.6} />
      </mesh>
      {[0.09, -0.09].map((z) => (
        <mesh key={z} castShadow position={[1.2, 0, z]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function Fries() {
  const fries = useMemo(() => {
    const rng = mulberry32(7)
    return Array.from({ length: 16 }, () => ({
      pos: [-0.9 + rng() * 0.8, 0.12 + rng() * 0.15, 0.25 + rng() * 0.7],
      rot: [rng() * 0.6 - 0.3, rng() * Math.PI, rng() * 0.5 - 0.25],
      len: 0.6 + rng() * 0.35,
    }))
  }, [])
  return (
    <group>
      {fries.map((f, i) => (
        <mesh key={i} castShadow position={f.pos} rotation={f.rot}>
          <boxGeometry args={[f.len, 0.08, 0.08]} />
          <meshStandardMaterial color={i % 3 ? '#facc15' : '#eab308'} roughness={0.55} />
        </mesh>
      ))}
    </group>
  )
}

function Salad() {
  return (
    <group position={[0.85, 0.1, 0.55]}>
      {[
        [0, 0, 0],
        [0.25, 0.03, -0.15],
        [-0.15, 0.05, 0.2],
      ].map((p, i) => (
        <mesh key={i} castShadow position={p} scale={[1, 0.35, 1]}>
          <sphereGeometry args={[0.25, 24, 24]} />
          <meshStandardMaterial color="#16a34a" roughness={0.7} />
        </mesh>
      ))}
      {[
        [0.05, 0.12, 0.05],
        [0.3, 0.14, 0.1],
      ].map((p, i) => (
        <mesh key={i} castShadow position={p} rotation={[0.3, 0, 0.2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.05, 24]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function SauceBowl() {
  return (
    <group position={[0.9, 0.12, -0.75]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.28, 0.2, 0.2, 32, 1, true]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 32]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.25} />
      </mesh>
    </group>
  )
}

function Plato({ hovered, setHovered, spinning, setSpinning }) {
  const group = useRef()
  const target = useRef(new THREE.Vector3(1, 1, 1))

  useFrame((state, delta) => {
    if (!group.current) return
    if (spinning) group.current.rotation.y += delta * 0.5
    const s = hovered ? 1.08 : 1
    target.current.set(s, s, s)
    group.current.scale.lerp(target.current, 0.1)
    const { x, y } = state.pointer
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.15, 0.05)
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, x * 0.08, 0.05)
  })

  return (
    <group
      ref={group}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
      onClick={(e) => {
        e.stopPropagation()
        setSpinning((s) => !s)
      }}
    >
      <mesh receiveShadow castShadow position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.9, 1.6, 0.12, 64]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.15} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.85, 0.05, 16, 96]} />
        <meshStandardMaterial color={hovered ? '#f97316' : '#ea580c'} roughness={0.3} />
      </mesh>

      <Drumstick position={[-0.15, 0.38, -0.35]} rotation={[0, 0.5, 0.15]} />
      <Drumstick position={[0.2, 0.35, -0.05]} rotation={[0, -2.4, 0.12]} scale={0.85} />
      <Fries />
      <Salad />
      <SauceBowl />

      <Sparkles count={30} scale={[2, 1.5, 2]} position={[0, 1.2, -0.2]} size={3} speed={0.4} color="#fde68a" opacity={0.6} />
    </group>
  )
}

export default function PlatoEstrella3D() {
  const [hovered, setHovered] = useState(false)
  const [spinning, setSpinning] = useState(true)

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold">⭐ Plato Estrella</h2>
          <p className="text-sm text-stone-500">Pollo a la brasa con papas, ensalada y ají</p>
        </div>
        <button onClick={() => setSpinning((s) => !s)} className="btn-ghost text-xs">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            {spinning ? <path d="M7 5h3v14H7zM14 5h3v14h-3z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
          {spinning ? 'Pausar' : 'Girar'}
        </button>
      </div>
      <div className="relative h-[340px] bg-gradient-to-b from-amber-50 via-orange-50 to-stone-100 sm:h-[400px]">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [3.2, 2.6, 3.6], fov: 40 }}>
          <ambientLight intensity={0.4} />
          <directionalLight
            castShadow
            position={[4, 6, 3]}
            intensity={1.6}
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-3, 2, -2]} intensity={8} color="#fb923c" />
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
            <Plato hovered={hovered} setHovered={setHovered} spinning={spinning} setSpinning={setSpinning} />
          </Float>
          <ContactShadows position={[0, -0.7, 0]} opacity={0.45} scale={8} blur={2.4} far={2} />
          <Environment resolution={256}>
            <Lightformer intensity={2} position={[0, 5, -5]} scale={[10, 5, 1]} />
            <Lightformer intensity={1.5} color="#fed7aa" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
            <Lightformer intensity={1} position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
          </Environment>
          <OrbitControls
            makeDefault
            enablePan={false}
            minDistance={3}
            maxDistance={9}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.1}
            autoRotate={spinning && !hovered}
            autoRotateSpeed={0.6}
          />
        </Canvas>
        <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-stone-500">
          Arrastra para rotar · Rueda para zoom · Clic en el plato para pausar
        </p>
      </div>
    </section>
  )
}

function mulberry32(a) {
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
