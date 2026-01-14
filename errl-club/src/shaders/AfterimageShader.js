// Afterimage/ghost trail shader for motion blur-like effect
import * as THREE from 'three';

export const AfterimageShader = {
    uniforms: {
        tDiffuse: { value: null },
        tOldTexture: { value: null }, // Previous frame texture
        amount: { value: 0.5 }, // Blend amount (0 = no trail, 1 = full trail)
        useOldTexture: { value: 0.0 }, // Boolean flag: 1.0 = use old texture, 0.0 = don't
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
        uniform sampler2D tOldTexture;
        uniform float amount;
        uniform float useOldTexture;
        varying vec2 vUv;
        
        void main() {
            vec4 current = texture2D(tDiffuse, vUv);
            
            // Only use old texture if useOldTexture flag is set
            if (useOldTexture > 0.5) {
                vec4 old = texture2D(tOldTexture, vUv);
                
                // Blend current frame with old frame
                vec4 color = mix(current, old, amount);
                
                // Fade out old frame slightly
                color.a = max(current.a, old.a * 0.95);
                
                gl_FragColor = color;
            } else {
                // Fallback: just use current frame
                gl_FragColor = current;
            }
        }
    `,
};
