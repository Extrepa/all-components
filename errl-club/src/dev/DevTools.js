/**
 * DevTools - Comprehensive development tools for debugging and testing
 */
import * as THREE from 'three';

export class DevTools {
    constructor(scene, systems) {
        this.scene = scene;
        this.systems = systems;
        this.enabled = false;
        this.showOverlay = true;

        // Store renderer reference for performance stats
        if (systems && systems.renderer) {
            this.renderer = systems.renderer;
        }

        // Performance tracking
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.frameTimes = [];
        this.fpsHistory = []; // For FPS graph
        this.memoryHistory = []; // For memory graph
        this.maxHistoryLength = 120; // 2 seconds at 60fps

        // Performance recommendations
        this.recommendations = [];
        this.lastRecommendationUpdate = 0;
        this.recommendationUpdateInterval = 5000; // Update every 5 seconds

        // Performance presets
        this.performancePresets = {
            low: { fpsTarget: 30, quality: 'low' },
            medium: { fpsTarget: 45, quality: 'medium' },
            high: { fpsTarget: 60, quality: 'high' },
            ultra: { fpsTarget: 120, quality: 'ultra' },
        };
        this.currentPreset = 'high';

        // Automatic performance adjustment
        this.autoAdjustEnabled = false;
        this.autoAdjustThreshold = 30; // FPS threshold
        this.autoAdjustWindow = 60; // Frames to average
        this.fpsWindow = [];

        // Performance warnings
        this.warnings = [];
        this.warningThresholds = {
            lowFps: 20,
            highMemory: 100, // MB
        };

        // Debug UI elements
        this.debugContainer = null;
        this.debugInfo = null;
        this.inputDisplay = null;
        this.positionDisplay = null;
        this.velocityDisplay = null;
        this.stateDisplay = null;

        // Visual debug objects
        this.avatarMarker = null;
        this.movementArrow = null;
        this.velocityLine = null;

        // Stats
        this.stats = {
            fps: 0,
            frameTime: 0,
            drawCalls: 0,
            triangles: 0,
            memory: 0,
            updateTimes: {},
            assetStats: {}, // Asset-specific performance metrics
        };

        // Asset performance tracking
        this.codexAssetIntegration = null; // Will be set via setCodexAssetIntegration

        // Performance tracking
        this.renderer = null;
        this.lastMemoryCheck = 0;
        this.memoryCheckInterval = 1000; // Check memory every second

        this.setupUI();
        this.setupVisualDebug();
        this.setupKeyboardToggle();
    }

    /**
     * Setup debug UI overlay
     */
    setupUI() {
        // Create debug container
        this.debugContainer = document.createElement('div');
        this.debugContainer.id = 'dev-tools-overlay';
        this.debugContainer.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 10px;
            border: 2px solid #00ff00;
            border-radius: 4px;
            z-index: 10000;
            pointer-events: none;
            display: none;
            max-width: 300px;
        `;
        document.body.appendChild(this.debugContainer);

        // Create debug info elements
        this.debugInfo = document.createElement('div');
        this.debugInfo.style.cssText = 'line-height: 1.6;';
        this.debugContainer.appendChild(this.debugInfo);

        // FPS display
        const fpsDiv = document.createElement('div');
        fpsDiv.id = 'debug-fps';
        fpsDiv.textContent = 'FPS: --';
        this.debugInfo.appendChild(fpsDiv);

        // Position display
        this.positionDisplay = document.createElement('div');
        this.positionDisplay.id = 'debug-position';
        this.positionDisplay.textContent = 'Position: (0, 0, 0)';
        this.debugInfo.appendChild(this.positionDisplay);

        // Velocity display
        this.velocityDisplay = document.createElement('div');
        this.velocityDisplay.id = 'debug-velocity';
        this.velocityDisplay.textContent = 'Velocity: (0, 0, 0)';
        this.debugInfo.appendChild(this.velocityDisplay);

        // State display
        this.stateDisplay = document.createElement('div');
        this.stateDisplay.id = 'debug-state';
        this.stateDisplay.textContent = 'State: idle';
        this.debugInfo.appendChild(this.stateDisplay);

        // Movement state display (enhanced)
        this.movementStateDisplay = document.createElement('div');
        this.movementStateDisplay.id = 'debug-movement-state';
        this.movementStateDisplay.textContent = 'Movement: --';
        this.movementStateDisplay.style.cssText = 'font-size: 11px; color: #00ffff;';
        this.debugInfo.appendChild(this.movementStateDisplay);

        // Speed display
        this.speedDisplay = document.createElement('div');
        this.speedDisplay.id = 'debug-speed';
        this.speedDisplay.textContent = 'Speed: 0.00';
        this.speedDisplay.style.cssText = 'font-size: 11px; color: #ffff00;';
        this.debugInfo.appendChild(this.speedDisplay);

        // Input display
        this.inputDisplay = document.createElement('div');
        this.inputDisplay.id = 'debug-input';
        this.inputDisplay.textContent = 'Input: ---';
        this.inputDisplay.style.marginTop = '10px';
        this.inputDisplay.style.paddingTop = '10px';
        this.inputDisplay.style.borderTop = '1px solid #00ff00';
        this.debugInfo.appendChild(this.inputDisplay);

        // Frame time
        const frameTimeDiv = document.createElement('div');
        frameTimeDiv.id = 'debug-frame-time';
        frameTimeDiv.textContent = 'Frame Time: 0ms';
        this.debugInfo.appendChild(frameTimeDiv);

        // Performance section
        const perfSection = document.createElement('div');
        perfSection.id = 'debug-performance';
        perfSection.style.marginTop = '10px';
        perfSection.style.paddingTop = '10px';
        perfSection.style.borderTop = '1px solid #00ff00';
        this.debugInfo.appendChild(perfSection);

        // Draw calls
        const drawCallsDiv = document.createElement('div');
        drawCallsDiv.id = 'debug-draw-calls';
        drawCallsDiv.textContent = 'Draw Calls: --';
        perfSection.appendChild(drawCallsDiv);

        // Triangles
        const trianglesDiv = document.createElement('div');
        trianglesDiv.id = 'debug-triangles';
        trianglesDiv.textContent = 'Triangles: --';
        perfSection.appendChild(trianglesDiv);

        // Memory usage
        const memoryDiv = document.createElement('div');
        memoryDiv.id = 'debug-memory';
        memoryDiv.textContent = 'Memory: --';
        perfSection.appendChild(memoryDiv);

        // System update times
        const updateTimesDiv = document.createElement('div');
        updateTimesDiv.id = 'debug-update-times';
        updateTimesDiv.textContent = 'Update Times: --';
        updateTimesDiv.style.fontSize = '10px';
        perfSection.appendChild(updateTimesDiv);

        // Performance graphs container
        const graphsContainer = document.createElement('div');
        graphsContainer.id = 'debug-graphs';
        graphsContainer.style.cssText = `
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #00ff00;
        `;

        // FPS graph canvas
        const fpsGraphCanvas = document.createElement('canvas');
        fpsGraphCanvas.id = 'debug-fps-graph';
        fpsGraphCanvas.width = 280;
        fpsGraphCanvas.height = 60;
        fpsGraphCanvas.style.cssText =
            'width: 100%; height: 60px; background: rgba(0, 0, 0, 0.5); border: 1px solid #00ff00;';
        graphsContainer.appendChild(fpsGraphCanvas);
        this.fpsGraphCanvas = fpsGraphCanvas;
        this.fpsGraphCtx = fpsGraphCanvas.getContext('2d');

        // Memory graph canvas
        const memoryGraphCanvas = document.createElement('canvas');
        memoryGraphCanvas.id = 'debug-memory-graph';
        memoryGraphCanvas.width = 280;
        memoryGraphCanvas.height = 40;
        memoryGraphCanvas.style.cssText =
            'width: 100%; height: 40px; background: rgba(0, 0, 0, 0.5); border: 1px solid #00ff00; margin-top: 5px;';
        graphsContainer.appendChild(memoryGraphCanvas);
        this.memoryGraphCanvas = memoryGraphCanvas;
        this.memoryGraphCtx = memoryGraphCanvas.getContext('2d');

        perfSection.appendChild(graphsContainer);

        // Performance recommendations
        const recommendationsDiv = document.createElement('div');
        recommendationsDiv.id = 'debug-recommendations';
        recommendationsDiv.style.cssText = `
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #00ff00;
            font-size: 10px;
            color: #ffff00;
        `;
        recommendationsDiv.textContent = 'Recommendations: --';
        perfSection.appendChild(recommendationsDiv);
        this.recommendationsDiv = recommendationsDiv;

        // Performance preset selector
        const presetContainer = document.createElement('div');
        presetContainer.style.cssText = 'margin-top: 10px; display: flex; gap: 5px;';

        const presetLabel = document.createElement('span');
        presetLabel.textContent = 'Preset:';
        presetLabel.style.cssText = 'font-size: 10px; margin-right: 5px;';
        presetContainer.appendChild(presetLabel);

        const presetSelect = document.createElement('select');
        presetSelect.style.cssText =
            'flex: 1; background: #000; color: #00ff00; border: 1px solid #00ff00; font-size: 10px; padding: 2px;';
        for (const [name, preset] of Object.entries(this.performancePresets)) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name.toUpperCase();
            presetSelect.appendChild(option);
        }
        presetSelect.value = this.currentPreset;
        presetSelect.addEventListener('change', (e) => {
            this.applyPerformancePreset(e.target.value);
        });
        presetContainer.appendChild(presetSelect);
        perfSection.appendChild(presetContainer);
        this.presetSelect = presetSelect;

        // Auto-adjust checkbox
        const autoAdjustContainer = document.createElement('div');
        autoAdjustContainer.style.cssText =
            'margin-top: 5px; display: flex; align-items: center; gap: 5px;';

        const autoAdjustCheckbox = document.createElement('input');
        autoAdjustCheckbox.type = 'checkbox';
        autoAdjustCheckbox.id = 'debug-auto-adjust';
        autoAdjustCheckbox.checked = this.autoAdjustEnabled;
        autoAdjustCheckbox.addEventListener('change', (e) => {
            this.autoAdjustEnabled = e.target.checked;
        });
        autoAdjustContainer.appendChild(autoAdjustCheckbox);

        const autoAdjustLabel = document.createElement('label');
        autoAdjustLabel.htmlFor = 'debug-auto-adjust';
        autoAdjustLabel.textContent = 'Auto-adjust quality';
        autoAdjustLabel.style.cssText = 'font-size: 10px; color: #00ff00; cursor: pointer;';
        autoAdjustContainer.appendChild(autoAdjustLabel);
        perfSection.appendChild(autoAdjustContainer);
    }

    /**
     * Setup visual debug indicators in 3D scene
     */
    setupVisualDebug() {
        // Avatar position marker (sphere)
        const markerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.8,
        });
        this.avatarMarker = new THREE.Mesh(markerGeometry, markerMaterial);
        this.avatarMarker.visible = false;
        this.scene.add(this.avatarMarker);

        // Movement direction arrow
        const arrowHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(0, 0, 0),
            0.5,
            0xff00ff,
            0.2,
            0.1
        );
        this.movementArrow = arrowHelper;
        this.movementArrow.visible = false;
        this.scene.add(this.movementArrow);

        // Velocity vector line
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
        });
        this.velocityLine = new THREE.Line(lineGeometry, lineMaterial);
        this.velocityLine.visible = false;
        this.scene.add(this.velocityLine);
    }

    /**
     * Setup keyboard toggle for debug overlay
     */
    setupKeyboardToggle() {
        document.addEventListener('keydown', (event) => {
            // F1 or D key toggles debug overlay
            if (event.key === 'F1' || (event.key.toLowerCase() === 'd' && event.ctrlKey)) {
                event.preventDefault();
                this.toggle();
            }
        });
    }

    /**
     * Toggle debug overlay
     */
    toggle() {
        this.enabled = !this.enabled;
        this.showOverlay = this.enabled;

        if (this.debugContainer) {
            this.debugContainer.style.display = this.enabled ? 'block' : 'none';
        }

        // Toggle visual debug objects
        if (this.avatarMarker) {
            this.avatarMarker.visible = this.enabled;
        }
        if (this.movementArrow) {
            this.movementArrow.visible = this.enabled;
        }
        if (this.velocityLine) {
            this.velocityLine.visible = this.enabled;
        }

        console.log(`Dev Tools: ${this.enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    /**
     * Update dev tools (called each frame)
     */
    update(deltaTime, elapsedTime) {
        if (!this.enabled) {
            return;
        }

        // Update FPS
        this.updateFPS(deltaTime);

        // Update performance stats
        this.updatePerformanceStats();

        // Update graphs
        this.updateGraphs();

        // Update recommendations periodically
        const now = performance.now();
        if (now - this.lastRecommendationUpdate > this.recommendationUpdateInterval) {
            this.updateRecommendations();
            this.lastRecommendationUpdate = now;
        }

        // Auto-adjust performance if enabled
        if (this.autoAdjustEnabled) {
            this.checkAutoAdjust();
        }

        // Update debug info
        this.updateDebugInfo();

        // Update visual debug objects
        this.updateVisualDebug();
    }

    /**
     * Update FPS calculation
     */
    updateFPS(deltaTime) {
        this.frameCount++;
        this.frameTimes.push(deltaTime);

        // Keep only last 60 frames
        if (this.frameTimes.length > 60) {
            this.frameTimes.shift();
        }

        // Update FPS every second
        const now = performance.now();
        if (now - this.lastFpsUpdate > 1000) {
            const avgFrameTime =
                this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
            this.fps = Math.round(1 / avgFrameTime);
            this.stats.fps = this.fps;
            this.stats.frameTime = avgFrameTime * 1000; // Convert to ms
            this.lastFpsUpdate = now;
        }

        // Add to FPS history for graph
        this.fpsHistory.push(this.fps);
        if (this.fpsHistory.length > this.maxHistoryLength) {
            this.fpsHistory.shift();
        }

        // Add to FPS window for auto-adjust
        this.fpsWindow.push(this.fps);
        if (this.fpsWindow.length > this.autoAdjustWindow) {
            this.fpsWindow.shift();
        }
    }

    /**
     * Update performance graphs
     * @private
     */
    updateGraphs() {
        // Update FPS graph
        if (this.fpsGraphCanvas && this.fpsGraphCtx) {
            const ctx = this.fpsGraphCtx;
            const width = this.fpsGraphCanvas.width;
            const height = this.fpsGraphCanvas.height;

            // Clear
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, width, height);

            // Draw grid
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = (height / 4) * i;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw FPS line
            if (this.fpsHistory.length > 1) {
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                ctx.beginPath();

                const maxFps = 120;
                const stepX = width / (this.maxHistoryLength - 1);
                const startX = width - this.fpsHistory.length * stepX;

                for (let i = 0; i < this.fpsHistory.length; i++) {
                    const x = startX + i * stepX;
                    const fps = this.fpsHistory[i];
                    const y = height - (fps / maxFps) * height;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // Draw target FPS line
            const targetFps = this.performancePresets[this.currentPreset]?.fpsTarget || 60;
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            const targetY = height - (targetFps / 120) * height;
            ctx.beginPath();
            ctx.moveTo(0, targetY);
            ctx.lineTo(width, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Update memory graph
        if (this.memoryGraphCanvas && this.memoryGraphCtx) {
            const ctx = this.memoryGraphCtx;
            const width = this.memoryGraphCanvas.width;
            const height = this.memoryGraphCanvas.height;

            // Clear
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, width, height);

            // Draw memory line
            if (this.memoryHistory.length > 1) {
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.beginPath();

                const maxMemory = 200; // MB
                const stepX = width / (this.maxHistoryLength - 1);
                const startX = width - this.memoryHistory.length * stepX;

                for (let i = 0; i < this.memoryHistory.length; i++) {
                    const x = startX + i * stepX;
                    const memory = this.memoryHistory[i];
                    const y = height - (memory / maxMemory) * height;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }
        }
    }

    /**
     * Update performance recommendations
     * @private
     */
    updateRecommendations() {
        this.recommendations = [];

        // Check FPS
        const avgFps =
            this.fpsWindow.length > 0
                ? this.fpsWindow.reduce((a, b) => a + b, 0) / this.fpsWindow.length
                : this.fps;

        if (avgFps < this.warningThresholds.lowFps) {
            this.recommendations.push({
                type: 'fps',
                severity: 'high',
                message: `Low FPS (${avgFps.toFixed(0)}). Consider lowering quality preset.`,
                action: () => {
                    this.applyPerformancePreset('low');
                },
            });
        } else if (avgFps < 30) {
            this.recommendations.push({
                type: 'fps',
                severity: 'medium',
                message: `FPS below 30 (${avgFps.toFixed(0)}). Consider medium quality preset.`,
                action: () => {
                    this.applyPerformancePreset('medium');
                },
            });
        }

        // Check memory
        if (this.stats.memory > this.warningThresholds.highMemory) {
            this.recommendations.push({
                type: 'memory',
                severity: 'high',
                message: `High memory usage (${this.stats.memory}MB). Consider reducing effects.`,
                action: () => {
                    // Suggest disabling some effects
                    if (this.systems.postProcessingManager) {
                        this.systems.postProcessingManager.setGlitchEnabled(false);
                    }
                },
            });
        }

        // Update recommendations display
        if (this.recommendationsDiv) {
            if (this.recommendations.length === 0) {
                this.recommendationsDiv.textContent = 'Recommendations: None';
                this.recommendationsDiv.style.color = '#00ff00';
            } else {
                const recText = this.recommendations.map((r) => r.message).join(' | ');
                this.recommendationsDiv.textContent = `Recommendations: ${recText}`;
                this.recommendationsDiv.style.color = this.recommendations.some(
                    (r) => r.severity === 'high'
                )
                    ? '#ff0000'
                    : '#ffff00';
            }
        }
    }

    /**
     * Check and apply automatic performance adjustment
     * @private
     */
    checkAutoAdjust() {
        if (this.fpsWindow.length < this.autoAdjustWindow) {
            return;
        }

        const avgFps = this.fpsWindow.reduce((a, b) => a + b, 0) / this.fpsWindow.length;

        if (avgFps < this.autoAdjustThreshold) {
            // FPS is below threshold, lower quality
            const currentIndex = ['low', 'medium', 'high', 'ultra'].indexOf(this.currentPreset);
            if (currentIndex > 0) {
                const lowerPreset = ['low', 'medium', 'high', 'ultra'][currentIndex - 1];
                console.log(
                    `Auto-adjusting: FPS ${avgFps.toFixed(0)} < ${this.autoAdjustThreshold}, switching to ${lowerPreset}`
                );
                this.applyPerformancePreset(lowerPreset);
            }
        } else if (avgFps > this.autoAdjustThreshold + 20 && this.currentPreset !== 'ultra') {
            // FPS is well above threshold, can increase quality
            const currentIndex = ['low', 'medium', 'high', 'ultra'].indexOf(this.currentPreset);
            if (currentIndex < 3) {
                const higherPreset = ['low', 'medium', 'high', 'ultra'][currentIndex + 1];
                console.log(
                    `Auto-adjusting: FPS ${avgFps.toFixed(0)} > ${this.autoAdjustThreshold + 20}, switching to ${higherPreset}`
                );
                this.applyPerformancePreset(higherPreset);
            }
        }
    }

    /**
     * Apply performance preset
     * @param {string} presetName - Preset name
     */
    applyPerformancePreset(presetName) {
        const preset = this.performancePresets[presetName];
        if (!preset) {
            console.warn('DevTools: Unknown performance preset:', presetName);
            return;
        }

        this.currentPreset = presetName;

        // Update preset selector
        if (this.presetSelect) {
            this.presetSelect.value = presetName;
        }

        // Apply graphics settings if available
        if (this.systems.graphicsSettings) {
            this.systems.graphicsSettings.setQualityPreset(preset.quality);
        }

        // Emit event
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(
                new CustomEvent('performancePresetChanged', {
                    detail: { preset: presetName, config: preset },
                })
            );
        }
    }

    /**
     * Update debug info display
     */
    updateDebugInfo() {
        if (!this.debugContainer || !this.systems) {
            return;
        }

        const avatar = this.systems.avatar;
        const inputManager = this.systems.inputManager;

        // Update FPS
        const fpsDiv = document.getElementById('debug-fps');
        if (fpsDiv) {
            fpsDiv.textContent = `FPS: ${this.fps} (${this.stats.frameTime.toFixed(2)}ms)`;
            fpsDiv.style.color =
                this.fps >= 60 ? '#00ff00' : this.fps >= 30 ? '#ffff00' : '#ff0000';
        }

        // Update position
        if (this.positionDisplay && avatar) {
            const pos = avatar.position;
            this.positionDisplay.textContent = `Position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`;
        }

        // Update velocity
        if (this.velocityDisplay && avatar) {
            const vel = avatar.velocity;
            const speed = vel.length();
            this.velocityDisplay.textContent = `Velocity: (${vel.x.toFixed(2)}, ${vel.y.toFixed(2)}, ${vel.z.toFixed(2)})`;

            // Update speed display
            if (this.speedDisplay) {
                const maxSpeed = avatar.isRunning ? avatar.runSpeed : avatar.speed;
                const speedPercent = (speed / maxSpeed) * 100;
                this.speedDisplay.textContent = `Speed: ${speed.toFixed(2)} (${speedPercent.toFixed(0)}%)`;
                this.speedDisplay.style.color =
                    speedPercent > 80 ? '#00ff00' : speedPercent > 50 ? '#ffff00' : '#ffffff';
            }
        }

        // Update movement state display
        if (this.movementStateDisplay && avatar) {
            const state = avatar.currentState || 'idle';
            const isRunning = avatar.isRunning || false;
            const isCrouching = avatar.isCrouching || false;
            const isHopping = avatar.isHopping || false;

            let movementInfo = `State: ${state}`;
            if (isRunning) {
                movementInfo += ' | RUNNING';
            }
            if (isCrouching) {
                movementInfo += ' | CROUCHING';
            }
            if (isHopping) {
                movementInfo += ' | HOPPING';
            }

            this.movementStateDisplay.textContent = movementInfo;

            // Color code based on state
            if (isHopping) {
                this.movementStateDisplay.style.color = '#ff00ff';
            } else if (isRunning) {
                this.movementStateDisplay.style.color = '#00ff00';
            } else if (isCrouching) {
                this.movementStateDisplay.style.color = '#ffff00';
            } else {
                this.movementStateDisplay.style.color = '#00ffff';
            }
        }

        // Update state display (original)
        if (this.stateDisplay && avatar) {
            const vel = avatar.velocity;
            const speed = vel.length();
            this.velocityDisplay.textContent = `Velocity: (${vel.x.toFixed(3)}, ${vel.y.toFixed(3)}, ${vel.z.toFixed(3)}) | Speed: ${speed.toFixed(3)}`;
            this.velocityDisplay.style.color = speed > 0.01 ? '#00ffff' : '#888888';
        }

        // Update state
        if (this.stateDisplay && avatar) {
            this.stateDisplay.textContent = `State: ${avatar.currentState} | Running: ${avatar.isRunning} | Crouching: ${avatar.isCrouching} | Hopping: ${avatar.isHopping}`;
        }

        // Update input
        if (this.inputDisplay && inputManager) {
            const keys = inputManager.keys;
            const activeKeys = [];
            if (keys.w) {
                activeKeys.push('W');
            }
            if (keys.a) {
                activeKeys.push('A');
            }
            if (keys.s) {
                activeKeys.push('S');
            }
            if (keys.d) {
                activeKeys.push('D');
            }
            if (keys.space) {
                activeKeys.push('SPACE');
            }
            if (keys.shift) {
                activeKeys.push('SHIFT');
            }
            if (keys.ctrl) {
                activeKeys.push('CTRL');
            }

            this.inputDisplay.textContent = `Input: ${activeKeys.length > 0 ? activeKeys.join(' ') : '---'}`;
            this.inputDisplay.style.color = activeKeys.length > 0 ? '#ffff00' : '#888888';
        }
    }

    /**
     * Update visual debug objects
     */
    updateVisualDebug() {
        if (!this.systems || !this.systems.avatar) {
            return;
        }

        const avatar = this.systems.avatar;

        // Update avatar position marker
        if (this.avatarMarker) {
            this.avatarMarker.position.copy(avatar.position);
            this.avatarMarker.position.y += 0.1; // Slightly above avatar
        }

        // Update movement arrow
        if (this.movementArrow && avatar.velocity.length() > 0.01) {
            const direction = avatar.velocity.clone().normalize();
            this.movementArrow.setDirection(direction);
            this.movementArrow.position.copy(avatar.position);
            this.movementArrow.position.y += 0.5;
            this.movementArrow.setLength(avatar.velocity.length() * 2, 0.2, 0.1);
        }

        // Update velocity line
        if (this.velocityLine && avatar.velocity.length() > 0.01) {
            const start = avatar.position.clone();
            const end = avatar.position.clone().add(avatar.velocity.clone().multiplyScalar(2));
            const positions = new Float32Array([
                start.x,
                start.y + 0.3,
                start.z,
                end.x,
                end.y + 0.3,
                end.z,
            ]);
            this.velocityLine.geometry.setAttribute(
                'position',
                new THREE.BufferAttribute(positions, 3)
            );
            this.velocityLine.geometry.attributes.position.needsUpdate = true;
        }
    }

    /**
     * Update performance statistics
     */
    /**
     * Set CodexAssetIntegration reference for asset-specific metrics
     * @param {Object} codexAssetIntegration - CodexAssetIntegration instance
     */
    setCodexAssetIntegration(codexAssetIntegration) {
        this.codexAssetIntegration = codexAssetIntegration;
    }

    /**
     * Calculate asset-specific performance metrics
     */
    calculateAssetStats() {
        if (!this.codexAssetIntegration || !this.renderer) {
            return;
        }

        const assetStats = {};
        const loadedAssets = this.codexAssetIntegration.loadedAssets;

        if (loadedAssets) {
            loadedAssets.forEach((asset, name) => {
                if (!asset.visible) {
                    assetStats[name] = {
                        visible: false,
                        drawCalls: 0,
                        triangles: 0,
                    };
                    return;
                }

                // Count meshes and triangles for this asset
                let drawCalls = 0;
                let triangles = 0;

                asset.traverse((child) => {
                    if (child.isMesh) {
                        drawCalls++;
                        if (child.geometry && child.geometry.attributes.position) {
                            const positionAttr = child.geometry.attributes.position;
                            const vertexCount = positionAttr.count;
                            // Estimate triangles (assuming indexed geometry)
                            if (child.geometry.index) {
                                triangles += child.geometry.index.count / 3;
                            } else {
                                triangles += vertexCount / 3;
                            }
                        }
                    }
                });

                assetStats[name] = {
                    visible: true,
                    drawCalls: drawCalls,
                    triangles: Math.floor(triangles),
                };
            });
        }

        this.stats.assetStats = assetStats;
    }

    updatePerformanceStats() {
        const now = performance.now();

        // Update renderer stats if available
        if (this.renderer && this.renderer.info) {
            const info = this.renderer.info;
            this.stats.drawCalls = info.render.calls || 0;
            this.stats.triangles = info.render.triangles || 0;

            // Update draw calls display
            const drawCallsDiv = document.getElementById('debug-draw-calls');
            if (drawCallsDiv) {
                drawCallsDiv.textContent = `Draw Calls: ${this.stats.drawCalls}`;
            }

            // Update triangles display
            const trianglesDiv = document.getElementById('debug-triangles');
            if (trianglesDiv) {
                trianglesDiv.textContent = `Triangles: ${this.stats.triangles.toLocaleString()}`;
            }
        }

        // Calculate asset-specific stats
        this.calculateAssetStats();

        // Update asset stats display if available
        this.updateAssetStatsDisplay();

        // Update memory usage (check periodically)
        if (now - this.lastMemoryCheck > this.memoryCheckInterval) {
            if (performance.memory) {
                const memoryMB = parseFloat(
                    (performance.memory.usedJSHeapSize / 1048576).toFixed(2)
                );
                this.stats.memory = memoryMB;

                // Add to memory history
                this.memoryHistory.push(memoryMB);
                if (this.memoryHistory.length > this.maxHistoryLength) {
                    this.memoryHistory.shift();
                }

                const memoryDiv = document.getElementById('debug-memory');
                if (memoryDiv) {
                    memoryDiv.textContent = `Memory: ${memoryMB} MB`;
                    memoryDiv.style.color =
                        memoryMB > this.warningThresholds.highMemory
                            ? '#ff0000'
                            : memoryMB > 50
                              ? '#ffff00'
                              : '#00ff00';
                }

                // Check for memory warnings
                if (memoryMB > this.warningThresholds.highMemory) {
                    this.addWarning('high_memory', `Memory usage high: ${memoryMB}MB`);
                }
            }
            this.lastMemoryCheck = now;
        }

        // Check for FPS warnings
        if (this.fps < this.warningThresholds.lowFps && this.fps > 0) {
            this.addWarning('low_fps', `FPS is low: ${this.fps}`);
        }

        // Update system update times if available
        if (this.systems && this.systems.updateTimes) {
            const updateTimesDiv = document.getElementById('debug-update-times');
            if (updateTimesDiv) {
                const times = Object.entries(this.systems.updateTimes)
                    .map(([name, time]) => `${name}: ${time.toFixed(2)}ms`)
                    .join(', ');
                updateTimesDiv.textContent = `Update: ${times || 'N/A'}`;
            }
        }
    }

    /**
     * Get current stats
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Add performance warning
     * @param {string} type - Warning type
     * @param {string} message - Warning message
     * @private
     */
    addWarning(type, message) {
        // Remove existing warning of same type
        this.warnings = this.warnings.filter((w) => w.type !== type);

        // Add new warning
        this.warnings.push({
            type,
            message,
            timestamp: Date.now(),
        });

        // Keep only last 5 warnings
        if (this.warnings.length > 5) {
            this.warnings.shift();
        }

        // Log warning
        console.warn(`Performance Warning [${type}]: ${message}`);
    }

    /**
     * Get performance recommendations
     * @returns {Array} Recommendations array
     */
    getRecommendations() {
        return [...this.recommendations];
    }

    /**
     * Get performance warnings
     * @returns {Array} Warnings array
     */
    getWarnings() {
        return [...this.warnings];
    }

    /**
     * Log current game state
     */
    logState() {
        if (!this.systems) {
            console.log('DevTools: Systems not available');
            return;
        }

        const avatar = this.systems.avatar;
        const inputManager = this.systems.inputManager;

        console.log('=== DEV TOOLS STATE ===');
        console.log('Avatar:', {
            position: avatar ? avatar.position.clone() : null,
            velocity: avatar ? avatar.velocity.clone() : null,
            state: avatar ? avatar.currentState : null,
            isRunning: avatar ? avatar.isRunning : null,
            isCrouching: avatar ? avatar.isCrouching : null,
            isHopping: avatar ? avatar.isHopping : null,
        });
        console.log('Input:', {
            keys: inputManager ? { ...inputManager.keys } : null,
        });
        console.log('Performance:', this.getStats());
        console.log('======================');
    }
}
