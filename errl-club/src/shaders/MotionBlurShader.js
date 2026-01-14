/**
 * MotionBlurShader - Motion blur shader for post-processing
 *
 * Creates motion blur effect tied to camera intensity
 * Uses velocity buffer for motion detection
 *
 * @module MotionBlurShader
 */
import * as THREE from 'three';

export const MotionBlurShader = {
    uniforms: {
        tDiffuse: { value: null },
        velocity: { value: null },
        intensity: { value: 0.5 },
        samples: { value: 10 },
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
        uniform sampler2D velocity;
        uniform float intensity;
        uniform int samples;
        varying vec2 vUv;

        void main() {
            vec2 vel = texture2D(velocity, vUv).rg;
            vec4 color = texture2D(tDiffuse, vUv);
            
            // Apply motion blur
            if (length(vel) > 0.001) {
                vec2 blurDir = normalize(vel) * intensity;
                int sampleCount = min(samples, 20);
                
                for (int i = 1; i <= 20; i++) {
                    if (i > sampleCount) break;
                    float weight = 1.0 / float(sampleCount);
                    vec2 offset = blurDir * (float(i) / float(sampleCount));
                    color += texture2D(tDiffuse, vUv + offset) * weight;
                }
            }
            
            gl_FragColor = color;
        }
    `,
};

/**
 * Create motion blur pass for EffectComposer
 * @param {Object} options - Motion blur options
 * @returns {Object} Motion blur pass configuration
 */
export function createMotionBlurPass(options = {}) {
    const { intensity = 0.5, samples = 10 } = options;

    return {
        shader: MotionBlurShader,
        uniforms: {
            intensity: { value: intensity },
            samples: { value: samples },
        },
    };
}
