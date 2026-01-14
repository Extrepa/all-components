import { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, MeshTransmissionMaterial, Text } from '@react-three/drei';
import { useSphere } from '@react-three/cannon';
import { useBloop } from '../hooks/useBloop';
import { getQualityTier } from '../utils/quality';
import * as THREE from 'three';

interface StretchyBubbleProps {
  position: [number, number, number];
  label: string;
  onPop: (position: THREE.Vector3) => void;
}

export function StretchyBubble({ position, label, onPop }: StretchyBubbleProps) {
  const [ref, api] = useSphere(() => ({ mass: 1, position, args: [0.8], linearDamping: 0.5 }));
  const [hovered, setHover] = useState(false);
  const playBloop = useBloop();
  const quality = getQualityTier();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    api.applyForce([Math.sin(t) * 0.5, Math.cos(t * 0.8) * 0.5, 0], [0, 0, 0]);
  });

  return (
    <mesh ref={ref as any} 
      onClick={(e) => { 
        e.stopPropagation(); 
        playBloop(); 
        if (ref.current) {
          const pos = new THREE.Vector3();
          ref.current.getWorldPosition(pos);
          onPop(pos);
        }
      }}
      onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}
    >
      <sphereGeometry args={[0.8, 64, 64]} />
      {quality === 'high' ? (
        <MeshTransmissionMaterial resolution={512} distortion={0.5} color="#a0e0ff" thickness={1} anisotropy={1} />
      ) : (
        <MeshDistortMaterial color="#00ffff" distort={hovered ? 0.6 : 0.3} speed={3} />
      )}
      <Text position={[0, 0, 0.9]} fontSize={0.25} color="white" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">
        {label}
      </Text>
    </mesh>
  );
}