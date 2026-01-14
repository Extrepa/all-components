/**
 * AudioSettings - Audio volume sliders and quality settings
 */
import { SettingsManager } from './SettingsManager.js';

export class AudioSettings {
    /**
     * Create a new AudioSettings
     * @param {SettingsManager} settingsManager - SettingsManager instance
     */
    constructor(settingsManager) {
        this.settingsManager = settingsManager;

        // Initialize defaults
        this.initializeDefaults();
    }

    /**
     * Initialize default settings
     * @private
     */
    initializeDefaults() {
        if (!this.settingsManager.getSetting('audio.masterVolume')) {
            this.settingsManager.setSetting('audio.masterVolume', 100);
        }
        if (!this.settingsManager.getSetting('audio.musicVolume')) {
            this.settingsManager.setSetting('audio.musicVolume', 80);
        }
        if (!this.settingsManager.getSetting('audio.sfxVolume')) {
            this.settingsManager.setSetting('audio.sfxVolume', 100);
        }
        if (!this.settingsManager.getSetting('audio.quality')) {
            this.settingsManager.setSetting('audio.quality', 'high');
        }
    }

    /**
     * Set master volume
     * @param {number} volume - Volume (0-100)
     */
    setMasterVolume(volume) {
        this.settingsManager.setSetting('audio.masterVolume', Math.max(0, Math.min(100, volume)));
    }

    /**
     * Get master volume
     * @returns {number} Master volume (0-100)
     */
    getMasterVolume() {
        return this.settingsManager.getSetting('audio.masterVolume', 100);
    }

    /**
     * Set music volume
     * @param {number} volume - Volume (0-100)
     */
    setMusicVolume(volume) {
        this.settingsManager.setSetting('audio.musicVolume', Math.max(0, Math.min(100, volume)));
    }

    /**
     * Get music volume
     * @returns {number} Music volume (0-100)
     */
    getMusicVolume() {
        return this.settingsManager.getSetting('audio.musicVolume', 80);
    }

    /**
     * Set SFX volume
     * @param {number} volume - Volume (0-100)
     */
    setSFXVolume(volume) {
        this.settingsManager.setSetting('audio.sfxVolume', Math.max(0, Math.min(100, volume)));
    }

    /**
     * Get SFX volume
     * @returns {number} SFX volume (0-100)
     */
    getSFXVolume() {
        return this.settingsManager.getSetting('audio.sfxVolume', 100);
    }

    /**
     * Set audio quality
     * @param {string} quality - Quality ('low', 'medium', 'high')
     */
    setQuality(quality) {
        this.settingsManager.setSetting('audio.quality', quality);
    }

    /**
     * Get audio quality
     * @returns {string} Audio quality
     */
    getQuality() {
        return this.settingsManager.getSetting('audio.quality', 'high');
    }

    /**
     * Get all audio settings
     * @returns {Object} Audio settings object
     */
    getSettings() {
        return {
            masterVolume: this.getMasterVolume(),
            musicVolume: this.getMusicVolume(),
            sfxVolume: this.getSFXVolume(),
            quality: this.getQuality(),
        };
    }
}
