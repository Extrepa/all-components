// Visualizer style picker UI
export class VisualizerStylePicker {
    constructor(visualEffects) {
        this.visualEffects = visualEffects;
        this.currentStyle = 'default';
        this.styles = ['default', 'neon', 'retro', 'cyberpunk', 'minimal', 'intense'];
        this.createUI();
    }

    createUI() {
        if (typeof document === 'undefined' || !document.body) {
            setTimeout(() => this.createUI(), 100);
            return;
        }

        const hud = document.getElementById('hud');
        if (!hud) {
            return;
        }

        const container = document.createElement('div');
        container.id = 'visualizer-style-picker';
        container.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border: 2px solid #00ff00;
            border-radius: 5px;
            display: none;
        `;

        const label = document.createElement('div');
        label.textContent = 'Visualizer Style';
        label.style.cssText = 'color: #00ff00; margin-bottom: 5px; font-family: monospace;';
        container.appendChild(label);

        const select = document.createElement('select');
        select.id = 'style-select';
        select.style.cssText =
            'width: 100%; padding: 5px; background: #000; color: #00ff00; border: 1px solid #00ff00;';

        this.styles.forEach((style) => {
            const option = document.createElement('option');
            option.value = style;
            option.textContent = style.toUpperCase();
            select.appendChild(option);
        });

        select.value = this.currentStyle;
        select.addEventListener('change', (e) => {
            this.setStyle(e.target.value);
        });

        container.appendChild(select);
        hud.appendChild(container);

        this.container = container;
        this.select = select;
    }

    setStyle(style) {
        this.currentStyle = style;
        // Apply style to visual effects system
        if (this.visualEffects) {
            this.visualEffects.setVisualizerStyle(style);
        }
        console.log('Visualizer style:', style);
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    toggle() {
        if (this.container) {
            this.container.style.display =
                this.container.style.display === 'none' ? 'block' : 'none';
        }
    }
}
