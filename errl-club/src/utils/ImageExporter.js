/**
 * ImageExporter - Utility for exporting image sequences
 *
 * Handles PNG/JPEG sequence export with progress tracking
 */
export class ImageExporter {
    /**
     * Export frames as PNG sequence
     * @param {Array} frames - Array of frame data {timestamp, dataURL}
     * @param {Object} options - Export options
     * @param {string} options.prefix - File name prefix (default: 'frame')
     * @param {Function} options.onProgress - Progress callback (progress: 0-1)
     * @param {Function} options.onComplete - Completion callback
     * @returns {Promise<Array>} Array of exported file names
     */
    static async exportPNGSequence(frames, options = {}) {
        const prefix = options.prefix || 'frame';
        const onProgress = options.onProgress || (() => {});
        const onComplete = options.onComplete || (() => {});

        const exportedFiles = [];
        const totalFrames = frames.length;

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            const frameNumber = i.toString().padStart(6, '0');
            const filename = `${prefix}_${frameNumber}.png`;

            try {
                // Convert dataURL to blob
                const blob = await this.dataURLToBlob(frame.dataURL, 'image/png');

                // Download file
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                exportedFiles.push(filename);

                // Update progress
                const progress = (i + 1) / totalFrames;
                onProgress(progress);

                // Small delay to prevent browser from blocking multiple downloads
                await new Promise((resolve) => setTimeout(resolve, 50));
            } catch (error) {
                console.error(`ImageExporter: Failed to export frame ${i}:`, error);
            }
        }

        onComplete(exportedFiles);
        return exportedFiles;
    }

    /**
     * Export frames as JPEG sequence
     * @param {Array} frames - Array of frame data {timestamp, dataURL}
     * @param {Object} options - Export options
     * @param {string} options.prefix - File name prefix (default: 'frame')
     * @param {number} options.quality - JPEG quality 0-1 (default: 0.9)
     * @param {Function} options.onProgress - Progress callback (progress: 0-1)
     * @param {Function} options.onComplete - Completion callback
     * @returns {Promise<Array>} Array of exported file names
     */
    static async exportJPEGSequence(frames, options = {}) {
        const prefix = options.prefix || 'frame';
        const quality = options.quality || 0.9;
        const onProgress = options.onProgress || (() => {});
        const onComplete = options.onComplete || (() => {});

        const exportedFiles = [];
        const totalFrames = frames.length;

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            const frameNumber = i.toString().padStart(6, '0');
            const filename = `${prefix}_${frameNumber}.jpg`;

            try {
                // Convert PNG dataURL to JPEG
                const jpegDataURL = await this.convertToJPEG(frame.dataURL, quality);

                // Convert dataURL to blob
                const blob = await this.dataURLToBlob(jpegDataURL, 'image/jpeg');

                // Download file
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                exportedFiles.push(filename);

                // Update progress
                const progress = (i + 1) / totalFrames;
                onProgress(progress);

                // Small delay to prevent browser from blocking multiple downloads
                await new Promise((resolve) => setTimeout(resolve, 50));
            } catch (error) {
                console.error(`ImageExporter: Failed to export frame ${i}:`, error);
            }
        }

        onComplete(exportedFiles);
        return exportedFiles;
    }

    /**
     * Export frames as ZIP archive (future enhancement)
     * @param {Array} frames - Array of frame data
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} ZIP file blob
     */
    static async exportAsZIP(frames, options = {}) {
        // This would require a ZIP library like JSZip
        // For now, return a promise that rejects
        return Promise.reject(new Error('ZIP export not yet implemented'));
    }

    /**
     * Convert dataURL to Blob
     * @param {string} dataURL - Data URL string
     * @param {string} mimeType - MIME type
     * @returns {Promise<Blob>} Blob object
     * @private
     */
    static dataURLToBlob(dataURL, mimeType) {
        return new Promise((resolve, reject) => {
            try {
                const byteString = atob(dataURL.split(',')[1]);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeType });
                resolve(blob);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Convert PNG dataURL to JPEG dataURL
     * @param {string} pngDataURL - PNG data URL
     * @param {number} quality - JPEG quality 0-1
     * @returns {Promise<string>} JPEG data URL
     * @private
     */
    static convertToJPEG(pngDataURL, quality) {
        return new Promise((resolve, reject) => {
            try {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const jpegDataURL = canvas.toDataURL('image/jpeg', quality);
                    resolve(jpegDataURL);
                };
                img.onerror = reject;
                img.src = pngDataURL;
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get export metadata
     * @param {Array} frames - Array of frame data
     * @returns {Object} Metadata object
     */
    static getExportMetadata(frames) {
        if (!frames || frames.length === 0) {
            return {
                frameCount: 0,
                duration: 0,
                estimatedSize: 0,
            };
        }

        const duration = frames[frames.length - 1].timestamp - frames[0].timestamp;
        const estimatedSize = frames.length * 500; // Rough estimate: 500KB per frame

        return {
            frameCount: frames.length,
            duration: duration / 1000, // Convert to seconds
            estimatedSize: estimatedSize,
            estimatedSizeMB: (estimatedSize / 1024 / 1024).toFixed(2),
        };
    }
}
