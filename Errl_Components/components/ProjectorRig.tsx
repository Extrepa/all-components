import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { useRef } from 'react';
import { ShaderMaterial, MathUtils } from 'three';
import { ERRL_CONFIG } from '../content/errl-config';

// Import shaders as strings
const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uScrollProgress;
uniform float uAspectRatio;
uniform float uTime;
uniform float uLightIntensity;

varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 lightPos = vec2(0.5, 1.0 - uScrollProgress);
  vec2 uvCorrected = vUv;
  uvCorrected.x *= uAspectRatio;
  
  vec2 lightPosCorrected = vec2(lightPos.x * uAspectRatio, lightPos.y);
  float dist = distance(uvCorrected, lightPosCorrected);
  
  float lightIntensity = smoothstep(0.4, 0.0, dist);
  
  vec2 noiseCoord = vUv * 8.0 + vec2(uTime * 0.1, uTime * 0.05);
  float oilNoise = noise(noiseCoord);
  oilNoise = pow(oilNoise, 2.0);
  
  // Errl color palette (cyan + magenta)
  vec3 primaryColor = vec3(0.0, 0.8, 0.9); // Cyan
  vec3 secondaryColor = vec3(0.9, 0.0, 0.8); // Magenta
  
  // Oil color with noise variation
  vec3 oilColor = primaryColor * 0.4 + secondaryColor * 0.3;
  oilColor += vec3(oilNoise * 0.15);
  
  // Add color shift based on noise for more organic feel
  float colorShift = noise(vUv * 4.0 + uTime * 0.05);
  oilColor = mix(oilColor, mix(primaryColor, secondaryColor, colorShift), 0.2);
  
  vec3 finalColor = oilColor * lightIntensity * uLightIntensity;
  
  // Hotspot (projector bulb center) with warm glow
  float hotspotDist = distance(uvCorrected, lightPosCorrected);
  float hotspot = smoothstep(0.05, 0.0, hotspotDist);
  vec3 hotspotColor = vec3(1.0, 0.95, 0.85); // Warm white
  finalColor += hotspotColor * hotspot * 0.6 * uLightIntensity;
  
  // Edge glow effect (like light bleeding at projector edges)
  float edgeGlow = smoothstep(0.85, 1.0, max(abs(vUv.x - 0.5) * 2.0, abs(vUv.y - 0.5) * 2.0));
  finalColor += primaryColor * edgeGlow * 0.2 * uLightIntensity;
  
  // Edge darkening (projector bed frame)
  float edgeDarken = smoothstep(0.0, 0.2, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
  finalColor *= (0.25 + edgeDarken * 0.75);
  
  // Subtle chromatic aberration at edges (refraction effect)
  float chromaDist = distance(uvCorrected, lightPosCorrected);
  float chroma = smoothstep(0.3, 0.5, chromaDist) * 0.1;
  finalColor.r += chroma * uLightIntensity;
  finalColor.b -= chroma * 0.5 * uLightIntensity;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function ProjectorRig() {
  const scroll = useScroll();
  const materialRef = useRef<ShaderMaterial>(null);
  const { viewport, clock } = useThree();
  const currentIntensityRef = useRef(0.8);
  const lastSectionIndexRef = useRef(-1);
  const aspectRatioRef = useRef(1);
  const totalSections = ERRL_CONFIG.sections.length;

  // Update aspect ratio only when viewport changes
  if (materialRef.current) {
    const newAspectRatio = viewport.width / viewport.height;
    if (Math.abs(newAspectRatio - aspectRatioRef.current) > 0.001) {
      aspectRatioRef.current = newAspectRatio;
      materialRef.current.uniforms.uAspectRatio.value = newAspectRatio;
    }
  }

  useFrame(() => {
    if (!materialRef.current) return;

    // Direct sync: scroll.offset is 0 -> 1
    materialRef.current.uniforms.uScrollProgress.value = scroll.offset;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();

    // Only recalculate section index if scroll position changed significantly
    const sectionIndex = Math.floor(scroll.offset * totalSections);
    if (sectionIndex !== lastSectionIndexRef.current) {
      lastSectionIndexRef.current = sectionIndex;
      const clampedIndex = Math.min(sectionIndex, totalSections - 1);
      const targetIntensity = ERRL_CONFIG.sections[clampedIndex]?.lightIntensity ?? 0.8;

      // Smoothly interpolate intensity
      currentIntensityRef.current = MathUtils.lerp(
        currentIntensityRef.current,
        targetIntensity,
        0.05
      );
    } else {
      // Continue lerping even if section hasn't changed (for smooth transitions)
      const clampedIndex = Math.min(sectionIndex, totalSections - 1);
      const targetIntensity = ERRL_CONFIG.sections[clampedIndex]?.lightIntensity ?? 0.8;
      currentIntensityRef.current = MathUtils.lerp(
        currentIntensityRef.current,
        targetIntensity,
        0.05
      );
    }
    
    materialRef.current.uniforms.uLightIntensity.value = currentIntensityRef.current;
  });

  return (
    <mesh>
      <planeGeometry args={[10, 10]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uScrollProgress: { value: 0 },
          uAspectRatio: { value: 1 },
          uTime: { value: 0 },
          uLightIntensity: { value: 0.8 },
        }}
      />
    </mesh>
  );
}

