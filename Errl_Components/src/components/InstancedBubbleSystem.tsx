import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import {
  InstancedMesh,
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  MathUtils,
  Object3D,
} from 'three';
import { useErrlInteractions } from '../store/useErrlInteractions';
import { ERRL_CONFIG } from '../content/errl-config';

const vertexShader = `
attribute vec3 instancePosition;
attribute float instanceHover;

uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;

varying vec2 vUv;
varying float vWobble;
varying float vHover;

void main() {
  vUv = uv;
  vHover = instanceHover;
  
  // Radial distance from center
  vec2 center = vec2(0.5, 0.5);
  float r = length(uv - center);
  
  // Phase calculation for wave
  float phase = uTime * uFrequency + r * 6.28318; // 2π
  
  // Wobble effect (stronger at edges, weaker at center)
  float wobble = sin(phase) * uAmplitude * instanceHover * smoothstep(0.0, 0.5, r);
  vWobble = wobble;
  
  // Apply instance position and wobble displacement
  vec3 pos = position;
  pos.z += wobble * 0.1; // Scale the displacement
  pos += instancePosition; // Add instance position
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;
uniform float uTime;

varying vec2 vUv;
varying float vWobble;
varying float vHover;

void main() {
  // Radial distance from center
  vec2 center = vec2(0.5, 0.5);
  float r = length(vUv - center);
  
  // Radial gradient (cyan core, soft alpha falloff)
  float alpha = 1.0 - smoothstep(0.3, 1.0, r);
  
  // Base color with Errl palette
  vec3 color = mix(uPrimaryColor, uSecondaryColor, r * 0.5);
  
  // Add glow when hovered
  if (vHover > 0.3) {
    float glow = smoothstep(0.5, 0.0, r) * vHover;
    color += vec3(0.2, 0.8, 1.0) * glow * 0.8;
    
    // Edge glow effect
    float edgeGlow = smoothstep(0.8, 0.95, r) * vHover;
    color += uSecondaryColor * edgeGlow * 0.6;
  }
  
  // Add subtle wobble-based color shift
  color += vec3(vWobble * 0.15);
  
  // Refraction-like effect (subtle chromatic aberration at edges)
  float chroma = smoothstep(0.6, 1.0, r) * abs(vWobble) * 0.1;
  color.r += chroma;
  color.b -= chroma * 0.5;
  
  // Pulsing effect when hovered
  float pulse = sin(uTime * 3.0) * 0.1 + 0.9;
  color *= mix(1.0, pulse, vHover * 0.3);
  
  gl_FragColor = vec4(color, alpha * 0.85);
}
`;

interface BubbleInstance {
  id: string;
  position: [number, number, number];
}

export function InstancedBubbleSystem({ bubbles }: { bubbles: BubbleInstance[] }) {
  const meshRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const { clock } = useThree();
  const hoverStatesRef = useRef<Map<string, number>>(new Map());
  const dummy = useMemo(() => new Object3D(), []);

  // Initialize hover states
  useMemo(() => {
    bubbles.forEach((bubble) => {
      hoverStatesRef.current.set(bubble.id, 0);
    });
  }, [bubbles]);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    const { hoveredBubbleId } = useErrlInteractions.getState();
    const time = clock.getElapsedTime();
    let needsMatrixUpdate = false;
    let needsAttributeUpdate = false;

    // Update hover states with lerp
    bubbles.forEach((bubble, index) => {
      const isHovered = hoveredBubbleId === bubble.id;
      const currentHover = hoverStatesRef.current.get(bubble.id) ?? 0;
      const targetHover = isHovered ? 1.0 : 0.0;
      const newHover = MathUtils.lerp(currentHover, targetHover, 0.1);
      
      // Only update if hover state changed significantly
      if (Math.abs(newHover - currentHover) > 0.001) {
        hoverStatesRef.current.set(bubble.id, newHover);
        needsMatrixUpdate = true;
        needsAttributeUpdate = true;

        // Update instance matrix
        dummy.position.set(...bubble.position);
        dummy.scale.setScalar(1.0 + newHover * 0.1); // Slight scale on hover
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(index, dummy.matrix);
      }
    });

    // Update instance attributes (hover strength) only if needed
    if (needsAttributeUpdate) {
      const hoverArray = new Float32Array(bubbles.length);
      bubbles.forEach((bubble, index) => {
        hoverArray[index] = hoverStatesRef.current.get(bubble.id) ?? 0;
      });

      const hoverAttribute = meshRef.current.geometry.getAttribute(
        'instanceHover'
      ) as BufferAttribute;
      if (hoverAttribute && hoverAttribute.array instanceof Float32Array) {
        hoverAttribute.array.set(hoverArray);
        hoverAttribute.needsUpdate = true;
      }
    }

    // Update material uniforms (time always changes)
    materialRef.current.uniforms.uTime.value = time;

    if (needsMatrixUpdate) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Create geometry with instance attributes
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const segments = 32;
    const vertices: number[] = [];
    const uvs: number[] = [];

    // Create circle geometry
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      vertices.push(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0);
      uvs.push((Math.cos(angle) + 1) / 2, (Math.sin(angle) + 1) / 2);
    }
    vertices.push(0, 0, 0); // Center point
    uvs.push(0.5, 0.5);

    // Create indices for triangle fan
    const indices: number[] = [];
    for (let i = 0; i < segments; i++) {
      indices.push(segments + 1, i, (i + 1) % (segments + 1));
    }

    geo.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    geo.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
    geo.setIndex(indices);

    // Instance attributes
    const positionArray = new Float32Array(bubbles.length * 3);
    const hoverArray = new Float32Array(bubbles.length);

    bubbles.forEach((bubble, index) => {
      positionArray[index * 3] = bubble.position[0];
      positionArray[index * 3 + 1] = bubble.position[1];
      positionArray[index * 3 + 2] = bubble.position[2];
      hoverArray[index] = 0;
    });

    const positionAttr = new BufferAttribute(positionArray, 3);
    positionAttr.setUsage(35048); // DynamicDrawUsage
    geo.setAttribute('instancePosition', positionAttr);

    const hoverAttr = new BufferAttribute(hoverArray, 1);
    hoverAttr.setUsage(35048); // DynamicDrawUsage
    geo.setAttribute('instanceHover', hoverAttr);

    return geo;
  }, [bubbles]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, bubbles.length]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        uniforms={{
          uTime: { value: 0 },
          uAmplitude: { value: 0.3 },
          uFrequency: { value: 2.0 },
          uPrimaryColor: { value: [0.0, 0.8, 0.9] }, // Cyan
          uSecondaryColor: { value: [0.9, 0.0, 0.8] }, // Magenta
        }}
      />
    </instancedMesh>
  );
}

