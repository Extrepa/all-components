/**
 * InputManager - Centralized input handling for keyboard, mouse, and resize events
 */
export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            space: false,
            shift: false,
            ctrl: false,
        };

        this.mouse = {
            isDown: false,
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
        };

        this.wheelDelta = 0;

        this.keyCallbacks = new Map();
        this.mouseCallbacks = new Map();
        this.resizeCallbacks = [];

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));

        // Clear all keys when window loses focus (prevents stuck keys)
        window.addEventListener('blur', () => {
            this.keys.w = false;
            this.keys.a = false;
            this.keys.s = false;
            this.keys.d = false;
            this.keys.shift = false;
            this.keys.ctrl = false;
            this.keys.space = false;
            if (window.DEBUG_MOVEMENT) {
                console.log('Window blurred - all keys cleared');
            }
        });

        // Mouse events
        this.canvas.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());

        // Wheel events
        this.canvas.addEventListener('wheel', (event) => this.handleWheel(event));

        // Resize events
        window.addEventListener('resize', () => this.handleResize());
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();

        // Update key state (WASD and arrow keys)
        if (key === 'w' || key === 'arrowup') {
            this.keys.w = true;
            // Debug: Log key press
            if (window.DEBUG_INPUT) {
                console.log('InputManager: W key pressed');
            }
        }
        if (key === 'a' || key === 'arrowleft') {
            this.keys.a = true;
            if (window.DEBUG_INPUT) {
                console.log('InputManager: A key pressed');
            }
        }
        if (key === 's' || key === 'arrowdown') {
            this.keys.s = true;
            if (window.DEBUG_INPUT) {
                console.log('InputManager: S key pressed');
            }
        }
        if (key === 'd' || key === 'arrowright') {
            this.keys.d = true;
            if (window.DEBUG_INPUT) {
                console.log('InputManager: D key pressed');
            }
        }
        if (key === 'shift') {
            this.keys.shift = true;
        }
        if (key === 'control') {
            this.keys.ctrl = true;
        }
        if (key === ' ') {
            this.keys.space = true;
            event.preventDefault();
        }

        // Call registered callbacks
        const callback = this.keyCallbacks.get(key);
        if (callback) {
            callback(event);
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();

        // Update key state (WASD and arrow keys)
        // Explicitly set to false to ensure keys are cleared
        if (key === 'w' || key === 'arrowup') {
            this.keys.w = false;
        }
        if (key === 'a' || key === 'arrowleft') {
            this.keys.a = false;
        }
        if (key === 's' || key === 'arrowdown') {
            this.keys.s = false;
        }
        if (key === 'd' || key === 'arrowright') {
            this.keys.d = false;
        }
        if (key === 'shift') {
            this.keys.shift = false;
        }
        if (key === 'control' || key === 'ctrl') {
            this.keys.ctrl = false;
        }
        if (key === ' ') {
            this.keys.space = false;
            event.preventDefault();
        }

        // Debug: Log key release if debugging
        if (
            window.DEBUG_MOVEMENT &&
            (key === 'a' || key === 'd' || key === 'arrowleft' || key === 'arrowright')
        ) {
            console.log('Key released:', key, 'keys.a:', this.keys.a, 'keys.d:', this.keys.d);
        }
    }

    handleMouseDown(event) {
        this.mouse.isDown = true;
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;

        const callback = this.mouseCallbacks.get('mousedown');
        if (callback) {
            callback(event);
        }
    }

    handleMouseMove(event) {
        if (this.mouse.isDown) {
            this.mouse.deltaX = event.clientX - this.mouse.x;
            this.mouse.deltaY = event.clientY - this.mouse.y;
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;

            const callback = this.mouseCallbacks.get('mousemove');
            if (callback) {
                callback(this.mouse.deltaX, this.mouse.deltaY);
            }
        }
    }

    handleMouseUp() {
        this.mouse.isDown = false;
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;

        const callback = this.mouseCallbacks.get('mouseup');
        if (callback) {
            callback();
        }
    }

    handleWheel(event) {
        event.preventDefault();
        this.wheelDelta = event.deltaY;

        const callback = this.mouseCallbacks.get('wheel');
        if (callback) {
            callback(this.wheelDelta);
        }
    }

    handleResize() {
        this.resizeCallbacks.forEach((callback) => callback());
    }

    // Public API
    isKeyPressed(key) {
        return this.keys[key] || false;
    }

    getMouseDelta() {
        return {
            x: this.mouse.deltaX,
            y: this.mouse.deltaY,
        };
    }

    getWheelDelta() {
        const delta = this.wheelDelta;
        this.wheelDelta = 0; // Reset after reading
        return delta;
    }

    onKeyDown(key, callback) {
        this.keyCallbacks.set(key.toLowerCase(), callback);
    }

    onKeyUp(key, callback) {
        // Store keyup callbacks separately if needed
        // For now, key state is tracked automatically
    }

    onMouseEvent(eventType, callback) {
        this.mouseCallbacks.set(eventType, callback);
    }

    onResize(callback) {
        this.resizeCallbacks.push(callback);
    }
}
