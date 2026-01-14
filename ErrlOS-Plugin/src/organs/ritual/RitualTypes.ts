/**
 * Ritual type
 */
export type RitualType = "session-start" | "session-end" | "project-complete" | "canon-declare" | "abandon";

/**
 * Ritual template
 */
export interface RitualTemplate {
	type: RitualType;
	name: string;
	description: string;
	template: string;
}

/**
 * Default ritual templates
 */
export const DEFAULT_RITUAL_TEMPLATES: RitualTemplate[] = [
	{
		type: "session-start",
		name: "Session Start",
		description: "Begin a new work session",
		template: `# Session Start - {{date}}

## Intent
What do you want to accomplish today?

## Energy Level
- [ ] Very Low
- [ ] Low
- [ ] Medium
- [ ] High

## Focus Areas
- 

## Notes
- 

---
*Session started at {{time}}*
`,
	},
	{
		type: "session-end",
		name: "Session End",
		description: "Close out a work session",
		template: `# Session End - {{date}}

## Accomplishments
What did you complete?

## Reflections
What did you learn?

## Next Steps
What should happen next?

## Energy After
- [ ] Very Low
- [ ] Low
- [ ] Medium
- [ ] High

---
*Session ended at {{time}}*
`,
	},
	{
		type: "project-complete",
		name: "Project Complete",
		description: "Mark a project as complete",
		template: `# Project Complete - {{projectName}}

## Completion Date
{{date}}

## Summary
What was accomplished?

## Key Learnings
What did you learn from this project?

## Artifacts
What was created?

## Next Steps
- [ ] Archive project
- [ ] Promote to lore
- [ ] Create follow-up project

---
*Project completed on {{date}}*
`,
	},
	{
		type: "canon-declare",
		name: "Declare Canon",
		description: "Declare something as canonical lore",
		template: `# Canon Declaration - {{entityName}}

## Declaration Date
{{date}}

## What is being declared canon?
{{entityName}}

## Why is this canon?
What makes this the official version?

## Variants
Are there alternate versions? How do they relate?

## Notes
- 

---
*Declared canon on {{date}}*
`,
	},
	{
		type: "abandon",
		name: "Clean Abandonment",
		description: "Abandon a project cleanly",
		template: `# Project Abandoned - {{projectName}}

## Abandonment Date
{{date}}

## Why Abandon?
What led to this decision?

## What Was Learned
Even if abandoned, what value came from this?

## Salvageable Content
What should be preserved?
- 

## Final Notes
- 

---
*Abandoned on {{date}}*
`,
	},
];

/**
 * Replace template variables
 */
export function processRitualTemplate(template: string, variables: Record<string, string>): string {
	let processed = template;
	const now = new Date();
	
	// Default variables
	const defaults: Record<string, string> = {
		date: now.toLocaleDateString(),
		time: now.toLocaleTimeString(),
		datetime: now.toISOString(),
		...variables,
	};

	// Replace all {{variable}} with values
	for (const [key, value] of Object.entries(defaults)) {
		processed = processed.replace(new RegExp(`{{${key}}}`, "g"), value);
	}

	return processed;
}

