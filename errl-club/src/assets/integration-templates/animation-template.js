/**
 * Animation Integration Template
 *
 * Copy this template and customize for your animation integration
 */

import * as THREE from 'three';

/**
 * Setup animations for model
 * @param {THREE.Group} model - Model with animations
 * @param {Array<THREE.AnimationClip>} animations - Animation clips from GLTF
 * @returns {THREE.AnimationMixer} Animation mixer
 */
export function setup{ANIMATION_NAME}(model, animations) {
    // Create animation mixer
    const mixer = new THREE.AnimationMixer(model);

    // Setup each animation
    animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
        // Configure action properties
        action.loop = THREE.{LOOP_MODE}; // LoopOnce, LoopRepeat, LoopPingPong
        action.timeScale = {TIME_SCALE}; // 1.0 for normal speed
    });

    // Update mixer in animation loop
    // mixer.update(deltaTime);

    console.log('✅ Setup {ANIMATION_NAME}');
    return mixer;
}

/**
 * Template Variables to Replace:
 * - {ANIMATION_NAME} - Animation name
 * - {LOOP_MODE} - Loop mode (LoopOnce, LoopRepeat, LoopPingPong)
 * - {TIME_SCALE} - Time scale (1.0 for normal speed)
 */

