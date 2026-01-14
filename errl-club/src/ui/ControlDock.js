/**
 * ControlDock - Compact bottom dock that exposes categorized keybind drawers,
 * camera buttons, fragment progress, and the camera intensity indicator.
 */
import { KeybindManager } from '../input/KeybindManager.js';
import { DESIGN_SYSTEM } from './designSystem.js';

export class ControlDock {
    constructor(keybindManager, systems = null) {
        this.keybindManager = keybindManager;
        this.systems = systems;
        this.controlsElement = null;
        this.isVisible = true;
        this.drawers = {
            movement: false,
            interactions: false,
            settings: false,
            debug: false,
        };

        this.createDock();

        if (typeof window !== 'undefined') {
            window.controlDockInstance = this;
        }
    }

    setSystems(systems) {
        this.systems = systems;
    }

    createDock() {
        const controlsElement = document.getElementById('controls');
        if (!controlsElement) {
            console.warn('ControlDock: #controls element not found');
            return;
        }

        this.controlsElement = controlsElement;
        controlsElement.innerHTML = '';
        // Use design system with some custom overrides for ControlDock's specific needs
        controlsElement.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: ${DESIGN_SYSTEM.spacing.gap};
            color: ${DESIGN_SYSTEM.colors.text};
            font-size: 0.9rem;
            text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            margin-top: auto;
            margin-bottom: 30px;
            padding: 14px 20px;
            width: min(95vw, 1080px);
            background: ${DESIGN_SYSTEM.colors.background};
            border-radius: 26px;
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            backdrop-filter: blur(12px);
            box-shadow: ${DESIGN_SYSTEM.shadows.panel}, 0 20px 55px rgba(0, 0, 0, 0.55);
            pointer-events: auto;
            transition: transform 0.3s ease, opacity 0.3s ease;
            opacity: 1;
            transform: translateY(0);
        `;
        controlsElement.classList.add('control-bar');

        const controlRow = document.createElement('div');
        controlRow.id = 'control-dock-row';
        controlRow.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            width: 100%;
            flex-wrap: wrap;
        `;

        const dockContainer = document.createElement('div');
        dockContainer.id = 'control-dock';
        dockContainer.style.cssText = `
            display: flex;
            flex: 1;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        `;

        this.createDrawer(
            dockContainer,
            'movement',
            'Movement & Camera',
            this.getMovementKeybinds()
        );
        this.createDrawer(
            dockContainer,
            'interactions',
            'Interactions & Effects',
            this.getInteractionKeybinds()
        );
        this.createDrawer(dockContainer, 'settings', 'Settings & UI', this.getSettingsKeybinds());
        this.createDrawer(dockContainer, 'debug', 'Debug & Advanced', this.getDebugKeybinds());

        const rightCluster = document.createElement('div');
        rightCluster.id = 'control-dock-right';
        rightCluster.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
            min-width: 180px;
        `;

        controlRow.appendChild(dockContainer);
        controlRow.appendChild(rightCluster);
        controlsElement.appendChild(controlRow);

        const progressRow = document.createElement('div');
        progressRow.id = 'control-progress-row';
        progressRow.style.cssText = `
            width: 100%;
            display: flex;
            justify-content: center;
        `;
        this.integrateFragmentProgress(progressRow);
        controlsElement.appendChild(progressRow);

        this.integrateCameraIntensity(rightCluster);
    }

    integrateFragmentProgress(container) {
        let fragmentProgress = document.getElementById('fragment-progress');
        if (!fragmentProgress) {
            fragmentProgress = document.createElement('div');
            fragmentProgress.id = 'fragment-progress';
            fragmentProgress.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-label">Fragments: <span id="fragment-count">0</span></div>
            `;
        } else if (fragmentProgress.parentNode) {
            fragmentProgress.parentNode.removeChild(fragmentProgress);
        }

        fragmentProgress.style.cssText = `
            display: none;
            width: 100%;
            max-width: 520px;
            pointer-events: none;
            gap: 8px;
            align-items: center;
        `;
        fragmentProgress.classList.add('control-fragment-progress');
        container.appendChild(fragmentProgress);
    }

    /**
     * Add camera controls to Settings & UI drawer
     * @private
     */
    addCameraControls(container) {
        // Camera Intensity cycling button
        const intensitySection = document.createElement('div');
        intensitySection.style.cssText = `
            margin-bottom: 12px;
            padding: 8px;
            background: rgba(0, 255, 255, 0.1);
            border-radius: 6px;
            border: 1px solid rgba(0, 255, 255, 0.3);
        `;

        const intensityLabel = document.createElement('div');
        intensityLabel.textContent = 'Camera Intensity';
        intensityLabel.style.cssText = `
            color: #00ffff;
            font-size: 0.75rem;
            font-weight: bold;
            margin-bottom: 6px;
        `;
        intensitySection.appendChild(intensityLabel);

        const intensityButton = document.createElement('button');
        intensityButton.id = 'camera-intensity-button';
        intensityButton.textContent = 'Medium';
        intensityButton.style.cssText = `
            width: 100%;
            padding: 8px;
            background: rgba(0, 255, 255, 0.2);
            border: 1px solid #00ffff;
            border-radius: 4px;
            color: #00ffff;
            font-size: 0.8rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        intensityButton.addEventListener('mouseenter', () => {
            intensityButton.style.background = 'rgba(0, 255, 255, 0.3)';
        });
        intensityButton.addEventListener('mouseleave', () => {
            intensityButton.style.background = 'rgba(0, 255, 255, 0.2)';
        });

        // Cycle through intensity levels: Low -> Medium -> High -> Low
        const intensityLevels = ['Low', 'Medium', 'High'];
        let currentIntensityIndex = 1; // Start at Medium

        // Initialize from current settings if available
        if (this.systems?.cameraSettings) {
            const currentPreset = this.systems.cameraSettings.getCurrentPreset() || 'medium';
            const presetIndex = intensityLevels.findIndex((p) => p.toLowerCase() === currentPreset);
            if (presetIndex >= 0) {
                currentIntensityIndex = presetIndex;
                intensityButton.textContent = intensityLevels[currentIntensityIndex];
            }
        }

        intensityButton.addEventListener('click', () => {
            if (this.systems?.cameraSettings) {
                currentIntensityIndex = (currentIntensityIndex + 1) % intensityLevels.length;
                const newIntensity = intensityLevels[currentIntensityIndex].toLowerCase();

                this.systems.cameraSettings.applyPreset(newIntensity);
                if (this.systems.cameraController) {
                    this.systems.cameraController.updateSettings();
                }
                if (this.systems.settingsManager) {
                    const settingsJson = this.systems.cameraSettings.export();
                    this.systems.settingsManager.setSetting('camera', JSON.parse(settingsJson));
                }
                if (this.systems.cameraIntensityIndicator) {
                    this.systems.cameraIntensityIndicator.update();
                }

                intensityButton.textContent = intensityLevels[currentIntensityIndex];
            }
        });

        intensitySection.appendChild(intensityButton);
        container.appendChild(intensitySection);

        // Camera Mode buttons
        const modeSection = document.createElement('div');
        modeSection.style.cssText = `
            margin-bottom: 12px;
        `;

        const modeLabel = document.createElement('div');
        modeLabel.textContent = 'Camera Modes';
        modeLabel.style.cssText = `
            color: #00ffff;
            font-size: 0.75rem;
            font-weight: bold;
            margin-bottom: 6px;
        `;
        modeSection.appendChild(modeLabel);

        const modeButtonsContainer = document.createElement('div');
        modeButtonsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
        `;

        const cameraModes = [
            {
                text: 'Reset',
                action: () => {
                    if (this.systems?.cameraController && this.systems?.avatar) {
                        this.systems.cameraController.snapBehindAvatar(this.systems.avatar);
                    }
                },
            },
            {
                text: 'Normal',
                action: () => {
                    if (this.systems?.cameraController) {
                        this.systems.cameraController.setMode('follow');
                        this.systems.cameraController.setPreset('normal');
                    }
                },
            },
            {
                text: 'Intimate',
                action: () => {
                    if (this.systems?.cameraController) {
                        this.systems.cameraController.setPreset('intimate');
                    }
                },
            },
            {
                text: 'Wide',
                action: () => {
                    if (this.systems?.cameraController) {
                        this.systems.cameraController.setPreset('wide');
                    }
                },
            },
            {
                text: 'Look Behind',
                action: () => {
                    if (this.systems?.cameraController) {
                        const current = this.systems.cameraController.isLookingBehind;
                        this.systems.cameraController.setLookBehind(!current);
                    }
                },
            },
        ];

        cameraModes.forEach((mode) => {
            const button = this.createCameraButton(mode.text, mode.action);
            button.style.cssText += `
                width: 100%;
                font-size: 0.7rem;
                padding: 6px;
            `;
            modeButtonsContainer.appendChild(button);
        });

        modeSection.appendChild(modeButtonsContainer);
        container.appendChild(modeSection);
    }

    integrateCameraIntensity(container) {
        // This method is kept for backwards compatibility but camera controls are now in Settings & UI drawer
        const tryIntegrate = () => {
            const cameraIndicator = document.getElementById('camera-intensity-indicator');
            if (!cameraIndicator) {
                return false;
            }
            if (cameraIndicator.parentNode) {
                cameraIndicator.parentNode.removeChild(cameraIndicator);
            }
            cameraIndicator.style.position = 'relative';
            cameraIndicator.style.bottom = 'auto';
            cameraIndicator.style.right = 'auto';
            cameraIndicator.style.left = 'auto';
            cameraIndicator.style.top = 'auto';
            cameraIndicator.style.margin = '0';
            cameraIndicator.style.opacity = '1';
            cameraIndicator.style.zIndex = 'auto';
            container.appendChild(cameraIndicator);
            return true;
        };

        if (!tryIntegrate()) {
            setTimeout(() => tryIntegrate(), 100);
        }
    }

    createCameraControls(container) {
        const cameraControlsContainer = document.createElement('div');
        cameraControlsContainer.id = 'camera-controls';
        cameraControlsContainer.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            align-items: center;
        `;

        const cameraButtons = [
            {
                text: 'Reset',
                action: () => {
                    if (this.systems?.cameraController && this.systems?.avatar) {
                        this.systems.cameraController.snapBehindAvatar(this.systems.avatar);
                    }
                },
            },
            {
                text: 'Normal',
                action: () => {
                    if (this.systems?.cameraController) {
                        this.systems.cameraController.setPreset('normal');
                    }
                },
            },
            {
                text: 'Intimate',
                action: () => {
                    if (this.systems?.cameraController) {
                        this.systems.cameraController.setPreset('intimate');
                    }
                },
            },
            {
                text: 'Wide',
                action: () => {
                    if (this.systems?.cameraController) {
                        this.systems.cameraController.setPreset('wide');
                    }
                },
            },
            {
                text: 'Look Behind',
                action: () => {
                    if (this.systems?.cameraController) {
                        const current = this.systems.cameraController.isLookingBehind;
                        this.systems.cameraController.setLookBehind(!current);
                    }
                },
            },
        ];

        cameraButtons.forEach((btn) => {
            const button = this.createCameraButton(btn.text, btn.action);
            cameraControlsContainer.appendChild(button);
        });

        container.appendChild(cameraControlsContainer);
    }

    createCameraButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            padding: 4px 10px;
            border-radius: 18px;
            border: 1px solid rgba(0, 255, 255, 0.6);
            background: rgba(0, 0, 0, 0.4);
            color: #00ffff;
            font-size: 0.7rem;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: none;
            font-family: 'Arial', sans-serif;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(0, 255, 255, 0.2)';
            button.style.borderColor = '#00ffff';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(0, 0, 0, 0.4)';
            button.style.borderColor = 'rgba(0, 255, 255, 0.6)';
        });
        button.addEventListener('click', onClick);
        return button;
    }

    createDrawer(container, id, title, keybinds) {
        const drawer = document.createElement('div');
        drawer.className = `drawer drawer-${id}`;
        drawer.style.cssText = `
            flex: 1;
            min-width: 150px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(0, 255, 255, 0.45);
            border-radius: 10px;
            overflow: hidden;
            transition: all 0.3s ease;
            max-width: 220px;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            padding: 10px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            user-select: none;
            color: #00ffff;
            font-weight: bold;
            font-size: 0.8rem;
        `;

        const titleEl = document.createElement('span');
        titleEl.textContent = title;

        const arrow = document.createElement('span');
        arrow.textContent = '▼';
        arrow.style.transition = 'transform 0.3s ease';

        header.appendChild(titleEl);
        header.appendChild(arrow);

        const content = document.createElement('div');
        content.className = 'drawer-content';
        content.style.cssText = `
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        `;

        const inner = document.createElement('div');
        inner.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 8px 12px 12px;
        `;

        // Add quick access controls for movement drawer
        if (id === 'movement') {
            this.addMovementPresets(inner);
        }

        // Add camera controls to Settings & UI drawer
        if (id === 'settings') {
            this.addCameraControls(inner);
        }

        // Add DevMenu button for debug drawer
        if (id === 'debug') {
            const devMenuButton = document.createElement('button');
            devMenuButton.textContent = 'Dev Menu';
            devMenuButton.style.cssText = `
                width: 100%;
                padding: 10px;
                margin-bottom: 8px;
                background: rgba(0, 255, 255, 0.3);
                border: 2px solid #00ffff;
                border-radius: 6px;
                color: #00ffff;
                font-weight: bold;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
            `;
            devMenuButton.addEventListener('mouseenter', () => {
                devMenuButton.style.background = 'rgba(0, 255, 255, 0.5)';
                devMenuButton.style.transform = 'scale(1.05)';
            });
            devMenuButton.addEventListener('mouseleave', () => {
                devMenuButton.style.background = 'rgba(0, 255, 255, 0.3)';
                devMenuButton.style.transform = 'scale(1)';
            });
            devMenuButton.addEventListener('click', () => {
                if (this.systems && this.systems.devMenu) {
                    if (this.systems.devMenu.isVisible()) {
                        this.systems.devMenu.hide();
                    } else {
                        this.systems.devMenu.show();
                    }
                } else if (window.gameSystems && window.gameSystems.devMenu) {
                    if (window.gameSystems.devMenu.isVisible()) {
                        window.gameSystems.devMenu.hide();
                    } else {
                        window.gameSystems.devMenu.show();
                    }
                }
            });
            inner.appendChild(devMenuButton);
        }

        if (keybinds.length === 0) {
            const noKeybind = document.createElement('div');
            noKeybind.textContent = 'No keybinds yet';
            noKeybind.style.cssText = 'color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;';
            inner.appendChild(noKeybind);
        } else {
            keybinds.forEach((keybind) => {
                const row = document.createElement('div');
                row.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.7rem;
                    color: #ffffff;
                `;

                const keyEl = document.createElement('span');
                keyEl.textContent = this.formatKeybind(keybind.key, keybind.modifiers);
                keyEl.style.cssText = `
                    color: #00ff99;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    min-width: 70px;
                `;

                const descEl = document.createElement('span');
                descEl.textContent = keybind.description || '';
                descEl.style.cssText =
                    'flex: 1; text-align: right; color: rgba(255, 255, 255, 0.8);';

                row.appendChild(keyEl);
                row.appendChild(descEl);
                inner.appendChild(row);
            });
        }

        content.appendChild(inner);
        drawer.appendChild(header);
        drawer.appendChild(content);
        container.appendChild(drawer);

        header.addEventListener('click', () => {
            this.toggleSection(id, drawer, content, arrow);
        });
    }

    toggleSection(id, drawer, content, arrow) {
        this.drawers[id] = !this.drawers[id];
        if (this.drawers[id]) {
            content.style.maxHeight = content.scrollHeight + 'px';
            arrow.style.transform = 'rotate(180deg)';
            drawer.style.borderColor = '#00ffff';
        } else {
            content.style.maxHeight = '0';
            arrow.style.transform = 'rotate(0deg)';
            drawer.style.borderColor = 'rgba(0, 255, 255, 0.45)';
        }
    }

    formatKeybind(key, modifiers) {
        const parts = [];
        if (modifiers.shift) {
            parts.push('Shift');
        }
        if (modifiers.ctrl) {
            parts.push('Ctrl');
        }
        if (modifiers.alt) {
            parts.push('Alt');
        }
        let keyStr = key.toUpperCase();
        if (key === ' ') {
            keyStr = 'Space';
        }
        if (key === 'tab') {
            keyStr = 'Tab';
        }
        if (key === 'arrowup') {
            keyStr = '↑';
        }
        if (key === 'arrowdown') {
            keyStr = '↓';
        }
        if (key === 'arrowleft') {
            keyStr = '←';
        }
        if (key === 'arrowright') {
            keyStr = '→';
        }
        parts.push(keyStr);
        return parts.join('+');
    }

    getMovementKeybinds() {
        const all = this.keybindManager.getAllKeybinds();
        return all.filter((k) => {
            const desc = (k.description || '').toLowerCase();
            return (
                desc.includes('move') ||
                desc.includes('camera') ||
                desc.includes('hop') ||
                desc.includes('jump') ||
                desc.includes('run') ||
                desc.includes('crouch') ||
                desc.includes('dash') ||
                desc.includes('preset') ||
                desc.includes('snap') ||
                desc.includes('cinematic') ||
                desc.includes('freecam') ||
                desc.includes('look behind')
            );
        });
    }

    /**
     * Add quick preset buttons to movement drawer
     */
    addMovementPresets(inner) {
        const presetContainer = document.createElement('div');
        presetContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
            margin-bottom: 8px;
        `;

        const presets = ['Snappy', 'Smooth', 'Arcade', 'Default'];
        presets.forEach((presetName) => {
            const presetBtn = document.createElement('button');
            presetBtn.textContent = presetName;
            presetBtn.style.cssText = `
                padding: 6px;
                background: rgba(0, 255, 255, 0.2);
                border: 1px solid #00ffff;
                border-radius: 4px;
                color: #00ffff;
                font-size: 0.7rem;
                cursor: pointer;
                transition: all 0.2s;
            `;
            presetBtn.addEventListener('mouseenter', () => {
                presetBtn.style.background = 'rgba(0, 255, 255, 0.4)';
            });
            presetBtn.addEventListener('mouseleave', () => {
                presetBtn.style.background = 'rgba(0, 255, 255, 0.2)';
            });
            presetBtn.addEventListener('click', () => {
                if (this.systems && this.systems.devMenu && this.systems.devMenu.loadPreset) {
                    this.systems.devMenu.loadPreset(presetName);
                }
            });
            presetContainer.appendChild(presetBtn);
        });

        inner.insertBefore(presetContainer, inner.firstChild);
    }

    getInteractionKeybinds() {
        const all = this.keybindManager.getAllKeybinds();
        return all.filter((k) => {
            const desc = (k.description || '').toLowerCase();
            return (
                desc.includes('interact') ||
                desc.includes('emote') ||
                desc.includes('throw') ||
                desc.includes('teleport') ||
                desc.includes('ghost') ||
                desc.includes('record') ||
                desc.includes('uv') ||
                desc.includes('visualizer') ||
                desc.includes('glitch')
            );
        });
    }

    getSettingsKeybinds() {
        const all = this.keybindManager.getAllKeybinds();
        return all.filter((k) => {
            const desc = (k.description || '').toLowerCase();
            return (
                desc.includes('settings') ||
                desc.includes('audio') ||
                desc.includes('collection') ||
                desc.includes('tutorial') ||
                desc.includes('camera intensity') ||
                desc.includes('visual effect') ||
                (!desc && k.key.startsWith('f') && k.key.length === 2)
            );
        });
    }

    getDebugKeybinds() {
        const all = this.keybindManager.getAllKeybinds();
        return all.filter((k) => {
            const desc = (k.description || '').toLowerCase();
            return (
                desc.includes('debug') ||
                desc.includes('test') ||
                desc.includes('log') ||
                desc.includes('help') ||
                (k.modifiers.ctrl && ['d', 't'].includes(k.key))
            );
        });
    }

    toggleDrawer() {
        if (!this.controlsElement) {
            return;
        }
        this.isVisible = !this.isVisible;
        this.controlsElement.style.opacity = this.isVisible ? '1' : '0';
        this.controlsElement.style.transform = this.isVisible
            ? 'translateY(0)'
            : 'translateY(60px)';
        this.controlsElement.style.pointerEvents = this.isVisible ? 'auto' : 'none';
    }

    show() {
        if (!this.isVisible) {
            this.toggleDrawer();
        }
    }

    hide() {
        if (this.isVisible) {
            this.toggleDrawer();
        }
    }
}
