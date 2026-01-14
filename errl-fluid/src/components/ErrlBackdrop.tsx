import { useScroll } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
// FIX: Import from the .ts file we created, not .frag
import { fragmentShader, vertexShader } from '../shaders/errl';

export function ErrlBackdrop() {
  // We use 'any' for the ref because ShaderMaterial types in R3F can be tricky with custom uniforms
  const ref = useRef<any>(null);
  const scroll = useScroll();
  const { size, viewport } = useThree();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScrollY: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    // Deep Blue/Black for oil
    uColorStart: { value: new THREE.Color("#0b1026") },
    // Neon Cyan for the fluid
    uColorEnd: { value: new THREE.Color("#00ffcc") },
  }), [size.width, size.height]);

  useFrame((state) => {
    if (ref.current) {
      // 1. Update Time
      ref.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // 2. Update Scroll (0 to 1)
      // Safety check: scroll.offset might be undefined on first frame
      ref.current.uniforms.uScrollY.value = scroll.offset ?? 0;
      
      // 3. Update Resolution if window resizes
      ref.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  });

  // Calculate plane size to cover viewport at z=-5 with camera at z=5, fov=75
  // Using aspect ratio and camera frustum calculation
  const planeSize = Math.max(viewport.width, viewport.height) * 1.5;

  return (
    // Push back in Z-space (-5) so bubbles float in front
    <mesh position={[0, 0, -5]} rotation={[0, 0, 0]}>
      {/* Plane covers the view. 
         Args: [width, height, widthSegments, heightSegments] 
         High segments (64) allow for better vertex displacement if we add it later.
      */}
      <planeGeometry args={[planeSize, planeSize, 64, 64]} />
      <shaderMaterial 
        ref={ref} 
        vertexShader={vertexShader} 
        fragmentShader={fragmentShader} 
        uniforms={uniforms}
        transparent={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}