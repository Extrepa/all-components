import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, MeshTransmissionMaterial, Float, Detailed } from '@react-three/drei';
import * as THREE from 'three';
import { useErrlSound } from '../../hooks/useErrlSound';
import '../shaders/GlowingOutlineMaterial';

const ComponentNode = React.memo(({ data, activeId, setActive }: any) => {
  const isSelected = activeId === data.id;
  const shaderRef = useRef<any>();
  const { playHover, playClick } = useErrlSound();

  useFrame((state) => {
    if (shaderRef.current) shaderRef.current.time = state.clock.elapsedTime;
  });

  const boxGeo = useMemo(() => new THREE.BoxGeometry(2.8, 1.8, 0.1), []);

  return (
    <Float speed={isSelected ? 0 : 2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group 
        position={data.pos} 
        onClick={(e) => { e.stopPropagation(); playClick(); setActive(data.id); }}
        onPointerOver={(e) => { e.stopPropagation(); playHover(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <Detailed distances={[0, 25, 50]}>
          {/* LEVEL 0: HIGH RES */}
          <group>
            <Html transform occlude distanceFactor={1.5} style={{ pointerEvents: 'none' }}>
              <div className={`
                relative w-64 h-40 p-6 flex flex-col justify-between overflow-hidden
                transition-all duration-500 rounded-2xl border
                ${isSelected ? 'border-transparent scale-100' : 'border-white/10 bg-black/40 opacity-80 scale-95'}
              `}>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] z-0 bg-[length:100%_4px] pointer-events-none" />
                <h3 className={`font-mono text-2xl font-bold tracking-tighter uppercase z-10 ${isSelected ? 'text-white' : 'text-white/80'}`}>{data.name}</h3>
                <span className="text-xs font-mono text-errl-cyan uppercase tracking-[0.3em] z-10">{data.tier}</span>
              </div>
            </Html>
            <mesh position={[0, 0, -0.05]} geometry={boxGeo}>
              <MeshTransmissionMaterial 
                backside 
                samples={isSelected ? 6 : 2} 
                resolution={isSelected ? 1024 : 256}
                thickness={0.5} 
                chromaticAberration={0.1} 
                anisotropy={0.3} 
                color="#aaddff"
                transmission={0.9}
                roughness={0.1}
                metalness={0.1}
              />
            </mesh>
            {isSelected && (
              <lineSegments scale={[1.05, 1.05, 1]}>
                <edgesGeometry args={[boxGeo]} />
                {/* @ts-ignore */}
                <glowingOutlineMaterial ref={shaderRef} transparent depthWrite={false} color={new THREE.Color('#00ffff')} glowColor={new THREE.Color('#ff00ff')} />
              </lineSegments>
            )}
          </group>

          {/* LEVEL 1: WIREFRAME - Only show wireframe, not X marks */}
          <mesh geometry={boxGeo}>
            <meshBasicMaterial color="#00ffff" wireframe opacity={0.5} transparent />
          </mesh>

          {/* LEVEL 2: DOT */}
          <mesh>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>
        </Detailed>
      </group>
    </Float>
  );
}, (prev, next) => prev.activeId === next.activeId && prev.data.id === next.data.id);

export default ComponentNode;