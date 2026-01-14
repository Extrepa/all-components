import { BaseConfig } from "./BaseManager";

/**
 * Base Template - Reusable Base configuration
 */
export interface BaseTemplate {
	id: string;
	name: string;
	description: string;
	category: "organ" | "system" | "custom";
	config: BaseConfig;
	variables?: Record<string, {
		description: string;
		default?: string;
		required?: boolean;
	}>;
}

/**
 * Default Base Templates
 * These templates can be instantiated to create new Bases
 */
export const DEFAULT_BASE_TEMPLATES: BaseTemplate[] = [
	{
		id: "capture",
		name: "Capture Base",
		description: "Base for capturing ideas, thoughts, and notes",
		category: "organ",
		config: {
			filters: `note.type = "capture"`,
			properties: {
				capturedAt: { displayName: "Captured", type: "date", format: "relative", sortable: true },
				tags: { displayName: "Tags", type: "multiselect", sortable: true },
				ageInDays: { displayName: "Age (Days)", type: "number", sortable: true },
				isRecent: { displayName: "Is Recent", type: "boolean", sortable: true },
				isThisWeek: { displayName: "Is This Week", type: "boolean", sortable: true },
				isThisMonth: { displayName: "Is This Month", type: "boolean", sortable: true },
			},
			formulas: {
				ageInDays: `(date.now() - note.capturedAt) / 86400000`,
				isRecent: `date.now() - note.capturedAt < 7 days`,
				isThisWeek: `date.now() - note.capturedAt < 7 days AND date.now() - note.capturedAt >= 0 days`,
				isThisMonth: `date.now() - note.capturedAt < 30 days`,
			},
			views: [
				{
					type: "table",
					name: "All Captures",
					order: ["note.capturedAt", "note.tags", "file.name"],
				},
				{
					type: "table",
					name: "Grouped by Tags",
					groupBy: "note.tags",
					order: ["note.capturedAt", "file.name"],
				},
				{
					type: "table",
					name: "Recent Captures",
					filter: `isRecent = true`,
					order: ["note.capturedAt", "note.tags"],
				},
				{
					type: "table",
					name: "This Month",
					filter: `isThisMonth = true`,
					order: ["note.capturedAt", "note.tags"],
				},
				{
					type: "list",
					name: "Quick List",
					order: ["note.capturedAt"],
					sortBy: "note.capturedAt",
				},
			],
		},
	},
	{
		id: "ritual",
		name: "Ritual Base",
		description: "Base for tracking rituals and structured transitions",
		category: "organ",
		config: {
			filters: `note.type = "ritual"`,
			properties: {
				ritualType: { displayName: "Ritual Type", type: "select", sortable: true, options: ["session-start", "session-end", "project-complete", "canon-declare", "abandon"] },
				date: { displayName: "Date", type: "date", format: "short", sortable: true },
				projectName: { displayName: "Project Name", type: "text", sortable: true },
				entityName: { displayName: "Entity Name", type: "text", sortable: true },
			},
			views: [
				{
					type: "table",
					name: "All Rituals",
					order: ["note.date", "note.ritualType", "file.name"],
				},
				{
					type: "table",
					name: "By Type",
					groupBy: "note.ritualType",
					order: ["note.date", "file.name"],
				},
				{
					type: "table",
					name: "By Date",
					groupBy: "note.date",
					order: ["note.ritualType", "file.name"],
				},
			],
		},
	},
	{
		id: "lore",
		name: "Lore Base",
		description: "Base for tracking lore entities and canon",
		category: "organ",
		config: {
			filters: `note.type = "lore"`,
			properties: {
				name: { displayName: "Name", type: "text", sortable: true },
				loreType: { displayName: "Type", type: "select", sortable: true, options: ["character", "location", "concept", "item", "event"] },
				canonStatus: { displayName: "Canon Status", type: "select", sortable: true, options: ["canon", "variant", "draft"] },
				timeline: { displayName: "Timeline", type: "text", sortable: true },
				tags: { displayName: "Tags", type: "multiselect", sortable: true },
			},
			views: [
				{
					type: "table",
					name: "All Lore",
					order: ["note.loreType", "note.canonStatus", "note.name"],
				},
				{
					type: "table",
					name: "By Type",
					groupBy: "note.loreType",
					order: ["note.name"],
				},
				{
					type: "table",
					name: "By Canon Status",
					groupBy: "note.canonStatus",
					order: ["note.loreType", "note.name"],
				},
				{
					type: "table",
					name: "Canon Only",
					filter: `note.canonStatus = "canon"`,
					order: ["note.loreType", "note.name"],
				},
				{
					type: "card",
					name: "Lore Cards",
					order: ["note.name", "note.loreType"],
					groupBy: "note.loreType",
				},
			],
		},
	},
	{
		id: "project",
		name: "Project Base",
		description: "Base for tracking projects and their status",
		category: "organ",
		config: {
			filters: `note.type = "project"`,
			properties: {
				name: { displayName: "Project Name", type: "text", sortable: true },
				status: { displayName: "Status", type: "select", sortable: true, options: ["active", "warm", "dormant", "abandoned"] },
				lastTouched: { displayName: "Last Touched", type: "date", format: "relative", sortable: true },
				priority: { displayName: "Priority", type: "text", sortable: true },
				computedStatus: { displayName: "Computed Status", type: "select", sortable: true },
				daysSinceTouched: { displayName: "Days Since Touched", type: "number", sortable: true },
				isActive: { displayName: "Is Active", type: "boolean", sortable: true },
				isWarm: { displayName: "Is Warm", type: "boolean", sortable: true },
			},
			formulas: {
				computedStatus: `if(date.now() - note.lastTouched < 3 days, "active", if(date.now() - note.lastTouched < 30 days, "warm", "dormant"))`,
				daysSinceTouched: `(date.now() - note.lastTouched) / 86400000`,
				isActive: `date.now() - note.lastTouched < 3 days`,
				isWarm: `date.now() - note.lastTouched >= 3 days AND date.now() - note.lastTouched < 30 days`,
			},
			views: [
				{
					type: "table",
					name: "All Projects",
					order: ["note.status", "note.lastTouched", "note.name"],
				},
				{
					type: "table",
					name: "By Status",
					groupBy: "note.status",
					order: ["note.lastTouched", "note.name"],
				},
				{
					type: "table",
					name: "Active Projects",
					filter: `note.status = "active"`,
					order: ["note.lastTouched", "note.name"],
				},
				{
					type: "table",
					name: "By Computed Status",
					groupBy: "computedStatus",
					order: ["note.lastTouched", "note.name"],
				},
				{
					type: "table",
					name: "Recently Active",
					filter: `isActive = true`,
					order: ["note.lastTouched", "note.name"],
				},
			],
		},
	},
	{
		id: "asset",
		name: "Asset Base",
		description: "Base for tracking creative assets (images, shaders, etc.)",
		category: "organ",
		config: {
			filters: `file.extension in ["svg", "png", "jpg", "jpeg", "glsl"]`,
			properties: {
				name: { displayName: "Asset Name", type: "text", sortable: true },
				type: { displayName: "Type", type: "text", sortable: true },
				extension: { displayName: "Extension", type: "select", sortable: true },
				size: { displayName: "Size", type: "number", sortable: true },
				lastModified: { displayName: "Last Modified", type: "date", format: "relative", sortable: true },
			},
			views: [
				{
					type: "table",
					name: "All Assets",
					order: ["file.name", "file.extension", "file.mtime"],
				},
				{
					type: "table",
					name: "By Extension",
					groupBy: "file.extension",
					order: ["file.name", "file.mtime"],
				},
				{
					type: "table",
					name: "Recently Modified",
					order: ["file.mtime", "file.name"],
				},
				{
					type: "card",
					name: "Asset Gallery",
					order: ["file.name", "file.extension"],
					groupBy: "file.extension",
				},
			],
		},
	},
	{
		id: "session",
		name: "Session Base",
		description: "Base for tracking work sessions",
		category: "organ",
		config: {
			filters: `note.type = "session"`,
			properties: {
				start: { displayName: "Start Time", type: "date", format: "absolute", sortable: true },
				end: { displayName: "End Time", type: "date", format: "absolute", sortable: true },
				duration: { displayName: "Duration", type: "number", sortable: true },
				date: { displayName: "Date", type: "date", format: "short", sortable: true },
				durationMinutes: { displayName: "Duration (Minutes)", type: "number", sortable: true },
				durationHours: { displayName: "Duration (Hours)", type: "number", format: "short", sortable: true },
				sessionDate: { displayName: "Session Date", type: "date", format: "short", sortable: true },
				isToday: { displayName: "Is Today", type: "boolean", sortable: true },
				isThisWeek: { displayName: "Is This Week", type: "boolean", sortable: true },
			},
			formulas: {
				durationMinutes: `if(note.end AND note.start, (note.end - note.start) / 60000, note.duration)`,
				durationHours: `if(note.end AND note.start, (note.end - note.start) / 3600000, note.duration / 60)`,
				sessionDate: `date(note.start)`,
				isToday: `date(note.start) = date.now()`,
				isThisWeek: `date(note.start) >= date.now() - 7 days`,
			},
			views: [
				{
					type: "table",
					name: "All Sessions",
					order: ["note.start", "note.date", "file.name"],
				},
				{
					type: "table",
					name: "By Date",
					groupBy: "note.date",
					order: ["note.start", "file.name"],
				},
				{
					type: "table",
					name: "Recent Sessions",
					order: ["note.start", "file.name"],
				},
				{
					type: "table",
					name: "Today's Sessions",
					filter: `isToday = true`,
					order: ["note.start", "file.name"],
				},
				{
					type: "table",
					name: "This Week",
					filter: `isThisWeek = true`,
					order: ["note.start", "file.name"],
				},
			],
		},
	},
	{
		id: "type-based",
		name: "Type-Based Base",
		description: "Generic Base filtered by note type (customizable)",
		category: "custom",
		config: {
			filters: `note.type = "{{type}}"`,
			properties: {
				name: { displayName: "Name" },
				type: { displayName: "Type" },
			},
			views: [
				{
					type: "table",
					name: "All Items",
					order: ["note.type", "file.name"],
				},
			],
		},
		variables: {
			type: {
				description: "The note type to filter by",
				required: true,
			},
		},
	},
];

