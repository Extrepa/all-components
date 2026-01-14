import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ExplosionSystemRef {
  trigger: (position: THREE.Vector3) => void;
}

export const ExplosionSystem = forwardRef<ExplosionSystemRef>((props, ref) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 50;
  const dummy = new THREE.Object3D();

  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      time: 0, life: 1, active: false,
      pos: new THREE.Vector3(), vel: new THREE.Vector3(),
      scale: 0
    }));
  }, []);

  useImperativeHandle(ref, () => ({
    trigger: (position: THREE.Vector3) => {
      particles.forEach(p => {
        p.active = true; p.time = 0; p.life = 0.5 + Math.random() * 0.5;
        p.pos.copy(position);
        p.vel.set((Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10);
        p.scale = 0.2 + Math.random() * 0.3;
      });
    }
  }));

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      if (!p.active) {
        dummy.scale.set(0,0,0);
      } else {
        p.time += delta;
        if (p.time >= p.life) p.active = false;
        p.pos.addScaledVector(p.vel, delta);
        p.vel.multiplyScalar(0.9); // Friction
        const s = p.scale * (1 - p.time/p.life);
        dummy.position.copy(p.pos);
        dummy.scale.set(s,s,s);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshBasicMaterial color="#00ffff" toneMapped={false} />
    </instancedMesh>
  );
});

ExplosionSystem.displayName = 'ExplosionSystem';