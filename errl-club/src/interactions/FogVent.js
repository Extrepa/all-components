// Fog vent that puffs periodically and reacts to music
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class FogVent {
    constructor(scene, position, particleSystem = null) {
        this.scene = scene;
        this.position = position.clone();
        this.particleSystem = particleSystem;
        this.puffTimer = 0;
        this.puffInterval = 3.0 + Math.random() * 2; // 3-5 seconds
        this.lastPuffTime = 0;

        this.createMesh();
    }

    // Step 214: Add fog vents that puff periodically and react to music
    createMesh() {
        // Vent base
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
        const baseMaterial = createMaterial({
            color: 0x666666,
        });

        this.baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        this.baseMesh.position.copy(this.position);
        this.scene.add(this.baseMesh);

        // Vent grille
        const grilleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 8);
        const grilleMaterial = createMaterial({
            color: 0x333333,
        });

        this.grilleMesh = new THREE.Mesh(grilleGeometry, grilleMaterial);
        this.grilleMesh.position.copy(this.position);
        this.grilleMesh.position.y += 0.1;
        this.scene.add(this.grilleMesh);
    }

    update(deltaTime, bassEnergy = 0) {
        this.puffTimer += deltaTime;

        // Step 214: React to music - puff more frequently on strong bass
        const adjustedInterval = this.puffInterval;
        if (bassEnergy > 0.7) {
            // Puff more frequently on strong bass
            this.puffTimer += deltaTime * 2; // Accelerate timer
        }

        // Puff when timer exceeds interval
        if (this.puffTimer >= adjustedInterval) {
            this.puff();
            this.puffTimer = 0;
            this.puffInterval = 3.0 + Math.random() * 2; // Random next interval
        }
    }

    puff() {
        // Create fog particles
        if (this.particleSystem) {
            const puffPosition = this.position.clone();
            puffPosition.y += 0.2;

            // Create multiple particles for fog effect
            for (let i = 0; i < 15; i++) {
                this.particleSystem.createDustParticle(
                    puffPosition,
                    0xcccccc,
                    Math.random() * 0.3 + 0.2 // Random spread
                );
            }
        }

        this.lastPuffTime = performance.now();
    }
}
