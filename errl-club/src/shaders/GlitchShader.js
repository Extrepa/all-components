// Procedural noise-based shader to simulate analog glitch
import * as THREE from 'three';

export const GlitchShader = {
    uniforms: {
        tDiffuse: { value: null },
        time: { value: 0.0 },
        intensity: { value: 0.5 },
    },

    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float time;
        uniform float intensity;
        varying vec2 vUv;
        
        // Simple noise function
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
            vec2 uv = vUv;
            
            // Add horizontal line offsets (glitch effect)
            float lineOffset = sin(uv.y * 20.0 + time * 10.0) * intensity * 0.02;
            uv.x += lineOffset;
            
            // Add random noise
            float n = noise(uv + time);
            uv += (n - 0.5) * intensity * 0.01;
            
            // Sample texture with glitch offset
            vec4 color = texture2D(tDiffuse, uv);
            
            // Add color channel separation (chromatic aberration effect)
            float r = texture2D(tDiffuse, uv + vec2(intensity * 0.01, 0.0)).r;
            float g = texture2D(tDiffuse, uv).g;
            float b = texture2D(tDiffuse, uv - vec2(intensity * 0.01, 0.0)).b;
            
            gl_FragColor = vec4(r, g, b, color.a);
        }
    `,
};
