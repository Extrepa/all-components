import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const GlowingOutlineMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0x00ffff),
    glowColor: new THREE.Color(0xff00ff),
    dashLength: 0.2,
    gapLength: 0.1,
    speed: 0.5,
  },
  `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  `uniform float time; uniform vec3 color; uniform vec3 glowColor; uniform float dashLength; uniform float gapLength; uniform float speed; varying vec2 vUv;
   void main() {
     float totalLength = dashLength + gapLength;
     float move = mod(time * speed, totalLength);
     float progress = mod(vUv.x + move, totalLength);
     float isDash = step(progress, dashLength);
     float pulse = sin(time * 3.0) * 0.5 + 0.5;
     vec3 finalColor = mix(color, glowColor, pulse);
     gl_FragColor = vec4(finalColor, isDash); 
   }`
);

extend({ GlowingOutlineMaterial });
export { GlowingOutlineMaterial };