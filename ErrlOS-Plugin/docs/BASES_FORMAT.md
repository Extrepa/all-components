# Obsidian Bases Format Specification

This document describes the Base file format used by ErrlOS for creating database-like views over notes in Obsidian.

## Overview

Base files are JSON-formatted files with `.base` extension that define filters, properties, views, and formulas for organizing and displaying notes in Obsidian's Bases plugin.

## File Format

Base files are stored as JSON with the following structure:

```json
{
  "filters": "filter expression",
  "properties": {
    "propertyName": {
      "displayName": "Display Name"
    }
  },
  "views": [
    {
      "type": "table",
      "name": "View Name",
      "order": ["property1", "property2"],
      "groupBy": "property",
      "sortBy": "property",
      "filter": "additional filter"
    }
  ],
  "formulas": {
    "formulaName": "formula expression"
  }
}
```

## Required Fields

### `filters` (required)

A string expression that defines which notes should be included in the Base. Uses Obsidian's filter syntax.

**Examples:**
- `note.type = "capture"` - Include all notes with `type: capture` in frontmatter
- `file.extension = "md"` - Include all markdown files
- `note.type = "lore" AND note.canonStatus = "canon"` - Include canon lore entities

**Filter Syntax:**
- Property access: `note.propertyName`, `file.propertyName`
- Comparisons: `=`, `!=`, `>`, `<`, `>=`, `<=`
- Logical operators: `AND`, `OR`, `NOT`
- String operations: `.contains()`, `.startsWith()`, `.endsWith()`

## Optional Fields

### `properties` (optional)

Defines property display names for the Base. Maps property names to display configuration.

**Structure:**
```json
{
  "properties": {
    "propertyName": {
      "displayName": "Human Readable Name",
      "type": "text | number | date | boolean | select | multiselect",
      "format": "relative | absolute | iso | short | long",
      "sortable": true,
      "visible": true,
      "options": ["option1", "option2"]
    }
  }
}
```

**Simple Format (Backward Compatible):**
```json
{
  "properties": {
    "propertyName": {
      "displayName": "Human Readable Name"
    }
  }
}
```

**Enhanced Format Example:**
```json
{
  "properties": {
    "capturedAt": {
      "displayName": "Captured",
      "type": "date",
      "format": "relative",
      "sortable": true
    },
    "tags": {
      "displayName": "Tags",
      "type": "multiselect",
      "sortable": true
    },
    "status": {
      "displayName": "Status",
      "type": "select",
      "sortable": true,
      "options": ["active", "warm", "dormant"]
    }
  }
}
```

**Property Configuration Options:**
- `displayName` (required): Human-readable name for the property
- `type` (optional): Property type hint (text, number, date, boolean, select, multiselect)
- `format` (optional): Formatting option, primarily for dates (relative, absolute, iso, short, long)
- `sortable` (optional): Boolean flag indicating if property can be sorted
- `visible` (optional): Boolean flag controlling property visibility
- `options` (optional): Array of options for select/multiselect types

### `views` (optional)

Array of view configurations that define how data is displayed in the Base.

**View Types:**
- `table` - Tabular view with rows and columns (most common)
- `list` - Simple list view for quick browsing
- `card` - Card-based view ideal for visual content (images, assets, entities)
- `map` - Map view for location-based data (requires location coordinates)

**View Structure:**
```json
{
  "type": "table",
  "name": "View Name",
  "order": ["property1", "property2"],
  "groupBy": "property",
  "sortBy": "property",
  "filter": "additional filter expression"
}
```

**Fields:**
- `type` (required) - View type: `"table"`, `"list"`, `"card"`, or `"map"`
- `name` (required) - Display name for the view
- `order` (optional) - Array of property names defining column/field order
- `groupBy` (optional) - Property to group by
- `sortBy` (optional) - Property to sort by
- `filter` (optional) - Additional filter expression for this view

**Example:**
```json
{
  "views": [
    {
      "type": "table",
      "name": "All Captures",
      "order": ["note.capturedAt", "note.tags", "file.name"]
    },
    {
      "type": "table",
      "name": "Grouped by Tags",
      "groupBy": "note.tags",
      "order": ["note.capturedAt"]
    }
  ]
}
```

### `formulas` (optional)

Defines computed properties using formula expressions.

**Structure:**
```json
{
  "formulas": {
    "formulaName": "formula expression"
  }
}
```

**Example:**
```json
{
  "formulas": {
    "computedStatus": "if(date.now() - note.lastTouched < 3 days, \"active\", if(date.now() - note.lastTouched < 30 days, \"warm\", \"dormant\"))",
    "daysSinceTouched": "(date.now() - note.lastTouched) / 86400000",
    "durationMinutes": "if(note.end AND note.start, (note.end - note.start) / 60000, note.duration)",
    "isRecent": "date.now() - note.capturedAt < 7 days"
  }
}
```

**Common Formula Patterns:**
- **Date calculations:** `(date.now() - note.date) / 86400000` (days difference)
- **Conditional status:** `if(condition, "value1", "value2")`
- **Boolean flags:** `date.now() - note.date < 7 days`
- **Duration calculations:** `(note.end - note.start) / 60000` (minutes)

**Note:** Formula syntax may vary based on Obsidian version. Refer to Obsidian's Bases documentation for current formula syntax. Test formulas in Obsidian to ensure compatibility.

## Complete Example

### Capture Base

```json
{
  "filters": "note.type = \"capture\"",
  "properties": {
    "capturedAt": {
      "displayName": "Captured"
    },
    "tags": {
      "displayName": "Tags"
    }
  },
  "views": [
    {
      "type": "table",
      "name": "Captures",
      "order": ["note.capturedAt", "note.tags", "file.name"]
    },
    {
      "type": "table",
      "name": "Grouped by Tags",
      "groupBy": "note.tags",
      "order": ["note.capturedAt"]
    }
  ]
}
```

### Lore Base

```json
{
  "filters": "note.type = \"lore\"",
  "properties": {
    "loreType": {
      "displayName": "Type"
    },
    "canonStatus": {
      "displayName": "Canon Status"
    },
    "name": {
      "displayName": "Name"
    }
  },
  "views": [
    {
      "type": "table",
      "name": "All Lore",
      "order": ["note.loreType", "note.canonStatus", "note.name"]
    },
    {
      "type": "table",
      "name": "By Type",
      "groupBy": "note.loreType",
      "order": ["note.name"]
    },
    {
      "type": "table",
      "name": "Canon Only",
      "filter": "note.canonStatus = \"canon\"",
      "order": ["note.name"]
    }
  ]
}
```

## Frontmatter Requirements

For notes to appear in Bases, they must have appropriate frontmatter. The frontmatter properties must match the filter expressions used in the Base.

### Capture Notes

```yaml
---
type: capture
capturedAt: 2025-12-22T10:30:00.000Z
tags:
  - idea
  - project-x
---
```

### Lore Notes

```yaml
---
type: lore
name: Entity Name
loreType: character
canonStatus: canon
tags:
  - tag1
  - tag2
---
```

## Implementation Notes

### BaseManager Usage

ErrlOS uses the `BaseManager` utility class to create and manage Base files:

```typescript
import { BaseManager, BaseConfig } from '../../utils/BaseManager';

const config: BaseConfig = {
  filters: 'note.type = "capture"',
  properties: {
    capturedAt: { displayName: 'Captured' },
  },
  views: [
    {
      type: 'table',
      name: 'Captures',
      order: ['note.capturedAt'],
    },
  ],
};

const baseFile = await BaseManager.ensureBaseExists(app, 'ErrlOS/Capture.base', config);
```

### File Location

Base files are typically stored in the `ErrlOS/` directory, but paths are configurable in settings:

- Capture Base: `ErrlOS/Capture.base` (default)
- Ritual Base: `ErrlOS/Rituals.base` (default)
- Lore Base: `ErrlOS/Lore.base` (default)
- Project Pulse Base: `ErrlOS/Project-Pulse.base` (default)
- Asset Brain Base: `ErrlOS/Asset-Brain.base` (default)
- Time Machine Base: `ErrlOS/Time-Machine.base` (default)

### Validation

BaseManager validates Base configurations before creating files:

- `filters` must be a non-empty string
- `properties` must be an object with valid display names
- `views` must be an array of valid view configurations
- `formulas` must be an object with string values

### Error Handling

If a Base file contains invalid JSON or structure, BaseManager will:
1. Create a backup of the corrupted file
2. Recreate the Base file with the provided configuration
3. Log a warning to the console

## Obsidian Version Compatibility

Base file format and syntax may vary between Obsidian versions. This specification is based on:

- Obsidian 1.9.2+ (Bases core plugin)
- Formula syntax updates from June 2025

**Important:** Always test Base files in your Obsidian version to ensure compatibility.

## References

- [Obsidian Bases Documentation](https://help.obsidian.md/bases/syntax)
- [Obsidian 1.9.2 Changelog](https://obsidian.md/changelog/2025-06-05-desktop-v1.9.2/)

## See Also

- `BaseManager` implementation: `src/utils/BaseManager.ts`
- Capture Base example: `src/organs/capture/CaptureOrgan.ts`
- Settings configuration: `src/settings/ErrlSettings.ts`

