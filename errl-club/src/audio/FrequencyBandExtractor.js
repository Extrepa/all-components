// Frequency band extractor for audio-reactive effects
// Extracts low (bass), mid, and high (treble) frequency bands from FFT data

export class FrequencyBandExtractor {
    constructor(analyser, sampleRate = 44100) {
        this.analyser = analyser;
        this.sampleRate = sampleRate;
        this.fftSize = analyser.fftSize || 256;

        // Frequency ranges (in Hz)
        // Typical frequency ranges for club music:
        // Bass: 20-250 Hz
        // Mid: 250-4000 Hz
        // Treble: 4000-20000 Hz
        this.bassRange = { min: 20, max: 250 };
        this.midRange = { min: 250, max: 4000 };
        this.trebleRange = { min: 4000, max: 20000 };

        // Frequency resolution: sampleRate / fftSize
        this.frequencyResolution = sampleRate / this.fftSize;
    }

    // Extract frequency bands from FFT data array
    extractBands(dataArray) {
        if (!dataArray || dataArray.length === 0) {
            return {
                bass: 0,
                mid: 0,
                treble: 0,
            };
        }

        // Calculate frequency bin indices for each range
        const bassStartBin = Math.floor(this.bassRange.min / this.frequencyResolution);
        const bassEndBin = Math.floor(this.bassRange.max / this.frequencyResolution);
        const midStartBin = Math.floor(this.midRange.min / this.frequencyResolution);
        const midEndBin = Math.floor(this.midRange.max / this.frequencyResolution);
        const trebleStartBin = Math.floor(this.trebleRange.min / this.frequencyResolution);
        const trebleEndBin = Math.min(
            Math.floor(this.trebleRange.max / this.frequencyResolution),
            dataArray.length - 1
        );

        // Calculate average energy for each band
        let bassSum = 0;
        let bassCount = 0;
        for (let i = bassStartBin; i <= bassEndBin && i < dataArray.length; i++) {
            bassSum += dataArray[i];
            bassCount++;
        }
        const bass = bassCount > 0 ? bassSum / bassCount / 255 : 0; // Normalize to 0-1

        let midSum = 0;
        let midCount = 0;
        for (let i = midStartBin; i <= midEndBin && i < dataArray.length; i++) {
            midSum += dataArray[i];
            midCount++;
        }
        const mid = midCount > 0 ? midSum / midCount / 255 : 0; // Normalize to 0-1

        let trebleSum = 0;
        let trebleCount = 0;
        for (let i = trebleStartBin; i <= trebleEndBin && i < dataArray.length; i++) {
            trebleSum += dataArray[i];
            trebleCount++;
        }
        const treble = trebleCount > 0 ? trebleSum / trebleCount / 255 : 0; // Normalize to 0-1

        return {
            bass: Math.min(1.0, bass),
            mid: Math.min(1.0, mid),
            treble: Math.min(1.0, treble),
        };
    }

    // Get individual band value
    getBass(dataArray) {
        return this.extractBands(dataArray).bass;
    }

    getMid(dataArray) {
        return this.extractBands(dataArray).mid;
    }

    getTreble(dataArray) {
        return this.extractBands(dataArray).treble;
    }

    // Detect strong peaks in a specific band
    detectPeak(dataArray, band = 'bass', threshold = 0.7) {
        const bands = this.extractBands(dataArray);
        const value = bands[band] || 0;
        return value > threshold;
    }
}
