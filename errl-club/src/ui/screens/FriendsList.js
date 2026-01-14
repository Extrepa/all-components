/**
 * FriendsList - Friends list display and management
 */
import { BasePanel } from '../BasePanel.js';
import { Button } from '../components/Button.js';
import { DESIGN_SYSTEM } from '../designSystem.js';

export class FriendsList extends BasePanel {
    /**
     * Create a new FriendsList
     * @param {Object} config - Configuration
     * @param {Function} config.onBack - Back handler
     * @param {Array} config.friends - Friends array
     */
    constructor(config = {}) {
        super({
            id: 'friends_list',
            title: 'Friends',
            position: { x: 100, y: 100 },
            size: { width: 500, height: 400 },
        });

        this.onBack = config.onBack || (() => {});
        this.friends = config.friends || [];

        // Create friends list content
        this.createFriendsListContent();
    }

    /**
     * Create friends list content
     * @private
     */
    createFriendsListContent() {
        const content = this.getContentElement();

        // Friends list
        const friendsList = document.createElement('div');
        friendsList.className = 'friends-list';
        friendsList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
            max-height: 250px;
            overflow-y: auto;
        `;

        if (this.friends.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'No friends yet';
            emptyMsg.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            friendsList.appendChild(emptyMsg);
        } else {
            this.friends.forEach((friend) => {
                const friendItem = document.createElement('div');
                friendItem.style.cssText = `
                    padding: 10px;
                    background: ${DESIGN_SYSTEM.colors.background};
                    border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
                    border-radius: ${DESIGN_SYSTEM.borders.radius};
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                `;

                const friendInfo = document.createElement('div');

                const nameDiv = document.createElement('div');
                nameDiv.textContent = friend.name || friend.id;
                nameDiv.style.cssText = `
                    color: ${DESIGN_SYSTEM.colors.accent};
                    font-weight: bold;
                    font-family: ${DESIGN_SYSTEM.typography.fontFamily};
                `;
                friendInfo.appendChild(nameDiv);

                const statusDiv = document.createElement('div');
                statusDiv.textContent = friend.status || 'Offline';
                statusDiv.style.cssText = `
                    color: ${DESIGN_SYSTEM.colors.text};
                    opacity: 0.6;
                    font-size: 12px;
                    font-family: ${DESIGN_SYSTEM.typography.fontFamily};
                `;
                friendInfo.appendChild(statusDiv);

                friendItem.appendChild(friendInfo);

                friendsList.appendChild(friendItem);
            });
        }

        content.appendChild(friendsList);

        // Back button
        const backButton = new Button({
            text: 'Back',
            onClick: () => {
                this.onBack();
            },
        });
        content.appendChild(backButton.getElement());
    }

    /**
     * Update friends list
     * @param {Array} friends - New friends array
     */
    updateFriends(friends) {
        this.friends = friends;
        // Recreate content
        const content = this.getContentElement();
        content.innerHTML = '';
        this.createFriendsListContent();
    }
}
