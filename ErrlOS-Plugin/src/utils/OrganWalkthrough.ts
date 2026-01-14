import { WalkthroughStep } from "./WalkthroughStep";

/**
 * Complete walkthrough information for an organ
 */
export interface OrganWalkthrough {
	organId: string;
	organName: string;
	purpose: string; // What does this organ do?
	monitoring: string[]; // What does it monitor/track?
	fileOperations: Array<{
		operation: "creates" | "modifies" | "reads" | "deletes";
		path: string;
		description: string;
	}>;
	backgroundProcesses: Array<{
		name: string;
		interval?: number;
		description: string;
		canControl: boolean;
	}>;
	dependencies: string[]; // Other organs this depends on
	useCases: string[]; // Common use cases
	configurationSteps: WalkthroughStep[];
	examples: string[];
}

