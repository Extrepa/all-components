# Vault Information System

**Location:** `_Resources/Vault/`  
**Purpose:** Project management and planning documentation system (optional)

This directory contains information copied from ErrlVault (`/Users/extrepa/Documents/ErrlVault/`) and adapted for use within the Projects workspace. All information is self-contained and accessible without leaving the workspace.

## Overview

The Vault information system provides:

1. **Project Management Templates** - For optional project planning/management documentation
2. **Project Integration Guides** - For integrating projects into the workspace
3. **Reference Guides** - For using templates and managing projects

## Directory Structure

```
_Resources/Vault/
├── README.md (this file)
├── Projects/
│   ├── README.md
│   └── _System/
│       ├── Project-Integration-Guide.md
│       ├── Project-Documentation-Audit.md
│       ├── Project-Bootstrap.md
│       ├── Project-Completion-Assessment.md
│       └── Project-Integration-Checklist.md
├── Templates/
│   └── Projects/
│       ├── Project-README-Template.md
│       ├── Specs-Template.md
│       ├── Tasks-Template.md
│       ├── Versions-Template.md
│       ├── Prompts-Template.md
│       ├── Build-Order-Template.md
│       ├── Asset-Spec-Template.md
│       ├── Technical-Architecture-Template.md
│       └── File-Structure-Template.md
└── Reference/
    ├── How-To-Use-Templates.md
    ├── How-To-Use-The-Vault.md
    └── Project-Code-Locations.md
```

## Two-Layer Documentation System

### Layer 1: Code Documentation (Required)
**Location:** `/Users/extrepa/Projects/project-name/`

All projects must have code documentation:
- README.md, INDEX.md, PROJECT_STATUS.md
- docs/index.md
- Additional docs as needed

**Templates:** `_Resources/_Templates/Documentation/`

### Layer 2: Project Management (Optional)
**Location:** `_Resources/Vault/Projects/Project-Name/`

Optional project management documentation:
- Planning, tasks, versions, prompts
- Separate from code documentation

**Templates:** `_Resources/Vault/Templates/Projects/`

## When to Use

### Code Documentation Templates
**Always use for:**
- All code projects
- Technical documentation
- Developer guides
- User guides

**Location:** `_Resources/_Templates/Documentation/`

### Project Management Templates
**Use optionally for:**
- Separate project planning docs
- Task management separate from code
- Version tracking separate from code

**Location:** `_Resources/Vault/Templates/Projects/`

**Note:** Most projects only need code documentation. Project management templates are for cases where you want separate planning/management documentation.

## Quick Start

### For New Projects

1. **Create code project** in `/Users/extrepa/Projects/project-name/`
2. **Use code documentation templates:**
   - README.md.template → README.md
   - INDEX.md.template → INDEX.md
   - PROJECT_STATUS.md.template → PROJECT_STATUS.md
   - docs-index.md.template → docs/index.md

3. **Optional: Create project management docs** in `_Resources/Vault/Projects/Project-Name/`
   - Use templates from `_Resources/Vault/Templates/Projects/`

4. **Integrate into workspace:**
   - Add to PROJECTS_DASHBOARD.md
   - Link code and management docs (if using both)

### For Existing Projects

1. **Review current documentation**
2. **Update to use templates**
3. **Add missing documentation**
4. **Optional: Add project management docs**

## Key Files

### Integration Guides
- [Project Integration Guide](Projects/_System/Project-Integration-Guide.md) - Complete integration process
- [Project Bootstrap](Projects/_System/Project-Bootstrap.md) - Creating new projects
- [Project Integration Checklist](Projects/_System/Project-Integration-Checklist.md) - Quick checklist

### Reference Guides
- [How to Use Templates](Reference/How-To-Use-Templates.md) - Template selection guide
- [Project Code Locations](Reference/Project-Code-Locations.md) - Code location mappings
- [Vault Usage Guide](Reference/How-To-Use-The-Vault.md) - Project management workflows

### Templates
- [Project Management Templates](Templates/Projects/) - Planning/management templates
- [Code Documentation Templates](../../_Templates/Documentation/) - Technical documentation templates
- [Phase Templates](../../_Templates/Phases/) - Development phase templates

## Related Documentation

- [Template Index](../../TEMPLATE-INDEX.md) - Complete template reference
- [PROJECTS_DASHBOARD](../../PROJECTS_DASHBOARD.md) - Workspace project dashboard
- [Documentation Standards](../../docs/phases/_references/DOCUMENTATION_STANDARDS.md) - Documentation requirements
- [Documentation Types Reference](../../docs/phases/_references/DOCUMENTATION_TYPES_REFERENCE.md) - All document types

## Notes

- All information is self-contained within the Projects workspace
- Code documentation is required for all projects
- Project management docs are optional
- Templates maintain consistency across projects
- Adapt templates for project-specific needs
