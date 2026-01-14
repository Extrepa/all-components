# Documentation Types Reference

**Purpose:** Comprehensive reference for all documentation types used across projects.

This document catalogs all types of markdown documentation files and when to use each type.

## Core Documentation

### README.md
**Purpose:** Main project entry point and overview  
**Location:** Project root  
**When to Use:** Every project needs a README  
**Template:** `_Resources/_Templates/README.md.template`

**Key Sections:**
- Project title and description
- Features
- Getting started
- Installation
- Usage
- Documentation links
- License

### INDEX.md
**Purpose:** Project index and structure overview  
**Location:** Project root  
**When to Use:** For projects with complex structure  
**Template:** `_Resources/_Templates/INDEX.md.template`

**Key Sections:**
- Project metadata
- Directory structure
- Key directories
- Documentation links

### PROJECT_STATUS.md
**Purpose:** Track project status and progress  
**Location:** Project root  
**When to Use:** All projects should have this  
**Template:** `_Resources/_Templates/PROJECT_STATUS.md.template`

**Key Sections:**
- Current status
- What's working
- What needs work
- Next steps
- Completion checklist

## Technical Documentation

### architecture.md
**Purpose:** Document system architecture and design  
**Location:** `docs/architecture.md`  
**When to Use:** For projects with significant architecture  
**Template:** `_Resources/_Templates/Documentation/Core/architecture.md.template`

**Key Sections:**
- Technology stack
- System components
- Design decisions
- Data flow
- API structure

### project-structure.md
**Purpose:** Document file organization and structure  
**Location:** `docs/project-structure.md`  
**When to Use:** For projects with complex file organization  
**Template:** `_Resources/_Templates/Documentation/Core/project-structure.md.template`

**Key Sections:**
- Directory structure
- File organization
- Naming conventions
- Import/export structure

### docs/index.md or docs/README.md
**Purpose:** Documentation index and navigation  
**Location:** `docs/index.md` or `docs/README.md`  
**When to Use:** Projects with multiple documentation files  
**Template:** `_Resources/_Templates/Documentation/Core/docs-index.md.template`

**Key Sections:**
- Documentation structure
- Quick links
- Finding what you need

## User Documentation

### USER_GUIDE.md
**Purpose:** Comprehensive user documentation  
**Location:** Project root or `docs/USER_GUIDE.md`  
**When to Use:** For user-facing projects  
**Template:** `_Resources/_Templates/Documentation/Guides/user-guide.md.template`

**Key Sections:**
- Getting started
- Features
- Workflows
- Configuration
- Troubleshooting
- FAQ

### QUICK_START.md
**Purpose:** Quick start guide for new users  
**Location:** Project root or `docs/QUICK_START.md`  
**When to Use:** For projects that need quick onboarding  
**Template:** `_Resources/_Templates/Documentation/Guides/quick-start.md.template`

**Key Sections:**
- Installation
- Basic usage
- First steps
- Example

## Developer Documentation

### DEVELOPER_GUIDE.md
**Purpose:** Developer setup and contribution guide  
**Location:** Project root or `docs/DEVELOPER_GUIDE.md`  
**When to Use:** For projects with contributors  
**Template:** `_Resources/_Templates/Documentation/Guides/developer-guide.md.template`

**Key Sections:**
- Development setup
- Project structure
- Development workflow
- Testing
- Building
- Debugging
- Contributing

### CONTRIBUTING.md
**Purpose:** Contribution guidelines  
**Location:** Project root  
**When to Use:** Open source or collaborative projects  
**Template:** `_Resources/_Templates/Documentation/Other/CONTRIBUTING.md.template`

**Key Sections:**
- Getting started
- Contribution guidelines
- Development workflow
- Testing requirements

## Migration Documentation

### MIGRATION_GUIDE_*.md
**Purpose:** Step-by-step migration guides  
**Location:** `docs/migration-guides/`  
**When to Use:** When migrating between versions or systems  
**Template:** `_Resources/_Templates/Documentation/Guides/migration-guide.md.template`

**Key Sections:**
- Overview
- Current state analysis
- Migration steps
- Code examples
- Testing checklist
- Rollback procedures

## Reports

### STATUS_REPORT.md
**Purpose:** Project status and progress reports  
**Location:** `docs/status/` or project root  
**When to Use:** Regular status updates  
**Template:** `_Resources/_Templates/Documentation/Reports/status-report.md.template`

**Key Sections:**
- Executive summary
- Current status
- Recent accomplishments
- Next steps
- Risks and issues

### VERIFICATION_REPORT.md
**Purpose:** Verification and testing reports  
**Location:** `docs/status/` or project root  
**When to Use:** After verification/testing phases  
**Template:** `_Resources/_Templates/Documentation/Reports/verification-report.md.template`

**Key Sections:**
- Verification scope
- Results
- Test results
- Performance metrics
- Issues found
- Recommendations

### ANALYSIS_REPORT.md
**Purpose:** Analysis and assessment reports  
**Location:** `docs/analysis/`  
**When to Use:** For code reviews, project analysis  
**Template:** `_Resources/_Templates/Documentation/Reports/analysis-report.md.template`

**Key Sections:**
- Analysis objectives
- Methodology
- Findings
- Data analysis
- Recommendations

### IMPLEMENTATION_SUMMARY.md
**Purpose:** Summary of implementation work  
**Location:** `docs/status/` or project root  
**When to Use:** After completing implementation work  
**Template:** `_Resources/_Templates/Documentation/Reports/implementation-summary.md.template`

**Key Sections:**
- Overview
- Implementation details
- Technical details
- Testing
- Verification

## Decision Records

### ADR-*.md (Architecture Decision Records)
**Purpose:** Document important architectural decisions  
**Location:** `docs/decisions/`  
**When to Use:** For significant technical decisions  
**Template:** `_Resources/_Templates/Documentation/Decisions/adr-template.md.template`

**Key Sections:**
- Context
- Decision
- Consequences
- Alternatives considered
- Implementation

## Planning Documents

### ACTION_PLAN.md
**Purpose:** Action plans and task breakdowns  
**Location:** `docs/planning/` or project root  
**When to Use:** For planning work phases  
**Template:** `_Resources/_Templates/Documentation/Planning/action-plan.md.template`

**Key Sections:**
- Overview
- Objectives
- Priority order
- Implementation strategy
- Timeline
- Risks and mitigation

### ROADMAP.md
**Purpose:** Project roadmap and future plans  
**Location:** `docs/planning/` or project root  
**When to Use:** For long-term planning  
**Template:** `_Resources/_Templates/Documentation/Planning/roadmap.md.template`

**Key Sections:**
- Overview
- Roadmap timeline
- Feature categories
- Milestones
- Dependencies

## Other Documentation

### CHANGELOG.md
**Purpose:** Version history and changes  
**Location:** Project root  
**When to Use:** For versioned projects  
**Template:** `_Resources/_Templates/Documentation/Core/CHANGELOG.md.template`

**Key Sections:**
- Version history
- Changes by version
- Added/Changed/Deprecated/Removed/Fixed

### features.md
**Purpose:** Feature documentation  
**Location:** `docs/features.md` or project root  
**When to Use:** For feature-rich projects  
**Template:** `_Resources/_Templates/Documentation/Other/features.md.template`

**Key Sections:**
- Feature list
- Feature categories
- Planned features

### troubleshooting.md
**Purpose:** Troubleshooting guide  
**Location:** `docs/troubleshooting.md`  
**When to Use:** For projects with common issues  
**Template:** `_Resources/_Templates/Documentation/Guides/troubleshooting.md.template`

**Key Sections:**
- Common issues
- Build issues
- Runtime issues
- Getting help

### completion-checklist.md
**Purpose:** Completion tracking checklist  
**Location:** `docs/completion-checklist.md`  
**When to Use:** For tracking project completion  
**Template:** `_Resources/_Templates/Documentation/Core/completion-checklist.md.template`

**Key Sections:**
- Documentation checklist
- Code quality checklist
- Testing checklist
- Build checklist
- Functionality checklist

## Phase Documentation

### PHASE_*.md
**Purpose:** Phase-specific documentation  
**Location:** `docs/phases/[category]/`  
**When to Use:** For documenting development phases  
**Templates:** `_Resources/_Templates/Phases/`

**Categories:**
- Documentation phases
- Build verification
- Code quality
- Test coverage
- Feature implementation
- Runtime verification
- Production readiness

## Documentation Standards

All documentation should:
- Use consistent formatting
- Include proper headers
- Link to related documentation
- Be kept up to date
- Follow project style guide

## Quick Reference

### By Purpose
- **Getting Started:** README.md, QUICK_START.md
- **Understanding System:** architecture.md, project-structure.md
- **Using Project:** USER_GUIDE.md, features.md
- **Developing:** DEVELOPER_GUIDE.md, CONTRIBUTING.md
- **Planning:** ACTION_PLAN.md, ROADMAP.md
- **Tracking:** PROJECT_STATUS.md, STATUS_REPORT.md
- **Decisions:** ADR-*.md
- **History:** CHANGELOG.md

### By Audience
- **Users:** README.md, USER_GUIDE.md, QUICK_START.md, troubleshooting.md
- **Developers:** DEVELOPER_GUIDE.md, CONTRIBUTING.md, architecture.md
- **Project Managers:** PROJECT_STATUS.md, STATUS_REPORT.md, ROADMAP.md
- **Architects:** architecture.md, ADR-*.md
- **QA/Testers:** VERIFICATION_REPORT.md, testing.md

## Notes

- Choose documentation types based on project needs
- Not all projects need all documentation types
- Start with core documentation (README, PROJECT_STATUS)
- Add specialized documentation as needed
- Keep documentation current and relevant
