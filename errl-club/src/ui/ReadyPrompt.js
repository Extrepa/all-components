/**
 * ReadyPrompt - Shows "Are you ready?" prompt on every page load
 */
import { DESIGN_SYSTEM } from './designSystem.js';

export class ReadyPrompt {
    constructor(onReady) {
        this.onReady = onReady;
        this.element = null;
        this.createUI();
    }

    createUI() {
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'ready-prompt-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;

        // Create prompt container
        const container = document.createElement('div');
        container.style.cssText = `
            background: linear-gradient(135deg, rgba(100, 50, 200, 0.9), rgba(200, 50, 100, 0.9));
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            padding: 40px 60px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            max-width: 500px;
        `;

        // Create title
        const title = document.createElement('h2');
        title.textContent = 'Are you ready?';
        title.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            font-size: 36px;
            margin: 0 0 20px 0;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            font-weight: bold;
        `;

        // Create description
        const description = document.createElement('p');
        description.textContent = 'Get ready to enter the club!';
        description.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            opacity: 0.9;
            font-size: 18px;
            margin: 0 0 30px 0;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 20px;
            justify-content: center;
        `;

        // Create Yes button
        const yesButton = document.createElement('button');
        yesButton.textContent = 'Yes';
        yesButton.style.cssText = `
            background: rgba(0, 255, 100, 0.8);
            border: ${DESIGN_SYSTEM.borders.width} solid rgba(255, 255, 255, 0.5);
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 15px 40px;
            color: ${DESIGN_SYSTEM.colors.text};
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        yesButton.onmouseover = () => {
            yesButton.style.background = 'rgba(0, 255, 100, 1)';
            yesButton.style.transform = 'scale(1.05)';
        };
        yesButton.onmouseout = () => {
            yesButton.style.background = 'rgba(0, 255, 100, 0.8)';
            yesButton.style.transform = 'scale(1)';
        };
        yesButton.onclick = () => {
            this.hide();
            if (this.onReady) {
                this.onReady();
            }
        };

        // Assemble UI
        container.appendChild(title);
        container.appendChild(description);
        buttonContainer.appendChild(yesButton);
        container.appendChild(buttonContainer);
        overlay.appendChild(container);

        this.element = overlay;
        document.body.appendChild(overlay);
    }

    show() {
        if (this.element) {
            this.element.style.display = 'flex';
        }
    }

    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.element = null;
        }
    }
}
