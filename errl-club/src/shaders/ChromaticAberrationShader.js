// Chromatic aberration shader for color channel separation effect
import * as THREE from 'three';

export const ChromaticAberrationShader = {
    uniforms: {
        tDiffuse: { value: null },
        amount: { value: 0.005 }, // Amount of chromatic aberration
        angle: { value: 0.0 }, // Angle of aberration (for rotation effect)
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
        uniform float amount;
        uniform float angle;
        varying vec2 vUv;
        
        void main() {
            vec2 uv = vUv;
            
            // Calculate offset direction based on angle
            vec2 offset = vec2(cos(angle), sin(angle)) * amount;
            
            // Sample each color channel with different offsets
            float r = texture2D(tDiffuse, uv + offset).r;
            float g = texture2D(tDiffuse, uv).g;
            float b = texture2D(tDiffuse, uv - offset).b;
            
            // Combine channels
            gl_FragColor = vec4(r, g, b, texture2D(tDiffuse, uv).a);
        }
    `,
};
