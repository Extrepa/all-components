import { ORGAN_METADATA, OrganId } from "../organs/metadata";

const buildEnabledOrgans = (defaultValue: boolean): Record<OrganId, boolean> => {
	const enabled: Record<OrganId, boolean> = {} as Record<OrganId, boolean>;
	for (const organ of ORGAN_METADATA) {
		enabled[organ.id as OrganId] = defaultValue;
	}
	return enabled;
};

export interface PulseThresholds {
	active: number;    // days
	warm: number;     // days
	dormant: number;  // days
}

export interface ErrlSettings {
	dashboardPath: string;
	captureFilePath: string;
	captureRecordFolderPath: string;
	captureBasePath: string;
	projectPulsePath: string;
	pulseThresholds: PulseThresholds;
	timeMachineLogPath: string;
	loreEnginePaths: string[];
	loreEngineIndexPath: string;
	loreEngineAutoLink: boolean;
	realityMapPath: string;
	realityMapClusterByTheme: boolean;
	realityMapIncludeTags: boolean;
	promotionHistoryPath: string;
	promotionProjectPath: string;
	promotionLorePath: string;
	energyLevel: string;
	energyLowMode: boolean;
	energyThreshold: number;
	energyLowModeHideOrgans: string[];
	energyLowModeDimOpacity: number;
	momentumLevel: number;
	momentumDecayRate: number;
	momentumThreshold: number;
	momentumLastUpdated: number;
	frictionReportPath: string;
	frictionScanInterval: number;
	ritualLogPath: string;
	entropyLevel: number;
	dreamBufferPath: string;
	thoughtRecyclerScanPaths: string[];
	thoughtRecyclerThresholds: {
		recent: number;
		forgotten: number;
		ancient: number;
	};
	sessionGhostTrackingInterval: number;
	sessionGhostStallThreshold: number;
	sessionGhostDataPath: string;
	assetBrainScanPaths: string[];
	assetBrainAssetExtensions: string[];
	assetBrainIndexPath: string;
	promptForgeOutputPath: string;
	enabledOrgans: Record<OrganId, boolean>;
	autoOpenDashboard: boolean;
	firstRunCompleted: boolean;
	dashboardCardOrder: string[];
	dashboardHiddenCards: string[];
	dashboardCardLayout: "grid" | "list";
	// Base feature flags
	basesEnabled: {
		capture: boolean;
		ritual: boolean;
		lore: boolean;
		projectPulse: boolean;
		assetBrain: boolean;
		timeMachine: boolean;
	};
	// Base paths (captureBasePath already exists above)
	ritualBasePath: string;
	loreBasePath: string;
	projectPulseBasePath: string;
	assetBrainBasePath: string;
	timeMachineBasePath: string;
	// System Base (master Base tracking all ErrlOS data)
	systemBasePath: string;
	// Legacy index links toggle
	showLegacyIndexLinks: boolean;
	// Onboarding modal
	showOnboardingModal: boolean;
	// Consent and walkthrough settings
	organWalkthroughsShown: Record<string, boolean>; // Map of organId -> has seen walkthrough
	organConsents: Record<string, {
		consented: boolean;
		timestamp: number;
		version: string; // Track if organ behavior changed
	}>;
	backgroundProcessConsents: Record<string, boolean>; // Map of processId -> consented
	autoBehaviorDisabled: Record<string, boolean>; // Map of behaviorId -> disabled
}

export const DEFAULT_SETTINGS: ErrlSettings = {
	dashboardPath: "ErrlOS/Dashboard.md",
	captureFilePath: "ErrlOS/Capture.md",
	captureRecordFolderPath: "ErrlOS/Capture/",
	captureBasePath: "ErrlOS/Capture.base",
	projectPulsePath: "",
	pulseThresholds: {
		active: 3,
		warm: 14,
		dormant: 90,
	},
	timeMachineLogPath: "ErrlOS/Logs/",
	loreEnginePaths: [],
	loreEngineIndexPath: "ErrlOS/Lore-Index.md",
	loreEngineAutoLink: false, // Default to false, require explicit opt-in
	realityMapPath: "ErrlOS/Reality-Map.md",
	realityMapClusterByTheme: true,
	realityMapIncludeTags: true,
	promotionHistoryPath: "ErrlOS/Promotion-History.md",
	promotionProjectPath: "",
	promotionLorePath: "",
	energyLevel: "medium",
	energyLowMode: false,
	energyThreshold: 2,
	energyLowModeHideOrgans: [],
	energyLowModeDimOpacity: 0.85,
	momentumLevel: 0,
	momentumDecayRate: 10, // percentage per day
	momentumThreshold: 20, // minimum to cash
	momentumLastUpdated: Date.now(),
	frictionReportPath: "ErrlOS/Friction-Report.md",
	frictionScanInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
	ritualLogPath: "ErrlOS/Rituals/",
	entropyLevel: 50,
	dreamBufferPath: "ErrlOS/Dream-Buffer.md",
	thoughtRecyclerScanPaths: ["ErrlOS/Capture.md"],
	thoughtRecyclerThresholds: {
		recent: 30,
		forgotten: 90,
		ancient: 365,
	},
	sessionGhostTrackingInterval: 5000,
	sessionGhostStallThreshold: 10,
	sessionGhostDataPath: "ErrlOS/SessionGhost/",
	assetBrainScanPaths: [],
	assetBrainAssetExtensions: [".svg", ".png", ".jpg", ".jpeg", ".glsl"],
	assetBrainIndexPath: "ErrlOS/Asset-Index.md",
	promptForgeOutputPath: "ErrlOS/Prompts/",
	enabledOrgans: buildEnabledOrgans(false),
	autoOpenDashboard: false, // Default to false, require explicit opt-in
	firstRunCompleted: false,
	dashboardCardOrder: [],
	dashboardHiddenCards: [],
	dashboardCardLayout: "grid",
	organWalkthroughsShown: {},
	organConsents: {},
	backgroundProcessConsents: {},
	autoBehaviorDisabled: {},
	// Base feature flags - Phase 1 organs enabled by default
	basesEnabled: {
		capture: true,
		ritual: true,
		lore: false,
		projectPulse: false,
		assetBrain: false,
		timeMachine: false,
	},
	// Base paths
	ritualBasePath: "ErrlOS/Rituals.base",
	loreBasePath: "ErrlOS/Lore.base",
	projectPulseBasePath: "ErrlOS/Project-Pulse.base",
	assetBrainBasePath: "ErrlOS/Asset-Brain.base",
	timeMachineBasePath: "ErrlOS/Time-Machine.base",
	// System Base (default: tracks all ErrlOS data)
	systemBasePath: "ErrlOS/System.base",
	// Legacy index links toggle (default: hidden, Bases are primary)
	showLegacyIndexLinks: false,
	// Onboarding modal (default: show on first run)
	showOnboardingModal: true,
};
