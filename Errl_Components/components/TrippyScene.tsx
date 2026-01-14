import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh, MathUtils } from 'three';
import { useHypnoStore } from '../store/useHypnoStore';

function MeltingMesh() {
  const meshRef = useRef<Mesh>(null!);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const currentHover = useHypnoStore.getState().isHovered;

    const targetScale = currentHover ? 2.1 : 1.0;
    const targetSpeed = currentHover ? 4.5 : 0.6;

    meshRef.current.scale.x = MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);
    meshRef.current.scale.y = MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.1);
    meshRef.current.scale.z = MathUtils.lerp(meshRef.current.scale.z, targetScale, 0.1);

    meshRef.current.rotation.x += delta * targetSpeed;
    meshRef.current.rotation.y += delta * (targetSpeed * 0.5);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 1]} />
      <meshNormalMaterial wireframe />
    </mesh>
  );
}

export function TrippyScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
      <color attach="background" args={[0x050510]} />
      <ambientLight intensity={0.6} />
      <MeltingMesh />
    </Canvas>
  );
}
