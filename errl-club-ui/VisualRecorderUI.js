/**
 * VisualRecorderUI - UI for visual recorder controls and management
 *
 * Provides recording controls, management, and metadata display
 */
import { BasePanel } from './BasePanel.js';
import { Button } from './components/Button.js';
import { Dropdown } from './components/Dropdown.js';
import { ImageExporter } from '../utils/ImageExporter.js';
import { DESIGN_SYSTEM } from './designSystem.js';

export class VisualRecorderUI extends BasePanel {
    /**
     * Create a new VisualRecorderUI
     * @param {Object} config - Configuration
     * @param {VisualRecorder} config.visualRecorder - VisualRecorder instance
     * @param {VisualRecorderExporter} config.visualRecorderExporter - VisualRecorderExporter instance (optional)
     * @param {Function} config.onClose - Close handler
     */
    constructor(config = {}) {
        super({
            id: 'visual_recorder_ui',
            title: 'Visual Recorder',
            position: { x: 200, y: 100 },
            size: { width: 500, height: 600 },
        });

        this.visualRecorder = config.visualRecorder;
        this.visualRecorderExporter = config.visualRecorderExporter || null;
        this.onClose = config.onClose || (() => {});

        // Recording state
        this.recording = false;
        this.paused = false;
        this.recordingQuality = 'medium';
        this.frameRate = 60;

        // Recording management
        this.recordings = []; // Stored in memory for now

        // Export state
        this.exporting = false;
        this.exportProgress = 0;
        this.exportFormat = 'png'; // 'png' or 'jpeg'

        // UI elements
        this.recordingIndicator = null;
        this.controlsContainer = null;
        this.recordingsList = null;
        this.exportProgressBar = null;

        // Create UI content
        this.createContent();

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Set VisualRecorder instance
     * @param {VisualRecorder} visualRecorder - VisualRecorder instance
     */
    setVisualRecorder(visualRecorder) {
        this.visualRecorder = visualRecorder;
        this.setupEventListeners();
    }

    /**
     * Task 4.2: Set VisualRecorderExporter instance
     * @param {VisualRecorderExporter} visualRecorderExporter - VisualRecorderExporter instance
     */
    setVisualRecorderExporter(visualRecorderExporter) {
        this.visualRecorderExporter = visualRecorderExporter;
    }

    /**
     * Setup event listeners
     * @private
     */
    setupEventListeners() {
        if (!this.visualRecorder) {
            return;
        }

        // Listen for recording state changes
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('visualRecordingStarted', () => {
                this.updateRecordingState(true, false);
            });

            window.addEventListener('visualRecordingStopped', () => {
                this.updateRecordingState(false, false);
            });

            window.addEventListener('visualRecordingPaused', () => {
                this.updateRecordingState(true, true);
            });

            window.addEventListener('visualRecordingResumed', () => {
                this.updateRecordingState(true, false);
            });
        }
    }

    /**
     * Create UI content
     * @private
     */
    createContent() {
        const content = this.getContentElement();

        // Recording indicator
        const indicatorContainer = document.createElement('div');
        indicatorContainer.style.cssText = `
            margin-bottom: 20px;
            padding: 10px;
            background: ${DESIGN_SYSTEM.colors.background};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
        `;

        this.recordingIndicator = document.createElement('div');
        this.recordingIndicator.id = 'visual-recorder-indicator';
        this.recordingIndicator.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        `;

        const statusDot = document.createElement('div');
        statusDot.id = 'vr-status-dot';
        statusDot.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${DESIGN_SYSTEM.colors.text};
            opacity: 0.6;
        `;
        this.recordingIndicator.appendChild(statusDot);

        const statusText = document.createElement('span');
        statusText.id = 'vr-status-text';
        statusText.textContent = 'Not Recording';
        statusText.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            opacity: 0.6;
            font-weight: bold;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        this.recordingIndicator.appendChild(statusText);

        indicatorContainer.appendChild(this.recordingIndicator);

        const timeDisplay = document.createElement('div');
        timeDisplay.id = 'vr-time-display';
        timeDisplay.textContent = '00:00';
        timeDisplay.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            font-size: 18px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            margin-bottom: 4px;
        `;
        indicatorContainer.appendChild(timeDisplay);
        this.timeDisplay = timeDisplay;

        const frameDisplay = document.createElement('div');
        frameDisplay.id = 'vr-frame-display';
        frameDisplay.textContent = 'Frames: 0';
        frameDisplay.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            opacity: 0.6;
            font-size: 12px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        indicatorContainer.appendChild(frameDisplay);
        this.frameDisplay = frameDisplay;

        content.appendChild(indicatorContainer);

        // Controls section
        const controlsSection = document.createElement('div');
        controlsSection.style.cssText = 'margin-bottom: 20px;';
        const controlsHeader = document.createElement('h3');
        controlsHeader.textContent = 'Controls';
        controlsHeader.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            margin-bottom: 10px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        controlsSection.appendChild(controlsHeader);

        this.controlsContainer = document.createElement('div');
        this.controlsContainer.style.cssText = 'display: flex; gap: 8px; margin-bottom: 10px;';

        // Start/Stop button
        this.startStopButton = new Button({
            text: 'Start Recording',
            onClick: () => {
                this.toggleRecording();
            },
        });
        this.controlsContainer.appendChild(this.startStopButton.element);

        // Pause/Resume button
        this.pauseResumeButton = new Button({
            text: 'Pause',
            onClick: () => {
                this.togglePause();
            },
        });
        this.pauseResumeButton.element.disabled = true;
        this.controlsContainer.appendChild(this.pauseResumeButton.element);

        controlsSection.appendChild(this.controlsContainer);

        // Recording settings
        const settingsContainer = document.createElement('div');
        settingsContainer.style.cssText =
            'display: flex; flex-direction: column; gap: 10px; margin-top: 10px;';

        // Quality selector
        const qualityDropdown = new Dropdown({
            label: 'Recording Quality',
            options: [
                { value: 'low', label: 'Low (Smaller file)' },
                { value: 'medium', label: 'Medium (Balanced)' },
                { value: 'high', label: 'High (Larger file)' },
            ],
            value: this.recordingQuality,
            onChange: (value) => {
                this.recordingQuality = value;
            },
        });
        settingsContainer.appendChild(qualityDropdown.getElement());

        // Frame rate selector
        const frameRateDropdown = new Dropdown({
            label: 'Frame Rate',
            options: [
                { value: '30', label: '30 FPS' },
                { value: '60', label: '60 FPS' },
                { value: 'unlimited', label: 'Unlimited' },
            ],
            value: this.frameRate.toString(),
            onChange: (value) => {
                this.frameRate = value === 'unlimited' ? 0 : parseInt(value);
            },
        });
        settingsContainer.appendChild(frameRateDropdown.getElement());

        controlsSection.appendChild(settingsContainer);
        content.appendChild(controlsSection);

        // Export section
        const exportSection = document.createElement('div');
        exportSection.style.cssText = 'margin-bottom: 20px;';
        const exportHeader = document.createElement('h3');
        exportHeader.textContent = 'Export';
        exportHeader.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            margin-bottom: 10px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        exportSection.appendChild(exportHeader);

        const exportControls = document.createElement('div');
        exportControls.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

        // Export format selector
        const formatDropdown = new Dropdown({
            label: 'Export Format',
            options: [
                { value: 'png', label: 'PNG Sequence' },
                { value: 'jpeg', label: 'JPEG Sequence' },
            ],
            value: this.exportFormat,
            onChange: (value) => {
                this.exportFormat = value;
            },
        });
        exportControls.appendChild(formatDropdown.getElement());

        // Export progress bar
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = 'display: none; margin-top: 10px;';
        progressContainer.id = 'export-progress-container';

        const progressLabel = document.createElement('div');
        progressLabel.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.text};
            opacity: 0.7;
            font-size: 12px;
            margin-bottom: 5px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        progressLabel.textContent = 'Exporting...';
        progressContainer.appendChild(progressLabel);

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 100%;
            height: 8px;
            background: rgba(0, 255, 255, 0.2);
            border-radius: 4px;
            overflow: hidden;
        `;

        const progressFill = document.createElement('div');
        progressFill.id = 'export-progress-fill';
        progressFill.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #00ffff, #00ff00);
            transition: width 0.3s;
        `;
        progressBar.appendChild(progressFill);
        progressContainer.appendChild(progressBar);

        this.exportProgressBar = progressContainer;
        exportControls.appendChild(progressContainer);

        exportSection.appendChild(exportControls);
        content.appendChild(exportSection);

        // Recordings list section
        const recordingsSection = document.createElement('div');
        recordingsSection.style.cssText = 'margin-bottom: 20px;';
        const recordingsHeader = document.createElement('h3');
        recordingsHeader.textContent = 'Recordings';
        recordingsHeader.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            margin-bottom: 10px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        recordingsSection.appendChild(recordingsHeader);

        this.recordingsList = document.createElement('div');
        this.recordingsList.id = 'vr-recordings-list';
        this.recordingsList.style.cssText = `
            max-height: 200px;
            overflow-y: auto;
            background: ${DESIGN_SYSTEM.colors.background};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 8px;
        `;
        recordingsSection.appendChild(this.recordingsList);

        // Refresh recordings list
        this.updateRecordingsList();

        content.appendChild(recordingsSection);

        // Close button
        const closeButton = new Button({
            text: 'Close',
            onClick: () => {
                this.onClose();
                this.hide();
            },
        });
        content.appendChild(closeButton.element);
    }

    /**
     * Toggle recording
     */
    toggleRecording() {
        if (!this.visualRecorder) {
            console.warn('VisualRecorderUI: VisualRecorder not available');
            return;
        }

        if (this.recording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    /**
     * Start recording
     */
    startRecording() {
        if (!this.visualRecorder) {
            return;
        }

        this.visualRecorder.startRecording();
        this.recording = true;
        this.paused = false;
        this.updateUI();

        // Emit event
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(
                new CustomEvent('visualRecordingStarted', {
                    detail: {
                        quality: this.recordingQuality,
                        frameRate: this.frameRate,
                    },
                })
            );
        }
    }

    /**
     * Stop recording
     */
    stopRecording() {
        if (!this.visualRecorder) {
            return;
        }

        const recordingData = this.visualRecorder.stopRecording();
        this.recording = false;
        this.paused = false;

        // Add to recordings list
        if (recordingData) {
            this.addRecording(recordingData);
        }

        this.updateUI();

        // Emit event
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(
                new CustomEvent('visualRecordingStopped', {
                    detail: recordingData,
                })
            );
        }
    }

    /**
     * Toggle pause
     */
    togglePause() {
        if (!this.visualRecorder || !this.recording) {
            return;
        }

        // Note: VisualRecorder doesn't have pause yet, so we'll simulate it
        this.paused = !this.paused;
        this.updateUI();

        // Emit event
        if (typeof window !== 'undefined' && window.dispatchEvent) {
            if (this.paused) {
                window.dispatchEvent(new CustomEvent('visualRecordingPaused'));
            } else {
                window.dispatchEvent(new CustomEvent('visualRecordingResumed'));
            }
        }
    }

    /**
     * Add recording to list
     * @param {Object} recordingData - Recording data
     * @private
     */
    addRecording(recordingData) {
        const recording = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            duration: recordingData.duration || 0,
            frameCount: recordingData.frames?.length || 0,
            eventCount: recordingData.events?.length || 0,
            data: recordingData,
        };

        this.recordings.unshift(recording); // Add to beginning
        this.updateRecordingsList();
    }

    /**
     * Update recordings list
     * @private
     */
    updateRecordingsList() {
        if (!this.recordingsList) {
            return;
        }

        this.recordingsList.innerHTML = '';

        if (this.recordings.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = 'No recordings yet';
            emptyMsg.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                opacity: 0.6;
                text-align: center;
                padding: 20px;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            this.recordingsList.appendChild(emptyMsg);
            return;
        }

        for (const recording of this.recordings) {
            const recordingItem = document.createElement('div');
            recordingItem.style.cssText = `
                padding: 8px;
                margin-bottom: 4px;
                background: ${DESIGN_SYSTEM.colors.background};
                border-radius: ${DESIGN_SYSTEM.borders.radius};
                border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            `;

            const date = new Date(recording.timestamp);
            const dateStr = date.toLocaleString();

            const itemContent = document.createElement('div');
            itemContent.style.cssText =
                'display: flex; justify-content: space-between; align-items: center;';

            const infoDiv = document.createElement('div');

            const dateDiv = document.createElement('div');
            dateDiv.textContent = dateStr;
            dateDiv.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                font-weight: bold;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            infoDiv.appendChild(dateDiv);

            const metaDiv = document.createElement('div');
            metaDiv.textContent = `Duration: ${recording.duration.toFixed(1)}s | Frames: ${recording.frameCount} | Events: ${recording.eventCount}`;
            metaDiv.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.text};
                opacity: 0.6;
                font-size: 11px;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            infoDiv.appendChild(metaDiv);

            itemContent.appendChild(infoDiv);

            const buttonsDiv = document.createElement('div');
            buttonsDiv.style.cssText = 'display: flex; gap: 4px;';

            const exportBtn = document.createElement('button');
            exportBtn.className = 'export-btn';
            exportBtn.textContent = 'Export';
            exportBtn.style.cssText = `
                padding: 4px 8px;
                background: ${DESIGN_SYSTEM.colors.background};
                border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.accent};
                color: ${DESIGN_SYSTEM.colors.accent};
                border-radius: ${DESIGN_SYSTEM.borders.radius};
                cursor: pointer;
                font-size: 10px;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            buttonsDiv.appendChild(exportBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.style.cssText = `
                padding: 4px 8px;
                background: ${DESIGN_SYSTEM.colors.background};
                border: ${DESIGN_SYSTEM.borders.width} solid #ff0000;
                color: #ff0000;
                border-radius: ${DESIGN_SYSTEM.borders.radius};
                cursor: pointer;
                font-size: 10px;
                font-family: ${DESIGN_SYSTEM.typography.fontFamily};
            `;
            buttonsDiv.appendChild(deleteBtn);

            itemContent.appendChild(buttonsDiv);
            recordingItem.appendChild(itemContent);

            recordingItem.setAttribute('data-recording-id', recording.id);

            // Export button handler (already attached to element)
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportRecording(recording);
                });
            }

            // Delete button handler (already attached to element)
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.deleteRecording(recording.id);
                });
            }

            this.recordingsList.appendChild(recordingItem);
        }
    }

    /**
     * Delete recording
     * @param {string} recordingId - Recording ID
     */
    deleteRecording(recordingId) {
        this.recordings = this.recordings.filter((r) => r.id !== recordingId);
        this.updateRecordingsList();
    }

    /**
     * Export recording as image sequence
     * @param {Object} recording - Recording object
     */
    async exportRecording(recording) {
        if (!recording || !recording.data || !recording.data.frames) {
            console.warn('VisualRecorderUI: No frames to export');
            return;
        }

        if (this.exporting) {
            console.warn('VisualRecorderUI: Export already in progress');
            return;
        }

        this.exporting = true;
        this.exportProgress = 0;

        // Show progress bar
        if (this.exportProgressBar) {
            this.exportProgressBar.style.display = 'block';
        }

        const frames = recording.data.frames;
        const prefix = `recording_${recording.id}`;

        try {
            // Task 4.2: Use VisualRecorderExporter if available, otherwise fall back to ImageExporter
            if (this.visualRecorderExporter) {
                // Use VisualRecorderExporter
                if (this.exportFormat === 'png') {
                    const result = await this.visualRecorderExporter.exportPNGSequence({
                        frames: frames,
                        prefix: prefix,
                        startIndex: 0,
                    });
                    console.log(`VisualRecorderUI: Exported ${result.fileCount} PNG files`);
                    this.onExportComplete();
                } else if (this.exportFormat === 'jpeg') {
                    const result = await this.visualRecorderExporter.exportJPEGSequence({
                        frames: frames,
                        prefix: prefix,
                        quality: 0.9,
                        startIndex: 0,
                    });
                    console.log(`VisualRecorderUI: Exported ${result.fileCount} JPEG files`);
                    this.onExportComplete();
                }
            } else {
                // Fall back to ImageExporter
                if (this.exportFormat === 'png') {
                    await ImageExporter.exportPNGSequence(frames, {
                        prefix: prefix,
                        onProgress: (progress) => {
                            this.exportProgress = progress;
                            this.updateExportProgress();
                        },
                        onComplete: (files) => {
                            console.log(`VisualRecorderUI: Exported ${files.length} PNG files`);
                            this.onExportComplete();
                        },
                    });
                } else if (this.exportFormat === 'jpeg') {
                    await ImageExporter.exportJPEGSequence(frames, {
                        prefix: prefix,
                        quality: 0.9,
                        onProgress: (progress) => {
                            this.exportProgress = progress;
                            this.updateExportProgress();
                        },
                        onComplete: (files) => {
                            console.log(`VisualRecorderUI: Exported ${files.length} JPEG files`);
                            this.onExportComplete();
                        },
                    });
                }
            }
        } catch (error) {
            console.error('VisualRecorderUI: Export failed:', error);
            this.onExportComplete();
        }
    }

    /**
     * Update export progress
     * @private
     */
    updateExportProgress() {
        const progressFill = document.getElementById('export-progress-fill');
        if (progressFill) {
            progressFill.style.width = `${this.exportProgress * 100}%`;
        }

        const progressLabel = this.exportProgressBar?.querySelector('div');
        if (progressLabel) {
            progressLabel.textContent = `Exporting... ${Math.round(this.exportProgress * 100)}%`;
        }
    }

    /**
     * Handle export completion
     * @private
     */
    onExportComplete() {
        this.exporting = false;
        this.exportProgress = 0;

        // Hide progress bar after a delay
        setTimeout(() => {
            if (this.exportProgressBar) {
                this.exportProgressBar.style.display = 'none';
            }
        }, 2000);
    }

    /**
     * Update recording state
     * @param {boolean} recording - Is recording
     * @param {boolean} paused - Is paused
     * @private
     */
    updateRecordingState(recording, paused) {
        this.recording = recording;
        this.paused = paused;
        this.updateUI();
    }

    /**
     * Update UI elements
     * @private
     */
    updateUI() {
        // Update status indicator
        const statusDot = document.getElementById('vr-status-dot');
        const statusText = document.getElementById('vr-status-text');

        if (statusDot && statusText) {
            if (this.recording) {
                if (this.paused) {
                    statusDot.style.background = '#ffff00';
                    statusText.textContent = 'PAUSED';
                    statusText.style.color = '#ffff00';
                } else {
                    statusDot.style.background = '#ff0000';
                    statusDot.style.animation = 'replayPulse 1s ease-in-out infinite';
                    statusText.textContent = 'RECORDING';
                    statusText.style.color = '#ff0000';
                }
            } else {
                statusDot.style.background = '#888';
                statusDot.style.animation = 'none';
                statusText.textContent = 'Not Recording';
                statusText.style.color = '#888';
            }
        }

        // Update buttons
        if (this.startStopButton) {
            this.startStopButton.element.textContent = this.recording
                ? 'Stop Recording'
                : 'Start Recording';
        }

        if (this.pauseResumeButton) {
            this.pauseResumeButton.element.disabled = !this.recording;
            this.pauseResumeButton.element.textContent = this.paused ? 'Resume' : 'Pause';
        }

        // Update time and frame display
        if (this.visualRecorder && this.visualRecorder.isRecording) {
            const duration = (performance.now() - this.visualRecorder.startTime) / 1000;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            if (this.timeDisplay) {
                this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            if (this.frameDisplay) {
                this.frameDisplay.textContent = `Frames: ${this.visualRecorder.recordedFrames.length}`;
            }
        } else {
            if (this.timeDisplay) {
                this.timeDisplay.textContent = '00:00';
            }
            if (this.frameDisplay) {
                this.frameDisplay.textContent = 'Frames: 0';
            }
        }
    }

    /**
     * Show panel
     */
    show() {
        super.show();
        this.updateUI();
    }

    /**
     * Update (called each frame)
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (this.recording && this.visualRecorder && this.visualRecorder.isRecording) {
            this.updateUI();
        }
    }
}
