import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = ({ count = 500 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  const pointsRef = useRef();

  useFrame((state) => {
    if (!pointsRef.current || !pointsRef.current.rotation) return;
    pointsRef.current.rotation.y += 0.001;
    pointsRef.current.rotation.x += 0.0005;
  });

  return (
    <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00f5ff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const NeuralCore = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current || !meshRef.current.rotation) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.cos(time / 4) * 0.2;
    meshRef.current.rotation.y = Math.sin(time / 2) * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#00f5ff"
          speed={3}
          distort={0.2}
          radius={1}
          emissive="#00f5ff"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>
    </Float>
  );
};

const NeuralMap = ({ active = false }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full h-full min-h-[300px] relative overflow-hidden rounded-3xl bg-obsidian-card border border-obsidian-border">
      {/* Decorative Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10">
         <div className="absolute top-4 left-4 flex flex-col gap-1">
            <div className="w-8 h-[1px] bg-tech-cyan/50" />
            <div className="w-4 h-[1px] bg-tech-cyan/30" />
         </div>
         <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1">
            <div className="w-4 h-[1px] bg-tech-cyan/30" />
            <div className="w-8 h-[1px] bg-tech-cyan/50" />
         </div>
         
         <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-[2px] h-[2px] rounded-full bg-tech-cyan/40" />
            ))}
         </div>
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7000ff" />
        
        <NeuralCore />
        <ParticleField count={active ? 1000 : 400} />
        
        {/* Glow effect */}
        <mesh position={[0, 0, -2]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#00f5ff" transparent opacity={0.05} />
        </mesh>
      </Canvas>

      {/* Label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
         <div className="px-4 py-2 bg-obsidian/60 backdrop-blur-md border border-obsidian-border rounded-xl flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-tech-cyan animate-pulse shadow-[0_0_8px_#00f5ff]' : 'bg-tech-violet shadow-[0_0_8px_#7000ff]'}`} />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
              {active ? 'Neural Core: Processing' : 'Neural Core: Standby'}
            </span>
         </div>
      </div>
    </div>
  );
};

export default NeuralMap;
