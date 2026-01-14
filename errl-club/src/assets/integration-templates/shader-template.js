/**
 * Shader Integration Template
 *
 * Copy this template and customize for your shader integration
 */

import * as THREE from 'three';

/**
 * Create shader material
 * @param {Object} uniforms - Shader uniforms
 * @returns {THREE.ShaderMaterial} Shader material
 */
export function create{SHADER_NAME}Material(uniforms = {}) {
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            ...uniforms,
        },
        vertexShader: `
            // Vertex shader code
            varying vec3 vPosition;
            void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            // Fragment shader code
            uniform float time;
            varying vec3 vPosition;
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
            }
        `,
    });

    return material;
}

/**
 * Template Variables to Replace:
 * - {SHADER_NAME} - Shader name
 * - Add your vertex and fragment shader code
 * - Define uniforms as needed
 */

