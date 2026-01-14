/**
 * Individual step in a walkthrough
 */
export interface WalkthroughStep {
	title: string;
	content: string; // Markdown supported
	actions?: Array<{
		label: string;
		action: () => void | Promise<void>;
	}>;
	requiresAcknowledgment?: boolean;
}

