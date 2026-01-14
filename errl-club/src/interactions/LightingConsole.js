// Lighting control console with toggles for special effects
import * as THREE from 'three';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class LightingConsole {
    constructor(scene, position, eventSystem, visualEffects) {
        this.scene = scene;
        this.position = position.clone();
        this.eventSystem = eventSystem;
        this.visualEffects = visualEffects;

        // Lighting states
        this.lightingStates = {
            bloom: true,
            strobe: false,
            blacklight: false,
            colorScheme: 'default', // 'default', 'neon', 'warm', 'cool'
        };

        this.createMesh();
    }

    // Step 219: Add a lighting control console with toggles for special effects
    createMesh() {
        // Create console base
        const baseGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.3);
        const baseMaterial = createMaterial({
            color: 0x222222,
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);

        // Create control panel
        const panelGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.05);
        const panelMaterial = createMaterial({
            color: 0x001111, // Dark cyan to simulate emissive
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        panel.position.y = 0.15;

        // Create toggle buttons
        const buttonGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.02);

        // Bloom toggle
        const bloomButton = new THREE.Mesh(buttonGeometry, this.createButtonMaterial(true));
        bloomButton.position.set(-0.15, 0.1, 0.04);
        bloomButton.userData.isButton = true;
        bloomButton.userData.buttonType = 'bloom';
        bloomButton.userData.state = true;

        // Strobe toggle
        const strobeButton = new THREE.Mesh(buttonGeometry, this.createButtonMaterial(false));
        strobeButton.position.set(0, 0.1, 0.04);
        strobeButton.userData.isButton = true;
        strobeButton.userData.buttonType = 'strobe';
        strobeButton.userData.state = false;

        // Blacklight toggle
        const blacklightButton = new THREE.Mesh(buttonGeometry, this.createButtonMaterial(false));
        blacklightButton.position.set(0.15, 0.1, 0.04);
        blacklightButton.userData.isButton = true;
        blacklightButton.userData.buttonType = 'blacklight';
        blacklightButton.userData.state = false;

        // Color scheme button
        const colorButton = new THREE.Mesh(buttonGeometry, this.createButtonMaterial(false));
        colorButton.position.set(0, 0, 0.04);
        colorButton.userData.isButton = true;
        colorButton.userData.buttonType = 'colorScheme';
        colorButton.userData.state = 0;

        this.mesh = new THREE.Group();
        this.mesh.add(base);
        this.mesh.add(panel);
        this.mesh.add(bloomButton);
        this.mesh.add(strobeButton);
        this.mesh.add(blacklightButton);
        this.mesh.add(colorButton);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.lightingConsoleId = Math.random().toString(36).substr(2, 9);
        this.mesh.userData.isInteractable = true;

        this.scene.add(this.mesh);
    }

    createButtonMaterial(isActive) {
        return createMaterial({
            color: isActive ? 0x00ff00 : 0x666666,
        });
    }

    // Toggle bloom effect
    toggleBloom() {
        this.lightingStates.bloom = !this.lightingStates.bloom;
        this.updateButtonVisuals('bloom', this.lightingStates.bloom);
        console.log('Bloom:', this.lightingStates.bloom ? 'ON' : 'OFF');
        // Note: Bloom is controlled by post-processing, would need to pass this to main.js
    }

    // Toggle strobe
    toggleStrobe() {
        this.lightingStates.strobe = !this.lightingStates.strobe;
        this.updateButtonVisuals('strobe', this.lightingStates.strobe);
        if (this.lightingStates.strobe && this.eventSystem) {
            this.eventSystem.triggerStrobe(5.0); // 5 second strobe
        }
        console.log('Strobe:', this.lightingStates.strobe ? 'ON' : 'OFF');
    }

    // Toggle blacklight mode
    toggleBlacklight() {
        this.lightingStates.blacklight = !this.lightingStates.blacklight;
        this.updateButtonVisuals('blacklight', this.lightingStates.blacklight);
        console.log('Blacklight:', this.lightingStates.blacklight ? 'ON' : 'OFF');
        // Note: Would need to implement UV/blacklight mode in VisualEffects
    }

    // Cycle color scheme
    cycleColorScheme() {
        const schemes = ['default', 'neon', 'warm', 'cool'];
        const currentIndex = schemes.indexOf(this.lightingStates.colorScheme);
        this.lightingStates.colorScheme = schemes[(currentIndex + 1) % schemes.length];
        console.log('Color scheme:', this.lightingStates.colorScheme);
        // Note: Would need to implement color scheme changes in main.js
    }

    updateButtonVisuals(buttonType, isActive) {
        const button = this.mesh.children.find(
            (child) => child.userData.isButton && child.userData.buttonType === buttonType
        );
        if (button && button.material) {
            button.material.color.setHex(isActive ? 0x00ff00 : 0x666666);
            button.material.emissive.setHex(isActive ? 0x00ff00 : 0x000000);
            button.material.emissiveIntensity = isActive ? 0.5 : 0;
        }
    }

    // Handle interaction
    interact(buttonType) {
        switch (buttonType) {
            case 'bloom':
                this.toggleBloom();
                break;
            case 'strobe':
                this.toggleStrobe();
                break;
            case 'blacklight':
                this.toggleBlacklight();
                break;
            case 'colorScheme':
                this.cycleColorScheme();
                break;
        }
    }

    getMesh() {
        return this.mesh;
    }

    getLightingStates() {
        return { ...this.lightingStates };
    }
}
