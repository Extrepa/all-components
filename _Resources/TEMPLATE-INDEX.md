# Template Index

**Location:** `_Resources/TEMPLATE-INDEX.md`  
**Purpose:** Complete index of all available templates in the Projects workspace

This document provides a comprehensive reference for all templates available in the workspace, organized by category and purpose.

## Template Systems

The workspace has three main template systems:

1. **Code Documentation Templates** - For technical code documentation (required)
2. **Project Management Templates** - For project planning and management (optional)
3. **Phase Templates** - For development phase documentation

## Code Documentation Templates

**Location:** `_Resources/_Templates/Documentation/`

### Core Documentation (Required)

#### Root Level Templates
- **README.md.template** → Project root `README.md`
  - Main project overview and documentation
  - Use for: Every project

- **INDEX.md.template** → Project root `INDEX.md`
  - Project index and structure overview
  - Use for: Projects with complex structure

- **PROJECT_STATUS.md.template** → Project root `PROJECT_STATUS.md`
  - Project status tracking
  - Use for: Every project

#### Documentation Directory Templates
- **docs-index.md.template** → `docs/index.md` or `docs/README.md`
  - Documentation index and navigation
  - Use for: Projects with multiple documentation files

- **architecture.md.template** → `docs/architecture.md`
  - System architecture documentation
  - Use for: Complex projects, Category A projects

- **project-structure.md.template** → `docs/project-structure.md`
  - File organization documentation
  - Use for: Projects with organized file structure

- **CHANGELOG.md.template** → Project root `CHANGELOG.md`
  - Version history
  - Use for: Versioned projects

- **completion-checklist.md.template** → `docs/completion-checklist.md`
  - Completion tracking checklist
  - Use for: Tracking project completion

### Guides

- **user-guide.md.template** → `docs/USER_GUIDE.md` or root `USER_GUIDE.md`
  - User documentation
  - Use for: User-facing projects

- **developer-guide.md.template** → `docs/DEVELOPER_GUIDE.md`
  - Developer documentation
  - Use for: All projects (recommended)

- **migration-guide.md.template** → `docs/migration-guides/MIGRATION_GUIDE_*.md`
  - Migration documentation
  - Use for: Documenting migrations

- **quick-start.md.template** → `docs/QUICK_START.md` or root `QUICK_START.md`
  - Quick start guide
  - Use for: Projects needing quick onboarding

- **troubleshooting.md.template** → `docs/troubleshooting.md`
  - Troubleshooting guide
  - Use for: Projects with common issues

### Reports

- **status-report.md.template** → `docs/status/STATUS_REPORT_*.md`
  - Status reports
  - Use for: Regular status updates

- **verification-report.md.template** → `docs/status/VERIFICATION_REPORT_*.md`
  - Verification reports
  - Use for: Verification documentation

- **analysis-report.md.template** → `docs/analysis/ANALYSIS_REPORT_*.md`
  - Analysis reports
  - Use for: Code reviews, project analysis

- **implementation-summary.md.template** → `docs/status/IMPLEMENTATION_SUMMARY_*.md`
  - Implementation summaries
  - Use for: Implementation documentation

### Planning

- **action-plan.md.template** → `docs/planning/ACTION_PLAN_*.md`
  - Action plans
  - Use for: Planning work phases

- **roadmap.md.template** → `docs/planning/ROADMAP_*.md`
  - Project roadmaps
  - Use for: Long-term planning

### Decisions

- **adr-template.md.template** → `docs/decisions/ADR-*.md`
  - Architecture Decision Records
  - Use for: Documenting architectural decisions

### Other

- **features.md.template** → `docs/features.md` or root `features.md`
  - Feature documentation
  - Use for: Feature-rich projects

- **CONTRIBUTING.md.template** → Project root `CONTRIBUTING.md`
  - Contribution guidelines
  - Use for: Open source or collaborative projects

## Project Management Templates (Optional)

**Location:** `_Resources/Vault/Templates/Projects/`

Use these only if you want separate project management documentation in `_Resources/Vault/Projects/Project-Name/`

- **Project-README-Template.md** → `_Resources/Vault/Projects/Project-Name/README.md`
  - Project management overview
  - Use for: Project management documentation

- **Specs-Template.md** → `_Resources/Vault/Projects/Project-Name/specs.md`
  - Technical specifications
  - Use for: Documenting requirements separately

- **Tasks-Template.md** → `_Resources/Vault/Projects/Project-Name/tasks.md`
  - Task tracking
  - Use for: Managing tasks separately

- **Versions-Template.md** → `_Resources/Vault/Projects/Project-Name/versions.md`
  - Version history
  - Use for: Tracking versions separately

- **Prompts-Template.md** → `_Resources/Vault/Projects/Project-Name/prompts.md`
  - AI prompts used
  - Use for: Documenting AI prompts separately

- **Build-Order-Template.md** → `_Resources/Vault/Projects/Project-Name/build-order.md`
  - Build sequence
  - Use for: Documenting build process separately

- **Asset-Spec-Template.md** → `_Resources/Vault/Projects/Project-Name/assets.md`
  - Asset documentation
  - Use for: Documenting assets separately

- **Technical-Architecture-Template.md** → `_Resources/Vault/Projects/Project-Name/technical-architecture.md`
  - System architecture (project management version)
  - Use for: Architecture docs in management system

- **File-Structure-Template.md** → `_Resources/Vault/Projects/Project-Name/file-structure.md`
  - File organization (project management version)
  - Use for: File structure docs in management system

## Phase Templates

**Location:** `_Resources/_Templates/Phases/`

Use these for documenting development phases in `docs/phases/[category]/`

- **PHASE_DOCUMENTATION_TEMPLATE.md** → `docs/phases/documentation/PHASE_*_DOCUMENTATION_*.md`
  - Documentation phases
  - Use for: Documenting documentation work

- **PHASE_BUILD_VERIFICATION_TEMPLATE.md** → `docs/phases/build-verification/PHASE_*_BUILD_*.md`
  - Build verification phases
  - Use for: Documenting build verification

- **PHASE_CODE_QUALITY_TEMPLATE.md** → `docs/phases/code-quality/PHASE_*_CODE_QUALITY_*.md`
  - Code quality phases
  - Use for: Documenting code quality work

- **PHASE_TEST_COVERAGE_TEMPLATE.md** → `docs/phases/test-coverage/PHASE_*_TEST_*.md`
  - Test coverage phases
  - Use for: Documenting test coverage work

- **PHASE_FEATURE_IMPLEMENTATION_TEMPLATE.md** → `docs/phases/features/PHASE_*_FEATURE_*.md`
  - Feature implementation phases
  - Use for: Documenting feature work

- **PHASE_RUNTIME_VERIFICATION_TEMPLATE.md** → `docs/phases/runtime/PHASE_*_RUNTIME_*.md`
  - Runtime verification phases
  - Use for: Documenting runtime verification

- **PHASE_PRODUCTION_READINESS_TEMPLATE.md** → `docs/phases/production/PHASE_*_PRODUCTION_*.md`
  - Production readiness phases
  - Use for: Documenting production readiness

## Quick Reference by Use Case

### New Project
1. **Code Documentation (Required):**
   - README.md.template
   - INDEX.md.template
   - PROJECT_STATUS.md.template
   - docs-index.md.template

2. **Technical Documentation (As Needed):**
   - architecture.md.template (if complex)
   - project-structure.md.template (if organized)
   - developer-guide.md.template (recommended)

3. **Optional Project Management:**
   - Project-README-Template.md
   - Specs-Template.md
   - Tasks-Template.md
   - Versions-Template.md

### Existing Project
1. Review current documentation
2. Compare with templates
3. Update to match template structure
4. Add missing documentation

### Phase Work
1. Choose appropriate phase template
2. Copy to `docs/phases/[category]/`
3. Fill in phase-specific information
4. Follow reference standards

### User-Facing Project
- user-guide.md.template
- quick-start.md.template
- troubleshooting.md.template

### Migration Work
- migration-guide.md.template

### Planning Work
- action-plan.md.template
- roadmap.md.template

### Decision Making
- adr-template.md.template

## Template Locations

### Code Documentation
- **Core:** `_Resources/_Templates/Documentation/Core/`
- **Guides:** `_Resources/_Templates/Documentation/Guides/`
- **Reports:** `_Resources/_Templates/Documentation/Reports/`
- **Planning:** `_Resources/_Templates/Documentation/Planning/`
- **Decisions:** `_Resources/_Templates/Documentation/Decisions/`
- **Other:** `_Resources/_Templates/Documentation/Other/`

### Project Management
- **Projects:** `_Resources/Vault/Templates/Projects/`

### Phases
- **Phases:** `_Resources/_Templates/Phases/`

## Reference Documentation

- [How to Use Templates](Vault/Reference/How-To-Use-Templates.md) - Detailed template usage guide
- [Documentation Types Reference](docs/phases/_references/DOCUMENTATION_TYPES_REFERENCE.md) - All document types
- [Documentation Standards](docs/phases/_references/DOCUMENTATION_STANDARDS.md) - Documentation requirements
- [Project Integration Guide](Vault/Projects/_System/Project-Integration-Guide.md) - Integration process

## Notes

- Code documentation templates are required for all projects
- Project management templates are optional
- Phase templates are for workspace-level phase documentation
- Use templates to maintain consistency across projects
- Customize templates for project-specific needs
