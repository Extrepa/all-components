import { Vault, TFile, TFolder } from "obsidian";

/**
 * Detected paths from vault structure analysis
 */
export interface DetectedPaths {
	projects?: string[];
	lore?: string[];
	capture?: string;
	timeMachine?: string;
	promotionProject?: string;
	promotionLore?: string;
}

/**
 * Path Detector - Automatically detects vault structure
 * Scans vault for common folder patterns and suggests paths
 */
export class PathDetector {
	/**
	 * Detect vault structure and suggest paths
	 * 
	 * @param vault - The Obsidian vault instance
	 * @returns Detected paths for common features
	 */
	static detectVaultStructure(vault: Vault): DetectedPaths {
		const detected: DetectedPaths = {};
		
		// Detect project folders
		detected.projects = this.detectProjectPaths(vault);
		
		// Detect lore/creative folders
		detected.lore = this.detectLorePaths(vault);
		
		// Detect capture file
		detected.capture = this.detectCapturePath(vault);
		
		// Detect time machine log path
		detected.timeMachine = this.detectTimeMachinePath(vault);
		
		// Detect promotion paths
		detected.promotionProject = this.detectPromotionProjectPath(vault);
		detected.promotionLore = this.detectPromotionLorePath(vault);
		
		return detected;
	}
	
	/**
	 * Detect project folder paths
	 */
	private static detectProjectPaths(vault: Vault): string[] {
		const paths: string[] = [];
		const commonPatterns = [
			"Projects/",
			"projects/",
			"02-Projects/",
			"Project/",
			"project/",
		];
		
		// Check common patterns
		for (const pattern of commonPatterns) {
			const file = vault.getAbstractFileByPath(pattern);
			if (file instanceof TFolder) {
				paths.push(pattern);
			}
		}
		
		// Check root-level folders that might be project folders
		const root = vault.getRoot();
		if (root) {
			for (const child of root.children) {
				if (child instanceof TFolder) {
					const name = child.name.toLowerCase();
					if (name.includes("project") && !paths.includes(child.path)) {
						paths.push(child.path);
					}
				}
			}
		}
		
		return paths;
	}
	
	/**
	 * Detect lore/creative folder paths
	 */
	private static detectLorePaths(vault: Vault): string[] {
		const paths: string[] = [];
		const commonPatterns = [
			"03-Creative/Lore Hub/",
			"Creative/Lore/",
			"Lore/",
			"lore/",
			"Creative/",
			"creative/",
			"03-Creative/",
		];
		
		// Check common patterns
		for (const pattern of commonPatterns) {
			const file = vault.getAbstractFileByPath(pattern);
			if (file instanceof TFolder) {
				paths.push(pattern);
			}
		}
		
		// Check root-level folders
		const root = vault.getRoot();
		if (root) {
			for (const child of root.children) {
				if (child instanceof TFolder) {
					const name = child.name.toLowerCase();
					if ((name.includes("lore") || name.includes("creative")) && !paths.includes(child.path)) {
						paths.push(child.path);
					}
				}
			}
		}
		
		return paths;
	}
	
	/**
	 * Detect capture file path
	 */
	private static detectCapturePath(vault: Vault): string | undefined {
		const commonPatterns = [
			"ErrlOS/Capture.md",
			"Capture.md",
			"capture.md",
			"Inbox.md",
			"inbox.md",
		];
		
		for (const pattern of commonPatterns) {
			const file = vault.getAbstractFileByPath(pattern);
			if (file instanceof TFile) {
				return pattern;
			}
		}
		
		return undefined;
	}
	
	/**
	 * Detect time machine log path
	 */
	private static detectTimeMachinePath(vault: Vault): string | undefined {
		const commonPatterns = [
			"ErrlOS/Logs/",
			"Logs/",
			"logs/",
			"05-Logs/",
		];
		
		for (const pattern of commonPatterns) {
			const file = vault.getAbstractFileByPath(pattern);
			if (file instanceof TFolder) {
				return pattern;
			}
		}
		
		return undefined;
	}
	
	/**
	 * Detect promotion project path
	 */
	private static detectPromotionProjectPath(vault: Vault): string | undefined {
		// Use same logic as project detection, return first match
		const projectPaths = this.detectProjectPaths(vault);
		return projectPaths.length > 0 ? projectPaths[0] : undefined;
	}
	
	/**
	 * Detect promotion lore path
	 */
	private static detectPromotionLorePath(vault: Vault): string | undefined {
		// Use same logic as lore detection, return first match
		const lorePaths = this.detectLorePaths(vault);
		return lorePaths.length > 0 ? lorePaths[0] : undefined;
	}
	
	/**
	 * Get detection summary for display
	 */
	static getDetectionSummary(detected: DetectedPaths): string {
		const parts: string[] = [];
		
		if (detected.projects && detected.projects.length > 0) {
			parts.push(`${detected.projects.length} project folder(s) found`);
		}
		
		if (detected.lore && detected.lore.length > 0) {
			parts.push(`${detected.lore.length} lore folder(s) found`);
		}
		
		if (detected.capture) {
			parts.push("Capture file found");
		}
		
		if (detected.timeMachine) {
			parts.push("Time Machine log folder found");
		}
		
		if (parts.length === 0) {
			return "No common vault structure detected";
		}
		
		return parts.join(", ");
	}
}

