// Visual effects system for various visual enhancements
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class VisualEffects {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.effects = [];
        // Step 274: UV/blacklight mode state
        this.uvMode = false;
        this.originalMaterials = new Map();
    }

    // Step 274: Implement a UV/blacklight mode that changes textures
    setUVMode(enabled) {
        this.uvMode = enabled;

        // Traverse scene and modify materials for UV effect
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh && object.material) {
                if (enabled) {
                    // Store original material properties
                    if (!this.originalMaterials.has(object)) {
                        this.originalMaterials.set(object, {
                            emissive: object.material.emissive.clone(),
                            emissiveIntensity: object.material.emissiveIntensity,
                            color: object.material.color.clone(),
                        });
                    }

                    // Apply UV/blacklight effect
                    if (object.material.emissive) {
                        object.material.emissive.setHex(0x4400ff); // Purple/blue UV glow
                        object.material.emissiveIntensity = 1.5;
                    }
                    // Make materials more emissive
                    if (object.material.color) {
                        object.material.color.multiplyScalar(0.3); // Darken base color
                    }
                } else {
                    // Restore original material properties
                    const original = this.originalMaterials.get(object);
                    if (original) {
                        object.material.emissive.copy(original.emissive);
                        object.material.emissiveIntensity = original.emissiveIntensity;
                        object.material.color.copy(original.color);
                        this.originalMaterials.delete(object);
                    }
                }
            }
        });
    }

    // Step 220: Add a distortion ring effect emanating from the DJ booth
    createDistortionRing(position, radius = 1.0, speed = 2.0) {
        const ringGeometry = new THREE.TorusGeometry(radius, 0.1, 8, 32);
        const ringMaterial = createMaterial({
            color: 0x00ffff,
            transparent: true,
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.rotation.x = Math.PI / 2;
        ring.userData.distortionRing = {
            radius: radius,
            speed: speed,
            age: 0,
            maxAge: 2.0,
        };

        this.scene.add(ring);
        this.effects.push(ring);

        return ring;
    }

    // Step 221: Add trails of goo on walls where avatar brushes against them
    createGooTrail(position, normal, color = 0xff00ff) {
        const trailGeometry = new THREE.PlaneGeometry(0.5, 0.5);
        const trailMaterial = createMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
        });

        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.position.copy(position);
        trail.lookAt(position.clone().add(normal));
        trail.userData.gooTrail = {
            age: 0,
            maxAge: 10.0, // Fade out over 10 seconds
            fadeStart: 8.0,
        };

        this.scene.add(trail);
        this.effects.push(trail);

        return trail;
    }

    // Step 222: Add overhead "laser" meshes that sweep the room
    createLaserBeam(start, end, color = 0xff0000) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        direction.normalize();

        const laserGeometry = new THREE.CylinderGeometry(0.05, 0.05, length, 8);
        // MeshBasicMaterial doesn't support emissive - use color only
        const laserMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
        });

        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        laser.position.copy(start).add(end).multiplyScalar(0.5);
        laser.lookAt(end);
        laser.rotation.x += Math.PI / 2;

        laser.userData.laserBeam = {
            start: start.clone(),
            end: end.clone(),
            color: color,
            age: 0,
            maxAge: 5.0, // Laser lasts 5 seconds
        };

        this.scene.add(laser);
        this.effects.push(laser);

        return laser;
    }

    // Step 268: Add floor ripple displacement around avatar or central point
    createFloorRipple(position, radius = 1.0, intensity = 1.0) {
        const rippleGeometry = new THREE.RingGeometry(0, radius, 32);
        const rippleMaterial = createMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
        });

        const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
        ripple.position.copy(position);
        ripple.position.y = 0.01; // Slightly above floor
        ripple.rotation.x = -Math.PI / 2;
        ripple.userData.floorRipple = {
            radius: radius,
            maxRadius: radius * 3,
            speed: 5.0,
            intensity: intensity,
            age: 0,
            maxAge: 2.0,
        };

        this.scene.add(ripple);
        this.effects.push(ripple);

        return ripple;
    }

    // Create sweeping laser system
    createSweepingLasers(roomSize, height = 6.0, colors = [0xff0000, 0x00ff00, 0x0000ff]) {
        this.sweepingLasers = [];
        this.laserSweepTime = 0;
        this.laserSweepSpeed = 0.5; // Sweep speed

        // Create multiple laser beams that sweep across the room
        for (let i = 0; i < 3; i++) {
            const color = colors[i % colors.length];
            const laser = this.createLaserBeam(
                new THREE.Vector3(-roomSize / 2, height, -roomSize / 2),
                new THREE.Vector3(roomSize / 2, height, -roomSize / 2),
                color
            );
            laser.userData.sweepIndex = i;
            laser.userData.sweepPhase = (i / 3) * Math.PI * 2; // Stagger phases
            this.sweepingLasers.push(laser);
        }
    }

    updateSweepingLasers(deltaTime, elapsedTime, bassEnergy = 0) {
        if (!this.sweepingLasers) {
            return;
        }

        this.laserSweepTime += deltaTime * (1.0 + bassEnergy * 0.5); // Speed up with bass

        for (const laser of this.sweepingLasers) {
            if (!laser.userData.laserBeam) {
                continue;
            }

            const phase = this.laserSweepTime + laser.userData.sweepPhase;
            const sweepAngle = phase * this.laserSweepSpeed;

            // Calculate sweep path (circular or figure-8 pattern)
            const radius = 10;
            const centerX = Math.cos(sweepAngle) * radius;
            const centerZ = Math.sin(sweepAngle * 2) * radius * 0.5; // Figure-8 pattern

            // Update laser start and end positions
            const start = new THREE.Vector3(centerX - 5, laser.position.y, centerZ - 5);
            const end = new THREE.Vector3(centerX + 5, laser.position.y, centerZ + 5);

            laser.userData.laserBeam.start = start;
            laser.userData.laserBeam.end = end;

            // Update laser position and rotation
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();
            direction.normalize();

            laser.position.copy(start).add(end).multiplyScalar(0.5);
            laser.lookAt(end);
            laser.rotation.x += Math.PI / 2;

            // Update geometry scale for length
            laser.scale.z = length / 10; // Assuming base length of 10
        }
    }

    // Step 224: Create a dedicated "hallucination zone" area
    createHallucinationZone(bounds) {
        // Create a zone marker (visual only for now)
        const zoneGeometry = new THREE.BoxGeometry(bounds.width, 0.1, bounds.depth);
        const zoneMaterial = createMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.2,
        });

        const zone = new THREE.Mesh(zoneGeometry, zoneMaterial);
        zone.position.set(bounds.centerX, bounds.height, bounds.centerZ);
        zone.rotation.x = -Math.PI / 2;

        this.scene.add(zone);

        return {
            mesh: zone,
            bounds: bounds,
            active: true,
        };
    }

    // Update all visual effects
    update(deltaTime, elapsedTime) {
        // Update distortion rings
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];

            if (effect.userData.distortionRing) {
                const data = effect.userData.distortionRing;
                data.age += deltaTime;

                if (data.age > data.maxAge) {
                    this.scene.remove(effect);
                    this.effects.splice(i, 1);
                    continue;
                }

                // Expand ring
                data.radius += data.speed * deltaTime;
                effect.scale.setScalar(data.radius / data.initialRadius);

                // Fade out
                const fadeProgress = data.age / data.maxAge;
                effect.material.opacity = 1 - fadeProgress;
            }

            if (effect.userData.gooTrail) {
                const data = effect.userData.gooTrail;
                data.age += deltaTime;

                if (data.age > data.maxAge) {
                    this.scene.remove(effect);
                    this.effects.splice(i, 1);
                    continue;
                }

                // Fade out near end
                if (data.age > data.fadeStart) {
                    const fadeProgress =
                        (data.age - data.fadeStart) / (data.maxAge - data.fadeStart);
                    effect.material.opacity = 0.8 * (1 - fadeProgress);
                }
            }

            // Step 268: Update floor ripples
            if (effect.userData.floorRipple) {
                const data = effect.userData.floorRipple;
                data.age += deltaTime;
                data.radius += data.speed * deltaTime;

                if (data.age > data.maxAge || data.radius > data.maxRadius) {
                    this.scene.remove(effect);
                    effect.geometry.dispose();
                    effect.material.dispose();
                    this.effects.splice(i, 1);
                    continue;
                }

                // Expand ripple
                effect.scale.setScalar(data.radius / data.radius);
                // Update geometry
                effect.geometry.dispose();
                effect.geometry = new THREE.RingGeometry(0, data.radius, 32);

                // Fade out
                const fadeProgress = data.age / data.maxAge;
                effect.material.opacity = 0.6 * (1 - fadeProgress);
                effect.material.emissiveIntensity = data.intensity * (1 - fadeProgress);
            }
        }
    }

    // Clear all effects
    clear() {
        for (const effect of this.effects) {
            this.scene.remove(effect);
        }
        this.effects = [];
    }
}
