// Color grading shader with LUT (Look-Up Table) support
import * as THREE from 'three';

export const ColorGradingShader = {
    uniforms: {
        tDiffuse: { value: null },
        tLUT: { value: null }, // LUT texture (optional)
        lutSize: { value: 8.0 }, // Size of LUT (e.g., 8x8x8 = 8)
        useLUT: { value: 0.0 }, // Boolean flag: 1.0 = use LUT, 0.0 = don't
        intensity: { value: 1.0 }, // Intensity of color grading (0 = no effect, 1 = full effect)
        // Color adjustment parameters
        brightness: { value: 0.0 }, // -1 to 1
        contrast: { value: 0.0 }, // -1 to 1
        saturation: { value: 0.0 }, // -1 to 1
        hue: { value: 0.0 }, // -1 to 1 (hue shift)
        // Color channel multipliers
        rMultiplier: { value: 1.0 },
        gMultiplier: { value: 1.0 },
        bMultiplier: { value: 1.0 },
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
        uniform sampler2D tLUT;
        uniform float lutSize;
        uniform float useLUT;
        uniform float intensity;
        uniform float brightness;
        uniform float contrast;
        uniform float saturation;
        uniform float hue;
        uniform float rMultiplier;
        uniform float gMultiplier;
        uniform float bMultiplier;
        varying vec2 vUv;
        
        // Convert RGB to HSV
        vec3 rgb2hsv(vec3 c) {
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
            
            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }
        
        // Convert HSV to RGB
        vec3 hsv2rgb(vec3 c) {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }
        
        // Sample LUT (if provided)
        vec3 sampleLUT(vec3 color) {
            float scale = (lutSize - 1.0) / lutSize;
            float offset = 1.0 / (2.0 * lutSize);
            
            vec3 lutCoord = color * scale + offset;
            
            // Calculate LUT texture coordinates
            float cell = floor(lutCoord.b * lutSize);
            float cellX = mod(cell, lutSize);
            float cellY = floor(cell / lutSize);
            
            vec2 lutUV = vec2(
                (lutCoord.r + cellX) / lutSize,
                (lutCoord.g + cellY) / lutSize
            );
            
            return texture2D(tLUT, lutUV).rgb;
        }
        
        void main() {
            vec4 original = texture2D(tDiffuse, vUv);
            vec3 color = original.rgb;
            
            // Apply LUT if available (use useLUT flag instead of null check)
            if (useLUT > 0.5) {
                color = sampleLUT(color);
            }
            
            // Apply color channel multipliers
            color.r *= rMultiplier;
            color.g *= gMultiplier;
            color.b *= bMultiplier;
            
            // Convert to HSV for hue/saturation adjustments
            vec3 hsv = rgb2hsv(color);
            
            // Adjust hue
            hsv.x = mod(hsv.x + hue, 1.0);
            
            // Adjust saturation
            hsv.y = clamp(hsv.y + saturation, 0.0, 1.0);
            
            // Convert back to RGB
            color = hsv2rgb(hsv);
            
            // Apply brightness
            color += brightness;
            
            // Apply contrast
            color = (color - 0.5) * (1.0 + contrast) + 0.5;
            
            // Clamp values
            color = clamp(color, 0.0, 1.0);
            
            // Blend with original based on intensity
            color = mix(original.rgb, color, intensity);
            
            gl_FragColor = vec4(color, original.a);
        }
    `,
};
