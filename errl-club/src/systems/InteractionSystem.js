// Interaction system for raycasting and object interaction
import * as THREE from 'three';
import { SystemLoop } from './SystemLoop.js';

export class InteractionSystem extends SystemLoop {
    constructor(scene, camera, loopManager = null) {
        super('interaction', 'avatar', 85); // Run after most avatar updates, before UI
        this.scene = scene;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.interactableObjects = [];
        this.currentTarget = null;
        this.maxInteractionDistance = 5.0;

        // Self-register with LoopManager if provided
        if (loopManager) {
            this.register(loopManager);
        }
    }

    // Register an interactable object
    registerInteractable(object, onInteract) {
        this.interactableObjects.push({
            object: object,
            onInteract: onInteract || (() => {}),
            id: object.uuid || Math.random().toString(),
        });
    }

    /**
     * Update interaction system - SystemLoop interface
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} systems - Game systems object
     */
    update(deltaTime, elapsedTime, systems) {
        const camera = systems?.camera || this.camera;
        const avatar = systems?.avatar;

        if (!camera || !avatar) {
            return;
        }

        this.updateInteraction(camera, avatar, systems);
    }

    /**
     * Step 168: Implement interaction raycast from camera direction
     * Original method signature for compatibility
     * @param {THREE.Camera} camera - Camera to cast ray from
     * @param {Object} avatar - Avatar instance
     * @param {Object} systems - Game systems (optional, for event emission)
     */
    updateInteraction(camera, avatar, systems = null) {
        // Cast ray from camera forward
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

        const intersects = this.raycaster.intersectObjects(
            this.interactableObjects.map((item) => item.object),
            true // Check children too
        );

        // Find first interactable object in range
        let newTarget = null;
        for (const intersect of intersects) {
            const interactable = this.interactableObjects.find(
                (item) =>
                    item.object === intersect.object ||
                    (item.object.children && item.object.children.includes(intersect.object))
            );

            if (interactable && intersect.distance <= this.maxInteractionDistance) {
                newTarget = interactable;
                break;
            }
        }

        const prevTarget = this.currentTarget;
        this.currentTarget = newTarget;

        // Emit event if target changed
        if (systems?.eventBus && prevTarget !== newTarget) {
            systems.eventBus.emit('interaction.targetChange', {
                target: newTarget
                    ? {
                          object: newTarget.object,
                          distance:
                              intersects.find((i) => i.object === newTarget.object)?.distance || 0,
                      }
                    : null,
                timestamp: Date.now(),
            });
        }

        // Update reticle visibility
        if (systems) {
            const reticle = document.getElementById('reticle');
            if (reticle) {
                reticle.style.display = newTarget ? 'block' : 'none';
            }
        }

        return newTarget;
    }

    // Step 170: Trigger interaction on current target
    interact() {
        if (this.currentTarget && this.currentTarget.onInteract) {
            this.currentTarget.onInteract();
            return true;
        }
        return false;
    }

    // Step 169: Check if there's a target (for reticle display)
    hasTarget() {
        return this.currentTarget !== null;
    }

    getTarget() {
        return this.currentTarget;
    }

    // Get nearest interactable object to a position (for lock-on camera)
    getNearestInteractable(position) {
        let nearest = null;
        let nearestDistance = Infinity;

        for (const interactable of this.interactableObjects) {
            if (interactable.object && interactable.object.position) {
                const distance = position.distanceTo(interactable.object.position);
                if (distance < nearestDistance && distance <= this.maxInteractionDistance * 2) {
                    nearestDistance = distance;
                    nearest = interactable.object;
                }
            }
        }

        return nearest;
    }
}
