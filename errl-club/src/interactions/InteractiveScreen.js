// Interactive screen that changes patterns when clicked
import * as THREE from 'three';

export class InteractiveScreen {
    constructor(scene, position, size = { width: 2, height: 1.5 }, onInteract = null) {
        this.scene = scene;
        this.position = position.clone();
        this.size = size;
        this.onInteract = onInteract;

        this.currentPattern = 0;
        this.patterns = ['waveform', 'spectrum', 'abstract', 'pulse', 'grid'];
        this.patternTime = 0;

        this.createMesh();
    }

    // Step 217: Add interactive screens that change patterns when clicked
    createMesh() {
        const geometry = new THREE.PlaneGeometry(this.size.width, this.size.height);

        // Create material with emissive for screen glow
        // Use MeshBasicMaterial to avoid texture unit limit errors
        const material = new THREE.MeshBasicMaterial({
            color: 0x001111, // Dark cyan to simulate emissive
            side: THREE.DoubleSide,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.interactiveScreenId = Math.random().toString(36).substr(2, 9);
        this.mesh.userData.isInteractable = true;

        // Add frame
        const frameGeometry = new THREE.BoxGeometry(
            this.size.width + 0.1,
            this.size.height + 0.1,
            0.05
        );
        // Use MeshBasicMaterial to avoid texture unit limit errors
        const frameMaterial = new THREE.MeshBasicMaterial({
            color: 0x333333,
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = -0.03;
        this.mesh.add(frame);

        this.scene.add(this.mesh);
    }

    // Change to next pattern
    changePattern() {
        this.currentPattern = (this.currentPattern + 1) % this.patterns.length;
        this.patternTime = 0;

        if (this.onInteract) {
            this.onInteract(this.patterns[this.currentPattern]);
        }

        console.log('Screen pattern changed to:', this.patterns[this.currentPattern]);
    }

    update(deltaTime, elapsedTime, bassEnergy = 0, overallEnergy = 0) {
        this.patternTime += deltaTime;

        const pattern = this.patterns[this.currentPattern];
        const material = this.mesh.material;

        // Update material based on pattern
        switch (pattern) {
            case 'waveform': {
                // Waveform pattern - horizontal waves
                const wave = Math.sin(elapsedTime * 2 + this.position.x) * 0.5 + 0.5;
                material.emissiveIntensity = 0.3 + wave * 0.4;
                material.emissive.setHSL(0.5 + wave * 0.2, 1, 0.5);
                break;
            }

            case 'spectrum': {
                // Spectrum pattern - vertical bars based on energy
                const spectrumHue = (elapsedTime * 0.1) % 1;
                material.emissiveIntensity = 0.4 + overallEnergy * 0.6;
                material.emissive.setHSL(spectrumHue, 1, 0.5);
                break;
            }

            case 'abstract': {
                // Abstract pattern - swirling colors
                const abstractHue = (elapsedTime * 0.2 + this.position.x * 0.1) % 1;
                material.emissiveIntensity = 0.5 + bassEnergy * 0.5;
                material.emissive.setHSL(abstractHue, 1, 0.6);
                break;
            }

            case 'pulse': {
                // Pulse pattern - rhythmic pulsing
                const pulse = Math.sin(elapsedTime * 4) * 0.5 + 0.5;
                material.emissiveIntensity = 0.2 + pulse * 0.8;
                material.emissive.setHSL(0.7, 1, 0.5 + pulse * 0.3);
                break;
            }

            case 'grid': {
                // Grid pattern - checkerboard effect
                const grid = Math.floor(elapsedTime * 2) % 2 === 0 ? 1 : 0;
                material.emissiveIntensity = 0.3 + grid * 0.5;
                material.emissive.setHSL(0.1, 1, 0.4 + grid * 0.4);
                break;
            }
        }
    }

    getMesh() {
        return this.mesh;
    }
}
