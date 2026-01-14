/**
 * VisualRecorderExporter - Export functionality for visual recorder
 *
 * Exports recorded frames as PNG/JPEG sequences
 * Handles frame download and batch export operations
 *
 * @class VisualRecorderExporter
 */
export class VisualRecorderExporter {
    /**
     * Create a VisualRecorderExporter instance
     * @param {VisualRecorder} visualRecorder - Visual recorder instance
     */
    constructor(visualRecorder) {
        this.visualRecorder = visualRecorder;
    }

    /**
     * Export frames as PNG sequence
     * @param {Object} options - Export options
     * @returns {Promise} Promise that resolves when export is complete
     */
    async exportPNGSequence(options = {}) {
        const {
            frames = this.visualRecorder.recordedFrames,
            quality = 1.0,
            prefix = 'frame',
            startIndex = 0,
        } = options;

        const exportedFiles = [];

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            const filename = `${prefix}-${String(startIndex + i).padStart(4, '0')}.png`;

            try {
                await this.downloadFrame(frame.dataURL, filename);
                exportedFiles.push(filename);
            } catch (error) {
                console.error(`Failed to export frame ${i}:`, error);
            }
        }

        return {
            success: true,
            fileCount: exportedFiles.length,
            files: exportedFiles,
        };
    }

    /**
     * Export frames as JPEG sequence
     * @param {Object} options - Export options
     * @returns {Promise} Promise that resolves when export is complete
     */
    async exportJPEGSequence(options = {}) {
        const {
            frames = this.visualRecorder.recordedFrames,
            quality = 0.9,
            prefix = 'frame',
            startIndex = 0,
        } = options;

        const exportedFiles = [];

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];

            // Convert PNG data URL to JPEG
            const jpegDataURL = await this.convertToJPEG(frame.dataURL, quality);
            const filename = `${prefix}-${String(startIndex + i).padStart(4, '0')}.jpg`;

            try {
                await this.downloadFrame(jpegDataURL, filename);
                exportedFiles.push(filename);
            } catch (error) {
                console.error(`Failed to export frame ${i}:`, error);
            }
        }

        return {
            success: true,
            fileCount: exportedFiles.length,
            files: exportedFiles,
        };
    }

    /**
     * Convert PNG data URL to JPEG
     * @param {string} dataURL - PNG data URL
     * @param {number} quality - JPEG quality (0-1)
     * @returns {Promise<string>} JPEG data URL
     */
    async convertToJPEG(dataURL, quality = 0.9) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = dataURL;
        });
    }

    /**
     * Download a single frame
     * @param {string} dataURL - Image data URL
     * @param {string} filename - Filename
     * @returns {Promise} Promise that resolves when download starts
     */
    downloadFrame(dataURL, filename) {
        return new Promise((resolve, reject) => {
            try {
                const blob = this.dataURLToBlob(dataURL);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Convert data URL to Blob
     * @param {string} dataURL - Data URL
     * @returns {Blob} Blob object
     */
    dataURLToBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    /**
     * Export all frames as ZIP (future enhancement)
     * @param {Object} options - Export options
     * @returns {Promise} Promise that resolves when export is complete
     */
    async exportAsZIP(options = {}) {
        // This would require a ZIP library like JSZip
        // For now, just export as individual files
        console.warn('ZIP export not yet implemented, exporting as individual files');
        return this.exportPNGSequence(options);
    }

    /**
     * Get export statistics
     * @returns {Object} Export statistics
     */
    getExportStats() {
        const frames = this.visualRecorder.recordedFrames || [];
        return {
            frameCount: frames.length,
            estimatedSize: frames.length * 500, // Rough estimate in KB
            duration: this.visualRecorder.startTime
                ? (performance.now() - this.visualRecorder.startTime) / 1000
                : 0,
        };
    }
}
