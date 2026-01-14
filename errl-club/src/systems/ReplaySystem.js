// Replay system for recording and playing back avatar movement
import * as THREE from 'three';
import { ErrlAvatar } from '../avatar/ErrlAvatar.js';

export class ReplaySystem {
    constructor(scene) {
        this.scene = scene;
        this.isRecording = false;
        this.recordedFrames = [];
        this.ghostAvatars = [];
        this.maxRecordingDuration = 30; // seconds
        this.recordingStartTime = 0;
    }

    // Step 195: Implement movement replay recording mode
    startRecording() {
        this.isRecording = true;
        this.recordedFrames = [];
        this.recordingStartTime = performance.now();
        console.log('Replay recording started');
    }

    stopRecording() {
        this.isRecording = false;
        console.log('Replay recording stopped. Frames:', this.recordedFrames.length);
    }

    // Record a frame of avatar state
    recordFrame(avatar, elapsedTime) {
        if (!this.isRecording) {
            return;
        }

        // Check if we've exceeded max duration
        const recordingDuration = (performance.now() - this.recordingStartTime) / 1000;
        if (recordingDuration > this.maxRecordingDuration) {
            this.stopRecording();
            return;
        }

        this.recordedFrames.push({
            time: elapsedTime,
            position: avatar.position.clone(),
            rotation: avatar.group.rotation.y,
            state: avatar.currentState,
            velocity: avatar.velocity.clone(),
        });
    }

    // Step 196: Add ability to spawn "ghost" avatar that replays recorded movement
    spawnGhost(recording = null) {
        if (!recording) {
            recording = this.recordedFrames;
        }

        if (recording.length === 0) {
            console.warn('No recording to play back');
            return null;
        }

        // Create a ghost avatar (semi-transparent copy)
        const ghostPosition = recording[0].position.clone();
        const ghost = new ErrlAvatar(this.scene, ghostPosition);

        // Make ghost semi-transparent
        ghost.material.transparent = true;
        ghost.material.opacity = 0.5;
        ghost.material.emissiveIntensity = 0.3;

        // Store replay data
        ghost._isGhost = true;
        ghost._replayFrames = recording;
        ghost._replayIndex = 0;
        ghost._replayStartTime = performance.now() / 1000;

        this.ghostAvatars.push(ghost);
        console.log('Ghost avatar spawned with', recording.length, 'frames');

        return ghost;
    }

    // Update ghost avatars
    update(deltaTime, elapsedTime) {
        for (let i = this.ghostAvatars.length - 1; i >= 0; i--) {
            const ghost = this.ghostAvatars[i];

            if (!ghost._isGhost || !ghost._replayFrames) {
                this.ghostAvatars.splice(i, 1);
                continue;
            }

            // Find current frame based on elapsed time
            const replayElapsed = elapsedTime - ghost._replayStartTime;
            const frameIndex = Math.floor(replayElapsed * 60); // Assuming 60 FPS recording

            if (frameIndex >= ghost._replayFrames.length) {
                // Replay finished - remove ghost
                this.scene.remove(ghost.group);
                this.ghostAvatars.splice(i, 1);
                continue;
            }

            // Interpolate between frames
            const currentFrame = ghost._replayFrames[frameIndex];
            const nextFrame =
                ghost._replayFrames[Math.min(frameIndex + 1, ghost._replayFrames.length - 1)];

            const t = replayElapsed * 60 - frameIndex;

            // Update ghost position and rotation
            ghost.position.lerpVectors(currentFrame.position, nextFrame.position, t);
            ghost.group.rotation.y = THREE.MathUtils.lerp(
                currentFrame.rotation,
                nextFrame.rotation,
                t
            );

            // Update ghost state
            if (currentFrame.state) {
                ghost.setState(currentFrame.state);
            }
        }
    }

    // Clear all ghosts
    clearGhosts() {
        for (const ghost of this.ghostAvatars) {
            this.scene.remove(ghost.group);
        }
        this.ghostAvatars = [];
    }

    // Get current recording
    getRecording() {
        return this.recordedFrames;
    }
}
