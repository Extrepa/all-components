// Film grain shader for black and white graininess effect
import * as THREE from 'three';

export const FilmGrainShader = {
    uniforms: {
        tDiffuse: { value: null },
        time: { value: 0.0 },
        intensity: { value: 0.0 },
        desaturate: { value: 0.0 }, // 0 = color, 1 = black and white
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
        uniform float desaturate;
        varying vec2 vUv;
        
        // Noise function for grain
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        // Film grain noise
        float grain(vec2 uv, float time) {
            float grainAmount = random(uv + time * 0.1) * intensity;
            return grainAmount;
        }
        
        void main() {
            vec2 uv = vUv;
            vec4 color = texture2D(tDiffuse, uv);
            
            // Add film grain
            float grainValue = grain(uv, time);
            color.rgb += (grainValue - 0.5) * intensity * 0.3;
            
            // Desaturate (black and white effect)
            float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            color.rgb = mix(color.rgb, vec3(gray), desaturate);
            
            gl_FragColor = color;
        }
    `,
};
