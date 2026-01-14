# How to Use Templates

**Location:** `_Resources/Vault/Reference/`  
**Purpose:** Guide for selecting and using templates in the Projects workspace

This guide explains which templates to use, when to use them, and how they fit into the Projects workspace structure.

## Template Categories

The Projects workspace has two main template systems:

1. **Code Documentation Templates** - For technical code documentation
2. **Project Management Templates** - For project planning and management (optional)
3. **Phase Templates** - For development phase documentation

## 1. CODE DOCUMENTATION TEMPLATES

**Location:** `_Resources/_Templates/Documentation/`

Use these for all code projects in `/Users/extrepa/Projects/project-name/`

### Core Documentation (Required for All Projects)

**README.md.template**  
Use for: Main project README  
Location: Project root  
Template: `_Resources/_Templates/README.md.template`

**INDEX.md.template**  
Use for: Project index  
Location: Project root  
Template: `_Resources/_Templates/INDEX.md.template`

**PROJECT_STATUS.md.template**  
Use for: Project status tracking  
Location: Project root  
Template: `_Resources/_Templates/PROJECT_STATUS.md.template`

**docs-index.md.template**  
Use for: Documentation index  
Location: `docs/index.md` or `docs/README.md`  
Template: `_Resources/_Templates/Documentation/Core/docs-index.md.template`

### Technical Documentation (Recommended)

**architecture.md.template**  
Use for: System architecture documentation  
Location: `docs/architecture.md`  
Template: `_Resources/_Templates/Documentation/Core/architecture.md.template`  
When: Complex projects, Category A projects

**project-structure.md.template**  
Use for: File organization documentation  
Location: `docs/project-structure.md`  
Template: `_Resources/_Templates/Documentation/Core/project-structure.md.template`  
When: Projects with organized file structure

**developer-guide.md.template**  
Use for: Developer documentation  
Location: `docs/DEVELOPER_GUIDE.md`  
Template: `_Resources/_Templates/Documentation/Guides/developer-guide.md.template`  
When: All projects (recommended)

**user-guide.md.template**  
Use for: User documentation  
Location: `docs/USER_GUIDE.md` or root  
Template: `_Resources/_Templates/Documentation/Guides/user-guide.md.template`  
When: User-facing projects

**quick-start.md.template**  
Use for: Quick start guide  
Location: `docs/QUICK_START.md` or root  
Template: `_Resources/_Templates/Documentation/Guides/quick-start.md.template`  
When: Projects needing quick onboarding

**troubleshooting.md.template**  
Use for: Troubleshooting guide  
Location: `docs/troubleshooting.md`  
Template: `_Resources/_Templates/Documentation/Guides/troubleshooting.md.template`  
When: Projects with common issues

**migration-guide.md.template**  
Use for: Migration documentation  
Location: `docs/migration-guides/MIGRATION_GUIDE_*.md`  
Template: `_Resources/_Templates/Documentation/Guides/migration-guide.md.template`  
When: Documenting migrations

**CHANGELOG.md.template**  
Use for: Version history  
Location: Project root  
Template: `_Resources/_Templates/Documentation/Core/CHANGELOG.md.template`  
When: Versioned projects

## 2. PROJECT MANAGEMENT TEMPLATES (Optional)

**Location:** `_Resources/Vault/Templates/Projects/`

Use these if you want separate project management documentation in `_Resources/Vault/Projects/Project-Name/`

**Project-README-Template.md**  
Use for: Project management overview  
Location: `_Resources/Vault/Projects/Project-Name/README.md`  
When: Using separate project management docs

**Specs-Template.md**  
Use for: Technical specifications  
Location: `_Resources/Vault/Projects/Project-Name/specs.md`  
When: Documenting project requirements separately

**Tasks-Template.md**  
Use for: Task tracking  
Location: `_Resources/Vault/Projects/Project-Name/tasks.md`  
When: Managing tasks separately from code

**Versions-Template.md**  
Use for: Version history  
Location: `_Resources/Vault/Projects/Project-Name/versions.md`  
When: Tracking versions separately

**Prompts-Template.md**  
Use for: AI prompts used  
Location: `_Resources/Vault/Projects/Project-Name/prompts.md`  
When: Documenting AI prompts separately

**Build-Order-Template.md**  
Use for: Build sequence  
Location: `_Resources/Vault/Projects/Project-Name/build-order.md`  
When: Documenting build process separately

**Asset-Spec-Template.md**  
Use for: Asset documentation  
Location: `_Resources/Vault/Projects/Project-Name/assets.md`  
When: Documenting assets separately

**Technical-Architecture-Template.md**  
Use for: System architecture (project management version)  
Location: `_Resources/Vault/Projects/Project-Name/technical-architecture.md`  
When: Architecture docs in management system

**File-Structure-Template.md**  
Use for: File organization (project management version)  
Location: `_Resources/Vault/Projects/Project-Name/file-structure.md`  
When: File structure docs in management system

## 3. PHASE TEMPLATES

**Location:** `_Resources/_Templates/Phases/`

Use these for documenting development phases in `docs/phases/[category]/`

**PHASE_DOCUMENTATION_TEMPLATE.md**  
Use for: Documentation phases  
Location: `docs/phases/documentation/PHASE_*_DOCUMENTATION_*.md`  
When: Documenting documentation work

**PHASE_BUILD_VERIFICATION_TEMPLATE.md**  
Use for: Build verification phases  
Location: `docs/phases/build-verification/PHASE_*_BUILD_*.md`  
When: Documenting build verification

**PHASE_CODE_QUALITY_TEMPLATE.md**  
Use for: Code quality phases  
Location: `docs/phases/code-quality/PHASE_*_CODE_QUALITY_*.md`  
When: Documenting code quality work

**PHASE_TEST_COVERAGE_TEMPLATE.md**  
Use for: Test coverage phases  
Location: `docs/phases/test-coverage/PHASE_*_TEST_*.md`  
When: Documenting test coverage work

**PHASE_FEATURE_IMPLEMENTATION_TEMPLATE.md**  
Use for: Feature implementation phases  
Location: `docs/phases/features/PHASE_*_FEATURE_*.md`  
When: Documenting feature work

**PHASE_RUNTIME_VERIFICATION_TEMPLATE.md**  
Use for: Runtime verification phases  
Location: `docs/phases/runtime/PHASE_*_RUNTIME_*.md`  
When: Documenting runtime verification

**PHASE_PRODUCTION_READINESS_TEMPLATE.md**  
Use for: Production readiness phases  
Location: `docs/phases/production/PHASE_*_PRODUCTION_*.md`  
When: Documenting production readiness

## 4. WORKSPACE-LEVEL TEMPLATES

**Location:** `_Resources/_Templates/Documentation/Reports/`, `_Resources/_Templates/Documentation/Planning/`, etc.

Use these for workspace-level documentation in `docs/`

**status-report.md.template**  
Use for: Status reports  
Location: `docs/status/STATUS_REPORT_*.md`  
When: Creating status reports

**verification-report.md.template**  
Use for: Verification reports  
Location: `docs/status/VERIFICATION_REPORT_*.md`  
When: Creating verification reports

**analysis-report.md.template**  
Use for: Analysis reports  
Location: `docs/analysis/ANALYSIS_REPORT_*.md`  
When: Creating analysis reports

**action-plan.md.template**  
Use for: Action plans  
Location: `docs/planning/ACTION_PLAN_*.md`  
When: Creating action plans

**roadmap.md.template**  
Use for: Roadmaps  
Location: `docs/planning/ROADMAP_*.md`  
When: Creating roadmaps

**adr-template.md.template**  
Use for: Architecture Decision Records  
Location: `docs/decisions/ADR-*.md`  
When: Documenting architectural decisions

## Template Selection Guide

### For New Projects

1. **Start with core documentation:**
   - README.md (from template)
   - INDEX.md (from template)
   - PROJECT_STATUS.md (from template)
   - docs/index.md (from template)

2. **Add technical documentation as needed:**
   - architecture.md (if complex)
   - project-structure.md (if organized)
   - DEVELOPER_GUIDE.md (recommended)

3. **Add user documentation if user-facing:**
   - USER_GUIDE.md
   - QUICK_START.md

4. **Optional: Add project management docs:**
   - Use templates from `_Resources/Vault/Templates/Projects/`
   - Only if you want separate planning/management docs

### For Existing Projects

1. **Review current documentation**
2. **Compare with templates**
3. **Update to match template structure**
4. **Add missing documentation**

### For Phase Work

1. **Choose appropriate phase template**
2. **Copy to `docs/phases/[category]/`**
3. **Fill in phase-specific information**
4. **Follow reference standards from `docs/phases/_references/`**

## Quick Reference

### By Purpose
- **Project Overview:** README.md, INDEX.md, PROJECT_STATUS.md
- **Technical Docs:** architecture.md, project-structure.md
- **User Docs:** USER_GUIDE.md, QUICK_START.md, troubleshooting.md
- **Developer Docs:** DEVELOPER_GUIDE.md
- **Planning:** Project management templates (optional)
- **Phases:** Phase templates
- **Reports:** Report templates
- **Decisions:** ADR template

### By Location
- **Project Root:** README.md, INDEX.md, PROJECT_STATUS.md, CHANGELOG.md
- **docs/:** All technical and user documentation
- **docs/phases/:** Phase documentation
- **_Resources/Vault/Projects/:** Project management docs (optional)

## Related Documentation

- [Template Index](../../TEMPLATE-INDEX.md) - Complete template reference
- [Documentation Types Reference](../../../docs/phases/_references/DOCUMENTATION_TYPES_REFERENCE.md) - All document types
- [Project Integration Guide](../Projects/_System/Project-Integration-Guide.md) - Integration process
- [Documentation Standards](../../../docs/phases/_references/DOCUMENTATION_STANDARDS.md) - Documentation requirements
