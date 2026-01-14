// Beat detection and BPM estimation from FFT data
export class BeatDetector {
    constructor(analyser) {
        this.analyser = analyser;
        this.beatHistory = [];
        this.beatThreshold = 0.7;
        this.lastBeatTime = 0;
        this.bpm = 120; // Default BPM
        this.beatCount = 0;

        // Beat detection parameters
        this.energyHistory = [];
        this.historySize = 43; // Number of frames to analyze
        this.instantEnergy = 0;
        this.averageEnergy = 0;

        // BPM estimation
        this.bpmHistory = [];
        this.bpmHistorySize = 10;
    }

    // Step 257: Implement beat detection from FFT (peaks + timing)
    getBeatCount() {
        return this.beatCount || 0;
    }

    detectBeat(dataArray, currentTime) {
        // Calculate instant energy (sum of squares)
        this.instantEnergy = 0;
        for (let i = 0; i < dataArray.length; i++) {
            this.instantEnergy += dataArray[i] * dataArray[i];
        }

        // Add to history
        this.energyHistory.push(this.instantEnergy);
        if (this.energyHistory.length > this.historySize) {
            this.energyHistory.shift();
        }

        // Calculate average energy
        if (this.energyHistory.length === this.historySize) {
            this.averageEnergy = this.energyHistory.reduce((a, b) => a + b, 0) / this.historySize;

            // Variance calculation for dynamic threshold
            let variance = 0;
            for (let i = 0; i < this.energyHistory.length; i++) {
                variance += Math.pow(this.energyHistory[i] - this.averageEnergy, 2);
            }
            variance /= this.historySize;

            // Dynamic threshold based on variance
            const threshold = this.averageEnergy + variance * 1.3;

            // Detect beat if instant energy exceeds threshold
            if (this.instantEnergy > threshold && currentTime - this.lastBeatTime > 0.1) {
                // Minimum 100ms between beats

                this.lastBeatTime = currentTime;
                this.beatCount++;

                // Estimate BPM
                this.estimateBPM(currentTime);

                return true;
            }
        }

        return false;
    }

    // Step 258: Estimate BPM from detected beats
    estimateBPM(currentTime) {
        if (this.beatHistory.length > 0) {
            const timeSinceLastBeat = currentTime - this.beatHistory[this.beatHistory.length - 1];

            if (timeSinceLastBeat > 0.1 && timeSinceLastBeat < 2.0) {
                // Valid beat interval
                const estimatedBPM = 60 / timeSinceLastBeat;

                // Add to BPM history
                this.bpmHistory.push(estimatedBPM);
                if (this.bpmHistory.length > this.bpmHistorySize) {
                    this.bpmHistory.shift();
                }

                // Calculate average BPM
                if (this.bpmHistory.length > 0) {
                    const sum = this.bpmHistory.reduce((a, b) => a + b, 0);
                    this.bpm = Math.round(sum / this.bpmHistory.length);
                }
            }
        }

        // Add current beat time to history
        this.beatHistory.push(currentTime);
        if (this.beatHistory.length > 10) {
            this.beatHistory.shift();
        }
    }

    // Get current BPM
    getBPM() {
        return this.bpm;
    }

    // Reset beat detection
    reset() {
        this.beatHistory = [];
        this.energyHistory = [];
        this.bpmHistory = [];
        this.lastBeatTime = 0;
        this.beatCount = 0;
        this.bpm = 120;
    }

    // Step 284: Precompute beat grid once per track
    precomputeBeatGrid(audioBuffer, sampleRate) {
        // This would analyze the entire track to find beat positions
        // For now, return a simple grid based on estimated BPM
        const duration = audioBuffer.duration;
        const beatsPerSecond = this.bpm / 60;
        const totalBeats = Math.floor(duration * beatsPerSecond);

        const beatGrid = [];
        for (let i = 0; i < totalBeats; i++) {
            beatGrid.push(i / beatsPerSecond);
        }

        return beatGrid;
    }
}
