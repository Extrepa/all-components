import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { ShaderMaterial, MathUtils } from 'three';
import { useErrlInteractions } from '../store/useErrlInteractions';

interface BubbleMeshProps {
  id: string;
  position: [number, number, number];
  radius?: number;
}

const vertexShader = `
uniform float uTime;
uniform float uHover;
uniform float uAmplitude;
uniform float uFrequency;

varying vec2 vUv;
varying float vWobble;

void main() {
  vUv = uv;
  
  // Radial distance from center
  vec2 center = vec2(0.5, 0.5);
  float r = length(uv - center);
  
  // Phase calculation for wave
  float phase = uTime * uFrequency + r * 6.28318; // 2π
  
  // Wobble effect (stronger at edges, weaker at center)
  float wobble = sin(phase) * uAmplitude * uHover * smoothstep(0.0, 0.5, r);
  vWobble = wobble;
  
  // Displace along normal (Z-axis for flat circle)
  vec3 pos = position;
  pos.z += wobble * 0.1; // Scale the displacement
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform vec3 uColor;
uniform float uHover;

varying vec2 vUv;
varying float vWobble;

void main() {
  // Radial distance from center
  vec2 center = vec2(0.5, 0.5);
  float r = length(vUv - center);
  
  // Radial gradient (cyan core, soft alpha falloff)
  float alpha = 1.0 - smoothstep(0.3, 1.0, r);
  
  // Add glow when hovered
  vec3 color = uColor;
  if (uHover > 0.5) {
    float glow = smoothstep(0.5, 0.0, r) * uHover;
    color += vec3(0.2, 0.8, 1.0) * glow * 0.5;
  }
  
  // Add subtle wobble-based color shift
  color += vec3(vWobble * 0.1);
  
  gl_FragColor = vec4(color, alpha * 0.8);
}
`;

export function BubbleMesh({ id, position, radius = 0.3 }: BubbleMeshProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const { clock } = useThree();
  const currentHoverRef = useRef(0);

  useFrame(() => {
    if (!materialRef.current) return;

    // Check if this bubble is hovered
    const hoveredId = useErrlInteractions.getState().hoveredBubbleId;
    const isHovered = hoveredId === id;

    // Smoothly interpolate hover state
    const targetHover = isHovered ? 1.0 : 0.0;
    currentHoverRef.current = MathUtils.lerp(
      currentHoverRef.current,
      targetHover,
      0.1
    );

    // Update uniforms
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uHover.value = currentHoverRef.current;
  });

  return (
    <mesh position={position}>
      <circleGeometry args={[radius, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        uniforms={{
          uTime: { value: 0 },
          uHover: { value: 0 },
          uAmplitude: { value: 0.3 },
          uFrequency: { value: 2.0 },
          uColor: { value: [0.0, 0.8, 0.9] }, // Cyan
        }}
      />
    </mesh>
  );
}

