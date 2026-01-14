/**
 * AudioSettingsUI - Comprehensive audio settings UI
 *
 * Provides controls for master volume, music volume, SFX volume, and audio quality
 */
import { BasePanel } from './BasePanel.js';
import { Button } from './components/Button.js';
import { Slider } from './components/Slider.js';
import { Dropdown } from './components/Dropdown.js';
import { DESIGN_SYSTEM } from './designSystem.js';

export class AudioSettingsUI extends BasePanel {
    /**
     * Create a new AudioSettingsUI
     * @param {Object} config - Configuration
     * @param {Function} config.onClose - Close handler
     * @param {Object} config.audioSettings - AudioSettings instance
     * @param {Object} config.audioSystem - AudioSystem instance (optional)
     * @param {Object} config.settingsManager - SettingsManager instance (optional)
     */
    constructor(config = {}) {
        super({
            id: 'audio_settings_ui',
            title: 'Audio Settings',
            position: { x: 100, y: 100 },
            size: { width: 500, height: 500 },
        });

        this.onClose = config.onClose || (() => {});
        this.onSettingsChange = config.onSettingsChange || (() => {});
        this.audioSettings = config.audioSettings;
        this.audioSystem = config.audioSystem;
        this.settingsManager = config.settingsManager;

        // UI state
        this.sliders = new Map();
        this.realTimePreview = true;

        // Create UI content
        this.createContent();

        // Load current settings
        this.loadSettings();
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
            gap: 20px;
            max-height: 450px;
            overflow-y: auto;
            padding-right: 8px;
        `;

        // Volume controls section
        this.createVolumeSection(content);

        // Audio level indicators section (if audio system available)
        if (this.audioSystem) {
            this.createAudioLevelIndicatorsSection(content);
        }

        // Quality settings section
        this.createQualitySection(content);

        // Audio system info section (if available)
        if (this.audioSystem) {
            this.createAudioSystemInfoSection(content);
        }

        // Audio test section
        this.createAudioTestSection(content);

        // Action buttons
        this.createActionButtons(content);
    }

    /**
     * Create volume controls section
     * @private
     */
    createVolumeSection(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 16px;
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 12px;
        `;

        const header = document.createElement('div');
        header.textContent = 'Volume Controls';
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        section.appendChild(header);

        // Master volume
        const masterVolume = new Slider({
            label: 'Master Volume',
            min: 0,
            max: 100,
            value: this.audioSettings ? this.audioSettings.getMasterVolume() : 50,
            onChange: (value) => {
                if (this.audioSettings) {
                    this.audioSettings.setMasterVolume(value);
                }
                if (this.realTimePreview && this.audioSystem) {
                    // Apply volume to audio system
                    this.applyVolumeToAudioSystem('master', value);
                }
                this.onSettingsChange();
            },
        });
        section.appendChild(masterVolume.getElement());
        this.sliders.set('masterVolume', masterVolume);

        // Music volume
        const musicVolume = new Slider({
            label: 'Music Volume',
            min: 0,
            max: 100,
            value: this.audioSettings ? this.audioSettings.getMusicVolume() : 80,
            onChange: (value) => {
                if (this.audioSettings) {
                    this.audioSettings.setMusicVolume(value);
                }
                if (this.realTimePreview && this.audioSystem) {
                    this.applyVolumeToAudioSystem('music', value);
                }
                this.onSettingsChange();
            },
        });
        section.appendChild(musicVolume.getElement());
        this.sliders.set('musicVolume', musicVolume);

        // SFX volume
        const sfxVolume = new Slider({
            label: 'SFX Volume',
            min: 0,
            max: 100,
            value: this.audioSettings ? this.audioSettings.getSFXVolume() : 100,
            onChange: (value) => {
                if (this.audioSettings) {
                    this.audioSettings.setSFXVolume(value);
                }
                if (this.realTimePreview && this.audioSystem) {
                    this.applyVolumeToAudioSystem('sfx', value);
                }
                this.onSettingsChange();
            },
        });
        section.appendChild(sfxVolume.getElement());
        this.sliders.set('sfxVolume', sfxVolume);

        container.appendChild(section);
    }

    /**
     * Create quality settings section
     * @private
     */
    createQualitySection(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 16px;
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 12px;
        `;

        const header = document.createElement('div');
        header.textContent = 'Audio Quality';
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        section.appendChild(header);

        // Quality preset dropdown
        const qualityDropdown = new Dropdown({
            label: 'Quality Preset',
            options: [
                { value: 'low', label: 'Low - Reduced quality, better performance' },
                { value: 'medium', label: 'Medium - Balanced quality and performance' },
                { value: 'high', label: 'High - Best quality, standard performance' },
            ],
            value: this.audioSettings ? this.audioSettings.getQuality() : 'high',
            onChange: (value) => {
                if (this.audioSettings) {
                    this.audioSettings.setQuality(value);
                }
                this.onSettingsChange();
            },
        });
        section.appendChild(qualityDropdown.getElement());

        container.appendChild(section);
    }

    /**
     * Create audio system info section
     * @private
     */
    createAudioSystemInfoSection(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 16px;
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 12px;
        `;

        const header = document.createElement('div');
        header.textContent = 'Audio System Status';
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        section.appendChild(header);

        // Audio status info
        const statusInfo = document.createElement('div');
        statusInfo.id = 'audio-status-info';
        statusInfo.style.cssText = 'color: #aaa; font-size: 12px; line-height: 1.6;';

        // Update status info
        this.updateAudioSystemInfo(statusInfo);

        section.appendChild(statusInfo);
        container.appendChild(section);

        this.audioStatusInfo = statusInfo;
    }

    /**
     * Create audio level indicators section
     * @private
     */
    createAudioLevelIndicatorsSection(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 16px;
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 12px;
        `;

        const header = document.createElement('div');
        header.textContent = 'Audio Level Indicators';
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        section.appendChild(header);

        // Master volume level meter
        const masterMeter = this.createLevelMeter('Master Volume', 'master');
        section.appendChild(masterMeter);

        // Music volume level meter
        const musicMeter = this.createLevelMeter('Music Volume', 'music');
        section.appendChild(musicMeter);

        // SFX volume level meter
        const sfxMeter = this.createLevelMeter('SFX Volume', 'sfx');
        section.appendChild(sfxMeter);

        // Frequency band meters (if available)
        if (this.audioSystem && this.audioSystem.frequencyBands) {
            const freqSection = document.createElement('div');
            freqSection.style.cssText =
                'margin-top: 16px; padding-top: 16px; border-top: 1px solid #333;';

            const freqHeader = document.createElement('div');
            freqHeader.textContent = 'Frequency Bands';
            freqHeader.style.cssText = `
                color: ${DESIGN_SYSTEM.colors.accent};
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 8px;
            `;
            freqSection.appendChild(freqHeader);

            const bassMeter = this.createLevelMeter('Bass', 'bass', '#00ff00');
            freqSection.appendChild(bassMeter);

            const midMeter = this.createLevelMeter('Mid', 'mid', '#00ffff');
            freqSection.appendChild(midMeter);

            const trebleMeter = this.createLevelMeter('Treble', 'treble', '#ff00ff');
            freqSection.appendChild(trebleMeter);

            section.appendChild(freqSection);
        }

        container.appendChild(section);

        // Start updating meters if audio system is available
        if (this.audioSystem) {
            this.startLevelMeterUpdates();
        }
    }

    /**
     * Create a level meter element
     * @private
     */
    createLevelMeter(label, id, color = '#00ffff') {
        const meterContainer = document.createElement('div');
        meterContainer.style.cssText = 'margin-bottom: 12px;';

        const labelElement = document.createElement('div');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            color: #ffffff;
            font-size: 12px;
            margin-bottom: 4px;
        `;
        meterContainer.appendChild(labelElement);

        const meterBar = document.createElement('div');
        meterBar.id = `audio-meter-${id}`;
        meterBar.style.cssText = `
            width: 100%;
            height: 20px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid ${color};
            border-radius: 4px;
            position: relative;
            overflow: hidden;
        `;

        const meterFill = document.createElement('div');
        meterFill.style.cssText = `
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, ${color} 0%, ${color}80 100%);
            transition: width 0.1s linear;
            box-shadow: 0 0 10px ${color};
        `;
        meterBar.appendChild(meterFill);

        const meterValue = document.createElement('div');
        meterValue.id = `audio-meter-value-${id}`;
        meterValue.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
        `;
        meterValue.textContent = '0%';
        meterBar.appendChild(meterValue);

        meterContainer.appendChild(meterBar);

        // Store reference for updates
        if (!this.levelMeters) {
            this.levelMeters = new Map();
        }
        this.levelMeters.set(id, { fill: meterFill, value: meterValue });

        return meterContainer;
    }

    /**
     * Start updating level meters
     * @private
     */
    startLevelMeterUpdates() {
        if (this.levelMeterUpdateInterval) {
            return; // Already running
        }

        this.levelMeterUpdateInterval = setInterval(() => {
            this.updateLevelMeters();
        }, 100); // Update 10 times per second
    }

    /**
     * Stop updating level meters
     * @private
     */
    stopLevelMeterUpdates() {
        if (this.levelMeterUpdateInterval) {
            clearInterval(this.levelMeterUpdateInterval);
            this.levelMeterUpdateInterval = null;
        }
    }

    /**
     * Update all level meters
     * @private
     */
    updateLevelMeters() {
        if (!this.levelMeters || !this.audioSystem) {
            return;
        }

        // Update volume meters
        if (this.audioSettings) {
            const masterVolume = this.audioSettings.getMasterVolume();
            this.updateMeter('master', masterVolume);

            const musicVolume = this.audioSettings.getMusicVolume();
            this.updateMeter('music', musicVolume);

            const sfxVolume = this.audioSettings.getSFXVolume();
            this.updateMeter('sfx', sfxVolume);
        }

        // Update frequency band meters
        if (this.audioSystem.frequencyBands) {
            const { bass, mid, treble } = this.audioSystem.frequencyBands;
            this.updateMeter('bass', bass * 100);
            this.updateMeter('mid', mid * 100);
            this.updateMeter('treble', treble * 100);
        }
    }

    /**
     * Update a single meter
     * @private
     */
    updateMeter(id, value) {
        const meter = this.levelMeters?.get(id);
        if (!meter) {
            return;
        }

        const clampedValue = Math.max(0, Math.min(100, value));
        meter.fill.style.width = `${clampedValue}%`;
        meter.value.textContent = `${clampedValue.toFixed(0)}%`;
    }

    /**
     * Create audio test section
     * @private
     */
    createAudioTestSection(container) {
        const section = document.createElement('div');
        section.style.cssText = `
            margin-bottom: 16px;
            border: ${DESIGN_SYSTEM.borders.width} solid ${DESIGN_SYSTEM.colors.border};
            border-radius: ${DESIGN_SYSTEM.borders.radius};
            padding: 12px;
        `;

        const header = document.createElement('div');
        header.textContent = 'Audio Test';
        header.style.cssText = `
            color: ${DESIGN_SYSTEM.colors.accent};
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        `;
        section.appendChild(header);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap;';

        // Test master volume button
        const testMasterButton = new Button({
            text: 'Test Master',
            onClick: () => {
                this.playTestSound('master');
            },
        });
        buttonContainer.appendChild(testMasterButton.getElement());

        // Test music volume button
        const testMusicButton = new Button({
            text: 'Test Music',
            onClick: () => {
                this.playTestSound('music');
            },
        });
        buttonContainer.appendChild(testMusicButton.getElement());

        // Test SFX volume button
        const testSFXButton = new Button({
            text: 'Test SFX',
            onClick: () => {
                this.playTestSound('sfx');
            },
        });
        buttonContainer.appendChild(testSFXButton.getElement());

        section.appendChild(buttonContainer);
        container.appendChild(section);
    }

    /**
     * Play a test sound
     * @private
     */
    playTestSound(type) {
        if (!this.audioSystem || !this.audioSystem.audioContext) {
            console.warn('AudioSystem not available for test sound');
            return;
        }

        const audioContext = this.audioSystem.audioContext;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Set frequency based on type
        const frequencies = {
            master: 440, // A4
            music: 523.25, // C5
            sfx: 659.25, // E5
        };
        oscillator.frequency.value = frequencies[type] || 440;
        oscillator.type = 'sine';

        // Set volume based on settings
        let volume = 0.3;
        if (this.audioSettings) {
            const masterVolume = this.audioSettings.getMasterVolume() / 100;
            volume = masterVolume * 0.3;

            if (type === 'music') {
                volume *= this.audioSettings.getMusicVolume() / 100;
            } else if (type === 'sfx') {
                volume *= this.audioSettings.getSFXVolume() / 100;
            }
        }

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    /**
     * Update audio system info display
     * @private
     */
    updateAudioSystemInfo(element) {
        if (!this.audioSystem) {
            return;
        }

        const isPlaying = this.audioSystem.isPlaying ? this.audioSystem.isPlaying() : false;
        const hasAudio = this.audioSystem.audioSource ? 'Yes' : 'No';
        const bassEnergy = this.audioSystem.bassEnergy
            ? (this.audioSystem.bassEnergy * 100).toFixed(1)
            : '0.0';

        element.innerHTML = `
            <div>Audio Source: ${hasAudio}</div>
            <div>Status: ${isPlaying ? 'Playing' : 'Stopped'}</div>
            <div>Bass Energy: ${bassEnergy}%</div>
        `;
    }

    /**
     * Apply volume to audio system
     * @private
     */
    applyVolumeToAudioSystem(type, value) {
        if (!this.audioSystem) {
            return;
        }

        const normalizedValue = value / 100;

        // Apply to audio context gain node if available
        if (this.audioSystem.audioContext && this.audioSystem.audioContext.gainNode) {
            if (type === 'master') {
                this.audioSystem.audioContext.gainNode.gain.value = normalizedValue;
            }
        }

        // Apply to audio source if available
        if (this.audioSystem.audioSource) {
            if (type === 'master' || type === 'music') {
                if (this.audioSystem.audioSource.volume !== undefined) {
                    this.audioSystem.audioSource.volume = normalizedValue;
                }
            }
        }
    }

    /**
     * Create action buttons
     * @private
     */
    createActionButtons(container) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText =
            'display: flex; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid #00ffff;';

        // Real-time preview toggle
        const previewToggle = this.createToggle(buttonContainer, 'Real-Time Preview', 'preview');
        previewToggle.checkbox.checked = this.realTimePreview;
        previewToggle.checkbox.addEventListener('change', () => {
            this.realTimePreview = previewToggle.checkbox.checked;
        });

        // Reset button
        const resetButton = new Button({
            text: 'Reset to Defaults',
            onClick: () => {
                if (this.audioSettings) {
                    this.audioSettings.setMasterVolume(100);
                    this.audioSettings.setMusicVolume(80);
                    this.audioSettings.setSFXVolume(100);
                    this.audioSettings.setQuality('high');
                }
                this.loadSettings();
                if (this.audioSystem) {
                    this.applyVolumeToAudioSystem('master', 100);
                }
            },
        });
        buttonContainer.appendChild(resetButton.getElement());

        // Save button
        const saveButton = new Button({
            text: 'Save',
            onClick: () => {
                this.saveSettings();
                this.onClose();
            },
        });
        buttonContainer.appendChild(saveButton.getElement());

        // Cancel button
        const cancelButton = new Button({
            text: 'Cancel',
            onClick: () => {
                this.loadSettings(); // Reload to discard changes
                this.onClose();
            },
        });
        buttonContainer.appendChild(cancelButton.getElement());

        container.appendChild(buttonContainer);
    }

    /**
     * Create a toggle control
     * @private
     */
    createToggle(container, label, key) {
        const toggleContainer = document.createElement('div');
        toggleContainer.style.cssText =
            'display: flex; align-items: center; gap: 12px; margin: 8px 0;';

        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = 'color: #ffffff; font-size: 14px; cursor: pointer;';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.style.cssText = 'width: 20px; height: 20px; cursor: pointer;';

        labelElement.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        });

        toggleContainer.appendChild(checkbox);
        toggleContainer.appendChild(labelElement);
        container.appendChild(toggleContainer);

        return {
            checkbox,
            labelElement,
            setValue: (value) => {
                checkbox.checked = value;
            },
            getValue: () => checkbox.checked,
        };
    }

    /**
     * Load settings into UI
     * @private
     */
    loadSettings() {
        if (!this.audioSettings) {
            return;
        }

        const settings = this.audioSettings.getSettings();

        if (this.sliders.has('masterVolume')) {
            this.sliders.get('masterVolume').setValue(settings.masterVolume);
        }
        if (this.sliders.has('musicVolume')) {
            this.sliders.get('musicVolume').setValue(settings.musicVolume);
        }
        if (this.sliders.has('sfxVolume')) {
            this.sliders.get('sfxVolume').setValue(settings.sfxVolume);
        }

        // Update audio system info
        if (this.audioStatusInfo) {
            this.updateAudioSystemInfo(this.audioStatusInfo);
        }
    }

    /**
     * Save settings to persistence
     * @private
     */
    saveSettings() {
        // Settings are already saved via AudioSettings when changed
        // This method is here for consistency with other settings UIs

        // Apply volumes to audio system
        if (this.audioSystem && this.audioSettings) {
            const settings = this.audioSettings.getSettings();
            this.applyVolumeToAudioSystem('master', settings.masterVolume);
            this.applyVolumeToAudioSystem('music', settings.musicVolume);
        }

        // Notify of settings change
        this.onSettingsChange();
    }

    /**
     * Show the audio settings UI
     */
    show() {
        super.show();
        this.loadSettings();
        // Update audio system info periodically
        if (this.audioStatusInfo) {
            this.infoUpdateInterval = setInterval(() => {
                this.updateAudioSystemInfo(this.audioStatusInfo);
            }, 1000);
        }
    }

    /**
     * Hide the audio settings UI
     */
    hide() {
        super.hide();
        if (this.infoUpdateInterval) {
            clearInterval(this.infoUpdateInterval);
            this.infoUpdateInterval = null;
        }
        // Stop level meter updates when hidden
        this.stopLevelMeterUpdates();
    }
}
