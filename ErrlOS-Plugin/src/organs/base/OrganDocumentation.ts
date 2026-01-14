/**
 * Comprehensive documentation for an organ
 * Every organ should provide this documentation
 */
export interface OrganDocumentation {
	// Core information
	purpose: string; // One sentence: "What does this do?"
	description: string; // Detailed description
	phase: string; // Which phase it belongs to
	version?: string; // Organ version (e.g., "1.0.0") - used for tracking changes and re-consent

	// What it does
	capabilities: Array<{
		name: string;
		description: string;
		commands?: string[];
		hotkeys?: string[];
	}>;

	// What it monitors/controls
	monitoring: Array<{
		what: string; // "File modification times"
		why: string; // "To determine project activity"
		how: string; // "Scans folders every X"
		userControl: string; // "Can disable in settings"
	}>;

	// File operations
	fileOperations: Array<{
		type: "create" | "modify" | "read" | "delete";
		path: string; // Pattern or specific
		when: string; // When does this happen?
		userControl: string; // How can user control this?
		example: string;
	}>;

	// Background processes
	backgroundProcesses: Array<{
		name: string;
		description: string;
		interval?: number;
		resourceUsage: "Minimal" | "Moderate" | "High";
		canDisable: boolean;
		startStop: boolean; // Can user start/stop on demand?
	}>;

	// Settings and configuration
	settings: Array<{
		key: string;
		name: string;
		description: string;
		default: any;
		affects: string[]; // What does changing this affect?
	}>;

	// Use cases
	useCases: Array<{
		scenario: string;
		steps: string[];
		expectedOutcome: string;
	}>;

	// Troubleshooting
	commonIssues: Array<{
		problem: string;
		cause: string;
		solution: string;
	}>;

	// Dependencies
	dependencies: {
		required: string[]; // Must have these enabled
		optional: string[]; // Works better with these
		conflicts: string[]; // Can't work with these
	};
}

