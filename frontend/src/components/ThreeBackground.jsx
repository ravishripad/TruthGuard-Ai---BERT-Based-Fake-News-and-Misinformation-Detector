import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const DataRings = () => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.z = time * 0.1;
    groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.2;
  });

  return (
    <group ref={groupRef}>
      {[1.8, 2.2, 2.6].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.005, 16, 100]} />
          <meshBasicMaterial color="#0071e3" transparent opacity={0.3 - i * 0.05} />
        </mesh>
      ))}
    </group>
  );
};

const QuantumParticles = ({ count = 1500 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) p[i] = (Math.random() - 0.5) * 20;
    return p;
  }, [count]);

  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <Points ref={ref} positions={points} stride={3}>
      <PointMaterial
        transparent
        color="#2997ff"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const NeuralCore = () => {
  const meshRef = useRef();
  const { mouse } = useThree();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scroll = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    
    // Smooth interaction
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, mouse.y * 0.2, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mouse.x * 0.2 + time * 0.2, 0.1);
    
    // Scroll logic
    if (scroll < 0.2) {
       meshRef.current.position.set(0, 0, 0);
       meshRef.current.scale.setScalar(1 + scroll);
    } else {
       const t = (scroll - 0.2) / 0.8;
       meshRef.current.position.set(t * 5, -t * 2, -3);
       meshRef.current.scale.setScalar(1.5 - t * 0.6);
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        {/* Core Pro Sphere */}
        <Sphere args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#121212"
            speed={3}
            distort={0.4}
            radius={1}
            metalness={1}
            roughness={0.1}
            emissive="#0071e3"
            emissiveIntensity={0.4}
          />
        </Sphere>
        
        {/* Outer Glow Shell (Native workaround for Bloom) */}
        <Sphere args={[1.05, 64, 64]}>
          <meshBasicMaterial color="#0071e3" transparent opacity={0.1} side={THREE.BackSide} />
        </Sphere>
      </Float>
      
      <DataRings />
    </group>
  );
};

const ThreeBackground = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none bg-black" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 5, 20]} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#0071e3" />
        
        <QuantumParticles />
        <NeuralCore />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
