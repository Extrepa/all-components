# Template Mapping Guide

**Purpose:** Maps vault project management templates to code documentation templates, showing when to use each type.

## Two-Layer Documentation System

### Layer 1: Code Documentation (Required)
**Location:** `/Users/extrepa/Projects/project-name/`  
**Templates:** `_Resources/_Templates/Documentation/`

**Purpose:** Technical code documentation that lives with the code.

### Layer 2: Project Management (Optional)
**Location:** `_Resources/Vault/Projects/Project-Name/`  
**Templates:** `_Resources/Vault/Templates/Projects/`

**Purpose:** Planning and management documentation separate from code.

## Template Mapping

### Project Overview

| Vault Template | Code Template | Purpose | Required? |
|----------------|---------------|---------|-----------|
| Project-README-Template.md | README.md.template | Project overview | Code: Required, Vault: Optional |
| - | INDEX.md.template | Project index | Code: Required |
| - | PROJECT_STATUS.md.template | Project status | Code: Required |

### Technical Documentation

| Vault Template | Code Template | Purpose | Required? |
|----------------|---------------|---------|-----------|
| Technical-Architecture-Template.md | architecture.md.template | System architecture | Code: Recommended (Category A), Vault: Optional |
| File-Structure-Template.md | project-structure.md.template | File organization | Code: Recommended (organized projects), Vault: Optional |
| Specs-Template.md | - | Technical specifications | Vault: Optional (can be in code docs) |

### Development Documentation

| Vault Template | Code Template | Purpose | Required? |
|----------------|---------------|---------|-----------|
| Build-Order-Template.md | developer-guide.md.template | Development guide | Code: Recommended, Vault: Optional |
| Tasks-Template.md | - | Task tracking | Vault: Optional (can use issue tracker) |
| Versions-Template.md | CHANGELOG.md.template | Version history | Code: If versioned, Vault: Optional |
| Prompts-Template.md | - | AI prompts | Vault: Optional |

### Asset Documentation

| Vault Template | Code Template | Purpose | Required? |
|----------------|---------------|---------|-----------|
| Asset-Spec-Template.md | - | Asset documentation | Vault: Optional (if managing assets) |

## When to Use Each

### Use Code Documentation Templates (Always)
- For all code projects
- Technical documentation
- Developer guides
- User guides
- Architecture documentation

### Use Project Management Templates (Optional)
- If you want separate planning docs
- If you want task tracking separate from code
- If you want version history separate from code
- If you want to manage projects in a separate system

### Use Both (Advanced)
- Code docs for technical documentation
- Management docs for planning/tracking
- Link between systems
- Keep synchronized

## Integration Examples

### Example 1: Code-Only (Most Common)
**Use:** Code documentation templates only  
**Location:** `/Users/extrepa/Projects/project-name/`  
**Files:** README.md, INDEX.md, PROJECT_STATUS.md, docs/

### Example 2: Code + Management
**Use:** Both template systems  
**Code Location:** `/Users/extrepa/Projects/project-name/`  
**Management Location:** `_Resources/Vault/Projects/Project-Name/`  
**Link:** Cross-reference between systems

## Quick Decision Guide

**Do you need separate project management docs?**
- **No** → Use code documentation templates only
- **Yes** → Use both template systems

**Most projects:** Use code documentation templates only. Project management templates are for advanced use cases where you want separate planning/management documentation.

## Related Documentation

- [How to Use Templates](How-To-Use-Templates.md) - Detailed template usage
- [Template Index](../../TEMPLATE-INDEX.md) - Complete template reference
- [Project Integration Guide](../Projects/_System/Project-Integration-Guide.md) - Integration process
