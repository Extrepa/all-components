/**
 * RoomBrowser - Browse and join available rooms
 */
import { BasePanel } from '../BasePanel.js';
import { Button } from '../components/Button.js';
import { DESIGN_SYSTEM } from '../designSystem.js';

export class RoomBrowser extends BasePanel {
    /**
     * Create a new RoomBrowser
     * @param {Object} config - Configuration
     * @param {Function} config.onBack - Back handler
     * @param {Function} config.onJoinRoom - Join room handler (roomId) => void
     * @param {Array} config.rooms - Available rooms array
     */
    constructor(config = {}) {
        super({
            id: 'room_browser',
            title: 'Room Browser',
            position: { x: 100, y: 100 },
            size: { width: 700, height: 500 },
        });

        this.onBack = config.onBack || (() => {});
        this.onJoinRoom = config.onJoinRoom || (() => {});
        this.rooms = config.rooms || [];

        // Create room browser content
        this.createRoomBrowserContent();
    }

    /**
     * Create room browser content
     * @private
     */
    createRoomBrowserContent() {
        const content = this.getContentElement();

        // Room list
        const roomList = document.createElement('div');
        roomList.className = 'room-list';
        roomList.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
            max-height: 350px;
            overflow-y: auto;
        `;

        if (this.rooms.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'No rooms available';
            emptyMsg.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            roomList.appendChild(emptyMsg);
        } else {
            this.rooms.forEach((room) => {
                const roomItem = document.createElement('div');
                roomItem.style.cssText = `
                    padding: 12px;
                    background: ${DESIGN_SYSTEM.colors.background};
                    border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
                    border-radius: ${DESIGN_SYSTEM.borders.radius};
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                `;

                const roomInfo = document.createElement('div');

                const nameDiv = document.createElement('div');
                nameDiv.textContent = room.name || room.id;
                nameDiv.style.cssText = `
                    color: ${DESIGN_SYSTEM.colors.accent};
                    font-weight: bold;
                    font-family: ${DESIGN_SYSTEM.typography.fontFamily};
                `;
                roomInfo.appendChild(nameDiv);

                const descDiv = document.createElement('div');
                descDiv.textContent = room.description || '';
                descDiv.style.cssText = `
                    color: ${DESIGN_SYSTEM.colors.text};
                    font-size: 12px;
                    font-family: ${DESIGN_SYSTEM.typography.fontFamily};
                `;
                roomInfo.appendChild(descDiv);

                const playersDiv = document.createElement('div');
                playersDiv.textContent = `Players: ${room.playerCount || 0}/${room.maxPlayers || 50}`;
                playersDiv.style.cssText = `
                    color: ${DESIGN_SYSTEM.colors.text};
                    opacity: 0.6;
                    font-size: 12px;
                    font-family: ${DESIGN_SYSTEM.typography.fontFamily};
                `;
                roomInfo.appendChild(playersDiv);

                roomItem.appendChild(roomInfo);

                const joinButton = new Button({
                    text: 'Join',
                    onClick: () => {
                        this.onJoinRoom(room.id);
                    },
                    style: {
                        width: '80px',
                    },
                });
                roomItem.appendChild(joinButton.getElement());

                roomList.appendChild(roomItem);
            });
        }

        content.appendChild(roomList);

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
     * Update room list
     * @param {Array} rooms - New rooms array
     */
    updateRooms(rooms) {
        this.rooms = rooms;
        // Recreate content
        const content = this.getContentElement();
        content.innerHTML = '';
        this.createRoomBrowserContent();
    }
}
