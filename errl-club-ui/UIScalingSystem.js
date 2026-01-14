/**
 * UIScalingSystem - UI scaling system for accessibility
 *
 * Provides:
 * - Scale factor settings (0.75x to 2x)
 * - Scaling presets (Small, Medium, Large, Extra Large)
 * - Per-element scaling
 * - Persistence via SettingsManager
 */

export class UIScalingSystem {
    constructor(settingsManager = null) {
        this.settingsManager = settingsManager;
        this.scaleFactor = 1.0;
        this.currentPreset = 'medium';

        // Scaling presets
        this.presets = {
            small: { name: 'Small', scale: 0.75 },
            medium: { name: 'Medium', scale: 1.0 },
            large: { name: 'Large', scale: 1.25 },
            extraLarge: { name: 'Extra Large', scale: 1.5 },
            huge: { name: 'Huge', scale: 2.0 },
        };

        // Track scaled elements
        this.scaledElements = new Set();

        // Load saved scale
        this.load();
    }

    /**
     * Get current scale factor
     * @returns {number} Scale factor
     */
    getScale() {
        return this.scaleFactor;
    }

    /**
     * Set scale factor
     * @param {number} scale - Scale factor (0.75 to 2.0)
     */
    setScale(scale) {
        this.scaleFactor = Math.max(0.75, Math.min(2.0, scale));
        this.applyScaling();
        this.save();
    }

    /**
     * Apply preset
     * @param {string} presetName - Preset name
     */
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (preset) {
            this.currentPreset = presetName;
            this.setScale(preset.scale);
            return true;
        }
        return false;
    }

    /**
     * Get current preset name
     * @returns {string} Preset name
     */
    getCurrentPreset() {
        // Check if current scale matches a preset
        for (const [name, preset] of Object.entries(this.presets)) {
            if (Math.abs(preset.scale - this.scaleFactor) < 0.01) {
                return name;
            }
        }
        return 'custom';
    }

    /**
     * Get all presets
     * @returns {Object} Presets object
     */
    getPresets() {
        return this.presets;
    }

    /**
     * Register element for scaling
     * @param {HTMLElement} element - Element to scale
     * @param {string} id - Optional ID for tracking
     */
    registerElement(element, id = null) {
        if (!element) {
            return;
        }

        const elementData = {
            element,
            id: id || element.id || `scaled-${this.scaledElements.size}`,
            originalFontSize: window.getComputedStyle(element).fontSize,
            originalWidth: element.style.width,
            originalHeight: element.style.height,
        };

        this.scaledElements.add(elementData);
        this.scaleElement(elementData);
    }

    /**
     * Unregister element from scaling
     * @param {HTMLElement} element - Element to unregister
     */
    unregisterElement(element) {
        for (const elementData of this.scaledElements) {
            if (elementData.element === element) {
                // Restore original size
                element.style.fontSize = elementData.originalFontSize;
                element.style.width = elementData.originalWidth;
                element.style.height = elementData.originalHeight;
                this.scaledElements.delete(elementData);
                break;
            }
        }
    }

    /**
     * Scale a single element
     * @param {Object} elementData - Element data
     */
    scaleElement(elementData) {
        const { element } = elementData;
        if (!element) {
            return;
        }

        // Scale font size
        if (elementData.originalFontSize) {
            const baseSize = parseFloat(elementData.originalFontSize);
            if (!isNaN(baseSize)) {
                element.style.fontSize = `${baseSize * this.scaleFactor}px`;
            }
        }

        // Scale width/height if they were set
        if (elementData.originalWidth) {
            const baseWidth = parseFloat(elementData.originalWidth);
            if (!isNaN(baseWidth)) {
                element.style.width = `${baseWidth * this.scaleFactor}px`;
            }
        }

        if (elementData.originalHeight) {
            const baseHeight = parseFloat(elementData.originalHeight);
            if (!isNaN(baseHeight)) {
                element.style.height = `${baseHeight * this.scaleFactor}px`;
            }
        }

        // Apply CSS transform for overall scaling (more reliable)
        element.style.transform = `scale(${this.scaleFactor})`;
        element.style.transformOrigin = 'top left';
    }

    /**
     * Apply scaling to all registered elements
     */
    applyScaling() {
        this.scaledElements.forEach((elementData) => {
            this.scaleElement(elementData);
        });

        // Also apply to root UI container if it exists
        const rootContainer = document.getElementById('ui-container');
        if (rootContainer) {
            rootContainer.style.transform = `scale(${this.scaleFactor})`;
            rootContainer.style.transformOrigin = 'top left';
        }
    }

    /**
     * Auto-register common UI elements
     */
    autoRegisterElements() {
        // Register common UI elements
        const commonSelectors = [
            '#errl-phone',
            '#dev-tools-overlay',
            '#help-panel',
            '.ui-panel',
            '.settings-panel',
            '.notification',
        ];

        commonSelectors.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
                this.registerElement(element);
            });
        });
    }

    /**
     * Load scale from storage
     */
    load() {
        if (this.settingsManager) {
            const saved = this.settingsManager.getSetting('uiScaling');
            if (saved) {
                this.scaleFactor = saved.scaleFactor || 1.0;
                this.currentPreset = saved.preset || 'medium';
            }
        } else if (typeof localStorage !== 'undefined') {
            try {
                const saved = JSON.parse(localStorage.getItem('uiScaling') || '{}');
                if (saved.scaleFactor) {
                    this.scaleFactor = saved.scaleFactor;
                }
                if (saved.preset) {
                    this.currentPreset = saved.preset;
                }
            } catch (error) {
                console.warn('Failed to load UI scaling settings:', error);
            }
        }

        // Apply loaded scale
        this.applyScaling();
    }

    /**
     * Save scale to storage
     */
    save() {
        const data = {
            scaleFactor: this.scaleFactor,
            preset: this.getCurrentPreset(),
        };

        if (this.settingsManager) {
            this.settingsManager.setSetting('uiScaling', data);
        } else if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('uiScaling', JSON.stringify(data));
            } catch (error) {
                console.warn('Failed to save UI scaling settings:', error);
            }
        }
    }

    /**
     * Reset to default
     */
    reset() {
        this.setScale(1.0);
        this.currentPreset = 'medium';
    }
}
