# Documentation Templates

**Location:** `_Resources/_Templates/`  
**Purpose:** Reusable templates for all types of project documentation

This directory contains templates for creating consistent documentation across all projects. Use these templates as starting points and customize them for your specific project needs.

## Template Categories

### Core Documentation Templates
Located in `Documentation/Core/`:

- **README.md.template** - Main project README
- **INDEX.md.template** - Project index
- **PROJECT_STATUS.md.template** - Project status tracking
- **architecture.md.template** - Architecture documentation
- **project-structure.md.template** - Project structure documentation
- **docs-index.md.template** - Documentation index (docs/index.md or docs/README.md)
- **CHANGELOG.md.template** - Version history
- **completion-checklist.md.template** - Completion tracking checklist

### Guide Templates
Located in `Documentation/Guides/`:

- **user-guide.md.template** - User documentation
- **developer-guide.md.template** - Developer documentation
- **migration-guide.md.template** - Migration guides
- **quick-start.md.template** - Quick start guide
- **troubleshooting.md.template** - Troubleshooting guide

### Report Templates
Located in `Documentation/Reports/`:

- **status-report.md.template** - Status reports
- **verification-report.md.template** - Verification reports
- **analysis-report.md.template** - Analysis reports
- **implementation-summary.md.template** - Implementation summaries

### Decision Templates
Located in `Documentation/Decisions/`:

- **adr-template.md.template** - Architecture Decision Records (ADRs)

### Planning Templates
Located in `Documentation/Planning/`:

- **action-plan.md.template** - Action plans
- **roadmap.md.template** - Project roadmaps

### Other Templates
Located in `Documentation/Other/`:

- **features.md.template** - Feature documentation
- **CONTRIBUTING.md.template** - Contribution guidelines

### Phase Templates
Located in `Phases/`:

- **PHASE_DOCUMENTATION_TEMPLATE.md** - Documentation phases
- **PHASE_BUILD_VERIFICATION_TEMPLATE.md** - Build verification phases
- **PHASE_CODE_QUALITY_TEMPLATE.md** - Code quality phases
- **PHASE_TEST_COVERAGE_TEMPLATE.md** - Test coverage phases
- **PHASE_FEATURE_IMPLEMENTATION_TEMPLATE.md** - Feature implementation phases
- **PHASE_RUNTIME_VERIFICATION_TEMPLATE.md** - Runtime verification phases
- **PHASE_PRODUCTION_READINESS_TEMPLATE.md** - Production readiness phases

### Project Management Templates (Optional)
Located in `../Vault/Templates/Projects/`:

- **Project-README-Template.md** - Project management overview
- **Specs-Template.md** - Technical specifications
- **Tasks-Template.md** - Task tracking
- **Versions-Template.md** - Version history
- **Prompts-Template.md** - AI prompts
- **Build-Order-Template.md** - Build sequence
- **Asset-Spec-Template.md** - Asset documentation
- **Technical-Architecture-Template.md** - System architecture (management version)
- **File-Structure-Template.md** - File organization (management version)

**Note:** These are for optional project management documentation separate from code. Most projects only need code documentation templates.

## Using Templates

### For New Projects

1. **Copy appropriate template** to your project
2. **Remove `.template` extension** from filename
3. **Fill in project-specific information**
4. **Customize sections** as needed
5. **Remove placeholder sections** that don't apply

### For Existing Projects

1. **Review current documentation**
2. **Compare with template structure**
3. **Update to match template format**
4. **Keep project-specific content**
5. **Add missing sections** from template

## Template Structure

All templates follow consistent patterns:

- **Header** - Project name, date, status
- **Overview** - Brief description
- **Main Content** - Organized sections
- **Related Documentation** - Links to other docs
- **Notes** - Additional information

## Customization Guidelines

### Required Sections
- Keep all sections marked as required
- Fill in all placeholders

### Optional Sections
- Remove sections that don't apply
- Add project-specific sections as needed

### Formatting
- Maintain consistent formatting
- Use proper markdown syntax
- Follow project style guide

## Reference Documentation

For standards and best practices, see:
- [Phase Reference Files](../../docs/phases/_references/) - Phase work standards
- [Documentation Standards](../../docs/phases/_references/DOCUMENTATION_STANDARDS.md) - Documentation requirements
- [Code Quality Standards](../../docs/phases/_references/CODE_QUALITY_STANDARDS.md) - Code quality criteria
- [Template Index](../TEMPLATE-INDEX.md) - Complete template reference
- [How to Use Templates](../Vault/Reference/How-To-Use-Templates.md) - Template selection guide
- [Project Integration Guide](../Vault/Projects/_System/Project-Integration-Guide.md) - Integration process

## Template Maintenance

Templates are living documents:
- Update based on lessons learned
- Add new templates as needed
- Keep templates current with best practices
- Share improvements across projects

## Quick Reference

### Most Used Templates
- `README.md.template` - Every project needs this
- `PROJECT_STATUS.md.template` - Track project status
- `architecture.md.template` - Document system design
- `developer-guide.md.template` - Help developers get started

### By Document Type
- **Project Overview:** README.md, INDEX.md, PROJECT_STATUS.md
- **Technical Docs:** architecture.md, project-structure.md
- **User Docs:** user-guide.md, quick-start.md, troubleshooting.md
- **Developer Docs:** developer-guide.md, CONTRIBUTING.md
- **Planning:** action-plan.md, roadmap.md
- **Reports:** status-report.md, verification-report.md
- **Decisions:** adr-template.md

## Notes

- Templates provide structure, not content
- Customize for your project's needs
- Keep documentation up to date
- Use templates to maintain consistency
