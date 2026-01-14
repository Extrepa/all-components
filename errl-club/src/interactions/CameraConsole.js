// Console that switches camera to unique viewpoints
import * as THREE from 'three';
import { STAGE_SIZE } from '../config/constants.js';
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class CameraConsole {
    constructor(scene, position, cameraController) {
        this.scene = scene;
        this.position = position.clone();
        this.cameraController = cameraController;

        // Define unique camera viewpoints
        this.viewpoints = [
            {
                name: 'Stage Front',
                position: new THREE.Vector3(0, 4, 6),
                target: new THREE.Vector3(0, 1, -STAGE_SIZE / 2),
                fov: 60,
            },
            {
                name: 'Stage Side',
                position: new THREE.Vector3(8, 3, -2),
                target: new THREE.Vector3(0, 1, -STAGE_SIZE / 2),
                fov: 65,
            },
            {
                name: 'Overhead',
                position: new THREE.Vector3(0, 10, 0),
                target: new THREE.Vector3(0, 1, 0),
                fov: 70,
            },
            {
                name: 'Corner',
                position: new THREE.Vector3(-8, 5, 8),
                target: new THREE.Vector3(0, 1, 0),
                fov: 55,
            },
            {
                name: 'DJ Booth',
                position: new THREE.Vector3(0, 2, -STAGE_SIZE / 2 - 2),
                target: new THREE.Vector3(0, 1, 4),
                fov: 75,
            },
        ];

        this.currentViewpoint = 0;
        this.transitionTime = 0;
        this.transitionDuration = 1.0;
        this.isTransitioning = false;

        this.createMesh();
    }

    // Step 218: Add a camera-switch console that moves camera to unique viewpoints
    createMesh() {
        // Create console base
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const baseMaterial = createMaterial({
            color: 0x222222,
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.1;

        // Create console top (screen)
        const screenGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.05);
        const screenMaterial = createMaterial({
            color: 0x001111, // Dark cyan to simulate emissive
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.y = 0.25;

        // Create buttons
        const buttonGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16);
        const buttonMaterial = createMaterial({
            color: 0x00ffff,
        });

        const nextButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        nextButton.position.set(0.15, 0.15, 0.03);
        nextButton.userData.isButton = true;
        nextButton.userData.buttonType = 'next';

        const prevButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        prevButton.position.set(-0.15, 0.15, 0.03);
        prevButton.userData.isButton = true;
        prevButton.userData.buttonType = 'prev';

        this.mesh = new THREE.Group();
        this.mesh.add(base);
        this.mesh.add(screen);
        this.mesh.add(nextButton);
        this.mesh.add(prevButton);
        this.mesh.position.copy(this.position);
        // Store ID reference to avoid circular serialization issues
        this.mesh.userData.cameraConsoleId = Math.random().toString(36).substr(2, 9);
        this.mesh.userData.isInteractable = true;

        this.scene.add(this.mesh);
    }

    // Switch to next viewpoint
    switchToNext() {
        this.currentViewpoint = (this.currentViewpoint + 1) % this.viewpoints.length;
        this.startTransition();
    }

    // Switch to previous viewpoint
    switchToPrevious() {
        this.currentViewpoint =
            (this.currentViewpoint - 1 + this.viewpoints.length) % this.viewpoints.length;
        this.startTransition();
    }

    // Switch to specific viewpoint by index
    switchToViewpoint(index) {
        if (index >= 0 && index < this.viewpoints.length) {
            this.currentViewpoint = index;
            this.startTransition();
        }
    }

    startTransition() {
        this.isTransitioning = true;
        this.transitionTime = 0;
        console.log('Switching to viewpoint:', this.viewpoints[this.currentViewpoint].name);
    }

    update(deltaTime, camera) {
        if (!this.isTransitioning || !this.cameraController) {
            return;
        }

        this.transitionTime += deltaTime;
        const progress = Math.min(this.transitionTime / this.transitionDuration, 1.0);

        // Smooth easing function
        const eased =
            progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const viewpoint = this.viewpoints[this.currentViewpoint];

        // Interpolate camera position
        const currentPos = camera.position.clone();
        const targetPos = viewpoint.position;
        camera.position.lerpVectors(currentPos, targetPos, eased);

        // Interpolate camera target (look-at point)
        const currentTarget = this.cameraController.state.target.clone();
        const targetTarget = viewpoint.target;
        this.cameraController.state.target.lerpVectors(currentTarget, targetTarget, eased);

        // Update camera to look at target
        camera.lookAt(this.cameraController.state.target);

        // Update FOV if needed
        if (viewpoint.fov && Math.abs(camera.fov - viewpoint.fov) > 0.1) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, viewpoint.fov, eased * 0.1);
            camera.updateProjectionMatrix();
        }

        if (progress >= 1.0) {
            this.isTransitioning = false;
            // Snap to exact position
            camera.position.copy(viewpoint.position);
            this.cameraController.state.target.copy(viewpoint.target);
            camera.lookAt(viewpoint.target);
            if (viewpoint.fov) {
                camera.fov = viewpoint.fov;
                camera.updateProjectionMatrix();
            }
        }
    }

    getMesh() {
        return this.mesh;
    }

    getCurrentViewpointName() {
        return this.viewpoints[this.currentViewpoint].name;
    }
}
