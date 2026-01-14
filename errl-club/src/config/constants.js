// Configuration constants for Errl Club Simulator

// Room dimensions
export const ROOM_SIZE = 20;
export const WALL_HEIGHT = 8;
export const STAGE_SIZE = 8;
export const STAGE_HEIGHT = 0.2;

// Avatar configuration
export const AVATAR_RADIUS = 0.5;

// Camera configuration
export const CAMERA_CONFIG = {
    sensitivity: 0.01, // Mouse sensitivity for rotation
    zoomSpeed: 0.5, // Zoom speed
    minDistance: 3, // Minimum zoom distance
    maxDistance: 20, // Maximum zoom distance
    minAngleX: -Math.PI / 3, // Minimum vertical angle
    maxAngleX: Math.PI / 3, // Maximum vertical angle
    autoAlignSpeed: 2.0, // Speed for auto-aligning behind avatar
    springStiffness: 0.15, // Spring stiffness for smooth camera movement
    springDamping: 0.8, // Damping factor for spring system
};

// Movement configuration
export const MOVEMENT_CONFIG = {
    acceleration: 50.0, // Acceleration rate - higher = snappier response
    deceleration: 60.0, // Deceleration rate - higher = faster stops
    defaultSpeed: 8.0, // Default walk speed
    runSpeed: 16.0, // Run speed (with Shift)
};

// Audio configuration
export const AUDIO_CONFIG = {
    fadeInDuration: 2.0, // Audio fade-in duration in seconds
    fftSize: 2048, // FFT size for audio analysis
    smoothingTimeConstant: 0.8, // Smoothing for audio analysis
};
