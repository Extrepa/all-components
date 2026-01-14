/**
 * Animation Tokens - Errl Club Design System
 * 
 * Keyframe animations, transitions, and timing functions.
 */

export const animations = {
    // Duration (in seconds)
    duration: {
        instant: '0.1s',
        fast: '0.2s',
        normal: '0.3s',
        slow: '0.5s',
        slower: '0.8s',
        slowest: '1.5s',
    },
    
    // Timing Functions
    easing: {
        linear: 'linear',
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        cubicBezier: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    
    // Keyframe Animations
    keyframes: {
        // Hue rotation for background gradient
        hueShift: `
            @keyframes hueShift {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `,
        
        // Gradient position shift
        gradientShift: `
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `,
        
        // Title glow pulse
        titleGlow: `
            @keyframes titleGlow {
                0% {
                    text-shadow: 
                        0 0 10px rgba(255, 255, 255, 0.5),
                        0 0 20px rgba(255, 255, 255, 0.3),
                        0 0 30px rgba(255, 255, 255, 0.2);
                }
                100% {
                    text-shadow: 
                        0 0 20px rgba(255, 255, 255, 0.8),
                        0 0 30px rgba(255, 255, 255, 0.5),
                        0 0 40px rgba(255, 255, 255, 0.3);
                }
            }
        `,
        
        // Reticle pulse
        reticlePulse: `
            @keyframes reticlePulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 0.8;
                }
            }
        `,
        
        // Loading pulse
        loadingPulse: `
            @keyframes loadingPulse {
                0%, 100% {
                    opacity: 1;
                    text-shadow: 
                        0 0 20px rgba(0, 255, 255, 0.8),
                        0 0 40px rgba(0, 255, 255, 0.5),
                        0 0 60px rgba(255, 0, 255, 0.3);
                }
                50% {
                    opacity: 0.8;
                    text-shadow: 
                        0 0 30px rgba(0, 255, 255, 1.0),
                        0 0 60px rgba(0, 255, 255, 0.7),
                        0 0 90px rgba(255, 0, 255, 0.5);
                }
            }
        `,
        
        // Button fill animation
        buttonFill: `
            @keyframes buttonFill {
                0% { background-position: 0% 50%; }
                100% { background-position: 100% 50%; }
            }
        `,
        
        // Button ready pulse
        buttonReady: `
            @keyframes buttonReady {
                0% {
                    transform: scale(1);
                    box-shadow: 
                        0 0 20px rgba(0, 255, 255, 0.6),
                        0 0 40px rgba(255, 0, 255, 0.4),
                        inset 0 0 20px rgba(255, 255, 255, 0.2);
                }
                50% {
                    transform: scale(1.02);
                    box-shadow: 
                        0 0 30px rgba(0, 255, 255, 0.9),
                        0 0 60px rgba(255, 0, 255, 0.7),
                        inset 0 0 30px rgba(255, 255, 255, 0.3);
                }
                100% {
                    transform: scale(1);
                    box-shadow: 
                        0 0 20px rgba(0, 255, 255, 0.6),
                        0 0 40px rgba(255, 0, 255, 0.4),
                        inset 0 0 20px rgba(255, 255, 255, 0.2);
                }
            }
        `,
        
        // Progress complete pulse
        progressComplete: `
            @keyframes progressComplete {
                0% {
                    box-shadow: 
                        0 0 10px rgba(0, 255, 255, 0.6),
                        0 0 20px rgba(255, 0, 255, 0.4);
                }
                50% {
                    box-shadow: 
                        0 0 20px rgba(0, 255, 255, 1.0),
                        0 0 40px rgba(255, 0, 255, 0.8),
                        0 0 60px rgba(0, 255, 255, 0.4);
                }
                100% {
                    box-shadow: 
                        0 0 10px rgba(0, 255, 255, 0.6),
                        0 0 20px rgba(255, 0, 255, 0.4);
                }
            }
        `,
        
        // Loading shimmer
        loadingShimmer: `
            @keyframes loadingShimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        `,
        
        // Loading float
        loadingFloat: `
            @keyframes loadingFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
        `,
        
        // Loading particle
        loadingParticle: `
            @keyframes loadingParticle {
                0% {
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% {
                    transform: translateY(-100px) rotate(360deg);
                    opacity: 0;
                }
            }
        `,
    },
    
    // Animation Presets
    presets: {
        // Background gradient animation
        backgroundGradient: {
            animation: 'gradientShift 15s ease infinite, hueShift 20s linear infinite',
        },
        
        // Title glow animation
        titleGlow: {
            animation: 'titleGlow 2s ease-in-out infinite alternate',
        },
        
        // Reticle pulse animation
        reticlePulse: {
            animation: 'reticlePulse 1s ease-in-out infinite',
        },
        
        // Button hover transition
        buttonHover: {
            transition: 'all 0.2s ease',
        },
        
        // Panel transition
        panelTransition: {
            transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
        },
        
        // Progress bar transition
        progressTransition: {
            transition: 'width 0.3s ease',
        },
    },
};

/**
 * Get animation string for a component
 * @param {string} component - Component name
 * @param {string} state - State (hover, active, etc.)
 * @returns {string} Animation string
 */
export function getAnimation(component, state = 'normal') {
    const animations = {
        button: {
            normal: animations.presets.buttonHover.transition,
            hover: animations.presets.buttonHover.transition,
        },
        title: {
            normal: animations.presets.titleGlow.animation,
        },
        reticle: {
            normal: animations.presets.reticlePulse.animation,
        },
        progress: {
            normal: animations.presets.progressTransition.transition,
        },
    };
    
    return animations[component]?.[state] || animations.presets.buttonHover.transition;
}

