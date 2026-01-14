# Project Bootstrap Guide

**Purpose:** Guide for creating a new project in the Projects workspace

## Bootstrap Process

When starting a new project:

### Step 1: Create Code Project

1. Create project folder: `/Users/extrepa/Projects/project-name/`
2. Initialize project (npm init, etc.)
3. Create core documentation using templates:

**Required Files:**
- Copy `_Resources/_Templates/README.md.template` → `README.md`
- Copy `_Resources/_Templates/INDEX.md.template` → `INDEX.md`
- Copy `_Resources/_Templates/PROJECT_STATUS.md.template` → `PROJECT_STATUS.md`
- Copy `_Resources/_Templates/Documentation/Core/docs-index.md.template` → `docs/index.md`

**Fill in project-specific information:**
- Project name and description
- Technology stack
- Installation instructions
- Usage examples

### Step 2: Add Technical Documentation (As Needed)

Based on project complexity:

**For Complex Projects:**
- Copy `_Resources/_Templates/Documentation/Core/architecture.md.template` → `docs/architecture.md`
- Copy `_Resources/_Templates/Documentation/Core/project-structure.md.template` → `docs/project-structure.md`

**For All Projects:**
- Copy `_Resources/_Templates/Documentation/Guides/developer-guide.md.template` → `docs/DEVELOPER_GUIDE.md`

**For User-Facing Projects:**
- Copy `_Resources/_Templates/Documentation/Guides/user-guide.md.template` → `docs/USER_GUIDE.md`
- Copy `_Resources/_Templates/Documentation/Guides/quick-start.md.template` → `docs/QUICK_START.md`

### Step 3: Optional Project Management Docs

If you want separate project management documentation:

1. Create folder: `_Resources/Vault/Projects/Project-Name/`
2. Use project management templates:
   - `_Resources/Vault/Templates/Projects/Project-README-Template.md` → `README.md`
   - `_Resources/Vault/Templates/Projects/Specs-Template.md` → `specs.md`
   - `_Resources/Vault/Templates/Projects/Tasks-Template.md` → `tasks.md`
   - `_Resources/Vault/Templates/Projects/Versions-Template.md` → `versions.md`
   - `_Resources/Vault/Templates/Projects/Prompts-Template.md` → `prompts.md`
   - `_Resources/Vault/Templates/Projects/Build-Order-Template.md` → `build-order.md`
   - `_Resources/Vault/Templates/Projects/Asset-Spec-Template.md` → `assets.md`

### Step 4: Workspace Integration

1. Add project to `PROJECTS_DASHBOARD.md` in workspace root
2. Update project status
3. Link to code location

### Step 5: Follow Integration Guide

After bootstrapping, follow the [Project Integration Guide](Project-Integration-Guide.md) to ensure complete integration.

## Folder Structure

### Code Project Structure
```
project-name/
├── README.md
├── INDEX.md
├── PROJECT_STATUS.md
├── package.json (or other config)
├── src/ (or source code)
├── docs/
│   ├── index.md
│   ├── architecture.md (if complex)
│   ├── project-structure.md (if organized)
│   └── DEVELOPER_GUIDE.md
└── ...
```

### Optional Project Management Structure
```
_Resources/Vault/Projects/Project-Name/
├── README.md
├── specs.md
├── tasks.md
├── versions.md
├── prompts.md
├── build-order.md
└── assets.md
```

## Quick Start Checklist

- [ ] Project folder created in `/Users/extrepa/Projects/`
- [ ] Core documentation files created (README, INDEX, PROJECT_STATUS)
- [ ] docs/index.md created
- [ ] Project initialized (npm, etc.)
- [ ] Added to PROJECTS_DASHBOARD.md
- [ ] Optional: Project management docs created

## Templates Reference

### Code Documentation
- `_Resources/_Templates/` - Core project templates
- `_Resources/_Templates/Documentation/` - All documentation templates

### Project Management (Optional)
- `_Resources/Vault/Templates/Projects/` - Project management templates

## Related Documentation

- [Project Integration Guide](Project-Integration-Guide.md) - Complete integration process
- [Project Integration Checklist](Project-Integration-Checklist.md) - Quick checklist
- [Template Usage Guide](../Reference/How-To-Use-Templates.md) - Which templates to use
