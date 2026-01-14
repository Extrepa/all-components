# Base File Examples

This document provides complete, working examples of Base files for reference and testing.

---

## Capture Base Example

**File:** `ErrlOS/Capture.base`

```json
{
  "filters": "note.type = \"capture\"",
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
    "ageInDays": {
      "displayName": "Age (Days)",
      "type": "number",
      "sortable": true
    },
    "isRecent": {
      "displayName": "Is Recent",
      "type": "boolean",
      "sortable": true
    },
    "isThisWeek": {
      "displayName": "Is This Week",
      "type": "boolean",
      "sortable": true
    },
    "isThisMonth": {
      "displayName": "Is This Month",
      "type": "boolean",
      "sortable": true
    }
  },
  "formulas": {
    "ageInDays": "(date.now() - note.capturedAt) / 86400000",
    "isRecent": "date.now() - note.capturedAt < 7 days",
    "isThisWeek": "date.now() - note.capturedAt < 7 days AND date.now() - note.capturedAt >= 0 days",
    "isThisMonth": "date.now() - note.capturedAt < 30 days"
  },
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
      "order": ["note.capturedAt", "file.name"]
    },
    {
      "type": "table",
      "name": "Recent Captures",
      "filter": "isRecent = true",
      "order": ["note.capturedAt", "note.tags"]
    },
    {
      "type": "table",
      "name": "This Month",
      "filter": "isThisMonth = true",
      "order": ["note.capturedAt", "note.tags"]
    },
    {
      "type": "list",
      "name": "Quick List",
      "order": ["note.capturedAt"],
      "sortBy": "note.capturedAt"
    }
  ]
}
```

**Required Frontmatter for Capture Notes:**
```yaml
---
type: capture
capturedAt: 2025-12-22T10:30:00.000Z
tags:
  - idea
  - project-x
---
```

---

## Project Pulse Base Example

**File:** `ErrlOS/Project-Pulse.base`

```json
{
  "filters": "note.type = \"project\"",
  "properties": {
    "name": {
      "displayName": "Project Name",
      "type": "text",
      "sortable": true
    },
    "status": {
      "displayName": "Status",
      "type": "select",
      "sortable": true,
      "options": ["active", "warm", "dormant", "abandoned"]
    },
    "lastTouched": {
      "displayName": "Last Touched",
      "type": "date",
      "format": "relative",
      "sortable": true
    },
    "priority": {
      "displayName": "Priority",
      "type": "text",
      "sortable": true
    },
    "computedStatus": {
      "displayName": "Computed Status",
      "type": "select",
      "sortable": true
    },
    "daysSinceTouched": {
      "displayName": "Days Since Touched",
      "type": "number",
      "sortable": true
    },
    "isActive": {
      "displayName": "Is Active",
      "type": "boolean",
      "sortable": true
    },
    "isWarm": {
      "displayName": "Is Warm",
      "type": "boolean",
      "sortable": true
    }
  },
  "formulas": {
    "computedStatus": "if(date.now() - note.lastTouched < 3 days, \"active\", if(date.now() - note.lastTouched < 30 days, \"warm\", \"dormant\"))",
    "daysSinceTouched": "(date.now() - note.lastTouched) / 86400000",
    "isActive": "date.now() - note.lastTouched < 3 days",
    "isWarm": "date.now() - note.lastTouched >= 3 days AND date.now() - note.lastTouched < 30 days"
  },
  "views": [
    {
      "type": "table",
      "name": "All Projects",
      "order": ["note.status", "note.lastTouched", "note.name"]
    },
    {
      "type": "table",
      "name": "By Status",
      "groupBy": "note.status",
      "order": ["note.lastTouched", "note.name"]
    },
    {
      "type": "table",
      "name": "Active Projects",
      "filter": "note.status = \"active\"",
      "order": ["note.lastTouched", "note.name"]
    },
    {
      "type": "table",
      "name": "By Computed Status",
      "groupBy": "computedStatus",
      "order": ["note.lastTouched", "note.name"]
    },
    {
      "type": "table",
      "name": "Recently Active",
      "filter": "isActive = true",
      "order": ["note.lastTouched", "note.name"]
    }
  ]
}
```

**Required Frontmatter for Project README.md:**
```yaml
---
type: project
name: My Project
status: active
lastTouched: 2025-12-22T10:30:00.000Z
priority: high
---
```

---

## Time Machine Base Example

**File:** `ErrlOS/Time-Machine.base`

```json
{
  "filters": "note.type = \"session\"",
  "properties": {
    "start": {
      "displayName": "Start Time",
      "type": "date",
      "format": "absolute",
      "sortable": true
    },
    "end": {
      "displayName": "End Time",
      "type": "date",
      "format": "absolute",
      "sortable": true
    },
    "duration": {
      "displayName": "Duration",
      "type": "number",
      "sortable": true
    },
    "date": {
      "displayName": "Date",
      "type": "date",
      "format": "short",
      "sortable": true
    },
    "durationMinutes": {
      "displayName": "Duration (Minutes)",
      "type": "number",
      "sortable": true
    },
    "durationHours": {
      "displayName": "Duration (Hours)",
      "type": "number",
      "format": "short",
      "sortable": true
    },
    "sessionDate": {
      "displayName": "Session Date",
      "type": "date",
      "format": "short",
      "sortable": true
    },
    "isToday": {
      "displayName": "Is Today",
      "type": "boolean",
      "sortable": true
    },
    "isThisWeek": {
      "displayName": "Is This Week",
      "type": "boolean",
      "sortable": true
    }
  },
  "formulas": {
    "durationMinutes": "if(note.end AND note.start, (note.end - note.start) / 60000, note.duration)",
    "durationHours": "if(note.end AND note.start, (note.end - note.start) / 3600000, note.duration / 60)",
    "sessionDate": "date(note.start)",
    "isToday": "date(note.start) = date.now()",
    "isThisWeek": "date(note.start) >= date.now() - 7 days"
  },
  "views": [
    {
      "type": "table",
      "name": "All Sessions",
      "order": ["note.start", "note.date", "file.name"]
    },
    {
      "type": "table",
      "name": "By Date",
      "groupBy": "note.date",
      "order": ["note.start", "file.name"]
    },
    {
      "type": "table",
      "name": "Recent Sessions",
      "order": ["note.start", "file.name"]
    },
    {
      "type": "table",
      "name": "Today's Sessions",
      "filter": "isToday = true",
      "order": ["note.start", "file.name"]
    },
    {
      "type": "table",
      "name": "This Week",
      "filter": "isThisWeek = true",
      "order": ["note.start", "file.name"]
    }
  ]
}
```

**Required Frontmatter for Session Notes:**
```yaml
---
type: session
start: 2025-12-22T10:00:00.000Z
end: 2025-12-22T12:30:00.000Z
date: 2025-12-22
duration: 150
---
```

---

## System Base Example

**File:** `ErrlOS/System.base`

```json
{
  "filters": "note.type in [\"capture\", \"ritual\", \"lore\", \"project\", \"session\"] OR file.extension in [\"svg\", \"png\", \"jpg\", \"jpeg\", \"glsl\"]",
  "properties": {
    "type": {
      "displayName": "Type"
    },
    "organ": {
      "displayName": "Organ"
    },
    "created": {
      "displayName": "Created"
    },
    "modified": {
      "displayName": "Modified"
    },
    "status": {
      "displayName": "Status"
    },
    "tags": {
      "displayName": "Tags"
    },
    "ageInDays": {
      "displayName": "Age (Days)"
    },
    "isRecent": {
      "displayName": "Is Recent"
    }
  },
  "formulas": {
    "ageInDays": "if(note.capturedAt, (date.now() - note.capturedAt) / 86400000, if(note.lastTouched, (date.now() - note.lastTouched) / 86400000, if(note.start, (date.now() - note.start) / 86400000, 0)))",
    "isRecent": "if(note.capturedAt, date.now() - note.capturedAt < 7 days, if(note.lastTouched, date.now() - note.lastTouched < 7 days, if(note.start, date.now() - note.start < 7 days, false)))"
  },
  "views": [
    {
      "type": "table",
      "name": "All ErrlOS Data",
      "order": ["note.type", "file.name", "file.mtime"]
    },
    {
      "type": "table",
      "name": "By Type",
      "groupBy": "note.type",
      "order": ["file.name", "file.mtime"]
    },
    {
      "type": "table",
      "name": "By Organ",
      "groupBy": "note.organ",
      "order": ["note.type", "file.name"]
    },
    {
      "type": "table",
      "name": "Recent Activity",
      "order": ["file.mtime", "file.name"]
    },
    {
      "type": "table",
      "name": "By Status",
      "groupBy": "note.status",
      "order": ["note.type", "file.name"]
    },
    {
      "type": "table",
      "name": "Recent Items",
      "filter": "isRecent = true",
      "order": ["file.mtime", "file.name"]
    }
  ]
}
```

---

## Simple Base Example (Minimal)

**File:** `ErrlOS/Simple.base`

```json
{
  "filters": "note.type = \"custom\"",
  "properties": {
    "name": {
      "displayName": "Name"
    }
  },
  "views": [
    {
      "type": "table",
      "name": "All Items",
      "order": ["file.name"]
    }
  ]
}
```

---

## Notes

- All Base files are JSON format
- Property names in formulas must match frontmatter property names
- Formula syntax may vary by Obsidian version
- Test formulas in Obsidian to ensure compatibility
- Base files are created automatically by ErrlOS, but you can also create them manually

---

## Alternative Formula Syntaxes

If formulas don't work, try these alternatives:

### Date Comparison Alternatives

**Current:**
```
date.now() - note.date < 7 days
```

**Alternative 1:**
```
(date.now() - note.date) / 86400000 < 7
```

**Alternative 2:**
```
date.now() - note.date < duration(7, "days")
```

**Alternative 3:**
```
date.now() - note.date < 7 * 86400000
```

### Date Equality Alternatives

**Current:**
```
date(note.start) = date.now()
```

**Alternative 1:**
```
date(note.start) == date.now()
```

**Alternative 2:**
```
date(note.start).equals(date.now())
```

**Alternative 3:**
```
date(note.start).toDateString() = date.now().toDateString()
```

---

## See Also

- `BASES_FORMAT.md` - Complete format specification
- `BASE_TEMPLATES.md` - Template guide
- `src/utils/BaseManager.ts` - Implementation

