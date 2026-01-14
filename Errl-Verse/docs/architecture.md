# Architecture Documentation

**Project:** Errl-Verse
**Type:** Documentation/Project
**Last Updated:** 2026-01-10

## Technical Architecture

### Technology Stack

- **Markdown** - Primary documentation format
- **Obsidian** - Documentation management (optional)
- **Git** - Version control

### Project Type

Documentation and Project Organization System

## Architecture Overview

Errl-Verse is a documentation and project organization system that provides:
- Comprehensive home server documentation
- Project verification and implementation tracking
- Cursor constraints and development guidelines
- Plan comparison and verification reports

### System Components

1. **Home Server Documentation** (`Home-Server/`)
   - Modular documentation structure (00-20)
   - Core setup and operational guides
   - Quick reference for build day

2. **Cursor Constraints** (`Cursor-Constraints/`)
   - Project contract and guidelines
   - Canonical paths and allowed actions
   - Definition of done and philosophy

3. **Verification System** (`docs/archive/`, `docs/current/`)
   - Implementation verification
   - Plan comparison documents
   - Status tracking

## Key Design Decisions

### Modular Documentation Structure
- **Rationale**: One file = one topic for easy navigation
- **Benefit**: Easy to find specific information
- **Structure**: Numbered files (00-20) for logical flow

### Storage Path: `/srv`
- **Rationale**: Linux standard for service data
- **Benefit**: Predictable, maintainable structure
- **Implementation**: All paths use `/srv` consistently

### Remote Access: Cloudflare Tunnel Only
- **Rationale**: Security and simplicity
- **Benefit**: No port forwarding required
- **Trade-off**: Requires Cloudflare account

### "Boring Is Good" Philosophy
- **Rationale**: Predictable, simple, long-lasting
- **Benefit**: Easy to maintain and understand
- **Principle**: No premature optimization

## Documentation Structure

```
Errl-Verse/
├── Home-Server/          # Home server documentation (22 files)
│   ├── 00-Overview.md
│   ├── 01-Architecture.md
│   ├── ...
│   └── QUICK-REFERENCE.md
├── Cursor-Constraints/   # Development constraints (6 files)
├── docs/
│   ├── archive/         # Historical verification docs
│   └── current/         # Active implementation notes
└── README.md            # Project overview
```

## Dependencies

- **Markdown**: Documentation format
- **Git**: Version control
- **Obsidian** (optional): Documentation management

## Design Patterns

### Modular Documentation
- Each file covers one topic
- Numbered sequence for logical flow
- Cross-references between related topics

### Verification System
- Archive for historical documents
- Current for active work
- Summary documents for quick reference

## Related Documentation

- [Project Structure](project-structure.md) - File organization
- [Summary](../docs/current/SUMMARY.md) - Documentation system summary
- [Implementation Notes](../docs/current/IMPLEMENTATION-NOTES.md) - Implementation verification
