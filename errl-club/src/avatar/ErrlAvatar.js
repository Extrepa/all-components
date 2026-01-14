// ErrlAvatar class for Chapter 3
import * as THREE from 'three';
// Import createMaterial - if it fails, we'll use fallback in the methods
import { createMaterial } from '../utils/MaterialSimplifier.js';

export class ErrlAvatar {
    constructor(scene, position = new THREE.Vector3(0, 0.5, 0)) {
        this.scene = scene;
        this.position = position.clone();
        this.velocity = new THREE.Vector3(0, 0, 0);

        // Animation state
        this.currentState = 'idle';
        this.targetState = 'idle';
        this.stateTransitionTime = 0;
        this.stateTransitionDuration = 0.3;

        // Animation states: idle, walk, run, hop, dance1, dance2, dance3, sit
        this.states = ['idle', 'walk', 'run', 'hop', 'dance1', 'dance2', 'dance3', 'sit'];

        // Configuration
        this.radius = 0.5;
        this.speed = 8.0; // Walk speed - units per second
        this.runSpeed = 16.0; // Run speed (with Shift) - units per second
        this.baseY = position.y;

        // Movement state
        this.isHopping = false;
        this.hopTime = 0;
        this.hoverOffset = 0;
        this.hoverTime = 0;
        this.isRunning = false;
        this.isCrouching = false;

        // Expression state
        this.currentExpression = 'neutral';
        this.blinkTimer = 0;
        this.blinkInterval = 3 + Math.random() * 2; // Random blink timing

        // Color variant
        this.colorVariant = 'base';
        this.colorVariants = {
            base: { color: 0xff00ff, glow: 0.3 },
            galaxy: { color: 0x8b00ff, glow: 0.5 },
            jelly: { color: 0x00ffff, glow: 0.4 },
            rainbow: { color: 0xff00ff, glow: 0.6 },
        };

        // Mood drift
        this.moodTime = 0;
        this.vibeMeter = 0; // Step 140
        this.accessories = []; // Step 142
        this.ghostTrail = []; // Step 143
        this.dashEffectTime = 0; // Step 145
        this.rippleEffectTime = 0; // Step 148
        this.jumpBuffered = false;
        this.dashCooldown = 0;
        this.lastMoveTime = 0;
        this.lastMoveDirection = new THREE.Vector3();
        this.isSitting = false; // Step 146
        this.hoverboard = null; // Step 147
        this.teleportPuffTime = 0; // Step 144
        this.jumpAnticipationTime = 0; // Step 182
        this.jumpAnticipationDuration = 0.15; // Brief crouch before jump
        this.idleQuirkTimer = 0; // Step 185
        this.idleQuirkInterval = 5 + Math.random() * 5; // Random interval for idle quirks
        this.lastQuirkTime = 0;

        // Create the avatar mesh
        this.createMesh();
        this.createFace();
        this.createShadow();
        this.createGlow();
        this.createForwardIndicator(); // Add visual forward indicator

        // Add to scene
        this.group = new THREE.Group();
        this.group.add(this.mesh);
        this.group.add(this.faceSprite);
        this.group.add(this.shadow);
        this.group.add(this.glowMesh);
        if (this.forwardIndicator) {
            this.group.add(this.forwardIndicator);
        }
        this.group.position.copy(this.position);
        scene.add(this.group);
    }

    // Step 101-104: Replace simple sphere with stylized Errl representation
    createMesh() {
        // Use a more stylized shape - slightly squashed sphere
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        geometry.scale(1, 1.1, 1); // Slightly taller

        const variant = this.colorVariants[this.colorVariant];
        // Use MeshBasicMaterial to avoid texture unit limit errors
        // Emissive effect is simulated by bright color
        // Check if createMaterial is available, fallback to direct MeshBasicMaterial creation
        let material;
        if (typeof createMaterial === 'function') {
            material = createMaterial({
                color: variant.color,
            });
        } else {
            // Fallback: create MeshBasicMaterial directly
            console.warn('ErrlAvatar: createMaterial not available, using fallback');
            material = new THREE.MeshBasicMaterial({
                color: variant.color,
            });
        }

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.userData.preserveColor = true; // Preserve color - avatar should remain colorful
        this.material = material;
    }

    // Step 110-113: Add face texture variants for different expressions
    createFace() {
        this.faceTextures = {};
        this.createFaceTexture('neutral', '#ffffff', '#000000', 'smile');
        this.createFaceTexture('happy', '#ffffff', '#000000', 'bigSmile');
        this.createFaceTexture('excited', '#ffff00', '#000000', 'wideSmile');
        this.createFaceTexture('wow', '#ffffff', '#ff0000', 'circle');
        this.createFaceTexture('mischievous', '#ff00ff', '#000000', 'wink');
        this.createFaceTexture('blink', '#ffffff', '#ffffff', 'none');

        const faceTexture = this.faceTextures[this.currentExpression];
        // Use Mesh instead of Sprite so it rotates with the avatar, not always facing camera
        const faceGeometry = new THREE.PlaneGeometry(0.6, 0.6);
        this.faceSprite = new THREE.Mesh(
            faceGeometry,
            new THREE.MeshBasicMaterial({
                map: faceTexture,
                transparent: true,
                side: THREE.DoubleSide,
            })
        );
        this.faceSprite.scale.set(0.8, 0.8, 1);
        this.faceSprite.position.set(0, 0.2, this.radius + 0.1);
        // Face forward (positive Z is forward in Three.js)
        this.faceSprite.rotation.y = 0;
    }

    createFaceTexture(name, bgColor, eyeColor, mouthType) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(32, 32, 20, 0, Math.PI * 2);
        ctx.fill();

        if (name !== 'blink') {
            // Eyes
            ctx.fillStyle = eyeColor;
            if (name === 'mischievous') {
                // One eye closed (wink)
                ctx.beginPath();
                ctx.arc(24, 28, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(38, 28);
                ctx.lineTo(42, 28);
                ctx.strokeStyle = eyeColor;
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(24, 28, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(40, 28, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Mouth
            ctx.fillStyle = eyeColor;
            if (mouthType === 'smile') {
                ctx.beginPath();
                ctx.ellipse(32, 36, 8, 4, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (mouthType === 'bigSmile') {
                ctx.beginPath();
                ctx.ellipse(32, 36, 10, 6, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (mouthType === 'wideSmile') {
                ctx.beginPath();
                ctx.ellipse(32, 36, 12, 8, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (mouthType === 'circle') {
                ctx.beginPath();
                ctx.arc(32, 36, 6, 0, Math.PI * 2);
                ctx.fill();
            } else if (mouthType === 'wink') {
                ctx.beginPath();
                ctx.ellipse(32, 38, 6, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        this.faceTextures[name] = texture;
    }

    // Step 115: Add a small circular fake shadow decal under the avatar
    createShadow() {
        const shadowGeometry = new THREE.CircleGeometry(this.radius * 1.2, 16);
        const shadowMaterial = createMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
        });
        this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadow.rotation.x = -Math.PI / 2;
        this.shadow.position.y = -this.radius - 0.01;
    }

    // Step 116: Add a glowing outline or aura using fresnel-like shader or halo mesh
    createGlow() {
        const glowGeometry = new THREE.SphereGeometry(this.radius * 1.15, 32, 32);
        // Check if createMaterial is available, fallback to direct MeshBasicMaterial creation
        let glowMaterial;
        if (typeof createMaterial === 'function') {
            glowMaterial = createMaterial({
                color: this.colorVariants[this.colorVariant].color,
                transparent: true,
                opacity: 0.3,
                side: THREE.BackSide,
            });
        } else {
            // Fallback: create MeshBasicMaterial directly
            glowMaterial = new THREE.MeshBasicMaterial({
                color: this.colorVariants[this.colorVariant].color,
                transparent: true,
                opacity: 0.3,
                side: THREE.BackSide,
            });
        }
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    }

    // Add a visual forward indicator (arrow pointing forward)
    createForwardIndicator() {
        const arrowGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
        const arrowMaterial = createMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.9,
        });
        this.forwardIndicator = new THREE.Mesh(arrowGeometry, arrowMaterial);
        // Position arrow on top, pointing forward (negative Z toward stage)
        this.forwardIndicator.position.set(0, this.radius * 1.2, 0);
        this.forwardIndicator.rotation.x = Math.PI / 2; // Point forward in negative Z direction
    }

    // Step 107: Implement a basic state machine in ErrlAvatar
    setState(newState) {
        if (this.states.includes(newState) && newState !== this.currentState) {
            this.targetState = newState;
            this.stateTransitionTime = 0;
        }
    }

    // Step 108-109: Implement idle wobble and hover
    updateIdleAnimation(deltaTime) {
        // Idle wobble: gentle scale + Y movement
        this.hoverTime += deltaTime;
        this.hoverOffset = Math.sin(this.hoverTime * 2) * 0.1;

        // Gentle scale wobble
        const scaleWobble = 1 + Math.sin(this.hoverTime * 1.5) * 0.05;
        this.mesh.scale.set(scaleWobble, scaleWobble * 1.1, scaleWobble);
    }

    // Step 110: Implement blinking by swapping/animating textures
    updateBlinking(deltaTime) {
        this.blinkTimer += deltaTime;

        if (this.blinkTimer >= this.blinkInterval) {
            // Blink
            this.faceSprite.material.map = this.faceTextures['blink'];
            this.faceSprite.material.needsUpdate = true;

            setTimeout(() => {
                if (this.faceSprite) {
                    this.faceSprite.material.map = this.faceTextures[this.currentExpression];
                    this.faceSprite.material.needsUpdate = true;
                }
            }, 100);

            this.blinkTimer = 0;
            this.blinkInterval = 3 + Math.random() * 2;
        }
    }

    // Step 114: Add expression change when player moves faster or jumps
    // Step 184: Tie expression changes to movement state
    updateExpression() {
        const speed = this.velocity.length();

        if (this.isHopping || this.jumpAnticipationTime > 0) {
            this.currentExpression = 'excited';
        } else if (this.isRunning && speed > 0.15) {
            this.currentExpression = 'excited'; // More excited when sprinting
        } else if (this.isRunning) {
            this.currentExpression = 'happy';
        } else if (speed > 0.05) {
            this.currentExpression = 'happy';
        } else {
            this.currentExpression = 'neutral';
        }

        if (this.faceSprite && this.faceTextures[this.currentExpression]) {
            this.faceSprite.material.map = this.faceTextures[this.currentExpression];
            this.faceSprite.material.needsUpdate = true;
        }
    }

    // Step 117-118: Create color-variant system
    setColorVariant(variantName) {
        if (this.colorVariants[variantName]) {
            this.colorVariant = variantName;
            const variant = this.colorVariants[variantName];
            
            // Set main material color (MeshBasicMaterial supports color)
            if (this.material && this.material.color) {
                this.material.color.setHex(variant.color);
            }
            
            // Set emissive only if material supports it (MeshBasicMaterial doesn't)
            if (this.material && this.material.emissive) {
                this.material.emissive.setHex(variant.color);
            }
            if (this.material && 'emissiveIntensity' in this.material) {
                this.material.emissiveIntensity = variant.glow;
            }
            
            // Set glow mesh material color
            if (this.glowMesh && this.glowMesh.material && this.glowMesh.material.color) {
                this.glowMesh.material.color.setHex(variant.color);
            }
            
            // Set glow mesh emissive only if material supports it
            if (this.glowMesh && this.glowMesh.material && this.glowMesh.material.emissive) {
                this.glowMesh.material.emissive.setHex(variant.color);
            }
        }
    }

    // Step 119: Add random color variant on first load (with seed)
    randomizeColorVariant(seed = null) {
        const variants = Object.keys(this.colorVariants);
        if (seed !== null) {
            // Use seed for deterministic randomness
            const index = Math.floor((seed * 1000) % variants.length);
            this.setColorVariant(variants[index]);
        } else {
            const randomVariant = variants[Math.floor(Math.random() * variants.length)];
            this.setColorVariant(randomVariant);
        }
    }

    // Step 120: Add mild "mood drift" system
    updateMoodDrift(deltaTime) {
        this.moodTime += deltaTime;
        // Slowly shift glow intensity
        const baseGlow = this.colorVariants[this.colorVariant].glow;
        const drift = Math.sin(this.moodTime * 0.1) * 0.1;
        if (this.material && 'emissiveIntensity' in this.material) {
            this.material.emissiveIntensity = baseGlow + drift;
        }
    }

    // Step 121: Blend between animation states
    updateStateTransition(deltaTime) {
        if (this.currentState !== this.targetState) {
            this.stateTransitionTime += deltaTime;
            const progress = Math.min(1, this.stateTransitionTime / this.stateTransitionDuration);

            // Smooth transition
            if (progress >= 1) {
                this.currentState = this.targetState;
            }
        }
    }

    // Get forward direction vector based on avatar rotation
    getForwardDirection() {
        const forward = new THREE.Vector3(0, 0, -1); // Default forward (negative Z)
        forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
        return forward.normalize();
    }

    // Update forward direction (called when rotation changes)
    updateForwardDirection() {
        // This method is called to ensure forward direction is up to date
        // The actual forward direction is calculated in getForwardDirection()
        // This can be used for caching or other updates if needed
    }

    // Step 122: Adjust movement animation speed based on actual velocity
    // Step 154: Add facing direction interpolation for smoother turns
    updateMovementAnimation(deltaTime) {
        const speed = this.velocity.length();
        if (speed > 0.01) {
            // Calculate target rotation angle
            const targetAngle = Math.atan2(this.velocity.x, this.velocity.z);

            // Step 154: Smoothly interpolate rotation instead of snapping
            const rotationSpeed = 8.0; // How fast to rotate (radians per second)
            let currentAngle = this.group.rotation.y;

            // Normalize angles to [-PI, PI] range for shortest rotation
            let angleDiff = targetAngle - currentAngle;
            if (angleDiff > Math.PI) {
                angleDiff -= Math.PI * 2;
            }
            if (angleDiff < -Math.PI) {
                angleDiff += Math.PI * 2;
            }

            // Interpolate towards target angle
            const maxRotation = rotationSpeed * deltaTime;
            if (Math.abs(angleDiff) < maxRotation) {
                currentAngle = targetAngle;
            } else {
                currentAngle += Math.sign(angleDiff) * maxRotation;
            }

            this.group.rotation.y = currentAngle;

            // Step 123: Add leaning / tilt when moving
            const leanAmount = speed * 0.3;
            this.group.rotation.z = -leanAmount;
        } else {
            this.group.rotation.z *= 0.9; // Return to upright
        }
    }

    // Step 124-125: Make hop arc consistent and implement gravity
    updateHop(deltaTime) {
        if (this.isHopping) {
            this.hopTime += deltaTime;
            const hopDuration = 0.6;
            const hopHeight = 0.8;
            const hopProgress = this.hopTime / hopDuration;

            if (hopProgress < 1) {
                const hopY = Math.sin(hopProgress * Math.PI) * hopHeight;
                this.position.y = this.baseY + hopY;
            } else {
                this.isHopping = false;
                this.position.y = this.baseY;
            }
        } else {
            // Simple gravity simulation
            if (this.position.y > this.baseY) {
                this.position.y = Math.max(this.baseY, this.position.y - deltaTime * 5);
            }
        }
    }

    // Step 126: Add landing compression (squash)
    applyLandingCompression() {
        if (!this.isHopping && this.position.y <= this.baseY + 0.1) {
            // Subtle squash on landing
            this.mesh.scale.y = 0.9;
            setTimeout(() => {
                this.mesh.scale.y = 1.1;
            }, 100);
        }
    }

    // Step 127: Add friction / inertia to movement
    applyFriction(deltaTime) {
        const friction = 0.9;
        this.velocity.multiplyScalar(friction);
        if (this.velocity.length() < 0.01) {
            this.velocity.set(0, 0, 0);
        }
    }

    // Step 129: Add jump buffering
    jumpBufferTime = 0;
    jumpBufferDuration = 0.2;

    bufferJump() {
        this.jumpBufferTime = this.jumpBufferDuration;
    }

    tryBufferedJump() {
        if (this.jumpBufferTime > 0 && !this.isHopping && this.position.y <= this.baseY + 0.1) {
            this.hop();
            this.jumpBufferTime = 0;
        }
    }

    // Step 130: Add run speed when holding Shift
    setRunning(running) {
        this.isRunning = running;
        if (running) {
            this.setState('run');
        } else if (this.velocity.length() > 0) {
            this.setState('walk');
        } else {
            this.setState('idle');
        }
    }

    // Step 131: Add crouch squish when holding Ctrl
    setCrouching(crouching) {
        this.isCrouching = crouching;
        if (crouching) {
            this.mesh.scale.y = 0.7;
        } else {
            this.mesh.scale.y = 1.1;
        }
    }

    // Step 132-135: Implement dance animations
    triggerDance(danceNumber = null) {
        if (danceNumber === null) {
            danceNumber = Math.floor(Math.random() * 3) + 1;
        }
        this.setState(`dance${danceNumber}`);
    }

    // Step 136: Add jump-twirl animation for special events
    jumpTwirl() {
        this.hop();
        this.mesh.rotation.y += Math.PI * 2; // Full rotation
    }

    // Step 137: Add "gloop mode" state where the avatar flattens and reforms
    gloopMode = false;
    gloopTime = 0;

    triggerGloopMode() {
        this.gloopMode = true;
        this.gloopTime = 0;
    }

    updateGloopMode(deltaTime) {
        if (this.gloopMode) {
            this.gloopTime += deltaTime;
            const gloopDuration = 2.0;
            const progress = this.gloopTime / gloopDuration;

            if (progress < 0.5) {
                // Flatten
                const flatten = progress * 2;
                this.mesh.scale.y = 0.3 + (1.1 - 0.3) * (1 - flatten);
                this.mesh.scale.x = 1 + flatten * 0.5;
                this.mesh.scale.z = 1 + flatten * 0.5;
            } else {
                // Reform
                const reform = (progress - 0.5) * 2;
                this.mesh.scale.y = 0.3 + (1.1 - 0.3) * reform;
                this.mesh.scale.x = 1.5 - reform * 0.5;
                this.mesh.scale.z = 1.5 - reform * 0.5;
            }

            if (progress >= 1) {
                this.gloopMode = false;
                this.mesh.scale.set(1, 1.1, 1);
            }
        }
    }

    // Step 138: Add color-change effect triggered by certain interactions
    colorChangeDuration = 0;
    colorChangeTime = 0;
    originalColor = null;
    targetColor = null;

    triggerColorChange(newColor, duration = 1.0) {
        if (this.material && this.material.color) {
            this.originalColor = this.material.color.getHex();
        } else {
            this.originalColor = 0xffffff; // Default color
        }
        this.targetColor = newColor;
        this.colorChangeDuration = duration;
        this.colorChangeTime = 0;
    }

    updateColorChange(deltaTime) {
        if (this.colorChangeTime < this.colorChangeDuration) {
            this.colorChangeTime += deltaTime;
            const progress = Math.min(1, this.colorChangeTime / this.colorChangeDuration);

            if (this.originalColor !== null && this.targetColor !== null) {
                const currentColor = new THREE.Color().lerpColors(
                    new THREE.Color(this.originalColor),
                    new THREE.Color(this.targetColor),
                    progress
                );
                if (this.material && this.material.color) {
                    this.material.color.copy(currentColor);
                }
                if (this.material && this.material.emissive) {
                    this.material.emissive.copy(currentColor);
                }
            }
        }
    }

    // Step 139: Add a glow-boost effect for a short duration
    glowBoostDuration = 0;
    glowBoostTime = 0;
    baseGlowIntensity = 0.3;

    triggerGlowBoost(duration = 2.0) {
        this.glowBoostDuration = duration;
        this.glowBoostTime = 0;
    }

    updateGlowBoost(deltaTime) {
        if (!this.material || !('emissiveIntensity' in this.material)) {
            return;
        }
        if (this.glowBoostTime < this.glowBoostDuration) {
            this.glowBoostTime += deltaTime;
            const progress = this.glowBoostTime / this.glowBoostDuration;
            const boost = 1 + Math.sin(progress * Math.PI) * 2; // Pulse effect
            this.material.emissiveIntensity = this.baseGlowIntensity * boost;
        } else {
            this.material.emissiveIntensity = this.baseGlowIntensity;
        }
    }

    // Step 140-141: Implement an XP or "vibe" meter
    vibeMeter = 0;
    vibeMeterMax = 100;
    unlockedDances = ['dance1']; // Start with one dance unlocked

    addVibe(amount) {
        this.vibeMeter = Math.min(this.vibeMeterMax, this.vibeMeter + amount);

        // Unlock dances at thresholds
        if (this.vibeMeter >= 30 && !this.unlockedDances.includes('dance2')) {
            this.unlockedDances.push('dance2');
        }
        if (this.vibeMeter >= 60 && !this.unlockedDances.includes('dance3')) {
            this.unlockedDances.push('dance3');
        }
    }

    getVibePercentage() {
        return this.vibeMeter / this.vibeMeterMax;
    }

    updateDanceAnimation(deltaTime, danceState, elapsedTime) {
        const danceSpeed = 2;
        const time = elapsedTime * danceSpeed;

        if (danceState === 'dance1') {
            // Bounce dance
            this.hoverOffset = Math.sin(time * 2) * 0.2;
            this.mesh.rotation.z = Math.sin(time) * 0.3;
        } else if (danceState === 'dance2') {
            // Spin dance
            this.group.rotation.y += deltaTime * 3;
            this.hoverOffset = Math.sin(time) * 0.15;
        } else if (danceState === 'dance3') {
            // Energetic dance
            this.hoverOffset = Math.sin(time * 3) * 0.25;
            this.mesh.rotation.x = Math.sin(time * 2) * 0.2;
            this.mesh.rotation.z = Math.cos(time * 2) * 0.2;
        }
    }

    // Step 110: Implement squash-stretch when changing direction
    applySquashStretch(deltaTime) {
        if (this.velocity.length() > 0.1) {
            const stretch = 1 + this.velocity.length() * 0.5;
            this.mesh.scale.z = stretch;
            this.mesh.scale.x = 1 / stretch;
        } else {
            this.mesh.scale.z = 1;
            this.mesh.scale.x = 1;
        }
    }

    // Step 136: Add head-bob animation during walking
    updateHeadBob(deltaTime, elapsedTime) {
        if (this.velocity.length() > 0.05 && !this.isHopping) {
            const bobSpeed = this.velocity.length() * 10;
            const bobAmount = 0.05;
            this.faceSprite.position.y = 0.2 + Math.sin(elapsedTime * bobSpeed) * bobAmount;
        } else {
            this.faceSprite.position.y = 0.2;
        }
    }

    // Step 126: Landing compression and dust effect
    triggerLandingEffect() {
        // Landing compression (squash)
        this.mesh.scale.y = 0.9;
        setTimeout(() => {
            if (this.mesh) {
                this.mesh.scale.y = 1.1;
            }
        }, 100);

        // Could add dust particles here in future
    }

    // Step 140: Update vibe meter over time
    updateVibeMeter(deltaTime) {
        // Vibe meter slowly decays when not dancing
        if (this.currentState.startsWith('dance')) {
            // Vibe increases when dancing (handled in update method)
        } else {
            // Small decay when idle
            this.vibeMeter = Math.max(0, this.vibeMeter - deltaTime * 0.5);
        }
    }

    // Step 143: Ghost trail effect behind rapid movement
    updateGhostTrail(elapsedTime) {
        const speed = this.velocity.length();
        if (speed > 0.15) {
            // Only show trail when moving fast
            // Add trail point
            this.ghostTrail.push({
                position: this.position.clone(),
                time: elapsedTime,
                opacity: 0.5,
            });

            // Remove old trail points
            const trailDuration = 0.5; // 0.5 seconds
            this.ghostTrail = this.ghostTrail.filter(
                (point) => elapsedTime - point.time < trailDuration
            );

            // Update trail opacity
            this.ghostTrail.forEach((point) => {
                const age = elapsedTime - point.time;
                point.opacity = 0.5 * (1 - age / trailDuration);
            });
        } else {
            // Clear trail when not moving fast
            this.ghostTrail = [];
        }
    }

    // Step 145: Dash mechanic with short burst of speed
    dash() {
        if (this.dashCooldown <= 0 && this.velocity.length() > 0.01) {
            const dashSpeed = 0.5;
            const dashDirection = this.velocity.clone().normalize();
            this.velocity.add(dashDirection.multiplyScalar(dashSpeed));
            this.dashCooldown = 1.0; // 1 second cooldown
            this.dashEffectTime = 0.3; // Visual effect duration
            this.triggerGlowBoost(0.3);
        }
    }

    updateDash(deltaTime) {
        // Update dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown -= deltaTime;
        }

        // Update dash visual effect
        if (this.dashEffectTime > 0) {
            this.dashEffectTime -= deltaTime;
            // Dash visual effect (could add particles or trail here)
        }
    }

    // Step 148: Liquid ripple under Errl when moving
    updateLiquidRipple(elapsedTime) {
        const speed = this.velocity.length();
        if (speed > 0.05 && !this.isHopping) {
            // Create ripple effect periodically
            if (elapsedTime - this.rippleEffectTime > 0.3) {
                this.rippleEffectTime = elapsedTime;
                // Could create ripple mesh here in future
                // For now, just update the shadow to pulse
                this.shadow.scale.setScalar(1 + Math.sin(elapsedTime * 10) * 0.1);
            }
        } else {
            this.shadow.scale.setScalar(1);
        }
    }

    // Update trail (alias for updateGhostTrail for compatibility)
    updateTrail(deltaTime, scene, elapsedTime) {
        // Use elapsedTime if provided, otherwise accumulate
        if (elapsedTime !== undefined) {
            this.updateGhostTrail(elapsedTime);
        } else {
            if (!this._lastTrailUpdate) {
                this._lastTrailUpdate = 0;
            }
            this._lastTrailUpdate += deltaTime;
            this.updateGhostTrail(this._lastTrailUpdate);
        }
    }

    // Step 149: Enhance floor reflection
    // Step 185: Add random small "quirk" motions occasionally while idle
    updateIdleQuirks(deltaTime, elapsedTime) {
        this.idleQuirkTimer += deltaTime;

        if (this.idleQuirkTimer >= this.idleQuirkInterval) {
            // Trigger a random quirk
            const quirks = [
                () => {
                    // Small bounce
                    this.mesh.scale.y = 1.2;
                    setTimeout(() => {
                        if (this.mesh) {
                            this.mesh.scale.y = 1.1;
                        }
                    }, 200);
                },
                () => {
                    // Slight rotation
                    this.group.rotation.y += (Math.random() - 0.5) * 0.3;
                },
                () => {
                    // Quick color flash
                    if (this.material && 'emissiveIntensity' in this.material) {
                        const originalIntensity = this.material.emissiveIntensity;
                        this.material.emissiveIntensity = originalIntensity * 1.5;
                        setTimeout(() => {
                            if (this.material && 'emissiveIntensity' in this.material) {
                                this.material.emissiveIntensity = originalIntensity;
                            }
                        }, 150);
                    }
                },
                () => {
                    // Subtle scale pulse
                    this.mesh.scale.multiplyScalar(1.1);
                    setTimeout(() => {
                        if (this.mesh) {
                            this.mesh.scale.multiplyScalar(1 / 1.1);
                        }
                    }, 300);
                },
            ];

            const randomQuirk = quirks[Math.floor(Math.random() * quirks.length)];
            randomQuirk();

            this.idleQuirkTimer = 0;
            this.idleQuirkInterval = 5 + Math.random() * 5; // Next quirk in 5-10 seconds
        }
    }

    updateFloorReflection() {
        // Update shadow opacity and scale based on movement
        const speed = this.velocity.length();
        if (speed > 0.05) {
            // More visible shadow when moving
            this.shadow.material.opacity = 0.4;
            this.shadow.scale.setScalar(1.1);
        } else {
            // Normal shadow when idle
            this.shadow.material.opacity = 0.3;
            this.shadow.scale.setScalar(1.0);
        }

        // Could add more advanced reflection effects here:
        // - Render target for mirror reflection
        // - Fresnel effect on floor
        // - Dynamic reflection based on position
    }

    // Step 146: Add sit/relax animation for chill mode
    sit() {
        if (!this.isSitting && !this.isHopping) {
            this.isSitting = true;
            this.setState('sit');
            // Squash down for sitting pose
            this.mesh.scale.y = 0.6;
            this.mesh.position.y = -this.radius * 0.4;
        }
    }

    stand() {
        if (this.isSitting) {
            this.isSitting = false;
            this.setState('idle');
            this.mesh.scale.y = 1.1;
            this.mesh.position.y = 0;
        }
    }

    // Step 144: Add teleport puff visuals
    triggerTeleportPuff() {
        this.teleportPuffTime = 0.5; // Duration of puff effect
        // Visual effect: scale up and fade
        const originalScale = this.mesh.scale.clone();
        this.mesh.scale.multiplyScalar(1.5);
        setTimeout(() => {
            if (this.mesh) {
                this.mesh.scale.copy(originalScale);
            }
        }, 200);
    }

    updateTeleportPuff(deltaTime) {
        if (this.teleportPuffTime > 0) {
            this.teleportPuffTime -= deltaTime;
            // Could add particle effects here
        }
    }

    // Step 147: Add optional hoverboard accessory mesh
    addHoverboard() {
        if (!this.hoverboard) {
            const hoverboardGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.4);
            const hoverboardMaterial = createMaterial({
                color: 0x00ffff,
            });
            this.hoverboard = new THREE.Mesh(hoverboardGeometry, hoverboardMaterial);
            this.hoverboard.position.set(0, -this.radius - 0.05, 0);
            this.hoverboard.rotation.x = Math.PI / 2;
            this.group.add(this.hoverboard);
        }
    }

    removeHoverboard() {
        if (this.hoverboard) {
            this.group.remove(this.hoverboard);
            this.hoverboard = null;
        }
    }

    // Step 182: Add jump anticipation crouch before the hop
    // Step 183: Allow animation cancel on quick hop input
    hop() {
        if (!this.isHopping && this.position.y <= this.baseY + 0.1 && !this.isSitting) {
            // Step 183: If already anticipating, cancel and hop immediately
            if (this.jumpAnticipationTime > 0) {
                this.jumpAnticipationTime = 0;
                this.mesh.scale.y = 1.1; // Return to normal
                this.isHopping = true;
                this.hopTime = 0;
                this.setState('hop');
                return;
            }

            // Start anticipation
            this.jumpAnticipationTime = this.jumpAnticipationDuration;
            // Brief crouch before jump
            this.mesh.scale.y = 0.8;

            // Trigger hop after anticipation
            setTimeout(() => {
                if (this.jumpAnticipationTime > 0) {
                    // Only if still anticipating
                    this.isHopping = true;
                    this.hopTime = 0;
                    this.setState('hop');
                    this.jumpAnticipationTime = 0;
                    this.mesh.scale.y = 1.1; // Return to normal
                }
            }, this.jumpAnticipationDuration * 1000);
        }
    }

    // Public methods

    update(deltaTime, elapsedTime, scene) {
        // Update state transitions
        this.updateStateTransition(deltaTime);

        // Update jump buffer
        this.jumpBufferTime = Math.max(0, this.jumpBufferTime - deltaTime);
        this.tryBufferedJump();

        // Update dash
        this.updateDash(deltaTime);

        // Step 182: Update jump anticipation
        if (this.jumpAnticipationTime > 0) {
            this.jumpAnticipationTime -= deltaTime;
            // Squash down during anticipation
            const anticipationProgress =
                1 - this.jumpAnticipationTime / this.jumpAnticipationDuration;
            this.mesh.scale.y = 0.8 + anticipationProgress * 0.3;
        }

        // Update teleport puff
        this.updateTeleportPuff(deltaTime);

        // Update gloop mode
        this.updateGloopMode(deltaTime);

        // Update color change
        this.updateColorChange(deltaTime);

        // Update glow boost
        this.updateGlowBoost(deltaTime);

        // Update vibe meter
        this.updateVibeMeter(deltaTime);

        // Update animations based on state
        if (this.currentState === 'idle') {
            this.updateIdleAnimation(deltaTime);
            // Step 185: Add random idle quirk motions
            this.updateIdleQuirks(deltaTime, elapsedTime);
        } else if (this.currentState === 'sit') {
            // Sitting animation: gentle bob
            this.hoverTime += deltaTime;
            this.hoverOffset = Math.sin(this.hoverTime * 1) * 0.02;
        } else if (this.currentState.startsWith('dance')) {
            this.updateDanceAnimation(deltaTime, this.currentState, elapsedTime);
            // Add vibe when dancing
            this.addVibe(deltaTime * 5);
        }

        // Update movement
        this.updateMovementAnimation(deltaTime);
        this.updateHop(deltaTime);
        this.applyFriction(deltaTime);
        this.applySquashStretch(deltaTime);
        this.updateHeadBob(deltaTime, elapsedTime);

        // Update expressions and blinking
        this.updateExpression();
        this.updateBlinking(deltaTime);
        this.updateMoodDrift(deltaTime);

        // Update trail
        this.updateTrail(deltaTime, scene, elapsedTime);

        // Update liquid ripple (throttled)
        if (Math.random() < 0.1) {
            this.updateLiquidRipple(elapsedTime);
        }

        // Update floor reflection
        this.updateFloorReflection();

        // Note: Position is updated in UpdateManager.updatePhysics() to handle collisions
        // We only update Y position here for hover/hopping effects
        // Only set Y position if not hopping (updateHop handles Y during hops)
        if (!this.isHopping) {
            this.position.y = this.baseY + this.hoverOffset;
        }

        // Update group position to match avatar position (position may have been updated by physics)
        this.group.position.copy(this.position);

        // Update shadow position
        this.shadow.position.y = -this.radius - 0.01;
    }

    dispose() {
        if (this.group) {
            this.scene.remove(this.group);
        }
    }
}
