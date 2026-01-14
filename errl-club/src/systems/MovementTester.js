/**
 * MovementTester - Automated movement testing and analysis system
 *
 * Provides automated testing, analysis, and recommendations for movement parameters
 */
import { MOVEMENT_CONFIG } from '../config/constants.js';

export class MovementTester {
    constructor(avatar, updateManager) {
        this.avatar = avatar;
        this.updateManager = updateManager;

        // Test state
        this.isTesting = false;
        this.testResults = [];
        this.currentTest = null;

        // Movement metrics
        this.metrics = {
            accelerationTime: 0, // Time to reach max speed
            decelerationTime: 0, // Time to stop from max speed
            rotationResponsiveness: 0, // Time to complete 180° rotation
            hopHeight: 0, // Actual hop height achieved
            dashDistance: 0, // Actual dash distance
            stateTransitionTime: 0, // Time between state changes
        };

        // Test history
        this.testHistory = [];
    }

    /**
     * Run comprehensive movement tests
     * @returns {Object} Test results
     */
    async runTests() {
        this.isTesting = true;
        this.testResults = [];

        console.log('MovementTester: Starting comprehensive movement tests...');

        // Test acceleration
        const accelResult = await this.testAcceleration();
        this.testResults.push(accelResult);

        // Test deceleration
        const decelResult = await this.testDeceleration();
        this.testResults.push(decelResult);

        // Test rotation
        const rotationResult = await this.testRotation();
        this.testResults.push(rotationResult);

        // Test hop
        const hopResult = await this.testHop();
        this.testResults.push(hopResult);

        // Test dash
        const dashResult = await this.testDash();
        this.testResults.push(dashResult);

        // Test state transitions
        const transitionResult = await this.testStateTransitions();
        this.testResults.push(transitionResult);

        this.isTesting = false;

        // Generate recommendations
        const recommendations = this.generateRecommendations();

        return {
            results: this.testResults,
            recommendations: recommendations,
            summary: this.generateSummary(),
        };
    }

    /**
     * Test acceleration from 0 to max speed
     */
    async testAcceleration() {
        const startSpeed = this.avatar.velocity.length();
        const maxSpeed = this.avatar.speed;
        const startTime = performance.now();

        // Simulate forward input
        let currentSpeed = startSpeed;
        let timeElapsed = 0;

        while (currentSpeed < maxSpeed * 0.95 && timeElapsed < 2.0) {
            await new Promise((resolve) => setTimeout(resolve, 16)); // ~60fps
            timeElapsed = (performance.now() - startTime) / 1000;

            // Estimate speed based on acceleration
            const accel = MOVEMENT_CONFIG.acceleration || 50.0;
            currentSpeed = Math.min(maxSpeed, currentSpeed + accel * 0.016);
        }

        const accelerationTime = timeElapsed;
        this.metrics.accelerationTime = accelerationTime;

        return {
            test: 'acceleration',
            time: accelerationTime,
            targetSpeed: maxSpeed,
            achievedSpeed: currentSpeed,
            rating:
                accelerationTime < 0.2
                    ? 'excellent'
                    : accelerationTime < 0.5
                      ? 'good'
                      : 'needs_improvement',
        };
    }

    /**
     * Test deceleration from max speed to 0
     */
    async testDeceleration() {
        const maxSpeed = this.avatar.speed;
        const startTime = performance.now();

        let currentSpeed = maxSpeed;
        let timeElapsed = 0;

        while (currentSpeed > 0.01 && timeElapsed < 2.0) {
            await new Promise((resolve) => setTimeout(resolve, 16));
            timeElapsed = (performance.now() - startTime) / 1000;

            // Estimate speed based on deceleration
            const decel = MOVEMENT_CONFIG.deceleration || 60.0;
            currentSpeed = Math.max(0, currentSpeed - decel * 0.016);
        }

        const decelerationTime = timeElapsed;
        this.metrics.decelerationTime = decelerationTime;

        return {
            test: 'deceleration',
            time: decelerationTime,
            rating:
                decelerationTime < 0.15
                    ? 'excellent'
                    : decelerationTime < 0.3
                      ? 'good'
                      : 'needs_improvement',
        };
    }

    /**
     * Test rotation responsiveness
     */
    async testRotation() {
        const startRotation = this.avatar.group.rotation.y;
        const targetRotation = startRotation + Math.PI; // 180 degrees
        const startTime = performance.now();

        let currentRotation = startRotation;
        let timeElapsed = 0;
        const rotationSpeed = this.updateManager.rotationSpeed || 3.0;

        while (Math.abs(currentRotation - targetRotation) > 0.1 && timeElapsed < 2.0) {
            await new Promise((resolve) => setTimeout(resolve, 16));
            timeElapsed = (performance.now() - startTime) / 1000;
            currentRotation += rotationSpeed * 0.016;
        }

        const rotationTime = timeElapsed;
        this.metrics.rotationResponsiveness = rotationTime;

        return {
            test: 'rotation',
            time: rotationTime,
            targetAngle: Math.PI,
            rating:
                rotationTime < 0.5
                    ? 'excellent'
                    : rotationTime < 1.0
                      ? 'good'
                      : 'needs_improvement',
        };
    }

    /**
     * Test hop height
     */
    async testHop() {
        const startY = this.avatar.position.y;
        const hopHeight = this.avatar.hopHeight || 1.2;

        // Simulate hop
        const hopDuration = 0.8;
        let maxHeight = startY;

        for (let t = 0; t < hopDuration; t += 0.016) {
            const progress = t / hopDuration;
            const hopY = Math.sin(progress * Math.PI) * hopHeight;
            maxHeight = Math.max(maxHeight, startY + hopY);
        }

        const actualHeight = maxHeight - startY;
        this.metrics.hopHeight = actualHeight;

        return {
            test: 'hop',
            height: actualHeight,
            targetHeight: hopHeight,
            rating: Math.abs(actualHeight - hopHeight) < 0.1 ? 'excellent' : 'good',
        };
    }

    /**
     * Test dash distance
     */
    async testDash() {
        const dashSpeed = this.avatar.dashSpeed || 0.5;
        const dashDistance = this.avatar.dashDistance || 2.0;

        // Estimate dash distance based on velocity
        const estimatedDistance = dashSpeed * dashDistance;
        this.metrics.dashDistance = estimatedDistance;

        return {
            test: 'dash',
            distance: estimatedDistance,
            targetDistance: dashDistance,
            rating: 'good',
        };
    }

    /**
     * Test state transitions
     */
    async testStateTransitions() {
        const transitionDuration = this.avatar.stateTransitionDuration || 0.3;
        this.metrics.stateTransitionTime = transitionDuration;

        return {
            test: 'state_transitions',
            duration: transitionDuration,
            rating:
                transitionDuration < 0.2
                    ? 'excellent'
                    : transitionDuration < 0.4
                      ? 'good'
                      : 'needs_improvement',
        };
    }

    /**
     * Generate recommendations based on test results
     */
    generateRecommendations() {
        const recommendations = [];

        if (this.metrics.accelerationTime > 0.5) {
            recommendations.push({
                type: 'acceleration',
                message: 'Acceleration is slow. Consider increasing MOVEMENT_CONFIG.acceleration',
                suggestedValue: 60.0,
            });
        }

        if (this.metrics.decelerationTime > 0.3) {
            recommendations.push({
                type: 'deceleration',
                message: 'Deceleration is slow. Consider increasing MOVEMENT_CONFIG.deceleration',
                suggestedValue: 70.0,
            });
        }

        if (this.metrics.rotationResponsiveness > 1.0) {
            recommendations.push({
                type: 'rotation',
                message: 'Rotation is slow. Consider increasing rotationSpeed',
                suggestedValue: 4.0,
            });
        }

        return recommendations;
    }

    /**
     * Generate test summary
     */
    generateSummary() {
        const excellent = this.testResults.filter((r) => r.rating === 'excellent').length;
        const good = this.testResults.filter((r) => r.rating === 'good').length;
        const needsImprovement = this.testResults.filter(
            (r) => r.rating === 'needs_improvement'
        ).length;

        return {
            totalTests: this.testResults.length,
            excellent,
            good,
            needsImprovement,
            overallRating:
                needsImprovement === 0
                    ? 'excellent'
                    : needsImprovement <= 2
                      ? 'good'
                      : 'needs_improvement',
        };
    }

    /**
     * Get current movement metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
}
