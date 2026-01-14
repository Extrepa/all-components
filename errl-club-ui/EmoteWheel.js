// Radial emote wheel UI for triggering specific dances and emotes
export class EmoteWheel {
    constructor(avatar) {
        this.avatar = avatar;
        this.isVisible = false;
        this.selectedIndex = -1;
        this.emotes = [
            { id: 'dance1', label: 'Dance 1', icon: '💃' },
            { id: 'dance2', label: 'Dance 2', icon: '🕺' },
            { id: 'dance3', label: 'Dance 3', icon: '🎵' },
            { id: 'wave', label: 'Wave', icon: '👋' },
            { id: 'sit', label: 'Sit', icon: '🪑' },
            { id: 'jump', label: 'Jump', icon: '⬆️' },
            { id: 'spin', label: 'Spin', icon: '🌀' },
            { id: 'idle', label: 'Idle', icon: '😊' },
        ];

        this.createUI();
    }

    // Step 236: Add radial emote wheel UI to trigger specific dances or emotes
    createUI() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createUI());
            return;
        }

        if (!document.body) {
            console.warn('EmoteWheel: document.body not available yet, retrying...');
            setTimeout(() => this.createUI(), 100);
            return;
        }

        const wheel = document.createElement('div');
        wheel.id = 'emote-wheel';
        wheel.className = 'emote-wheel hidden';

        // Create emote buttons in a circle
        this.emotes.forEach((emote, index) => {
            const button = document.createElement('button');
            button.className = 'emote-button';
            button.dataset.emoteId = emote.id;
            button.dataset.index = index;

            const icon = document.createElement('span');
            icon.className = 'emote-icon';
            icon.textContent = emote.icon;

            const label = document.createElement('span');
            label.className = 'emote-label';
            label.textContent = emote.label;

            button.appendChild(icon);
            button.appendChild(label);
            wheel.appendChild(button);
        });

        // Center indicator
        const center = document.createElement('div');
        center.className = 'emote-center';
        center.textContent = '🎭';
        wheel.appendChild(center);

        document.body.appendChild(wheel);
        this.wheelElement = wheel;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Click on emote button
        this.wheelElement.addEventListener('click', (e) => {
            const button = e.target.closest('.emote-button');
            if (button) {
                const emoteId = button.dataset.emoteId;
                this.triggerEmote(emoteId);
                this.hide();
            }
        });

        // Mouse move to highlight
        this.wheelElement.addEventListener('mousemove', (e) => {
            const button = e.target.closest('.emote-button');
            if (button) {
                this.highlightEmote(parseInt(button.dataset.index));
            }
        });
    }

    show() {
        this.isVisible = true;
        this.wheelElement.classList.remove('hidden');
        this.updateButtonPositions();
    }

    hide() {
        this.isVisible = false;
        this.wheelElement.classList.add('hidden');
        this.selectedIndex = -1;
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    updateButtonPositions() {
        const buttons = this.wheelElement.querySelectorAll('.emote-button');
        const radius = 120; // pixels
        const centerX = 0;
        const centerY = 0;

        buttons.forEach((button, index) => {
            const angle = (index / this.emotes.length) * Math.PI * 2 - Math.PI / 2; // Start from top
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            button.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    highlightEmote(index) {
        const buttons = this.wheelElement.querySelectorAll('.emote-button');
        buttons.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('highlighted');
            } else {
                btn.classList.remove('highlighted');
            }
        });
        this.selectedIndex = index;
    }

    triggerEmote(emoteId) {
        if (!this.avatar) {
            return;
        }

        switch (emoteId) {
            case 'dance1':
                this.avatar.setState('dance1');
                break;
            case 'dance2':
                this.avatar.setState('dance2');
                break;
            case 'dance3':
                this.avatar.setState('dance3');
                break;
            case 'wave':
                // Wave animation (could be a new state)
                this.avatar.setExpression('happy');
                break;
            case 'sit':
                this.avatar.sit();
                break;
            case 'jump':
                this.avatar.hop();
                break;
            case 'spin':
                // Spin animation
                this.avatar.group.rotation.y += Math.PI * 2;
                break;
            case 'idle':
                this.avatar.setState('idle');
                break;
        }
    }
}
