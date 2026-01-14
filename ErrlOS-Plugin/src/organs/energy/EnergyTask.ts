/**
 * Energy cost levels
 */
export type EnergyCost = "low" | "medium" | "high" | "very-high";

/**
 * Time cost levels
 */
export type TimeCost = "quick" | "medium" | "long" | "very-long";

/**
 * Task type
 */
export type TaskType = "creative" | "mechanical" | "mixed";

/**
 * Energy Task - Represents a task with energy and time metadata
 */
export interface EnergyTask {
	/** Task identifier (file path or task ID) */
	id: string;
	/** Task name/description */
	name: string;
	/** Energy cost */
	energyCost: EnergyCost;
	/** Time cost */
	timeCost: TimeCost;
	/** Task type */
	type: TaskType;
	/** Tags */
	tags: string[];
	/** Last modified */
	lastModified: Date;
}

/**
 * Energy level for user
 */
export type EnergyLevel = "very-low" | "low" | "medium" | "high";

/**
 * Get energy cost numeric value
 */
export function getEnergyCostValue(cost: EnergyCost): number {
	switch (cost) {
		case "low": return 1;
		case "medium": return 2;
		case "high": return 3;
		case "very-high": return 4;
	}
}

/**
 * Get time cost numeric value
 */
export function getTimeCostValue(cost: TimeCost): number {
	switch (cost) {
		case "quick": return 1;
		case "medium": return 2;
		case "long": return 3;
		case "very-long": return 4;
	}
}

/**
 * Check if task fits current energy level
 */
export function taskFitsEnergy(task: EnergyTask, energyLevel: EnergyLevel): boolean {
	const taskEnergy = getEnergyCostValue(task.energyCost);
	
	switch (energyLevel) {
		case "very-low":
			return taskEnergy <= 1; // Only low energy tasks
		case "low":
			return taskEnergy <= 2; // Low and medium
		case "medium":
			return taskEnergy <= 3; // Low, medium, high
		case "high":
			return true; // All tasks
	}
}

