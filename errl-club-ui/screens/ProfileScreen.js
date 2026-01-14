/**
 * ProfileScreen - Player profile display and avatar customization
 */
import { BasePanel } from '../BasePanel.js';
import { Button } from '../components/Button.js';
import { DESIGN_SYSTEM } from '../designSystem.js';

export class ProfileScreen extends BasePanel {
    /**
     * Create a new ProfileScreen
     * @param {Object} config - Configuration
     * @param {Function} config.onBack - Back handler
     */
    constructor(config = {}) {
        super({
            id: 'profile_screen',
            title: 'Profile',
            position: { x: 100, y: 100 },
            size: { width: 600, height: 500 },
        });

        this.onBack = config.onBack || (() => {});

        // Create profile content
        this.createProfileContent();
    }

    /**
     * Create profile content
     * @private
     */
    createProfileContent() {
        const content = this.getContentElement();

        // Profile info placeholder
        const profileInfo = document.createElement('div');
        const playerInfoDiv = document.createElement('div');
        playerInfoDiv.style.cssText = 'margin-bottom: 20px;';

        const playerInfoHeader = document.createElement('h3');
        playerInfoHeader.textContent = 'Player Info';
        playerInfoHeader.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            margin-bottom: 10px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        playerInfoDiv.appendChild(playerInfoHeader);

        const createInfoParagraph = (text) => {
            const p = document.createElement('p');
            p.textContent = text;
            p.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            return p;
        };

        playerInfoDiv.appendChild(createInfoParagraph('Username: Player'));
        playerInfoDiv.appendChild(createInfoParagraph('Level: 1'));
        playerInfoDiv.appendChild(createInfoParagraph('Experience: 0'));
        profileInfo.appendChild(playerInfoDiv);

        const avatarDiv = document.createElement('div');
        const avatarHeader = document.createElement('h3');
        avatarHeader.textContent = 'Avatar Customization';
        avatarHeader.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            margin-bottom: 10px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        avatarDiv.appendChild(avatarHeader);
        avatarDiv.appendChild(createInfoParagraph('Customize your avatar appearance here.'));
        profileInfo.appendChild(avatarDiv);
        content.appendChild(profileInfo);

        // Back button
        const backButton = new Button({
            text: 'Back',
            onClick: () => {
                this.onBack();
            },
        });
        content.appendChild(backButton.getElement());
    }
}
