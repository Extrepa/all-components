/**
 * DebugCommands - Console commands for testing and debugging
 */
export class DebugCommands {
    constructor(systems) {
        this.systems = systems;
        this.setupCommands();
    }

    /**
     * Setup window.debug commands
     */
    setupCommands() {
        window.debug = {
            moveTo: (x, y, z) => this.moveTo(x, y, z),
            setSpeed: (speed) => this.setSpeed(speed),
            toggleDebug: () => this.toggleDebug(),
            showState: () => this.showState(),
            testMovement: () => this.testMovement(),
            getPosition: () => this.getPosition(),
            getVelocity: () => this.getVelocity(),
            setVelocity: (x, y, z) => this.setVelocity(x, y, z),
            resetPosition: () => this.resetPosition(),
            logInput: () => this.logInput(),
            logAvatar: () => this.logAvatar(),
            enableMovementLogging: () => this.enableMovementLogging(),
            disableMovementLogging: () => this.disableMovementLogging(),
        };

        console.log('Debug commands available at window.debug');
        console.log(
            'Commands: moveTo(x,y,z), setSpeed(speed), toggleDebug(), showState(), testMovement()'
        );
        console.log('          enableMovementLogging(), disableMovementLogging()');
    }

    /**
     * Teleport avatar to position
     */
    moveTo(x, y, z) {
        if (!this.systems || !this.systems.avatar) {
            console.error('Avatar not available');
            return;
        }

        const avatar = this.systems.avatar;
        avatar.position.set(x, y, z);
        avatar.group.position.copy(avatar.position);
        console.log(`Avatar moved to: (${x}, ${y}, ${z})`);
    }

    /**
     * Set movement speed
     */
    setSpeed(speed) {
        if (!this.systems || !this.systems.avatar) {
            console.error('Avatar not available');
            return;
        }

        const avatar = this.systems.avatar;
        avatar.speed = speed;
        avatar.runSpeed = speed * 2;
        console.log(`Movement speed set to: ${speed} (run: ${speed * 2})`);
    }

    /**
     * Toggle debug overlay
     */
    toggleDebug() {
        if (!this.systems || !this.systems.devTools) {
            console.error('DevTools not available');
            return;
        }

        this.systems.devTools.toggle();
    }

    /**
     * Show current game state
     */
    showState() {
        if (!this.systems) {
            console.log('Systems not available');
            return;
        }

        if (this.systems.devTools) {
            this.systems.devTools.logState();
        } else {
            this.logState();
        }
    }

    /**
     * Test movement system
     */
    testMovement() {
        if (!this.systems || !this.systems.avatar) {
            console.error('Avatar not available');
            return;
        }

        const avatar = this.systems.avatar;
        console.log('=== Movement Test ===');
        console.log('Current position:', avatar.position.clone());
        console.log('Current velocity:', avatar.velocity.clone());
        console.log('Speed:', avatar.velocity.length());
        console.log('State:', avatar.currentState);
        console.log('Is running:', avatar.isRunning);
        console.log('Is crouching:', avatar.isCrouching);
        console.log('Is hopping:', avatar.isHopping);

        // Test setting velocity directly
        console.log('Setting test velocity...');
        avatar.velocity.set(0.1, 0, 0);
        console.log('Velocity set to:', avatar.velocity.clone());
    }

    /**
     * Get current position
     */
    getPosition() {
        if (!this.systems || !this.systems.avatar) {
            return null;
        }
        return this.systems.avatar.position.clone();
    }

    /**
     * Get current velocity
     */
    getVelocity() {
        if (!this.systems || !this.systems.avatar) {
            return null;
        }
        return this.systems.avatar.velocity.clone();
    }

    /**
     * Set velocity directly
     */
    setVelocity(x, y, z) {
        if (!this.systems || !this.systems.avatar) {
            console.error('Avatar not available');
            return;
        }

        this.systems.avatar.velocity.set(x, y, z);
        console.log(`Velocity set to: (${x}, ${y}, ${z})`);
    }

    /**
     * Reset avatar to origin
     */
    resetPosition() {
        if (!this.systems || !this.systems.avatar) {
            console.error('Avatar not available');
            return;
        }

        this.moveTo(0, 0.5, 0);
        this.systems.avatar.velocity.set(0, 0, 0);
        console.log('Avatar reset to origin');
    }

    /**
     * Log input state
     */
    logInput() {
        if (!this.systems || !this.systems.inputManager) {
            console.error('InputManager not available');
            return;
        }

        const keys = this.systems.inputManager.keys;
        console.log('=== Input State ===');
        console.log('W:', keys.w);
        console.log('A:', keys.a);
        console.log('S:', keys.s);
        console.log('D:', keys.d);
        console.log('Space:', keys.space);
        console.log('Shift:', keys.shift);
        console.log('Ctrl:', keys.ctrl);
    }

    /**
     * Log avatar state
     */
    logAvatar() {
        if (!this.systems || !this.systems.avatar) {
            console.error('Avatar not available');
            return;
        }

        const avatar = this.systems.avatar;
        console.log('=== Avatar State ===');
        console.log('Position:', avatar.position.clone());
        console.log('Velocity:', avatar.velocity.clone());
        console.log('Speed:', avatar.velocity.length());
        console.log('State:', avatar.currentState);
        console.log('Target State:', avatar.targetState);
        console.log('Is Running:', avatar.isRunning);
        console.log('Is Crouching:', avatar.isCrouching);
        console.log('Is Hopping:', avatar.isHopping);
        console.log('Is Sitting:', avatar.isSitting);
        console.log('Base Y:', avatar.baseY);
        console.log('Group Position:', avatar.group.position.clone());
    }

    /**
     * Log full game state
     */
    logState() {
        if (!this.systems) {
            console.log('Systems not available');
            return;
        }

        console.log('=== Full Game State ===');

        if (this.systems.avatar) {
            this.logAvatar();
        }

        if (this.systems.inputManager) {
            this.logInput();
        }

        if (this.systems.camera) {
            console.log('Camera Position:', this.systems.camera.position.clone());
        }

        if (this.systems.devTools) {
            console.log('Performance:', this.systems.devTools.getStats());
        }
    }

    /**
     * Enable movement debug logging
     */
    enableMovementLogging() {
        window.DEBUG_MOVEMENT = true;
        console.log('Movement debug logging ENABLED');
    }

    /**
     * Disable movement debug logging
     */
    disableMovementLogging() {
        window.DEBUG_MOVEMENT = false;
        console.log('Movement debug logging DISABLED');
    }
}
