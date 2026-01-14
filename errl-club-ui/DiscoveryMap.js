/**
 * DiscoveryMap - Visual map showing discovered interactive objects
 *
 * Displays a minimap or full-screen map view with discovered objects, room boundaries, and statistics
 */
import { BasePanel } from './BasePanel.js';
import { Button } from './components/Button.js';
import { DESIGN_SYSTEM } from './designSystem.js';

export class DiscoveryMap extends BasePanel {
    /**
     * Create a new DiscoveryMap
     * @param {Object} config - Configuration
     * @param {Object} config.discoverySystem - InteractiveObjectDiscovery instance
     * @param {Object} config.roomManager - RoomManager instance
     * @param {Object} config.eventBus - EventBus instance
     * @param {Function} config.onClose - Close handler
     */
    constructor(config = {}) {
        super({
            id: 'discovery_map_ui',
            title: 'Discovery Map',
            position: { x: 100, y: 100 },
            size: { width: 900, height: 700 },
        });

        this.discoverySystem = config.discoverySystem;
        this.roomManager = config.roomManager;
        this.eventBus = config.eventBus;
        this.onClose = config.onClose || (() => {});

        // View state
        this.viewMode = 'full'; // 'full' or 'minimap'
        this.selectedRoom = null; // null = all rooms
        this.showUndiscovered = false;

        // UI elements
        this.mapCanvas = null;
        this.roomList = null;
        this.statsDisplay = null;
        this.filterButtons = null;

        // Create UI
        this.createContent();

        // Listen to discovery events
        if (this.eventBus) {
            this.eventBus.on('object.discovered', (data) => {
                this.onObjectDiscovered(data);
            });
        }

        // Update map periodically
        this.updateInterval = setInterval(() => {
            if (this.isVisible()) {
                this.updateMap();
            }
        }, 1000);
    }

    /**
     * Create UI content
     * @private
     */
    createContent() {
        const content = this.getContentElement();
        content.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 15px;
            height: 100%;
        `;

        // Controls bar
        const controlsBar = document.createElement('div');
        controlsBar.style.cssText = `
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        `;

        // View mode toggle
        const viewModeButton = new Button({
            text: 'Toggle View',
            onClick: () => {
                this.viewMode = this.viewMode === 'full' ? 'minimap' : 'full';
                this.updateViewMode();
            },
        });
        controlsBar.appendChild(viewModeButton.getElement());

        // Show undiscovered toggle
        const undiscoveredButton = new Button({
            text: 'Show Undiscovered',
            onClick: () => {
                this.showUndiscovered = !this.showUndiscovered;
                this.updateMap();
                undiscoveredButton.getElement().textContent = this.showUndiscovered
                    ? 'Hide Undiscovered'
                    : 'Show Undiscovered';
            },
        });
        controlsBar.appendChild(undiscoveredButton.getElement());

        // Room filter dropdown
        const roomFilterContainer = document.createElement('div');
        roomFilterContainer.style.cssText = 'display: flex; align-items: center; gap: 8px;';

        const roomFilterLabel = document.createElement('label');
        roomFilterLabel.textContent = 'Room:';
        roomFilterLabel.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            opacity: 0.7;
            font-size: 14px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        roomFilterContainer.appendChild(roomFilterLabel);

        const roomFilter = document.createElement('select');
        roomFilter.style.cssText = `
            padding: 6px 12px;
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            color: ${DESIGN_SYSTEM.colors.text};
            font-size: 14px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        roomFilter.innerHTML = '<option value="">All Rooms</option>';
        roomFilter.addEventListener('change', (e) => {
            this.selectedRoom = e.target.value || null;
            this.updateMap();
        });
        this.roomFilter = roomFilter;
        roomFilterContainer.appendChild(roomFilter);
        controlsBar.appendChild(roomFilterContainer);

        content.appendChild(controlsBar);

        // Main content area
        const mainContent = document.createElement('div');
        mainContent.style.cssText = `
            display: flex;
            gap: 15px;
            flex: 1;
            min-height: 0;
        `;

        // Map canvas container
        const mapContainer = document.createElement('div');
        mapContainer.style.cssText = `
            flex: 2;
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            position: relative;
            overflow: hidden;
        `;

        // Canvas for map rendering
        this.mapCanvas = document.createElement('canvas');
        this.mapCanvas.style.cssText = `
            width: 100%;
            height: 100%;
            display: block;
        `;
        mapContainer.appendChild(this.mapCanvas);
        mainContent.appendChild(mapContainer);

        // Sidebar
        const sidebar = document.createElement('div');
        sidebar.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 15px;
            min-width: 200px;
        `;

        // Statistics display
        this.statsDisplay = document.createElement('div');
        this.statsDisplay.style.cssText = `
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 15px;
        `;
        sidebar.appendChild(this.statsDisplay);

        // Room list
        this.roomList = document.createElement('div');
        this.roomList.style.cssText = `
            flex: 1;
            background: ${DESIGN_SYSTEM.colors.background};
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 15px;
            overflow-y: auto;
        `;
        sidebar.appendChild(this.roomList);

        mainContent.appendChild(sidebar);
        content.appendChild(mainContent);

        // Close button
        const closeButton = new Button({
            text: 'Close',
            onClick: () => {
                this.hide();
                if (this.onClose) {
                    this.onClose();
                }
            },
        });
        closeButton.getElement().style.cssText += 'margin-top: 10px;';
        content.appendChild(closeButton.getElement());

        // Initialize
        this.updateRoomList();
        this.updateStats();
        this.updateMap();
    }

    /**
     * Update view mode
     * @private
     */
    updateViewMode() {
        if (this.viewMode === 'minimap') {
            this.element.style.width = '400px';
            this.element.style.height = '300px';
        } else {
            this.element.style.width = '900px';
            this.element.style.height = '700px';
        }
        this.updateMap();
    }

    /**
     * Update room list
     * @private
     */
    updateRoomList() {
        if (!this.roomManager || !this.roomList) {
            return;
        }

        this.roomList.innerHTML = '';

        const header = document.createElement('div');
        header.textContent = 'Rooms';
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        this.roomList.appendChild(header);

        // Get all rooms
        const rooms = Array.from(this.roomManager.availableRooms.values());

        rooms.forEach((room) => {
            const roomItem = document.createElement('div');
            roomItem.style.cssText = `
                padding: 10px;
                margin-bottom: 8px;
                background: ${DESIGN_SYSTEM.colors.background};
                border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
                border-radius: ${DESIGN_SYSTEM.borders.radius};
                cursor: pointer;
                transition: background 0.2s;
            `;

            // Get discovery progress for this room
            const progress = this.discoverySystem
                ? this.discoverySystem.getRoomProgress(room.id)
                : { discovered: 0, total: 0, percentage: 0 };

            const nameRow = document.createElement('div');
            nameRow.style.cssText =
                'display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = room.name;
            nameSpan.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                font-weight: bold;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            nameRow.appendChild(nameSpan);

            const progressSpan = document.createElement('span');
            progressSpan.textContent = `${progress.discovered}/${progress.total}`;
            progressSpan.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.accent};
                font-size: 12px;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            nameRow.appendChild(progressSpan);
            roomItem.appendChild(nameRow);

            const progressBar = document.createElement('div');
            progressBar.style.cssText = `
                width: 100%;
                height: 4px;
                background: ${DESIGN_SYSTEM.colors.background};
                border-radius: 2px;
                overflow: hidden;
            `;

            const progressFill = document.createElement('div');
            progressFill.style.cssText = `
                width: ${progress.percentage}%;
                height: 100%;
                background: ${DESIGN_SYSTEM.colors.accent};
                transition: width 0.3s;
            `;
            progressBar.appendChild(progressFill);
            roomItem.appendChild(progressBar);

            roomItem.addEventListener('click', () => {
                this.selectedRoom = room.id;
                this.roomFilter.value = room.id;
                this.updateMap();
            });

            roomItem.addEventListener('mouseenter', () => {
                roomItem.style.background = DESIGN_SYSTEM.colors.background;
                roomItem.style.opacity = '0.9';
            });

            roomItem.addEventListener('mouseleave', () => {
                roomItem.style.background = DESIGN_SYSTEM.colors.background;
                roomItem.style.opacity = '1';
            });

            this.roomList.appendChild(roomItem);
        });

        // Update room filter dropdown
        if (this.roomFilter) {
            const currentValue = this.roomFilter.value;
            this.roomFilter.innerHTML = '<option value="">All Rooms</option>';
            rooms.forEach((room) => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = room.name;
                this.roomFilter.appendChild(option);
            });
            this.roomFilter.value = currentValue;
        }
    }

    /**
     * Update statistics display
     * @private
     */
    updateStats() {
        if (!this.discoverySystem || !this.statsDisplay) {
            return;
        }

        const stats = this.discoverySystem.getStats();

        this.statsDisplay.innerHTML = '';

        const header = document.createElement('div');
        header.textContent = 'Statistics';
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        this.statsDisplay.appendChild(header);

        const statsContainer = document.createElement('div');
        statsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';

        const createStatRow = (label, value, valueColor = DESIGN_SYSTEM.colors.text) => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; justify-content: space-between;';

            const labelSpan = document.createElement('span');
            labelSpan.textContent = label;
            labelSpan.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                opacity: 0.7;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            row.appendChild(labelSpan);

            const valueSpan = document.createElement('span');
            valueSpan.textContent = value;
            valueSpan.style.cssText = `
                color: ${valueColor};
                font-weight: bold;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            row.appendChild(valueSpan);

            statsContainer.appendChild(row);
        };

        createStatRow('Total Objects:', stats.totalObjects.toString());
        createStatRow('Discovered:', stats.discoveredObjects.toString(), '#00ff00');
        createStatRow('Discovery Rate:', `${stats.discoveryRate.toFixed(1)}%`);

        if (stats.firstDiscoveryTime) {
            const divider = document.createElement('div');
            divider.style.cssText = `
                margin-top: 10px;
                padding-top: 10px;
                border-top: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            `;

            const firstLabel = document.createElement('div');
            firstLabel.textContent = 'First Discovery:';
            firstLabel.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                opacity: 0.6;
                font-size: 12px;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            divider.appendChild(firstLabel);

            const firstDate = document.createElement('div');
            firstDate.textContent = new Date(stats.firstDiscoveryTime).toLocaleDateString();
            firstDate.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                opacity: 0.7;
                font-size: 12px;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            divider.appendChild(firstDate);

            statsContainer.appendChild(divider);
        }

        this.statsDisplay.appendChild(statsContainer);
    }

    /**
     * Update map canvas
     * @private
     */
    updateMap() {
        if (!this.mapCanvas) {
            return;
        }

        const canvas = this.mapCanvas;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.fillStyle = 'rgba(10, 0, 18, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!this.discoverySystem || !this.roomManager) {
            // Draw placeholder
            ctx.fillStyle = '#888';
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('No discovery data available', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Get rooms to display
        const rooms = this.selectedRoom
            ? [this.roomManager.availableRooms.get(this.selectedRoom)].filter(Boolean)
            : Array.from(this.roomManager.availableRooms.values());

        if (rooms.length === 0) {
            return;
        }

        // Calculate layout (simple grid for now)
        const cols = Math.ceil(Math.sqrt(rooms.length));
        const rows = Math.ceil(rooms.length / cols);
        const roomWidth = canvas.width / cols;
        const roomHeight = canvas.height / rows;

        rooms.forEach((room, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * roomWidth;
            const y = row * roomHeight;

            // Draw room boundary
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 10, y + 10, roomWidth - 20, roomHeight - 20);

            // Draw room name
            ctx.fillStyle = '#00ffff';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(room.name, x + 15, y + 25);

            // Get objects for this room
            const allObjects = Array.from(this.discoverySystem.objectRegistry.entries()).filter(
                ([id, obj]) => obj.roomId === room.id
            );
            const discoveredObjectIds = this.discoverySystem.getDiscoveredObjects(room.id);

            // Draw objects
            allObjects.forEach(([objectId, obj], objIndex) => {
                const isDiscovered = discoveredObjectIds.includes(objectId);

                if (!isDiscovered && !this.showUndiscovered) {
                    return;
                }

                // Calculate position within room
                const objX = x + 20 + (objIndex % 5) * 15;
                const objY = y + 40 + Math.floor(objIndex / 5) * 15;

                // Draw object icon
                ctx.fillStyle = isDiscovered ? '#00ff00' : '#ff0000';
                ctx.beginPath();
                ctx.arc(objX, objY, 4, 0, Math.PI * 2);
                ctx.fill();

                // Draw discovery indicator
                if (isDiscovered) {
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(objX, objY, 6, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            // Draw progress bar
            const progress = this.discoverySystem.getRoomProgress(room.id);
            const barWidth = roomWidth - 40;
            const barHeight = 6;
            const barX = x + 20;
            const barY = y + roomHeight - 25;

            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            ctx.fillStyle = '#00ffff';
            ctx.fillRect(barX, barY, (barWidth * progress.percentage) / 100, barHeight);

            // Progress text
            ctx.fillStyle = '#aaa';
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`${progress.discovered}/${progress.total}`, barX, barY - 5);
        });
    }

    /**
     * Handle object discovered event
     * @param {Object} data - Discovery event data
     */
    onObjectDiscovered(data) {
        this.updateMap();
        this.updateStats();
        this.updateRoomList();
    }

    /**
     * Set discovery system
     * @param {Object} discoverySystem - InteractiveObjectDiscovery instance
     */
    setDiscoverySystem(discoverySystem) {
        this.discoverySystem = discoverySystem;
        this.updateMap();
        this.updateStats();
        this.updateRoomList();
    }

    /**
     * Set room manager
     * @param {Object} roomManager - RoomManager instance
     */
    setRoomManager(roomManager) {
        this.roomManager = roomManager;
        this.updateRoomList();
        this.updateMap();
    }

    /**
     * Show the UI
     */
    show() {
        super.show();
        this.updateMap();
        this.updateStats();
        this.updateRoomList();
    }

    /**
     * Toggle the UI
     */
    toggle() {
        if (this.isVisible()) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.eventBus) {
            this.eventBus.off('object.discovered', this.onObjectDiscovered);
        }
    }
}
