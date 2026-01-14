# Documentation Index

Welcome to the Figma Clone Engine documentation! This guide will help you navigate all available documentation.

## 📚 Documentation Overview

### For Users
- **[User Guide](./user_guide.md)** - How to use the application
- **[Features Overview](./features.md)** - Complete feature list

### For Developers

#### Getting Started
- **[Getting Started](./getting_started.md)** - Developer onboarding guide
- **[Codebase Guide](./codebase_guide.md)** - Navigate the codebase, understand structure
- **[Quick Reference](./quick_reference.md)** - Cheat sheet for common patterns and APIs

#### Development
- **[Development Guidelines](./development_guidelines.md)** - Coding standards, conventions, best practices
- **[Architecture](./architecture.md)** - Technical architecture and design decisions
- **[Performance Guide](./performance_guide.md)** - Optimization strategies and tips

#### Problem Solving
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions
- **[Contributing](./contributing.md)** - How to contribute to the project

#### Planning & Status
- **[Roadmap](./roadmap.md)** - Project roadmap (Phase 8 completed!)
- **[Implementation Status](./implementation_status.md)** - Current implementation status (✅ All features complete)
- **[Feature Comparison](./feature_comparison.md)** - Comparison with v0.dev features
- **[Release Notes](./release_notes.md)** - Version history and changelog

**Note**: See `IMPLEMENTATION_COMPLETE.md` in the root directory for a consolidated summary of all completed features.

## 🚀 Quick Start

**New to the project?** Start here:
1. Read [Getting Started](./getting_started.md) for developer onboarding
2. Read [User Guide](./user_guide.md) to understand the application
3. Read [Codebase Guide](./codebase_guide.md) to understand the code structure
4. Read [Development Guidelines](./development_guidelines.md) before making changes
5. Keep [Quick Reference](./quick_reference.md) handy while coding

**Want to contribute?**
1. Read [Contributing](./contributing.md) for the workflow
2. Check [Roadmap](./roadmap.md) for planned features
3. Review [Development Guidelines](./development_guidelines.md) for standards

**Having issues?**
1. Check [Troubleshooting](./troubleshooting.md) for common problems
2. Review [Architecture](./architecture.md) to understand the system
3. Check [Performance Guide](./performance_guide.md) for performance issues

## 📖 Documentation by Topic

### State Management
- [Architecture](./architecture.md#2-data-structure-the-normalized-tree) - Normalized state structure
- [Codebase Guide](./codebase_guide.md#1-normalized-state-structure) - State patterns
- [Development Guidelines](./development_guidelines.md#state-management-patterns) - State update patterns
- [Quick Reference](./quick_reference.md#state-management) - State management snippets

### Rendering
- [Architecture](./architecture.md#1-rendering-strategy) - Canvas rendering strategy
- [Codebase Guide](./codebase_guide.md#2-rendering-pipeline) - Rendering pipeline
- [Performance Guide](./performance_guide.md#canvas-rendering-optimization) - Rendering optimization
- [Quick Reference](./quick_reference.md#canvas-rendering) - Canvas code snippets

### Coordinate System
- [Architecture](./architecture.md#3-coordinate-systems) - Screen vs World space
- [Codebase Guide](./codebase_guide.md#3-coordinate-system) - Coordinate transforms
- [Development Guidelines](./development_guidelines.md#coordinate-system) - Coordinate best practices
- [Troubleshooting](./troubleshooting.md#elements-render-in-wrong-position) - Common coordinate issues

### Auto-Layout
- [Features](./features.md#4-alignment--layout) - Auto-layout features
- [Codebase Guide](./codebase_guide.md#5-auto-layout-system) - How auto-layout works
- [Development Guidelines](./development_guidelines.md#auto-layout-engine) - Layout calculation rules
- [Performance Guide](./performance_guide.md#auto-layout-performance) - Layout optimization

### Component System
- [Architecture](./architecture.md#4-component-inheritance-model) - Master/Instance pattern
- [Codebase Guide](./codebase_guide.md#4-node-hierarchy) - Component hierarchy
- [Development Guidelines](./development_guidelines.md#component-system) - Component patterns

### History & Undo/Redo
- [Architecture](./architecture.md#5-history-engine) - History implementation
- [Codebase Guide](./codebase_guide.md#2-rendering-pipeline) - History in pipeline
- [Development Guidelines](./development_guidelines.md#history-management) - When to commit
- [Troubleshooting](./troubleshooting.md#undoredo-not-working) - History issues

### Code Generation
- [Features](./features.md#5-developer-mode-handoff) - Dev mode features
- [Codebase Guide](./codebase_guide.md#key-functions-reference) - Code generation functions
- [Development Guidelines](./development_guidelines.md#code-generation) - Generation patterns
- [Performance Guide](./performance_guide.md#code-generation-performance) - Generation optimization

## 🔍 Finding What You Need

### "How do I..."
- **Add a new feature?** → [Contributing](./contributing.md#adding-features)
- **Fix a bug?** → [Troubleshooting](./troubleshooting.md)
- **Optimize performance?** → [Performance Guide](./performance_guide.md)
- **Understand the code?** → [Codebase Guide](./codebase_guide.md)
- **Follow coding standards?** → [Development Guidelines](./development_guidelines.md)

### "What is..."
- **The state structure?** → [Architecture](./architecture.md#2-data-structure-the-normalized-tree)
- **The rendering pipeline?** → [Codebase Guide](./codebase_guide.md#2-rendering-pipeline)
- **Auto-layout?** → [Codebase Guide](./codebase_guide.md#5-auto-layout-system)
- **The coordinate system?** → [Architecture](./architecture.md#3-coordinate-systems)

### "Why does..."
- **My code not render?** → [Troubleshooting](./troubleshooting.md#canvas-not-rendering)
- **Selection not work?** → [Troubleshooting](./troubleshooting.md#selection-not-working)
- **Layout break?** → [Troubleshooting](./troubleshooting.md#auto-layout-not-working)

## 📝 Documentation Standards

All documentation follows these principles:
- **Clear and concise** - Easy to understand
- **Code examples** - Practical, copy-paste ready
- **Cross-referenced** - Links to related docs
- **Up-to-date** - Reflects current codebase
- **Searchable** - Well-organized with clear headings

## 🤝 Contributing to Docs

Found an error or want to improve documentation?
1. Check [Contributing](./contributing.md#documentation) for guidelines
2. Make your changes
3. Submit a pull request

## 📌 Key Resources

- **Main README**: [../README.md](../README.md)
- **Package.json**: [../package.json](../package.json)
- **Source Code**: [../src/](../src/)

---

**Last Updated**: Documentation is maintained alongside the codebase. If you find outdated information, please update it or file an issue.

