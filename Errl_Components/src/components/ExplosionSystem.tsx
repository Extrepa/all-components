import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import {
  InstancedMesh,
  BufferGeometry,
  BufferAttribute,
  Object3D,
  MathUtils,
  Vector3,
} from 'three';
import { useErrlInteractions } from '../store/useErrlInteractions';

const PARTICLE_COUNT = 50;

interface Particle {
  time: number;
  life: number;
  vel: Vector3;
  scale: number;
  active: boolean;
  position: Vector3;
  color: Vector3; // RGB color for each particle
}

export function ExplosionSystem() {
  const meshRef = useRef<InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastProcessedTimeRef = useRef<number>(0);
  const dummy = useMemo(() => new Object3D(), []);

  const { size, viewport } = useThree();

  // Initialize particles
  useMemo(() => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
      // Random color between cyan and magenta (Errl palette)
      const colorChoice = Math.random();
      const color = new Vector3(
        colorChoice < 0.5 ? 0.0 : 0.9, // R: 0 or 0.9
        colorChoice < 0.5 ? 0.8 : 0.0, // G: 0.8 or 0
        colorChoice < 0.5 ? 0.9 : 0.8  // B: 0.9 or 0.8
      );
      
      return {
        time: 0,
        life: 1.5 + Math.random() * 1.0,
        vel: new Vector3(),
        scale: 0.2 + Math.random() * 0.3,
        active: false,
        position: new Vector3(),
        color,
      };
    });
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const { lastPopEvent } = useErrlInteractions.getState();

    // Check for new pop event
    if (lastPopEvent && lastPopEvent.time !== lastProcessedTimeRef.current) {
      lastProcessedTimeRef.current = lastPopEvent.time;

      // Convert pixel coordinates to world coordinates
      const px =
        (lastPopEvent.x / size.width) * viewport.width - viewport.width / 2;
      const py =
        -(lastPopEvent.y / size.height) * viewport.height + viewport.height / 2;

      // Reset all particles at the pop location
      particlesRef.current.forEach((particle) => {
        particle.active = true;
        particle.time = 0;
        particle.position.set(px, py, 0);

      // Random velocity in all directions with some upward bias
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.8;
      const upwardBias = Math.random() * 0.3; // Slight upward preference
      particle.vel.set(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed + upwardBias,
        (Math.random() - 0.3) * 0.6 // Less Z spread
      );
      
      // Randomize color slightly on each pop for variety
      const colorVariation = 0.2;
      particle.color.x += (Math.random() - 0.5) * colorVariation;
      particle.color.y += (Math.random() - 0.5) * colorVariation;
      particle.color.z += (Math.random() - 0.5) * colorVariation;
      particle.color.clampScalar(0, 1);
      });
    }

    // Physics loop
    particlesRef.current.forEach((particle, i) => {
      if (!particle.active) {
        // Hide inactive particles
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
        return;
      }

      // Update time
      particle.time += delta;

      // Integrate position by velocity
      const deltaVel = particle.vel.clone().multiplyScalar(delta * 10);
      particle.position.add(deltaVel);

      // Apply drag/friction (viscous feel)
      particle.vel.multiplyScalar(0.95);

      // Shrink particles over lifetime
      const lifeFraction = 1.0 - particle.time / particle.life;
      const currentScale = particle.scale * Math.max(0, lifeFraction);

      // Kill when dead
      if (particle.time >= particle.life || currentScale <= 0) {
        particle.active = false;
        dummy.scale.setScalar(0);
      } else {
        dummy.position.copy(particle.position);
        dummy.scale.setScalar(currentScale);
      }

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Create geometry for particles (small sphere-like shape)
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    // Create a small circle/quad for particles
    const segments = 8;
    const radius = 0.1;
    const vertices: number[] = [];
    const uvs: number[] = [];
    
    // Center point
    vertices.push(0, 0, 0);
    uvs.push(0.5, 0.5);
    
    // Circle points
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      vertices.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      );
      uvs.push(
        (Math.cos(angle) + 1) / 2,
        (Math.sin(angle) + 1) / 2
      );
    }
    
    // Indices for triangle fan
    const indices: number[] = [];
    for (let i = 1; i <= segments; i++) {
      indices.push(0, i, (i % segments) + 1);
    }
    
    geo.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    geo.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geo.setIndex(indices);
    return geo;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, PARTICLE_COUNT]}>
      <meshBasicMaterial
        color={0x00ffff}
        transparent
        opacity={0.95}
        blending={2} // AdditiveBlending
        depthWrite={false}
      />
    </instancedMesh>
  );
}

