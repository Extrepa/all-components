/**
 * DJPlaceholder - A simple placeholder DJ character that plays music in the club
 *
 * Creates a simple geometric DJ figure with audio-reactive animations
 */
import * as THREE from 'three';
import { STAGE_SIZE, STAGE_HEIGHT } from '../config/constants.js';

export class DJPlaceholder {
    /**
     * Create a new DJ placeholder
     * @param {THREE.Scene} scene - The Three.js scene to add the DJ to
     * @param {Object} config - Configuration options
     * @param {THREE.Vector3} config.position - Position in scene (optional, defaults to DJ booth)
     */
    constructor(scene, config = {}) {
        this.scene = scene;

        // DJ booth position (from RoomBuilder.createDJBooth)
        const boothWidth = 2;
        const boothHeight = 3;
        const boothDepth = 1.5;
        const boothPosition = new THREE.Vector3(
            0,
            boothHeight / 2 + STAGE_HEIGHT - 0.5,
            -STAGE_SIZE / 2 - boothDepth / 2
        );

        // Position DJ in front of the booth, on the stage
        this.basePosition =
            config.position ||
            new THREE.Vector3(
                boothPosition.x,
                STAGE_HEIGHT + 1.2, // Standing on stage, ~1.2 units tall
                boothPosition.z + boothDepth / 2 + 0.3 // In front of booth
            );

        // Animation state
        this.time = 0;
        this.group = new THREE.Group();
        this.meshes = [];

        // Create the DJ figure
        this.createDJ();

        // Add to scene
        this.scene.add(this.group);
    }

    /**
     * Create the DJ figure using simple geometry
     */
    createDJ() {
        // Head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const headMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa88, // Skin tone
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 0.5, 0);
        head.castShadow = true;
        this.group.add(head);
        this.meshes.push({ mesh: head, type: 'head' });

        // Body (capsule/cylinder)
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.6, 16);
        const bodyMaterial = new THREE.MeshBasicMaterial({
            color: 0x333333, // Dark clothing
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.1, 0);
        body.castShadow = true;
        this.group.add(body);
        this.meshes.push({ mesh: body, type: 'body' });

        // Left arm (raised, as if mixing)
        const leftArmGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.4, 8);
        const armMaterial = new THREE.MeshBasicMaterial({
            color: 0x222222,
        });
        const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
        leftArm.position.set(-0.3, 0.25, 0.1);
        leftArm.rotation.z = -0.5; // Raised arm
        leftArm.rotation.x = 0.3;
        leftArm.castShadow = true;
        this.group.add(leftArm);
        this.meshes.push({ mesh: leftArm, type: 'leftArm' });

        // Right arm (also raised)
        const rightArm = new THREE.Mesh(leftArmGeometry, armMaterial);
        rightArm.position.set(0.3, 0.25, 0.1);
        rightArm.rotation.z = 0.5; // Raised arm
        rightArm.rotation.x = 0.3;
        rightArm.castShadow = true;
        this.group.add(rightArm);
        this.meshes.push({ mesh: rightArm, type: 'rightArm' });

        // DJ Mixer (center piece)
        const mixerGeometry = new THREE.BoxGeometry(0.8, 0.15, 0.4);
        const mixerMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1a1a,
        });
        const mixer = new THREE.Mesh(mixerGeometry, mixerMaterial);
        mixer.position.set(0, -0.15, 0.25);
        mixer.castShadow = true;
        this.group.add(mixer);
        this.meshes.push({ mesh: mixer, type: 'mixer' });

        // Mixer screen/display
        const mixerScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 0.08),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
            })
        );
        mixerScreen.position.set(0, -0.08, 0.45);
        this.group.add(mixerScreen);
        this.meshes.push({ mesh: mixerScreen, type: 'mixerScreen' });

        // Mixer knobs (small cylinders)
        const knobGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8);
        const knobMaterial = new THREE.MeshBasicMaterial({
            color: 0x666666,
        });
        for (let i = 0; i < 6; i++) {
            const knob = new THREE.Mesh(knobGeometry, knobMaterial);
            knob.position.set(-0.25 + i * 0.1, -0.08, 0.45);
            this.group.add(knob);
            this.meshes.push({ mesh: knob, type: 'knob' });
        }

        // Left Turntable
        const turntableGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 32);
        const turntableBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32),
            new THREE.MeshBasicMaterial({
                color: 0x2a2a2a,
            })
        );
        turntableBase.position.set(-0.6, -0.2, 0.2);
        turntableBase.castShadow = true;
        this.group.add(turntableBase);
        this.meshes.push({ mesh: turntableBase, type: 'turntableBase' });

        const turntablePlatter = new THREE.Mesh(
            turntableGeometry,
            new THREE.MeshBasicMaterial({
                color: 0x1a1a1a,
            })
        );
        turntablePlatter.position.set(-0.6, -0.15, 0.2);
        this.group.add(turntablePlatter);
        this.meshes.push({ mesh: turntablePlatter, type: 'turntablePlatter' });
        this.leftTurntable = turntablePlatter;

        // Right Turntable
        const rightTurntableBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32),
            new THREE.MeshBasicMaterial({
                color: 0x2a2a2a,
            })
        );
        rightTurntableBase.position.set(0.6, -0.2, 0.2);
        rightTurntableBase.castShadow = true;
        this.group.add(rightTurntableBase);
        this.meshes.push({ mesh: rightTurntableBase, type: 'turntableBase' });

        const rightTurntablePlatter = new THREE.Mesh(
            turntableGeometry,
            new THREE.MeshBasicMaterial({
                color: 0x1a1a1a,
            })
        );
        rightTurntablePlatter.position.set(0.6, -0.15, 0.2);
        this.group.add(rightTurntablePlatter);
        this.meshes.push({ mesh: rightTurntablePlatter, type: 'turntablePlatter' });
        this.rightTurntable = rightTurntablePlatter;

        // Headphones
        const headphoneBand = new THREE.Mesh(
            new THREE.TorusGeometry(0.2, 0.03, 8, 16, Math.PI),
            new THREE.MeshBasicMaterial({
                color: 0x333333,
            })
        );
        headphoneBand.position.set(0, 0.5, 0);
        headphoneBand.rotation.x = Math.PI / 2;
        headphoneBand.rotation.z = Math.PI / 2;
        this.group.add(headphoneBand);
        this.meshes.push({ mesh: headphoneBand, type: 'headphoneBand' });

        // Left earcup
        const leftEarcup = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16),
            new THREE.MeshBasicMaterial({
                color: 0x222222,
            })
        );
        leftEarcup.position.set(-0.2, 0.5, 0);
        leftEarcup.rotation.z = Math.PI / 2;
        this.group.add(leftEarcup);
        this.meshes.push({ mesh: leftEarcup, type: 'earcup' });

        // Right earcup
        const rightEarcup = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16),
            new THREE.MeshBasicMaterial({
                color: 0x222222,
            })
        );
        rightEarcup.position.set(0.2, 0.5, 0);
        rightEarcup.rotation.z = Math.PI / 2;
        this.group.add(rightEarcup);
        this.meshes.push({ mesh: rightEarcup, type: 'earcup' });

        // Equipment glow (under equipment for ambient lighting)
        const equipmentGlow = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.05, 0.8),
            new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.4,
            })
        );
        equipmentGlow.position.set(0, -0.35, 0.2);
        this.group.add(equipmentGlow);
        this.meshes.push({ mesh: equipmentGlow, type: 'equipmentGlow' });
        this.equipmentGlow = equipmentGlow;

        // Set initial position
        this.group.position.copy(this.basePosition);

        // Store references for animation
        this.head = head;
        this.body = body;
        this.leftArm = leftArm;
        this.rightArm = rightArm;
        this.mixerScreen = mixerScreen;
    }

    /**
     * Update animation
     * @param {number} deltaTime - Time since last frame
     * @param {number} elapsedTime - Total elapsed time
     * @param {Object} audioSystem - Optional audio system for reactive effects
     */
    update(deltaTime, elapsedTime, audioSystem = null) {
        this.time = elapsedTime;

        // Base bobbing animation (subtle head/body movement)
        const bobSpeed = 2.0;
        const bobAmount = 0.05;
        const bobOffset = Math.sin(this.time * bobSpeed) * bobAmount;

        // Audio-reactive bobbing enhancement
        let audioBob = 0;
        if (audioSystem) {
            const bassEnergy = audioSystem.getBassEnergy ? audioSystem.getBassEnergy() : 0;
            const overallEnergy = audioSystem.getOverallEnergy ? audioSystem.getOverallEnergy() : 0;

            // More intense bobbing with music
            const audioIntensity = bassEnergy * 0.6 + overallEnergy * 0.4;
            audioBob = audioIntensity * 0.15; // Additional bobbing from audio

            // Beat detection for stronger bobs
            if (audioSystem.getBeatDetector && audioSystem.getBeatDetector()) {
                const beatDetector = audioSystem.getBeatDetector();
                const lastBeatTime = beatDetector.getLastBeatTime
                    ? beatDetector.getLastBeatTime()
                    : 0;
                if (elapsedTime - lastBeatTime < 0.2) {
                    audioBob += 0.1; // Strong bob on beat
                }
            }
        }

        const totalBob = bobOffset + audioBob;
        this.group.position.y = this.basePosition.y + totalBob;

        // Head bobbing (slightly out of phase)
        if (this.head) {
            this.head.position.y = 0.5 + Math.sin(this.time * bobSpeed * 1.1) * 0.02;
        }

        // Arm movement (mixing motion)
        const armSpeed = 3.0;
        const armAmount = 0.2;
        if (this.leftArm) {
            this.leftArm.rotation.z = -0.5 + Math.sin(this.time * armSpeed) * armAmount;
            this.leftArm.rotation.x = 0.3 + Math.cos(this.time * armSpeed * 0.7) * 0.1;
        }
        if (this.rightArm) {
            this.rightArm.rotation.z = 0.5 - Math.sin(this.time * armSpeed * 0.9) * armAmount;
            this.rightArm.rotation.x = 0.3 + Math.cos(this.time * armSpeed * 0.8) * 0.1;
        }

        // Turntable rotation (spinning platters)
        const turntableSpeed = 2.0; // RPM equivalent
        if (this.leftTurntable) {
            this.leftTurntable.rotation.y += deltaTime * turntableSpeed;
        }
        if (this.rightTurntable) {
            this.rightTurntable.rotation.y -= deltaTime * turntableSpeed * 0.95; // Slightly different speed
        }

        // Mixer screen visualization (simple waveform effect)
        if (this.mixerScreen && this.mixerScreen.material) {
            let screenIntensity = 0.6;
            if (audioSystem) {
                const bassEnergy = audioSystem.getBassEnergy ? audioSystem.getBassEnergy() : 0;
                screenIntensity = 0.6 + bassEnergy * 0.4;
            }
            this.mixerScreen.material.emissiveIntensity = screenIntensity;
        }

        // Equipment glow pulsing
        if (this.equipmentGlow && this.equipmentGlow.material) {
            let glowIntensity = 0.8;
            if (audioSystem) {
                const bassEnergy = audioSystem.getBassEnergy ? audioSystem.getBassEnergy() : 0;
                glowIntensity = 0.8 + bassEnergy * 0.5; // Pulse with bass
            }
            this.equipmentGlow.material.emissiveIntensity = glowIntensity;

            // Color shift based on frequency
            if (audioSystem && audioSystem.getFrequencyBands) {
                const frequencyBands = audioSystem.getFrequencyBands();
                if (frequencyBands) {
                    const midIntensity = frequencyBands.mid || 0;
                    // Shift from cyan to magenta based on mid frequencies
                    const hue = 0.5 + midIntensity * 0.3; // 0.5 (cyan) to 0.8 (magenta)
                    this.equipmentGlow.material.emissive.setHSL(hue, 1.0, 0.5);
                    this.equipmentGlow.material.color.setHSL(hue, 1.0, 0.5);
                }
            }
        }

        // Subtle rotation (looking around)
        const rotationSpeed = 0.3;
        this.group.rotation.y = Math.sin(this.time * rotationSpeed) * 0.1;
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.meshes.forEach(({ mesh }) => {
            if (mesh.geometry) {
                mesh.geometry.dispose();
            }
            if (mesh.material) {
                if (mesh.material.map) {
                    mesh.material.map.dispose();
                }
                mesh.material.dispose();
            }
        });

        if (this.group.parent) {
            this.group.parent.remove(this.group);
        }
    }
}
