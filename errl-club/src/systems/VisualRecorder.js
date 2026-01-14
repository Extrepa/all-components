// Step 286: Record visuals mode - capture frames or log visual events
export class VisualRecorder {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.isRecording = false;
        this.recordedFrames = [];
        this.recordedEvents = [];
        this.startTime = 0;
    }

    // Start recording
    startRecording() {
        this.isRecording = true;
        this.recordedFrames = [];
        this.recordedEvents = [];
        this.startTime = performance.now();
        console.log('Visual recording started');
    }

    // Stop recording
    stopRecording() {
        this.isRecording = false;
        console.log('Visual recording stopped. Frames:', this.recordedFrames.length);
        return {
            frames: this.recordedFrames,
            events: this.recordedEvents,
            duration: (performance.now() - this.startTime) / 1000,
        };
    }

    // Capture current frame
    captureFrame() {
        if (!this.isRecording) {
            return;
        }

        // Capture frame as data URL
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        this.recordedFrames.push({
            timestamp: performance.now() - this.startTime,
            dataURL: dataURL,
        });
    }

    // Log visual event
    logEvent(type, data) {
        if (!this.isRecording) {
            return;
        }

        this.recordedEvents.push({
            timestamp: performance.now() - this.startTime,
            type: type,
            data: data,
        });
    }

    // Export recorded data
    exportData() {
        return {
            frames: this.recordedFrames,
            events: this.recordedEvents,
            duration: (performance.now() - this.startTime) / 1000,
            metadata: {
                sceneObjects: this.scene.children.length,
                timestamp: new Date().toISOString(),
            },
        };
    }

    // Download recorded data as JSON
    downloadRecording(filename = 'visual-recording.json') {
        const data = this.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
