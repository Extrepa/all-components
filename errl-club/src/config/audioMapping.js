// Step 285: Custom mapping of audio bands to specific effects via config
export const AudioMappingConfig = {
    // Default mapping configuration
    default: {
        bass: {
            effects: ['bloom', 'speakerBursts', 'bassQuake'],
            intensity: 1.0,
            threshold: 0.5,
        },
        mid: {
            effects: ['wallLights', 'fogColor'],
            intensity: 1.0,
            threshold: 0.4,
        },
        treble: {
            effects: ['sparkles', 'ledStrips'],
            intensity: 1.0,
            threshold: 0.6,
        },
    },

    // Custom mapping presets
    intense: {
        bass: {
            effects: ['bloom', 'speakerBursts', 'bassQuake', 'floorRipple'],
            intensity: 1.5,
            threshold: 0.3,
        },
        mid: {
            effects: ['wallLights', 'fogColor', 'strobe'],
            intensity: 1.3,
            threshold: 0.3,
        },
        treble: {
            effects: ['sparkles', 'ledStrips', 'glitch'],
            intensity: 1.2,
            threshold: 0.5,
        },
    },

    subtle: {
        bass: {
            effects: ['bloom'],
            intensity: 0.7,
            threshold: 0.7,
        },
        mid: {
            effects: ['wallLights'],
            intensity: 0.8,
            threshold: 0.6,
        },
        treble: {
            effects: ['sparkles'],
            intensity: 0.6,
            threshold: 0.8,
        },
    },
};

// Load mapping configuration
export function loadAudioMapping(preset = 'default') {
    return AudioMappingConfig[preset] || AudioMappingConfig.default;
}

// Save custom mapping
export function saveAudioMapping(name, mapping) {
    AudioMappingConfig[name] = mapping;
}
