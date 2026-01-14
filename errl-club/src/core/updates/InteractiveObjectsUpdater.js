/**
 * InteractiveObjectsUpdater - Handles updates for interactive environment objects
 *
 * Extracted from main.js's animate() function.
 */

/**
 * Update interactive environment objects (doors, teleporters, fog vents, portal rifts)
 * @param {Array} doors - Array of door objects
 * @param {Array} teleporters - Array of teleporter objects
 * @param {Array} fogVents - Array of fog vent objects
 * @param {Array} portalRifts - Array of portal rift objects
 * @param {Object} avatar - Avatar instance
 * @param {number} deltaTime - Time since last frame
 * @param {number} elapsedTime - Total elapsed time
 * @param {Object} systems - Game systems
 * @param {Object} systems.beatDetector - Beat detector instance
 * @param {Uint8Array} systems.audioData - Audio data array
 * @param {Object} systems.frequencyBands - Frequency bands object
 * @param {THREE.Clock} systems.clock - Three.js clock
 */
export function updateInteractiveObjects(
    doors,
    teleporters,
    fogVents,
    portalRifts,
    avatar,
    deltaTime,
    elapsedTime,
    systems
) {
    const { beatDetector, audioData, frequencyBands, clock } = systems;

    // Step 209-215: Update interactive environment elements
    // Update doors (auto-open when avatar approaches)
    if (doors) {
        for (const door of doors) {
            door.update(deltaTime);
            if (door.checkProximity(avatar.position)) {
                door.open();
            } else {
                door.close();
            }
        }
    }

    // Update teleporters
    if (teleporters) {
        for (const teleporter of teleporters) {
            teleporter.update(deltaTime, elapsedTime);
            if (teleporter.checkActivation(avatar.position)) {
                teleporter.teleport(avatar);
            }
        }
    }

    // Update fog vents
    if (fogVents) {
        const bassEnergy = frequencyBands?.bass || 0;
        for (const fogVent of fogVents) {
            fogVent.update(deltaTime, bassEnergy);
        }
    }

    // Codex Enhancement: Update portal rifts with beat synchronization
    if (portalRifts) {
        let beatDetected = false;
        let beatIntensity = 0;
        if (beatDetector && audioData && clock) {
            const currentTime = clock.getElapsedTime();
            beatDetected = beatDetector.detectBeat(audioData, currentTime);
            beatIntensity = frequencyBands?.bass || 0;
        }
        for (const portal of portalRifts) {
            portal.update(deltaTime, elapsedTime, beatDetected, beatIntensity);
        }
    }
}

/**
 * Update seatable objects
 * @param {Array} seatableObjects - Array of seatable objects
 * @param {Object} avatar - Avatar instance
 */
export function updateSeatableObjects(seatableObjects, avatar) {
    if (!seatableObjects || !avatar) {
        return;
    }

    // Step 237: Update seatable objects
    for (const seatable of seatableObjects) {
        if (seatable.canUse(avatar.position)) {
            // Show interaction hint (could add visual indicator)
            // Avatar can press E key to sit
        }
    }
}
