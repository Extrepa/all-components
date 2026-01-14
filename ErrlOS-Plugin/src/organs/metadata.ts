export type OrganPhase =
	| "Phase 1: Foundation"
	| "Phase 2: Stability"
	| "Phase 3: Intelligence"
	| "Phase 4: Adaptation"
	| "Phase 5: Weird Power";

export const ORGAN_METADATA = [
	{
		id: "dashboard",
		name: "Dashboard",
		description: "Home screen of Errl OS",
		phase: "Phase 1: Foundation",
		order: 1,
		recommended: true,
	},
	{
		id: "capture",
		name: "Capture",
		description: "Zero-friction idea intake",
		phase: "Phase 1: Foundation",
		order: 2,
		recommended: true,
	},
	{
		id: "projectPulse",
		name: "Project Pulse",
		description: "Track project activity",
		phase: "Phase 2: Stability",
		order: 3,
		recommended: false,
	},
	{
		id: "timeMachine",
		name: "Time Machine",
		description: "Session logs",
		phase: "Phase 2: Stability",
		order: 4,
		recommended: false,
	},
	{
		id: "loreEngine",
		name: "Lore Engine",
		description: "Maintain living canon",
		phase: "Phase 3: Intelligence",
		order: 5,
		recommended: false,
	},
	{
		id: "realityMap",
		name: "Reality Map",
		description: "Spatial thinking",
		phase: "Phase 3: Intelligence",
		order: 6,
		recommended: false,
	},
	{
		id: "promotion",
		name: "Promotion Flows",
		description: "Capture -> Projects -> Lore transitions",
		phase: "Phase 3: Intelligence",
		order: 7,
		recommended: false,
	},
	{
		id: "energy",
		name: "Energy System",
		description: "Task fit by energy",
		phase: "Phase 4: Adaptation",
		order: 8,
		recommended: false,
	},
	{
		id: "frictionScanner",
		name: "Friction Scanner",
		description: "Detect workflow friction",
		phase: "Phase 4: Adaptation",
		order: 9,
		recommended: false,
	},
	{
		id: "ritual",
		name: "Ritual Engine",
		description: "Structured transitions",
		phase: "Phase 5: Weird Power",
		order: 10,
		recommended: false,
	},
	{
		id: "entropyDial",
		name: "Entropy Dial",
		description: "Order <-> Chaos slider",
		phase: "Phase 5: Weird Power",
		order: 11,
		recommended: false,
	},
	{
		id: "dreamBuffer",
		name: "Dream Buffer",
		description: "Logic-free creative capture",
		phase: "Phase 5: Weird Power",
		order: 12,
		recommended: false,
	},
	{
		id: "thoughtRecycler",
		name: "Thought Recycler",
		description: "Resurface forgotten ideas",
		phase: "Phase 5: Weird Power",
		order: 13,
		recommended: false,
	},
	{
		id: "sessionGhost",
		name: "Session Ghost",
		description: "Track note usage patterns",
		phase: "Phase 5: Weird Power",
		order: 14,
		recommended: false,
	},
	{
		id: "assetBrain",
		name: "Asset Brain",
		description: "Track creative assets",
		phase: "Phase 5: Weird Power",
		order: 15,
		recommended: false,
	},
	{
		id: "promptForge",
		name: "Prompt Forge",
		description: "Generate prompts from notes",
		phase: "Phase 5: Weird Power",
		order: 16,
		recommended: false,
	},
] as const;

export type OrganId = typeof ORGAN_METADATA[number]["id"];
export type OrganMetadata = typeof ORGAN_METADATA[number];

export const getOrganIds = () => ORGAN_METADATA.map((organ) => organ.id);

export const getRecommendedOrganIds = () =>
	ORGAN_METADATA.filter((organ) => organ.recommended).map((organ) => organ.id);
