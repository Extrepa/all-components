/**
 * DebugOverlay - Visual debug indicators in 3D scene
 */
import * as THREE from 'three';

export class DebugOverlay {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;

        // Debug objects
        this.avatarMarker = null;
        this.movementArrow = null;
        this.velocityLine = null;
        this.collisionBoundaries = [];
        this.cameraIndicator = null;
        this.inputIndicators = [];

        this.setupVisualDebug();
    }

    /**
     * Setup visual debug objects
     */
    setupVisualDebug() {
        // Avatar position marker (green sphere)
        const markerGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.9,
            wireframe: false,
        });
        this.avatarMarker = new THREE.Mesh(markerGeometry, markerMaterial);
        this.avatarMarker.visible = false;
        this.scene.add(this.avatarMarker);

        // Movement direction arrow (magenta)
        const arrowHelper = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(0, 0, 0),
            1.0,
            0xff00ff,
            0.3,
            0.15
        );
        this.movementArrow = arrowHelper;
        this.movementArrow.visible = false;
        this.scene.add(this.movementArrow);

        // Velocity vector line (cyan)
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8,
            linewidth: 3,
        });
        this.velocityLine = new THREE.Line(lineGeometry, lineMaterial);
        this.velocityLine.visible = false;
        this.scene.add(this.velocityLine);

        // Camera indicator (yellow sphere)
        const cameraGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const cameraMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.7,
        });
        this.cameraIndicator = new THREE.Mesh(cameraGeometry, cameraMaterial);
        this.cameraIndicator.visible = false;
        this.scene.add(this.cameraIndicator);
    }

    /**
     * Toggle debug overlay
     */
    toggle() {
        this.enabled = !this.enabled;
        this.setVisible(this.enabled);
    }

    /**
     * Set visibility of all debug objects
     */
    setVisible(visible) {
        if (this.avatarMarker) {
            this.avatarMarker.visible = visible;
        }
        if (this.movementArrow) {
            this.movementArrow.visible = visible;
        }
        if (this.velocityLine) {
            this.velocityLine.visible = visible;
        }
        if (this.cameraIndicator) {
            this.cameraIndicator.visible = visible;
        }

        this.collisionBoundaries.forEach((boundary) => {
            if (boundary) {
                boundary.visible = visible;
            }
        });
    }

    /**
     * Update debug overlay
     */
    update(avatar, camera, inputManager) {
        if (!this.enabled) {
            return;
        }

        // Update avatar marker
        if (this.avatarMarker && avatar) {
            this.avatarMarker.position.copy(avatar.position);
            this.avatarMarker.position.y += 0.2; // Slightly above avatar
        }

        // Update movement arrow
        if (this.movementArrow && avatar) {
            const speed = avatar.velocity.length();
            if (speed > 0.01) {
                const direction = avatar.velocity.clone().normalize();
                this.movementArrow.setDirection(direction);
                this.movementArrow.position.copy(avatar.position);
                this.movementArrow.position.y += 0.5;
                const arrowLength = Math.min(speed * 3, 2.0);
                this.movementArrow.setLength(arrowLength, 0.3, 0.15);
                this.movementArrow.visible = true;
            } else {
                this.movementArrow.visible = false;
            }
        }

        // Update velocity line
        if (this.velocityLine && avatar) {
            const speed = avatar.velocity.length();
            if (speed > 0.01) {
                const start = avatar.position.clone();
                start.y += 0.3;
                const end = start.clone().add(avatar.velocity.clone().multiplyScalar(2));

                const positions = new Float32Array([
                    start.x,
                    start.y,
                    start.z,
                    end.x,
                    end.y,
                    end.z,
                ]);

                if (!this.velocityLine.geometry.attributes.position) {
                    this.velocityLine.geometry.setAttribute(
                        'position',
                        new THREE.BufferAttribute(positions, 3)
                    );
                } else {
                    this.velocityLine.geometry.attributes.position.array.set(positions);
                    this.velocityLine.geometry.attributes.position.needsUpdate = true;
                }
                this.velocityLine.visible = true;
            } else {
                this.velocityLine.visible = false;
            }
        }

        // Update camera indicator
        if (this.cameraIndicator && camera) {
            this.cameraIndicator.position.copy(camera.position);
        }
    }

    /**
     * Add collision boundary visualization
     */
    addCollisionBoundary(bounds, color = 0xff0000) {
        const geometry = new THREE.BoxGeometry(
            bounds.maxX - bounds.minX,
            0.1,
            bounds.maxZ - bounds.minZ
        );
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            wireframe: true,
        });
        const boundary = new THREE.Mesh(geometry, material);
        boundary.position.set(
            (bounds.minX + bounds.maxX) / 2,
            bounds.y || 0,
            (bounds.minZ + bounds.maxZ) / 2
        );
        boundary.visible = this.enabled;
        this.scene.add(boundary);
        this.collisionBoundaries.push(boundary);
        return boundary;
    }

    /**
     * Clear all collision boundaries
     */
    clearCollisionBoundaries() {
        this.collisionBoundaries.forEach((boundary) => {
            this.scene.remove(boundary);
            boundary.geometry.dispose();
            boundary.material.dispose();
        });
        this.collisionBoundaries = [];
    }
}
