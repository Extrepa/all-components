/**
 * AudioReactiveDebugger - Debug helper for audio-reactive features
 *
 * Provides visual debugging and logging for audio-reactive systems:
 * - Frequency band visualization
 * - Beat detection logging
 * - Asset response monitoring
 * - Performance metrics
 */

export class AudioReactiveDebugger {
    constructor() {
        this.enabled = false;
        this.logFrequency = false;
        this.logBeats = false;
        this.logAssetResponses = false;
        this.showVisualizations = false;

        // Statistics
        this.stats = {
            beatsDetected: 0,
            bassPeaks: 0,
            midPeaks: 0,
            treblePeaks: 0,
            assetUpdates: 0,
            lastBeatTime: 0,
            lastBassPeak: 0,
            lastMidPeak: 0,
            lastTreblePeak: 0,
        };

        // Visualization elements (created when enabled)
        this.visualizationContainer = null;
        this.frequencyBars = null;
    }

    /**
     * Enable debugger
     * @param {Object} options - Debug options
     */
    enable(options = {}) {
        this.enabled = true;
        this.logFrequency = options.logFrequency !== false;
        this.logBeats = options.logBeats !== false;
        this.logAssetResponses = options.logAssetResponses !== false;
        this.showVisualizations = options.showVisualizations !== false;

        if (this.showVisualizations) {
            this.createVisualizations();
        }

        console.log('🎵 AudioReactiveDebugger enabled');
    }

    /**
     * Disable debugger
     */
    disable() {
        this.enabled = false;
        if (this.visualizationContainer) {
            this.visualizationContainer.remove();
            this.visualizationContainer = null;
        }
        console.log('🎵 AudioReactiveDebugger disabled');
    }

    /**
     * Log frequency band data
     * @param {Object} frequencyBands - Frequency band data
     */
    logFrequencyBands(frequencyBands) {
        if (!this.enabled || !this.logFrequency) {
            return;
        }

        const { bass, mid, treble } = frequencyBands;

        // Track peaks
        if (bass > 0.7 && Date.now() - this.stats.lastBassPeak > 1000) {
            this.stats.bassPeaks++;
            this.stats.lastBassPeak = Date.now();
            console.log(`🔴 Bass peak detected: ${bass.toFixed(3)}`);
        }
        if (mid > 0.7 && Date.now() - this.stats.lastMidPeak > 1000) {
            this.stats.midPeaks++;
            this.stats.lastMidPeak = Date.now();
            console.log(`🟢 Mid peak detected: ${mid.toFixed(3)}`);
        }
        if (treble > 0.7 && Date.now() - this.stats.lastTreblePeak > 1000) {
            this.stats.treblePeaks++;
            this.stats.lastTreblePeak = Date.now();
            console.log(`🔵 Treble peak detected: ${treble.toFixed(3)}`);
        }

        // Update visualization
        if (this.showVisualizations && this.frequencyBars) {
            this.updateFrequencyBars(bass, mid, treble);
        }
    }

    /**
     * Log beat detection
     * @param {boolean} beatDetected - Whether a beat was detected
     * @param {number} intensity - Beat intensity
     */
    logBeat(beatDetected, intensity = 0) {
        if (!this.enabled || !this.logBeats) {
            return;
        }

        if (beatDetected) {
            this.stats.beatsDetected++;
            this.stats.lastBeatTime = Date.now();
            console.log(`🥁 Beat detected! Intensity: ${intensity.toFixed(3)}`);
        }
    }

    /**
     * Log asset audio-reactive response
     * @param {string} assetName - Name of asset
     * @param {string} frequencyBand - Frequency band (bass/mid/treble)
     * @param {number} intensity - Response intensity
     */
    logAssetResponse(assetName, frequencyBand, intensity) {
        if (!this.enabled || !this.logAssetResponses) {
            return;
        }

        this.stats.assetUpdates++;

        // Only log significant responses to avoid spam
        if (intensity > 0.5) {
            const emoji = frequencyBand === 'bass' ? '🔴' : frequencyBand === 'mid' ? '🟢' : '🔵';
            console.log(
                `${emoji} ${assetName} responding to ${frequencyBand}: ${intensity.toFixed(3)}`
            );
        }
    }

    /**
     * Create visual frequency band visualization
     */
    createVisualizations() {
        if (this.visualizationContainer) {
            return;
        }

        const container = document.createElement('div');
        container.id = 'audio-reactive-debug';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 200px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
        `;

        container.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold;">Audio-Reactive Debug</div>
            <div style="margin-bottom: 5px;">🔴 Bass: <span id="bass-bar">0.00</span></div>
            <div style="width: 100%; height: 20px; background: #333; margin-bottom: 10px; border-radius: 3px; overflow: hidden;">
                <div id="bass-visual" style="width: 0%; height: 100%; background: #ff0000; transition: width 0.1s;"></div>
            </div>
            <div style="margin-bottom: 5px;">🟢 Mid: <span id="mid-bar">0.00</span></div>
            <div style="width: 100%; height: 20px; background: #333; margin-bottom: 10px; border-radius: 3px; overflow: hidden;">
                <div id="mid-visual" style="width: 0%; height: 100%; background: #00ff00; transition: width 0.1s;"></div>
            </div>
            <div style="margin-bottom: 5px;">🔵 Treble: <span id="treble-bar">0.00</span></div>
            <div style="width: 100%; height: 20px; background: #333; margin-bottom: 10px; border-radius: 3px; overflow: hidden;">
                <div id="treble-visual" style="width: 0%; height: 100%; background: #0000ff; transition: width 0.1s;"></div>
            </div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #555;">
                <div>Beats: <span id="beat-count">0</span></div>
                <div>Bass Peaks: <span id="bass-peaks">0</span></div>
            </div>
        `;

        document.body.appendChild(container);
        this.visualizationContainer = container;
        this.frequencyBars = {
            bass: {
                text: document.getElementById('bass-bar'),
                visual: document.getElementById('bass-visual'),
            },
            mid: {
                text: document.getElementById('mid-bar'),
                visual: document.getElementById('mid-visual'),
            },
            treble: {
                text: document.getElementById('treble-bar'),
                visual: document.getElementById('treble-visual'),
            },
            beatCount: document.getElementById('beat-count'),
            bassPeaks: document.getElementById('bass-peaks'),
        };
    }

    /**
     * Update frequency bar visualizations
     * @param {number} bass - Bass value (0-1)
     * @param {number} mid - Mid value (0-1)
     * @param {number} treble - Treble value (0-1)
     */
    updateFrequencyBars(bass, mid, treble) {
        if (!this.frequencyBars) {
            return;
        }

        // Update bass
        this.frequencyBars.bass.text.textContent = bass.toFixed(2);
        this.frequencyBars.bass.visual.style.width = `${bass * 100}%`;

        // Update mid
        this.frequencyBars.mid.text.textContent = mid.toFixed(2);
        this.frequencyBars.mid.visual.style.width = `${mid * 100}%`;

        // Update treble
        this.frequencyBars.treble.text.textContent = treble.toFixed(2);
        this.frequencyBars.treble.visual.style.width = `${treble * 100}%`;

        // Update stats
        if (this.frequencyBars.beatCount) {
            this.frequencyBars.beatCount.textContent = this.stats.beatsDetected;
        }
        if (this.frequencyBars.bassPeaks) {
            this.frequencyBars.bassPeaks.textContent = this.stats.bassPeaks;
        }
    }

    /**
     * Get debug statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            beatsDetected: 0,
            bassPeaks: 0,
            midPeaks: 0,
            treblePeaks: 0,
            assetUpdates: 0,
            lastBeatTime: 0,
            lastBassPeak: 0,
            lastMidPeak: 0,
            lastTreblePeak: 0,
        };
    }
}
