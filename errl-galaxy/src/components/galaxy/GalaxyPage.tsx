'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Stars } from '@react-three/drei';
import { SearchHUD } from './SearchHUD';
import { CameraRig } from './CameraRig';
import { NebulaBackground } from './NebulaBackground';
import ComponentNode from './ComponentNode';

const FALLBACK_DATA = [
  { id: '1', name: 'ErrlAvatar', tier: 'ATOM', pos: [0, 0, 0] },
];

export default function GalaxyPage() {
  const [systemData, setSystemData] = useState<any[]>(FALLBACK_DATA);
  const [activeId, setActive] = useState<string | null>(null);
  const controlsRef = useRef<CameraControls>(null);

  useEffect(() => {
    fetch('/galaxy-manifest.json') 
      .then((res) => res.json())
      .then((data) => {
        console.log('🌌 Galaxy Data Loaded:', data.length, 'nodes');
        setSystemData(data);
      })
      .catch((err) => {
        console.warn('⚠️ No manifest found, using fallback.', err);
      });
  }, []);

  return (
    <div className="w-screen h-screen relative">
      <SearchHUD data={systemData} />
      <CameraRig controlsRef={controlsRef} data={systemData} />
      
      <Canvas
        camera={{ position: [0, 0, 20], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
        
        <NebulaBackground />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        
        <CameraControls
          ref={controlsRef}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={100}
        />
        
        {systemData.map((data) => (
          <ComponentNode
            key={data.id}
            data={data}
            activeId={activeId}
            setActive={setActive}
          />
        ))}
      </Canvas>
    </div>
  );
}
