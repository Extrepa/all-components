/**
 * Project Health Metrics
 * Provides health assessment and recommendations for projects
 */

export interface ProjectHealth {
	score: number; // 0-100, higher is better
	activityScore: number; // Based on recency of modifications
	fileCount: number; // Number of files in project
	structureScore: number; // Based on presence of key files (README, etc.)
	status: "healthy" | "needs-attention" | "abandoned";
}

export interface ProjectRecommendation {
	type: "archive" | "revive" | "organize" | "document" | "review";
	message: string;
	priority: "low" | "medium" | "high";
}

