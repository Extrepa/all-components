# How to Use Project Management System

**Location:** `_Resources/Vault/Reference/`  
**Purpose:** Guide for using project management templates and workflows in the Projects workspace

> **Note:** This is adapted from the vault system for use within the Projects workspace.  
> This guide focuses on project management aspects relevant to code projects.

## Overview

The Projects workspace supports two documentation layers:

1. **Code Documentation** - Technical documentation in code projects (`/Users/extrepa/Projects/project-name/`)
2. **Project Management** - Optional planning/management docs (`_Resources/Vault/Projects/Project-Name/`)

## Project Workflow

### Starting a New Project

#### Step 1: Create Code Project
1. Create project folder: `/Users/extrepa/Projects/project-name/`
2. Initialize project (npm init, etc.)
3. Create core documentation using code templates:
   - `_Resources/_Templates/README.md.template` → `README.md`
   - `_Resources/_Templates/INDEX.md.template` → `INDEX.md`
   - `_Resources/_Templates/PROJECT_STATUS.md.template` → `PROJECT_STATUS.md`
   - `_Resources/_Templates/Documentation/Core/docs-index.md.template` → `docs/index.md`

#### Step 2: Optional Project Management Docs
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

#### Step 3: Integrate into Workspace
1. Add project to `PROJECTS_DASHBOARD.md` in workspace root
2. Link code location: `/Users/extrepa/Projects/project-name`
3. Link between code and management docs (if using both)

### Working on Existing Projects

1. **Open Code Project**
   - Location: `/Users/extrepa/Projects/project-name/`
   - Start with `README.md` for overview
   - Check `PROJECT_STATUS.md` for current status
   - Review `docs/` for detailed documentation

2. **Check Tasks** (if using management docs)
   - Location: `_Resources/Vault/Projects/Project-Name/tasks.md`
   - See what needs to be done
   - Mark tasks complete as you finish them

3. **Update Documentation**
   - Update code `PROJECT_STATUS.md` as work progresses
   - Update management `tasks.md` if using separate docs
   - Update `versions.md` when making significant changes

## Template Usage

### Code Documentation Templates
**Location:** `_Resources/_Templates/Documentation/`

Use for all technical documentation in code projects.

**Required:**
- README.md, INDEX.md, PROJECT_STATUS.md, docs/index.md

**Recommended:**
- docs/architecture.md (complex projects)
- docs/project-structure.md (organized projects)
- docs/DEVELOPER_GUIDE.md (all projects)

### Project Management Templates (Optional)
**Location:** `_Resources/Vault/Templates/Projects/`

Use only if you want separate project management documentation.

**Available:**
- Project-README-Template.md
- Specs-Template.md
- Tasks-Template.md
- Versions-Template.md
- Prompts-Template.md
- Build-Order-Template.md
- Asset-Spec-Template.md

### Phase Templates
**Location:** `_Resources/_Templates/Phases/`

Use for documenting development phases in `docs/phases/`.

**Available:**
- PHASE_DOCUMENTATION_TEMPLATE.md
- PHASE_BUILD_VERIFICATION_TEMPLATE.md
- PHASE_CODE_QUALITY_TEMPLATE.md
- PHASE_TEST_COVERAGE_TEMPLATE.md
- PHASE_FEATURE_IMPLEMENTATION_TEMPLATE.md
- PHASE_RUNTIME_VERIFICATION_TEMPLATE.md
- PHASE_PRODUCTION_READINESS_TEMPLATE.md

## File Organization

### Code Projects
**Location:** `/Users/extrepa/Projects/project-name/`

**Structure:**
```
project-name/
├── README.md
├── INDEX.md
├── PROJECT_STATUS.md
├── src/ (or source code)
├── docs/
│   ├── index.md
│   ├── architecture.md (if complex)
│   └── ...
└── ...
```

### Project Management (Optional)
**Location:** `_Resources/Vault/Projects/Project-Name/`

**Structure:**
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

## Naming Conventions

### Code Project Folders
- **Format:** `project-name` (lowercase, hyphenated)
- **Examples:** `errl-portal`, `figma-clone-engine`

### Project Management Folders (Optional)
- **Format:** `Project-Name` (title case, hyphenated)
- **Examples:** `Errl-Portal`, `Figma-Clone-Engine`

## Linking Systems

### Code → Management
In code `README.md`:
```markdown
## Project Management
- [Project Management Docs](../../_Resources/Vault/Projects/Project-Name/README.md) (if applicable)
```

### Management → Code
In management `README.md`:
```markdown
## Code Location
- **Code:** `/Users/extrepa/Projects/project-name`
- [Code README](../../../project-name/README.md)
- [Code Documentation](../../../project-name/docs/)
```

## Quick Reference

### Template Selection
- **Code docs:** Use `_Resources/_Templates/Documentation/`
- **Project management:** Use `_Resources/Vault/Templates/Projects/` (optional)
- **Phases:** Use `_Resources/_Templates/Phases/`

### Integration
- **Code projects:** Required - all projects need code documentation
- **Management docs:** Optional - only if you want separate planning docs
- **Workspace integration:** Add to PROJECTS_DASHBOARD.md

## Related Documentation

- [How to Use Templates](How-To-Use-Templates.md) - Template selection guide
- [Project Integration Guide](../Projects/_System/Project-Integration-Guide.md) - Integration process
- [Template Index](../../TEMPLATE-INDEX.md) - All available templates
- [Documentation Standards](../../../docs/phases/_references/DOCUMENTATION_STANDARDS.md) - Documentation requirements
