// Event system for club-wide events (blackout, strobe, wave, etc.)
import * as THREE from 'three';

export class EventSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeEvents = [];
        this.eventHistory = [];
    }

    // Step 229: Implement a club-wide blackout event
    triggerBlackout(duration = 5.0) {
        const event = {
            type: 'blackout',
            startTime: performance.now() / 1000,
            duration: duration,
            lights: [],
        };

        // Find all lights in scene and dim them
        this.scene.traverse((object) => {
            if (object instanceof THREE.Light) {
                event.lights.push({
                    light: object,
                    originalIntensity: object.intensity,
                });
                object.intensity = 0.1; // Emergency glow only
            }
        });

        this.activeEvents.push(event);
        console.log('Blackout event triggered');

        // Auto-end after duration
        setTimeout(() => {
            this.endEvent(event);
        }, duration * 1000);

        return event;
    }

    // Step 230: Implement a strobe event triggered by music peaks
    triggerStrobe(duration = 2.0, frequency = 10) {
        const event = {
            type: 'strobe',
            startTime: performance.now() / 1000,
            duration: duration,
            frequency: frequency, // flashes per second
            lights: [],
            isOn: true,
        };

        // Find spotlights and main lights
        this.scene.traverse((object) => {
            if (object instanceof THREE.SpotLight || object instanceof THREE.PointLight) {
                event.lights.push({
                    light: object,
                    originalIntensity: object.intensity,
                });
            }
        });

        this.activeEvents.push(event);
        console.log('Strobe event triggered');

        // Auto-end after duration
        setTimeout(() => {
            this.endEvent(event);
        }, duration * 1000);

        return event;
    }

    // Step 267: Implement a bass quake event that shakes geometry
    triggerBassQuake(intensity = 1.0, duration = 0.5) {
        const event = {
            type: 'bassQuake',
            startTime: performance.now() / 1000,
            duration: duration,
            intensity: intensity,
            originalPositions: new Map(),
        };

        // Store original positions of scene objects
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh && object !== this.scene) {
                event.originalPositions.set(object, object.position.clone());
            }
        });

        this.activeEvents.push(event);
        console.log('Bass quake event triggered');

        // Auto-end after duration
        setTimeout(() => {
            this.endEvent(event);
        }, duration * 1000);

        return event;
    }

    // Step 231: Implement a wave event - visible ripple that travels across floor/walls
    triggerWave(origin, speed = 5.0) {
        const event = {
            type: 'wave',
            startTime: performance.now() / 1000,
            origin: origin.clone(),
            speed: speed,
            radius: 0,
            maxRadius: 30,
        };

        this.activeEvents.push(event);
        console.log('Wave event triggered from:', origin);

        return event;
    }

    // Step 279: Add occasional color inversion flashes at key musical moments
    triggerColorInversion(duration = 0.2) {
        const event = {
            type: 'colorInversion',
            startTime: performance.now() / 1000,
            duration: duration,
        };

        this.activeEvents.push(event);
        console.log('Color inversion flash triggered');

        // Apply color inversion effect (simplified - would use shader in full implementation)
        // For now, we'll use a CSS filter on the canvas
        const canvas = document.getElementById('club-canvas');
        if (canvas) {
            canvas.style.filter = 'invert(1)';
            setTimeout(() => {
                if (canvas) {
                    canvas.style.filter = '';
                }
                this.endEvent(event);
            }, duration * 1000);
        }

        return event;
    }

    // Step 232: Emit smoke or fog bursts on strong bass hits
    triggerSmokeBurst(position, particleSystem, intensity = 1.0) {
        if (!particleSystem) {
            return;
        }

        // Create multiple smoke particles
        const particleCount = Math.floor(20 * intensity);
        for (let i = 0; i < particleCount; i++) {
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                0,
                (Math.random() - 0.5) * 0.5
            );
            particleSystem.createDustParticle(
                position.clone().add(offset),
                0x888888,
                0.3 + Math.random() * 0.2
            );
        }
    }

    // Update active events
    update(deltaTime, elapsedTime, bassEnergy = 0) {
        // Update blackout events
        for (const event of this.activeEvents) {
            if (event.type === 'blackout') {
                // Blackout is handled by light intensity, nothing to update
            } else if (event.type === 'strobe') {
                // Strobe flashing
                const elapsed = elapsedTime - event.startTime;
                if (elapsed < event.duration) {
                    const flashInterval = 1.0 / event.frequency;
                    const flashPhase = (elapsed % flashInterval) / flashInterval;
                    event.isOn = flashPhase < 0.5;

                    // Apply strobe to lights
                    for (const lightData of event.lights) {
                        lightData.light.intensity = event.isOn
                            ? lightData.originalIntensity * 2
                            : 0;
                    }
                }
            } else if (event.type === 'wave') {
                // Wave propagation
                event.radius += event.speed * deltaTime;

                if (event.radius > event.maxRadius) {
                    // Remove wave when it reaches max radius
                    this.endEvent(event);
                }
            } else if (event.type === 'bassQuake') {
                // Step 267: Bass quake - shake geometry
                const elapsed = elapsedTime - event.startTime;
                if (elapsed < event.duration) {
                    const shakeAmount = event.intensity * (1 - elapsed / event.duration);
                    const shakeX = (Math.random() - 0.5) * shakeAmount * 0.1;
                    const shakeY = (Math.random() - 0.5) * shakeAmount * 0.1;
                    const shakeZ = (Math.random() - 0.5) * shakeAmount * 0.1;

                    // Apply shake to stored objects
                    event.originalPositions.forEach((originalPos, object) => {
                        if (object && object.position) {
                            object.position.set(
                                originalPos.x + shakeX,
                                originalPos.y + shakeY,
                                originalPos.z + shakeZ
                            );
                        }
                    });
                }
            }
        }

        // Auto-trigger strobe on strong bass
        if (bassEnergy > 0.8 && Math.random() < 0.01) {
            // 1% chance per frame when bass is high
            this.triggerStrobe(0.5, 15);
        }

        // Auto-trigger smoke bursts on very strong bass
        if (bassEnergy > 0.9 && Math.random() < 0.02) {
            // Could trigger smoke at DJ booth or other locations
        }
    }

    // End an event
    endEvent(event) {
        const index = this.activeEvents.indexOf(event);
        if (index > -1) {
            this.activeEvents.splice(index, 1);

            // Restore lights
            if (event.lights) {
                for (const lightData of event.lights) {
                    lightData.light.intensity = lightData.originalIntensity;
                }
            }

            this.eventHistory.push({
                type: event.type,
                duration: performance.now() / 1000 - event.startTime,
            });
        }
    }

    // Get active events
    getActiveEvents() {
        return this.activeEvents.map((e) => e.type);
    }
}
