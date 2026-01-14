// Manager for all collectibles in the scene
import * as THREE from 'three';
import { DripCollectible } from './DripCollectible.js';
import { BubbleCollectible } from './BubbleCollectible.js';
import { ErrlFragment } from './ErrlFragment.js';
import { GlowBall } from './GlowBall.js';
import { SystemLoop } from '../systems/SystemLoop.js';

export class CollectibleManager extends SystemLoop {
    constructor(scene, audioContext, collectionTracker = null, loopManager = null) {
        super('collectibles', 'avatar', 35); // Run after physics, before other avatar updates
        this.scene = scene;
        this.audioContext = audioContext;
        this.collectionTracker = collectionTracker;
        this.collectibles = [];
        this.collectedCount = 0;
        this.fragmentCount = 0;
        this.bubbles = [];
        this.glowBalls = [];
        this.screenRippleCallback = null;

        // Self-register with LoopManager if provided
        if (loopManager) {
            this.register(loopManager);
        }
    }

    // Task 2.2: Set collection tracker (for late initialization)
    setCollectionTracker(collectionTracker) {
        this.collectionTracker = collectionTracker;
    }

    // Add a drip collectible
    addDrip(position, color = null) {
        // Random color if not specified
        if (!color) {
            const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff0000];
            color = colors[Math.floor(Math.random() * colors.length)];
        }

        const drip = new DripCollectible(this.scene, position, color);
        this.collectibles.push(drip);
        return drip;
    }

    // Spawn drips in random locations
    spawnDrips(count, bounds) {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * bounds.width;
            const z = (Math.random() - 0.5) * bounds.depth;
            const y = bounds.height || 1.0;

            this.addDrip(new THREE.Vector3(x, y, z));
        }
    }

    // Step 205-206: Add bubble collectible
    addBubble(position, size = 1.0) {
        const bubble = new BubbleCollectible(this.scene, position, size);
        this.bubbles.push(bubble);
        return bubble;
    }

    // Step 207-208: Add Errl fragment
    addFragment(position) {
        const fragment = new ErrlFragment(this.scene, position);
        this.collectibles.push(fragment);
        return fragment;
    }

    // Spawn bubbles
    spawnBubbles(count, bounds) {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * bounds.width;
            const z = (Math.random() - 0.5) * bounds.depth;
            const y = (bounds.height || 2.0) + Math.random() * 2; // Float higher

            this.addBubble(new THREE.Vector3(x, y, z), 0.8 + Math.random() * 0.4);
        }
    }

    // Spawn fragments (rarer)
    spawnFragments(count, bounds) {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * bounds.width;
            const z = (Math.random() - 0.5) * bounds.depth;
            const y = bounds.height || 1.5;

            this.addFragment(new THREE.Vector3(x, y, z));
        }
    }

    // Step 233-235: Add glow-ball
    addGlowBall(position) {
        const glowBall = new GlowBall(this.scene, position);
        this.glowBalls.push(glowBall);
        return glowBall;
    }

    spawnGlowBalls(count, bounds) {
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * bounds.width;
            const z = (Math.random() - 0.5) * bounds.depth;
            const y = bounds.height || 1.5;

            this.addGlowBall(new THREE.Vector3(x, y, z));
        }
    }

    /**
     * Set screen ripple callback for bubble pops
     * @param {Function} callback - Callback function(position)
     */
    setScreenRippleCallback(callback) {
        this.screenRippleCallback = callback;
    }

    /**
     * Update all collectibles - SystemLoop interface
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} systems - Game systems object
     */
    update(deltaTime, elapsedTime, systems) {
        const avatar = systems?.avatar;
        if (!avatar) {
            return;
        }

        // Use stored callback or get from systems
        const screenRippleCallback = this.screenRippleCallback || null;

        this.updateCollectibles(deltaTime, avatar, elapsedTime, screenRippleCallback);
    }

    /**
     * Update all collectibles - original method signature for compatibility
     * @param {number} deltaTime - Time since last frame
     * @param {Object} avatar - Avatar instance
     * @param {number} elapsedTime - Total elapsed time
     * @param {Function} screenRippleCallback - Callback for bubble pops
     */
    updateCollectibles(deltaTime, avatar, elapsedTime, screenRippleCallback = null) {
        if (!avatar) {
            return;
        }

        // Update drips and fragments
        this.collectibles = this.collectibles.filter((collectible) => {
            const stillActive = collectible.update(deltaTime, elapsedTime);

            // Check for collection
            if (!collectible.collected && collectible.checkCollection) {
                if (collectible.checkCollection(avatar.position)) {
                    if (collectible.collect(this.audioContext)) {
                        if (collectible.applyColorToAvatar) {
                            collectible.applyColorToAvatar(avatar);
                        }
                        this.collectedCount++;
                        if (collectible.constructor.name === 'ErrlFragment') {
                            this.fragmentCount++;
                            // Task 4.1: Record fragment collection
                            if (this.collectionTracker) {
                                this.collectionTracker.recordCollection('fragments');
                            }
                        } else {
                            // Task 4.1: Record drip collection
                            if (this.collectionTracker) {
                                this.collectionTracker.recordCollection('drips');
                            }
                        }
                        console.log(
                            'Collectible collected! Total:',
                            this.collectedCount,
                            'Fragments:',
                            this.fragmentCount
                        );
                    }
                }
            }

            return stillActive;
        });

        // Update bubbles
        this.bubbles = this.bubbles.filter((bubble) => {
            const stillActive = bubble.update(deltaTime, elapsedTime);

            // Check for pop
            if (!bubble.popped && bubble.checkPop(avatar.position)) {
                bubble.pop(this.audioContext, screenRippleCallback);
                // Task 4.1: Record bubble collection
                if (this.collectionTracker) {
                    this.collectionTracker.recordCollection('bubbles');
                }
            }

            return stillActive;
        });

        // Update glow balls
        this.glowBalls = this.glowBalls.filter((glowBall) => {
            const stillActive = glowBall.update(deltaTime, elapsedTime);

            // Check for collection
            if (!glowBall.collected && glowBall.checkCollection(avatar.position)) {
                if (glowBall.collect(this.audioContext)) {
                    // Step 234-235: Apply power-up effect
                    glowBall.applyPowerUp(avatar, 10.0);
                    // Task 4.1: Record glow ball collection
                    if (this.collectionTracker) {
                        this.collectionTracker.recordCollection('glowBalls');
                    }
                    console.log('Glow ball collected! Avatar powered up!');
                }
            }

            return stillActive;
        });
    }

    // Step 208: Get collection stats (for progress bar HUD)
    getStats() {
        return {
            total: this.collectibles.length + this.collectedCount,
            collected: this.collectedCount,
            remaining: this.collectibles.length,
            fragments: this.fragmentCount,
            bubbles: this.bubbles.length,
        };
    }

    // Clear all collectibles
    clear() {
        for (const collectible of this.collectibles) {
            this.scene.remove(collectible.mesh);
        }
        for (const bubble of this.bubbles) {
            this.scene.remove(bubble.mesh);
        }
        for (const glowBall of this.glowBalls) {
            this.scene.remove(glowBall.mesh);
        }
        this.collectibles = [];
        this.bubbles = [];
        this.glowBalls = [];
        this.collectedCount = 0;
        this.fragmentCount = 0;
    }
}
