/**
 * VibesMarquee - Reusable marquee component that displays scrolling "VIBES" text
 *
 * Used in phone header, portals, and other UI elements
 */
export class VibesMarquee {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            text: options.text || 'VIBES',
            color: options.color || '#00ffff',
            fontSize: options.fontSize || '8px',
            speed: options.speed || 2, // seconds per cycle
            direction: options.direction || 'horizontal', // 'horizontal' or 'vertical'
            ...options,
        };

        this.marqueeElement = null;
        this.create();
    }

    create() {
        // Remove existing marquee if any
        const existing = this.container.querySelector('.vibes-marquee');
        if (existing) {
            existing.remove();
        }

        // Create marquee container
        this.marqueeElement = document.createElement('div');
        this.marqueeElement.className = 'vibes-marquee';
        this.marqueeElement.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Create scrolling text container
        const textContainer = document.createElement('div');
        textContainer.className = 'vibes-marquee-text';
        textContainer.textContent = `${this.options.text} `.repeat(10); // Repeat for seamless loop
        textContainer.style.cssText = `
            position: absolute;
            white-space: nowrap;
            font-size: ${this.options.fontSize};
            font-weight: bold;
            color: ${this.options.color};
            opacity: 1;
            text-shadow: 
                0 0 4px ${this.options.color}80,
                0 0 8px ${this.options.color}40;
            ${
                this.options.direction === 'vertical'
                    ? 'writing-mode: vertical-rl; text-orientation: mixed;'
                    : ''
            }
            animation: vibesMarquee${this.options.direction === 'vertical' ? 'Vertical' : 'Horizontal'} ${this.options.speed}s linear infinite;
            width: ${this.options.direction === 'vertical' ? '100%' : 'auto'};
            height: ${this.options.direction === 'vertical' ? 'auto' : '100%'};
            ${
                this.options.direction === 'horizontal'
                    ? 'left: 0; top: 50%; will-change: transform;'
                    : 'top: 0; left: 50%; will-change: transform;'
            }
        `;

        this.marqueeElement.appendChild(textContainer);
        this.container.appendChild(this.marqueeElement);

        // Add animation keyframes if not already present
        this.addKeyframes();
    }

    addKeyframes() {
        const styleId = `vibes-marquee-styles-${this.options.direction}`;
        if (document.getElementById(styleId)) {
            return; // Already added
        }

        const style = document.createElement('style');
        style.id = styleId;

        if (this.options.direction === 'vertical') {
            style.textContent = `
                @keyframes vibesMarqueeVertical {
                    0% { transform: translateY(100%); }
                    100% { transform: translateY(-100%); }
                }
            `;
        } else {
            style.textContent = `
                @keyframes vibesMarqueeHorizontal {
                    0% { transform: translateY(-50%) translateX(0); }
                    100% { transform: translateY(-50%) translateX(-50%); }
                }
                .vibes-marquee-text {
                    transform: translateY(-50%);
                }
            `;
        }

        document.head.appendChild(style);
    }

    update(options = {}) {
        this.options = { ...this.options, ...options };
        if (this.marqueeElement) {
            this.marqueeElement.remove();
        }
        this.create();
    }

    destroy() {
        if (this.marqueeElement) {
            this.marqueeElement.remove();
            this.marqueeElement = null;
        }
    }
}
