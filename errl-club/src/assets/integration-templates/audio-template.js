/**
 * Audio Integration Template
 *
 * Copy this template and customize for your audio integration
 */

/**
 * Load and play audio
 * @param {AudioSystem} audioSystem - AudioSystem instance
 * @param {Object} options - Audio options
 * @returns {Promise} Resolves when audio is loaded
 */
export async function load{AUDIO_NAME}(audioSystem, options = {}) {
    try {
        // Load audio file
        await audioSystem.loadFile('/audio/{CATEGORY}/{AUDIO_NAME}.ogg');

        // Configure audio properties
        if (audioSystem.audioSource) {
            audioSystem.audioSource.volume = {VOLUME}; // 0-1
            audioSystem.audioSource.loop = {LOOP}; // true or false
        }

        console.log('✅ Loaded {AUDIO_NAME}');
        return true;
    } catch (error) {
        console.error('❌ Failed to load {AUDIO_NAME}:', error);
        return false;
    }
}

/**
 * Template Variables to Replace:
 * - {AUDIO_NAME} - Audio file name
 * - {CATEGORY} - Audio category (music, sfx, ambient)
 * - {VOLUME} - Volume level (0-1)
 * - {LOOP} - Whether to loop (true/false)
 */

