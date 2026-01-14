/**
 * VibesLiquidBar - Reusable liquid bar component with rainbow gradient effect
 *
 * Used for scrollbar thumbs, progress bars, and other UI elements
 * Matches the vibe meter's liquid rainbow aesthetic
 */
export class VibesLiquidBar {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            width: options.width || '100%',
            height: options.height || '100%',
            borderRadius: options.borderRadius || '4px',
            vibeLevel: options.vibeLevel || 0, // 0 to 1
            ...options,
        };

        this.barElement = null;
        this.create();
    }

    create() {
        // Remove existing bar if any
        const existing = this.container.querySelector('.vibes-liquid-bar');
        if (existing) {
            existing.remove();
        }

        // Create bar container
        this.barElement = document.createElement('div');
        this.barElement.className = 'vibes-liquid-bar';
        this.barElement.style.cssText = `
            position: relative;
            width: ${this.options.width};
            height: ${this.options.height};
            border-radius: ${this.options.borderRadius};
            overflow: hidden;
            background: rgba(0, 0, 0, 0.3);
        `;

        // Create liquid fill with rainbow gradient
        const fill = document.createElement('div');
        fill.className = 'vibes-liquid-fill';
        fill.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                #ff0080 0%,
                #ff8000 14%,
                #ffff00 28%,
                #80ff00 42%,
                #00ff80 57%,
                #00ffff 71%,
                #0080ff 85%,
                #8000ff 100%
            );
            background-size: 200% 100%;
            background-position: 0% 0%;
            animation: rainbowFlow 3s linear infinite;
            opacity: ${Math.max(0.8, this.options.vibeLevel)};
            transition: opacity 0.3s ease;
            box-shadow: 
                0 0 10px rgba(0, 255, 255, 0.6),
                inset 0 0 10px rgba(255, 0, 255, 0.4);
        `;

        // Add glitter effect overlay
        const glitter = document.createElement('div');
        glitter.className = 'vibes-liquid-glitter';
        glitter.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.25) 0%, transparent 50%);
            animation: glitterMove 4s ease-in-out infinite;
            pointer-events: none;
        `;

        this.barElement.appendChild(fill);
        this.barElement.appendChild(glitter);
        this.container.appendChild(this.barElement);

        // Add animations if not already present
        this.addAnimations();

        // Store references
        this.fillElement = fill;
    }

    addAnimations() {
        const styleId = 'vibes-liquid-bar-styles';
        if (document.getElementById(styleId)) {
            return; // Already added
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes rainbowFlow {
                0% { background-position: 0% 0%; }
                100% { background-position: 200% 0%; }
            }
            @keyframes glitterMove {
                0%, 100% { transform: translate(0, 0); opacity: 0.8; }
                50% { transform: translate(10px, 10px); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    setVibeLevel(vibeLevel) {
        this.options.vibeLevel = Math.max(0, Math.min(1, vibeLevel));
        if (this.fillElement) {
            this.fillElement.style.opacity = this.options.vibeLevel.toString();
        }
    }

    update(options = {}) {
        this.options = { ...this.options, ...options };
        if (this.barElement) {
            this.barElement.remove();
        }
        this.create();
    }

    destroy() {
        if (this.barElement) {
            this.barElement.remove();
            this.barElement = null;
        }
        this.fillElement = null;
    }
}
