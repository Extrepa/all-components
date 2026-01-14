# Project Integration Guide

**Purpose:** Standardize the process of adding new projects and ensuring they're discoverable throughout the workspace  
**Location:** `_Resources/Vault/Projects/_System/`  
**Based on:** Integration work completed for Errl FX Lab (December 2024)

## Overview

This guide helps integrate new projects into the Projects workspace ecosystem. Projects exist in two layers:

1. **Code Projects** (`/Users/extrepa/Projects/project-name/`) - Technical code and documentation
2. **Project Management** (`_Resources/Vault/Projects/Project-Name/`) - Planning, tasks, versions (optional)

## Integration Checklist

### Phase 1: Code Project Documentation

Create project folder in `/Users/extrepa/Projects/project-name/` and add core documentation:

- [ ] `README.md` - Project overview (use `_Resources/_Templates/README.md.template`)
- [ ] `INDEX.md` - Project index (use `_Resources/_Templates/INDEX.md.template`)
- [ ] `PROJECT_STATUS.md` - Project status (use `_Resources/_Templates/PROJECT_STATUS.md.template`)
- [ ] `docs/index.md` - Documentation index (use `_Resources/_Templates/Documentation/Core/docs-index.md.template`)
- [ ] `docs/architecture.md` - Architecture documentation (if complex, use `_Resources/_Templates/Documentation/Core/architecture.md.template`)
- [ ] `docs/project-structure.md` - Project structure (if organized, use `_Resources/_Templates/Documentation/Core/project-structure.md.template`)
- [ ] `docs/DEVELOPER_GUIDE.md` - Developer guide (use `_Resources/_Templates/Documentation/Guides/developer-guide.md.template`)

**Code Documentation Templates:**
- `_Resources/_Templates/README.md.template` - Main project README
- `_Resources/_Templates/INDEX.md.template` - Project index
- `_Resources/_Templates/PROJECT_STATUS.md.template` - Project status
- `_Resources/_Templates/Documentation/Core/` - Core documentation templates (architecture, project-structure, docs-index, CHANGELOG, completion-checklist)
- `_Resources/_Templates/Documentation/Guides/` - Guide templates (user-guide, developer-guide, migration-guide, quick-start, troubleshooting)

### Phase 2: Project Management Documentation (Optional)

If you want project management documentation separate from code:

Create folder in `_Resources/Vault/Projects/Project-Name/` and add:

- [ ] `README.md` - Project management overview (use `_Resources/Vault/Templates/Projects/Project-README-Template.md`)
- [ ] `specs.md` - Technical specifications (use `_Resources/Vault/Templates/Projects/Specs-Template.md`)
- [ ] `tasks.md` - Task tracking (use `_Resources/Vault/Templates/Projects/Tasks-Template.md`)
- [ ] `versions.md` - Version history (use `_Resources/Vault/Templates/Projects/Versions-Template.md`)
- [ ] `prompts.md` - AI prompts used (use `_Resources/Vault/Templates/Projects/Prompts-Template.md`)
- [ ] `build-order.md` - Build sequence (use `_Resources/Vault/Templates/Projects/Build-Order-Template.md`)
- [ ] `assets.md` - Asset documentation (use `_Resources/Vault/Templates/Projects/Asset-Spec-Template.md`)

**Project Management Templates:**
- `_Resources/Vault/Templates/Projects/Project-README-Template.md`
- `_Resources/Vault/Templates/Projects/Specs-Template.md`
- `_Resources/Vault/Templates/Projects/Tasks-Template.md`
- `_Resources/Vault/Templates/Projects/Versions-Template.md`
- `_Resources/Vault/Templates/Projects/Prompts-Template.md`
- `_Resources/Vault/Templates/Projects/Build-Order-Template.md`
- `_Resources/Vault/Templates/Projects/Asset-Spec-Template.md`

### Phase 3: Workspace Integration

- [ ] Add project to `PROJECTS_DASHBOARD.md` in workspace root
- [ ] Update project status in dashboard
- [ ] Link to code location: `/Users/extrepa/Projects/project-name`
- [ ] Link to documentation: `project-name/README.md`

**Example:**
```markdown
| Project Name | Status | Category | Code Location | Links |
|--------------|--------|----------|---------------|-------|
| project-name | Active | B | `/Users/extrepa/Projects/project-name` | [README](project-name/README.md) |
```

## Naming Conventions

### Code Project Folders
- **Format:** `project-name` (lowercase, hyphenated)
- **Examples:** 
  - `errl-portal`
  - `figma-clone-engine`
  - `multi-tool-app`
- **Avoid:** 
  - Spaces: `errl portal`
  - Underscores: `errl_portal` (unless existing)
  - camelCase: `errlPortal`

### Project Management Folders (Optional)
- **Format:** `Project-Name` (title case, hyphenated)
- **Examples:**
  - `Errl-Portal`
  - `Figma-Clone-Engine`
- **Note:** Only needed if using separate project management docs

## Documentation Standards

### Required for All Projects
- `README.md` - Project overview
- `INDEX.md` - Project index
- `PROJECT_STATUS.md` - Current status
- `docs/index.md` - Documentation navigation

### Recommended by Category

**Category A (Extensive Documentation):**
- `docs/architecture.md`
- `docs/project-structure.md`
- `docs/DEVELOPER_GUIDE.md`
- `CHANGELOG.md` (if versioned)

**Category B (Moderate Documentation):**
- `docs/architecture.md` (if complex)
- `docs/DEVELOPER_GUIDE.md`

**Category C (Basic Documentation):**
- Basic `docs/` structure

**Category D (Minimal Documentation):**
- Core files only

## Cross-References

### Linking Code and Management Docs

If using both systems:

**In Code README.md:**
```markdown
## Project Management
- [Project Management Docs](../../_Resources/Vault/Projects/Project-Name/README.md) (if applicable)
```

**In Management README.md:**
```markdown
## Code Location
- **Code:** `/Users/extrepa/Projects/project-name`
- [Code README](../../../project-name/README.md)
- [Code Documentation](../../../project-name/docs/)
```

## Integration Examples

### Example 1: Code-Only Project

**Project:** Simple utility tool

**Integration:**
1. Create code project in `/Users/extrepa/Projects/tool-name/`
2. Add core documentation (README, INDEX, PROJECT_STATUS)
3. Add to PROJECTS_DASHBOARD.md
4. Done - no separate management docs needed

### Example 2: Complex Project with Management

**Project:** Large application with planning needs

**Integration:**
1. Create code project in `/Users/extrepa/Projects/app-name/`
2. Add full code documentation suite
3. Create management docs in `_Resources/Vault/Projects/App-Name/`
4. Link between systems
5. Add to PROJECTS_DASHBOARD.md

## Quick Reference

### Code Documentation Templates
- `_Resources/_Templates/README.md.template`
- `_Resources/_Templates/INDEX.md.template`
- `_Resources/_Templates/PROJECT_STATUS.md.template`
- `_Resources/_Templates/Documentation/` - All documentation templates

### Project Management Templates (Optional)
- `_Resources/Vault/Templates/Projects/` - Project management templates

### Integration Points
- `PROJECTS_DASHBOARD.md` - Main project index (workspace root)
- `docs/` - Workspace-level documentation

## Related Documentation

- [Project Bootstrap](Project-Bootstrap.md) - Creating new projects
- [Project Documentation Audit](Project-Documentation-Audit.md) - Documentation completeness
- [Project Integration Checklist](Project-Integration-Checklist.md) - Quick checklist
- [Template Usage Guide](../Reference/How-To-Use-Templates.md) - Template selection guide

## Notes

- Code documentation is required for all projects
- Project management docs are optional
- Use templates to maintain consistency
- Keep code and management docs synchronized if using both
