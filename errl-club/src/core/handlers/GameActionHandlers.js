/**
 * GameActionHandlers - Handles game-specific keyboard actions beyond basic movement
 *
 * This module extracts game action handlers from main.js.
 * Basic movement (WASD) is handled by InputManager.
 */

/**
 * Register game action handlers (interact, throw, emote wheel, etc.)
 * @param {Object} systems - Game systems object containing avatar, interactionSystem, etc.
 * @returns {Function} Cleanup function to remove event listeners
 */
export function registerGameActionHandlers(systems) {
    const {
        avatar,
        interactionSystem,
        seatableObjects,
        scene,
        cameraController,
        replaySystem,
        teleportSystem,
        eventSystem,
        visualEffects,
        composer,
        throwableDrips = [],
        emoteWheel = null,
        helpPanel = null,
        devTools = null,
        devMenu = null,
        debugOverlay = null,
        visualizerStylePicker = null,
        visualRecorder = null,
        collectionGoalsUI = null,
        assetAttributionPanel = null,
        codexAssetIntegration = null,
        particleSystem = null,
        vibeMeter = null,
        replayLibrary = null,
    } = systems;

    let emoteWheelInstance = emoteWheel;

    // Handler for Tab key - Emote wheel
    const handleTabKey = async (event) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            if (!emoteWheelInstance) {
                // Lazy load EmoteWheel on first use
                const { EmoteWheel } = await import('../../ui/EmoteWheel.js');
                emoteWheelInstance = new EmoteWheel(avatar);
                emoteWheelInstance.toggle();
            } else {
                emoteWheelInstance.toggle();
            }
        }
    };

    // Handler for E key - Interact
    const handleEKey = (event) => {
        const key = event.key.toLowerCase();
        if (key === 'e' || key === 'E') {
            if (interactionSystem?.interact()) {
                console.log('Interacted with object');
            }

            // Check for seatable objects
            if (seatableObjects) {
                for (const seatable of seatableObjects) {
                    if (seatable.canUse(avatar.position)) {
                        if (seatable.isOccupiedBy(avatar)) {
                            seatable.release();
                            console.log('Stood up from seat');
                        } else {
                            seatable.use(avatar);
                            console.log('Sat down');
                        }
                        break;
                    }
                }
            }
        }
    };

    // Handler for Q key - Throw drip orb
    const handleQKey = (event) => {
        const key = event.key.toLowerCase();
        if (key === 'q' || (key === 'Q' && avatar && scene)) {
            // Import THREE and ThrowableDrip dynamically
            Promise.all([import('three'), import('../../interactions/ThrowableDrip.js')])
                .then(([THREE, { ThrowableDrip }]) => {
                    const throwDirection = new THREE.Vector3(0, 0, -1)
                        .applyQuaternion(avatar.mesh.quaternion)
                        .normalize();
                    const throwVelocity = throwDirection.multiplyScalar(5);
                    throwVelocity.y = 3; // Add upward component

                    const drip = new ThrowableDrip(
                        scene,
                        avatar.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
                        throwVelocity,
                        0xff00ff
                    );
                    throwableDrips.push(drip);
                })
                .catch((err) => {
                    // eslint-disable-next-line no-console
                    console.warn('Failed to load ThrowableDrip:', err);
                });
        }
    };

    // Handler for Shift+D - Dance
    const handleDanceKey = (event) => {
        const key = event.key.toLowerCase();
        if (key === 'd' && event.shiftKey && avatar) {
            avatar.triggerDance();
        }
    };

    // Main handler that routes to specific handlers
    const handleKeyDown = (event) => {
        handleTabKey(event);
        handleEKey(event);
        handleQKey(event);
        handleDanceKey(event);
        // Additional handlers would go here
    };

    document.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
}
