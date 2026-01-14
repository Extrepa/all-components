/**
 * UIInitializer - Handles UI components initialization
 */
import { VibeMeter } from '../../ui/VibeMeter.js';
import { VisualizerStylePicker } from '../../ui/VisualizerStylePicker.js';
import { NotificationSystem } from '../../ui/NotificationSystem.js';
import { CameraIntensityIndicator } from '../../ui/CameraIntensityIndicator.js';
import { InteractionPrompt } from '../../ui/InteractionPrompt.js';
import { InteractionFeedback } from '../../ui/InteractionFeedback.js';
import { ControlDock } from '../../ui/ControlDock.js';
import { ErrlPhone } from '../../ui/ErrlPhone.js';
import { HelpSystem } from '../../ui/HelpSystem.js';
import { HelpPanel } from '../../ui/HelpPanel.js';
import { ReplayRecordingIndicator } from '../../ui/ReplayRecordingIndicator.js';
import { VisualRecorderUI } from '../../ui/VisualRecorderUI.js';
import { CollectionStreakUI } from '../../ui/CollectionStreakUI.js';
import { RoomTransitionUI } from '../../ui/RoomTransitionUI.js';
import { ControlsReferenceUI } from '../../ui/ControlsReferenceUI.js';
import { DiscoveryMap } from '../../ui/DiscoveryMap.js';

export class UIInitializer {
    /**
     * Check if dev mode is enabled (via ?dev=true URL parameter)
     * @returns {boolean} True if dev mode is enabled
     */
    static isDevMode() {
        if (typeof window === 'undefined') {
            return false;
        }
        return new URLSearchParams(window.location.search).get('dev') === 'true';
    }

    /**
     * Initialize UI components
     * @param {Object} avatar - The avatar instance
     * @param {Object} keybindManager - The keybind manager instance
     * @param {Object} eventBus - The event bus instance
     * @returns {Object} Object containing UI components
     */
    static initialize(avatar, keybindManager = null, eventBus = null) {
        const vibeMeter = new VibeMeter(avatar, eventBus);

        // Hide the separate vibe meter UI (it's now in ErrlPhone header)
        if (typeof document !== 'undefined') {
            const existingVibeMeter = document.getElementById('vibe-meter');
            if (existingVibeMeter) {
                existingVibeMeter.style.display = 'none';
            }
        }
        const visualizerStylePicker = new VisualizerStylePicker(null); // Will be set later
        const notificationSystem = new NotificationSystem();
        const cameraIntensityIndicator = new CameraIntensityIndicator();
        const interactionPrompt = new InteractionPrompt();
        const interactionFeedback = new InteractionFeedback();

        // Initialize Errl Phone (replaces ControlDock - consolidates all UI into compact phone)
        let errlPhone = null;
        let controlDock = null; // Keep for backwards compatibility, but hide it
        if (keybindManager) {
            // Create Errl Phone - consolidates menu, map, avatar, vibe
            errlPhone = new ErrlPhone(keybindManager);

            // Create ControlDock but hide it (for backwards compatibility)
            controlDock = new ControlDock(keybindManager);
            const controlsElement = document.getElementById('controls');
            if (controlsElement) {
                controlsElement.style.display = 'none'; // Hide old dock
            }
        }

        // Set click handler to open camera settings (will be set up in SetupInitializer)
        // This allows the indicator to be clickable

        // Lazy load emote wheel
        let emoteWheel = null;
        const getEmoteWheel = () => {
            if (!emoteWheel) {
                // Dynamic import to reduce initial bundle size
                import('../../ui/EmoteWheel.js').then(({ EmoteWheel }) => {
                    emoteWheel = new EmoteWheel(avatar);
                });
            }
            return emoteWheel;
        };

        // Initialize help system
        const helpSystem = new HelpSystem();
        const helpPanel = new HelpPanel(helpSystem);

        // Initialize replay recording indicator (will be connected to replay system later)
        const replayRecordingIndicator = new ReplayRecordingIndicator();

        // Initialize visual recorder UI (will be connected to visual recorder later)
        const visualRecorderUI = new VisualRecorderUI({
            visualRecorder: null, // Will be set later
            onClose: () => {
                visualRecorderUI.hide();
            },
        });

        // Initialize collection streak UI (will be connected to streak system later)
        const collectionStreakUI = new CollectionStreakUI({
            streakSystem: null, // Will be set later
            eventBus: eventBus,
        });

        // Initialize room transition UI
        const roomTransitionUI = new RoomTransitionUI({
            eventBus: eventBus,
            roomManager: null, // Will be set later
        });

        // Initialize controls reference UI (will be connected to keybind manager later)
        const controlsReferenceUI = new ControlsReferenceUI({
            keybindManager: null, // Will be set later
            onClose: () => {
                controlsReferenceUI.hide();
            },
        });

        // Initialize discovery map UI (will be connected to systems later)
        const discoveryMap = new DiscoveryMap({
            discoverySystem: null, // Will be set later
            roomManager: null, // Will be set later
            eventBus: eventBus,
            onClose: () => {
                discoveryMap.hide();
            },
        });

        return {
            vibeMeter,
            visualizerStylePicker,
            notificationSystem,
            cameraIntensityIndicator,
            interactionPrompt,
            interactionFeedback,
            controlDock, // Only created in dev mode
            errlPhone, // Primary UI for regular users
            getEmoteWheel,
            helpSystem,
            helpPanel,
            replayRecordingIndicator,
            visualRecorderUI,
            collectionStreakUI,
            roomTransitionUI,
            controlsReferenceUI,
            discoveryMap,
        };
    }
}
