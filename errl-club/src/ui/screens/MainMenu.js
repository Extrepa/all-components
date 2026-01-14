/**
 * MainMenu - Main menu screen
 *
 * Provides navigation to other screens
 */
import { BasePanel } from '../BasePanel.js';
import { Button } from '../components/Button.js';

export class MainMenu extends BasePanel {
    /**
     * Create a new MainMenu
     * @param {Object} config - Configuration
     * @param {Function} config.onNavigate - Navigation handler (screenId) => void
     */
    constructor(config = {}) {
        super({
            id: 'main_menu',
            title: 'Errl Club',
            position: { x: 0, y: 0 },
            size: { width: window.innerWidth, height: window.innerHeight },
            style: {
                display: 'flex',
                'flex-direction': 'column',
                'align-items': 'center',
                'justify-content': 'center',
            },
        });

        this.onNavigate = config.onNavigate || (() => {});

        // Create menu buttons
        this.createMenuButtons();
    }

    /**
     * Create menu buttons
     * @private
     */
    createMenuButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 16px;
            align-items: center;
        `;

        const buttons = [
            { text: 'Play', screen: 'game' },
            { text: 'Profile', screen: 'profile' },
            { text: 'Settings', screen: 'settings' },
            { text: 'Rooms', screen: 'rooms' },
            { text: 'Friends', screen: 'friends' },
        ];

        buttons.forEach(({ text, screen }) => {
            const button = new Button({
                text,
                onClick: () => {
                    this.onNavigate(screen);
                },
                style: {
                    width: '200px',
                },
            });

            buttonContainer.appendChild(button.getElement());
        });

        this.getContentElement().appendChild(buttonContainer);
    }
}
