# Documentation Consolidation Guide

**Date:** 2026-01-09  
**Status:** Analysis Complete  
**Purpose:** Guide for consolidating duplicate documentation content across projects

## Common Documentation Patterns

### README.md Common Sections

Most projects follow similar README structure:

1. **Title & Badge** - Project name and status
2. **Overview** - Brief description
3. **Features** - Feature list
4. **Getting Started / Quick Start** - Installation and setup
5. **Project Structure** - Directory layout
6. **Documentation** - Links to docs
7. **License** - License information

### INDEX.md Common Sections

1. **Project Info** - Name, type, last updated
2. **Directory Structure** - File tree
3. **Key Directories** - Important folders
4. **Documentation Links** - Related docs

### PROJECT_STATUS.md Common Sections

1. **Status** - Current state
2. **What's Working** - Completed features
3. **What Needs Work** - Pending tasks
4. **Next Steps** - Planned work
5. **Completion Checklist** - Task list

## Duplicate Content Identified

### Installation Instructions
Many projects have similar installation patterns:
- `npm install`
- `npm run dev`
- Environment variable setup

**Consolidation Opportunity:** Create shared installation guide template

### Project Structure Documentation
Many projects document similar structures:
- `src/` - Source code
- `public/` - Public assets
- `docs/` - Documentation

**Consolidation Opportunity:** Use standardized structure template

### Getting Started Sections
Common patterns:
- Install dependencies
- Configure environment
- Run dev server

**Consolidation Opportunity:** Standardize getting started format

## Consolidation Strategy

### 1. Use Templates
- Apply `_Resources/_Templates/Documentation/` templates to projects (code documentation)
- Apply `_Resources/Vault/Templates/Projects/` templates for optional project management docs
- Customize project-specific sections
- Keep common sections consistent

### 2. Extract Common Content
- Create shared documentation snippets
- Reference shared content where appropriate
- Keep project-specific content local

### 3. Standardize Structure
- Ensure all projects have: README.md, INDEX.md, PROJECT_STATUS.md
- Use consistent section ordering
- Use consistent formatting

### 4. Two-Layer Documentation System
- **Code Documentation (Required):** Use templates from `_Resources/_Templates/Documentation/`
- **Project Management (Optional):** Use templates from `_Resources/Vault/Templates/Projects/` if using separate management docs

## Recommended Actions

### Immediate (High Priority)
1. ✅ Templates created in `_Resources/_Templates/`
2. ⏳ Apply templates to projects missing standard docs
3. ⏳ Standardize README structure across projects

### Incremental (Medium Priority)
1. Extract common installation instructions to shared guide
2. Create shared "Getting Started" template
3. Consolidate duplicate project structure docs

### Optional (Low Priority)
1. Create shared troubleshooting guide
2. Consolidate common FAQ sections
3. Create shared contribution guidelines

## Template Usage

### For New Projects

**Code Documentation (Required):**
1. Copy templates from `_Resources/_Templates/Documentation/`
2. Fill in project-specific information
3. Customize as needed

**Project Management (Optional):**
1. Copy templates from `_Resources/Vault/Templates/Projects/` if using separate management docs
2. Fill in project-specific information
3. Link to code project location

### For Existing Projects
1. Review current documentation
2. Compare with templates from `_Resources/_Templates/Documentation/`
3. Update to match template structure
4. Keep project-specific content
5. Optional: Add project management docs using `_Resources/Vault/Templates/Projects/`

## Common Sections to Standardize

### README.md
- Title format: `# Project Name`
- Overview: Brief 1-2 sentence description
- Features: Bullet list of key features
- Getting Started: Standard installation steps
- Project Structure: Link to INDEX.md or docs/project-structure.md
- Documentation: Links to docs/ directory

### INDEX.md
- Project metadata: Name, type, last updated
- Directory structure: File tree or link to docs
- Key directories: Important folders explained
- Documentation links: Related documentation

### PROJECT_STATUS.md
- Status: Current state (In Progress/Complete/Deprecated)
- Category: A/B/C classification
- What's Working: Completed features
- What Needs Work: Pending tasks
- Next Steps: Planned work
- Completion Checklist: Task list

## Notes

- Templates provide structure, not content
- Project-specific content should remain
- Common patterns can be referenced, not duplicated
- Documentation should be maintained incrementally

## Status

- ✅ Code documentation templates created in `_Resources/_Templates/Documentation/`
- ✅ Project management templates created in `_Resources/Vault/Templates/Projects/`
- ✅ Phase templates created in `_Resources/_Templates/Phases/`
- ✅ Common patterns identified
- ✅ Template index created at `_Resources/TEMPLATE-INDEX.md`
- ⏳ Template application (incremental)
- ⏳ Content consolidation (incremental)

## Template Systems

### Code Documentation Templates
**Location:** `_Resources/_Templates/Documentation/`
- Core documentation (README, INDEX, PROJECT_STATUS, docs-index)
- Technical documentation (architecture, project-structure)
- Guides (user-guide, developer-guide, migration-guide, quick-start, troubleshooting)
- Reports (status-report, verification-report, analysis-report, implementation-summary)
- Planning (action-plan, roadmap)
- Decisions (adr-template)
- Other (features, CONTRIBUTING)

### Project Management Templates (Optional)
**Location:** `_Resources/Vault/Templates/Projects/`
- Project-README-Template.md
- Specs-Template.md
- Tasks-Template.md
- Versions-Template.md
- Prompts-Template.md
- Build-Order-Template.md
- Asset-Spec-Template.md
- Technical-Architecture-Template.md
- File-Structure-Template.md

### Phase Templates
**Location:** `_Resources/_Templates/Phases/`
- PHASE_DOCUMENTATION_TEMPLATE.md
- PHASE_BUILD_VERIFICATION_TEMPLATE.md
- PHASE_CODE_QUALITY_TEMPLATE.md
- PHASE_TEST_COVERAGE_TEMPLATE.md
- PHASE_FEATURE_IMPLEMENTATION_TEMPLATE.md
- PHASE_RUNTIME_VERIFICATION_TEMPLATE.md
- PHASE_PRODUCTION_READINESS_TEMPLATE.md

## Related Documentation

- [Template Index](../../_Resources/TEMPLATE-INDEX.md) - Complete template reference
- [How to Use Templates](../../_Resources/Vault/Reference/How-To-Use-Templates.md) - Template selection guide
- [Project Integration Guide](../../_Resources/Vault/Projects/_System/Project-Integration-Guide.md) - Integration process
