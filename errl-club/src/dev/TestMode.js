/**
 * TestMode - Isolated testing environment with grid overlay and movement testing
 */
import * as THREE from 'three';

export class TestMode {
    constructor(scene, systems) {
        this.scene = scene;
        this.systems = systems;
        this.enabled = false;

        // Test environment objects
        this.gridHelper = null;
        this.axesHelper = null;
        this.testArea = null;
        this.movementHistory = [];
        this.maxHistoryLength = 100;

        // Step-by-step movement testing
        this.stepMode = false;
        this.stepIndex = 0;
        this.movementSteps = [];
    }

    /**
     * Toggle test mode
     */
    toggle() {
        this.enabled = !this.enabled;
        this.setVisible(this.enabled);
        console.log(`Test Mode: ${this.enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    /**
     * Setup test environment
     */
    setup() {
        // Create grid overlay
        this.gridHelper = new THREE.GridHelper(20, 20, 0x00ff00, 0x004400);
        this.gridHelper.visible = false;
        this.scene.add(this.gridHelper);

        // Create coordinate axes
        this.axesHelper = new THREE.AxesHelper(5);
        this.axesHelper.visible = false;
        this.scene.add(this.axesHelper);

        // Create test area boundaries (visual)
        const testAreaGeometry = new THREE.BoxGeometry(10, 0.1, 10);
        const testAreaMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0.2,
            wireframe: true,
        });
        this.testArea = new THREE.Mesh(testAreaGeometry, testAreaMaterial);
        this.testArea.position.set(0, 0.05, 0);
        this.testArea.visible = false;
        this.scene.add(this.testArea);
    }

    /**
     * Set visibility of all test mode objects
     */
    setVisible(visible) {
        if (this.gridHelper) {
            this.gridHelper.visible = visible;
        }
        if (this.axesHelper) {
            this.axesHelper.visible = visible;
        }
        if (this.testArea) {
            this.testArea.visible = visible;
        }
    }

    /**
     * Update test mode (called each frame)
     */
    update(deltaTime, elapsedTime) {
        if (!this.enabled) {
            return;
        }

        // Record movement history
        if (this.systems && this.systems.avatar) {
            const avatar = this.systems.avatar;
            const position = avatar.position.clone();

            this.movementHistory.push({
                time: elapsedTime,
                position: position,
                velocity: avatar.velocity.clone(),
                state: avatar.currentState,
            });

            // Limit history length
            if (this.movementHistory.length > this.maxHistoryLength) {
                this.movementHistory.shift();
            }
        }

        // Handle step mode
        if (this.stepMode && this.movementSteps.length > 0) {
            // Step mode logic would go here
        }
    }

    /**
     * Enable step-by-step movement testing
     */
    enableStepMode() {
        this.stepMode = true;
        this.stepIndex = 0;
        console.log('Step mode enabled');
    }

    /**
     * Disable step-by-step movement testing
     */
    disableStepMode() {
        this.stepMode = false;
        this.stepIndex = 0;
        console.log('Step mode disabled');
    }

    /**
     * Add a movement step for testing
     */
    addMovementStep(direction, distance) {
        this.movementSteps.push({ direction, distance });
    }

    /**
     * Clear movement history
     */
    clearHistory() {
        this.movementHistory = [];
        console.log('Movement history cleared');
    }

    /**
     * Get movement history
     */
    getHistory() {
        return [...this.movementHistory];
    }

    /**
     * Visualize movement history as a trail
     */
    visualizeHistory() {
        if (this.movementHistory.length < 2) {
            return;
        }

        // Create line geometry from history
        const points = this.movementHistory.map((h) => h.position);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5,
            linewidth: 2,
        });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);

        // Remove after a delay
        setTimeout(() => {
            this.scene.remove(line);
            geometry.dispose();
            material.dispose();
        }, 5000);
    }

    /**
     * Reset test environment
     */
    reset() {
        this.clearHistory();
        this.movementSteps = [];
        this.stepIndex = 0;

        // Reset avatar to origin if available
        if (this.systems && this.systems.avatar) {
            this.systems.avatar.position.set(0, 0.5, 0);
            this.systems.avatar.velocity.set(0, 0, 0);
            if (this.systems.avatar.group) {
                this.systems.avatar.group.position.copy(this.systems.avatar.position);
            }
        }

        console.log('Test environment reset');
    }

    /**
     * Get test statistics
     */
    getStats() {
        return {
            enabled: this.enabled,
            historyLength: this.movementHistory.length,
            stepMode: this.stepMode,
            stepIndex: this.stepIndex,
            totalSteps: this.movementSteps.length,
        };
    }
}
