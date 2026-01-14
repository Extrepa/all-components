# Base Templates Guide

## Overview

Base Templates are reusable configurations for creating Obsidian Bases. They allow you to quickly create new Bases with predefined filters, properties, and views.

## What are Base Templates?

Base Templates are JSON configurations that define:
- **Filters**: Which notes/files to include
- **Properties**: What metadata to display
- **Views**: How to organize and display the data
- **Variables**: Placeholders for customization

## Available Templates

### Organ Templates

These templates are pre-configured for ErrlOS organs:

1. **Capture Base Template**
   - Filters: `note.type = "capture"`
   - Formulas: ageInDays, isRecent, isThisWeek, isThisMonth
   - Views: All Captures, Grouped by Tags, Recent Captures (using formula), This Month, Quick List (list view)

2. **Ritual Base Template**
   - Filters: `note.type = "ritual"`
   - Views: All Rituals, By Type, By Date

3. **Lore Base Template**
   - Filters: `note.type = "lore"`
   - Views: All Lore, By Type, By Canon Status, Canon Only

4. **Project Base Template**
   - Filters: `note.type = "project"`
   - Formulas: computedStatus, daysSinceTouched, isActive, isWarm
   - Views: All Projects, By Status, Active Projects, By Computed Status, Recently Active

5. **Asset Base Template**
   - Filters: `file.extension in ["svg", "png", "jpg", "jpeg", "glsl"]`
   - Views: All Assets, By Extension, Recently Modified, Asset Gallery (card view)

6. **Session Base Template**
   - Filters: `note.type = "session"`
   - Formulas: durationMinutes, durationHours, sessionDate, isToday, isThisWeek
   - Views: All Sessions, By Date, Recent Sessions, Today's Sessions, This Week

### Custom Templates

You can create custom templates for your own use cases. Custom templates are stored in `ErrlOS/.templates/bases/`.

## Using Templates

### From Settings

1. Open Settings → Errl OS
2. Scroll to "Base Templates" section
3. Click "Open Template Manager"
4. Select a template
5. Choose "Use Template" to create a new Base

### From Code

```typescript
import { BaseTemplateManager } from "./utils/BaseTemplateManager";

// Create a Base from a template
const baseFile = await BaseTemplateManager.createBaseFromTemplate(
    app,
    "capture", // template ID
    "MyVault/Custom-Capture.base", // base path
    { type: "custom-capture" } // optional variables
);
```

## Creating Custom Templates

### From Existing Base

1. Open Template Manager
2. Select an existing Base
3. Choose "Create Template from Base"
4. Provide template ID, name, and description
5. Template is saved to `ErrlOS/.templates/bases/`

### From Code

```typescript
import { BaseTemplateManager } from "./utils/BaseTemplateManager";
import { BaseTemplate } from "./utils/BaseTemplate";

const template: BaseTemplate = {
    id: "my-custom-template",
    name: "My Custom Template",
    description: "A custom Base template",
    category: "custom",
    config: {
        filters: `note.type = "{{type}}"`,
        properties: {
            name: { displayName: "Name" },
        },
        views: [
            {
                type: "table",
                name: "All Items",
                order: ["file.name"],
            },
        ],
    },
    variables: {
        type: {
            description: "The note type to filter by",
            required: true,
        },
    },
};

await BaseTemplateManager.saveCustomTemplate(app, template);
```

## View Types

Bases support multiple view types for different use cases:

- **Table View**: Best for structured data with multiple properties. Most common view type.
- **List View**: Simple, fast browsing. Less cluttered than tables. Good for quick scanning.
- **Card View**: Visual browsing with cards. Ideal for:
  - Images and visual assets (Asset Brain)
  - Entities with rich metadata (Lore)
  - Any content that benefits from visual presentation
- **Map View**: Location-based data visualization. Requires coordinates in frontmatter.

## Formulas

Templates can include formulas for computed properties:

**Common Formula Examples:**
- `(date.now() - note.lastTouched) / 86400000` - Days since last touched
- `if(date.now() - note.date < 7 days, "recent", "old")` - Conditional status
- `(note.end - note.start) / 60000` - Duration in minutes
- `date.now() - note.capturedAt < 7 days` - Boolean flag

Formulas are evaluated by Obsidian Bases and appear as properties in views.

## Template Variables

Templates can use variables for customization. Variables are substituted when the template is instantiated.

### Variable Syntax

Variables use double curly braces: `{{variableName}}`

### Example

```json
{
  "filters": "note.type = \"{{type}}\"",
  "variables": {
    "type": {
      "description": "The note type to filter by",
      "required": true
    }
  }
}
```

When instantiated with `{ type: "project" }`, the filter becomes:
```
note.type = "project"
```

## Template Storage

- **Default Templates**: Built into the plugin
- **Custom Templates**: Stored in `ErrlOS/.templates/bases/` as JSON files

## Managing Templates

### View Templates

- Open Settings → Errl OS → Base Templates → "Open Template Manager"
- All templates are listed by category

### Delete Custom Templates

1. Open Template Manager
2. Find the custom template
3. Click "Delete"
4. Template is removed from `ErrlOS/.templates/bases/`

### Export/Import Templates

Templates are stored as JSON files. You can:
- Copy template files between vaults
- Share templates with others
- Version control templates in git

## Best Practices

1. **Use Descriptive Names**: Template names should clearly indicate their purpose
2. **Document Variables**: Provide clear descriptions for template variables
3. **Test Templates**: Verify templates work before sharing
4. **Organize by Category**: Use appropriate categories (organ, system, custom)
5. **Keep It Simple**: Start with simple templates and add complexity as needed

## Examples

### Type-Based Template

Create a template that filters by any note type:

```json
{
  "id": "type-based",
  "name": "Type-Based Base",
  "description": "Generic Base filtered by note type",
  "category": "custom",
  "config": {
    "filters": "note.type = \"{{type}}\"",
    "properties": {
      "name": { "displayName": "Name" },
      "type": { "displayName": "Type" }
    },
    "views": [
      {
        "type": "table",
        "name": "All Items",
        "order": ["note.type", "file.name"]
      }
    ]
  },
  "variables": {
    "type": {
      "description": "The note type to filter by",
      "required": true
    }
  }
}
```

### Tag-Based Template

Create a template that filters by tags:

```json
{
  "id": "tag-based",
  "name": "Tag-Based Base",
  "description": "Base filtered by tags",
  "category": "custom",
  "config": {
    "filters": "note.tags contains \"{{tag}}\"",
    "properties": {
      "name": { "displayName": "Name" },
      "tags": { "displayName": "Tags" }
    },
    "views": [
      {
        "type": "table",
        "name": "All Items",
        "order": ["file.name"]
      }
    ]
  },
  "variables": {
    "tag": {
      "description": "The tag to filter by",
      "required": true
    }
  }
}
```

## See Also

- `BaseManager` implementation: `src/utils/BaseManager.ts`
- `BaseTemplateManager` implementation: `src/utils/BaseTemplateManager.ts`
- Base format specification: `docs/BASES_FORMAT.md`

