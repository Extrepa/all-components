# Consolidation Strategy

**Created:** 2027-01-07  
**Purpose:** Strategic plan for consolidating duplicated code, shared utilities, and design systems across projects

---

## Overview

This document outlines the strategic approach for consolidating similarities and duplications identified in the [Project Similarity Analysis](PROJECT_SIMILARITY_ANALYSIS.md). The goal is to reduce code duplication, improve maintainability, and establish clear patterns for shared code.

---

## Decision Framework

### When to Consolidate

**Consolidate when:**
- ✅ Same functionality exists in 3+ projects
- ✅ Code is nearly identical (>80% similarity)
- ✅ Maintenance burden is high (bugs fixed in multiple places)
- ✅ Shared utilities would reduce complexity
- ✅ Design system inconsistencies cause UX issues

**Keep Separate when:**
- ✅ Projects have intentionally different approaches
- ✅ Consolidation would add unnecessary complexity
- ✅ Projects serve different domains (e.g., 3D vs 2D)
- ✅ Tight coupling would reduce flexibility

### Consolidation Principles

1. **Backward Compatibility First** - Migrations should not break existing projects
2. **Incremental Migration** - Migrate one project at a time, test thoroughly
3. **Clear Ownership** - Each shared utility has a maintainer
4. **Documentation Required** - All shared code must be well-documented
5. **Testing Mandatory** - Shared utilities must have comprehensive tests

---

## Shared Utilities Architecture

### Directory Structure

```
shared/
├── README.md                    # Overview and usage guide
├── ARCHITECTURE.md              # Architecture documentation
├── package.json                 # Package metadata
├── tsconfig.json                # TypeScript config
├── hooks/
│   ├── useHistory.ts           # Unified history hook
│   ├── useKeyboardShortcuts.ts # Keyboard shortcuts hook
│   └── index.ts
├── utils/
│   ├── export/
│   │   ├── jsonExporter.ts     # JSON export utilities
│   │   ├── svgExporter.ts      # SVG export utilities
│   │   ├── pngExporter.ts     # PNG export utilities
│   │   └── index.ts
│   ├── paper/
│   │   ├── pathOperations.ts   # Paper.js wrappers
│   │   ├── booleanOps.ts       # Boolean operations
│   │   └── index.ts
│   ├── scene/
│   │   ├── sceneGraph.ts       # Scene graph utilities
│   │   ├── layerManager.ts    # Layer management
│   │   └── index.ts
│   ├── interaction/
│   │   ├── dragDrop.ts        # Drag and drop utilities
│   │   ├── selection.ts       # Selection utilities
│   │   ├── transform.ts       # Transform utilities
│   │   └── index.ts
│   └── index.ts
├── design-system/
│   ├── README.md               # Design system docs
│   ├── tokens.ts                # Design tokens
│   ├── components/              # Shared React components
│   ├── styles/                  # CSS files
│   └── index.ts
└── types/
    ├── history.ts               # History types
    ├── scene.ts                 # Scene graph types
    ├── export.ts                # Export types
    └── index.ts
```

### API Design Principles

1. **Generic Over Specific** - Utilities should work with multiple data types
2. **Composable** - Small, focused functions that can be combined
3. **Type-Safe** - Full TypeScript support with strict types
4. **Tree-Shakeable** - Import only what you need
5. **Framework Agnostic** - Core utilities work without React (hooks are separate)

### Import Patterns

**Recommended:**
```typescript
// Import specific utilities
import { useHistory } from '@/shared/hooks';
import { exportJSON } from '@/shared/utils/export';
import { unionPaths } from '@/shared/utils/paper';

// Or use barrel exports
import { useHistory, useKeyboardShortcuts } from '@/shared/hooks';
```

**Avoid:**
```typescript
// Don't import entire modules
import * as shared from '@/shared'; // Too broad
```

### Versioning Strategy

- **Semantic Versioning** - Follow semver (major.minor.patch)
- **Breaking Changes** - Require major version bump
- **Deprecation Period** - 2 versions before removal
- **Migration Guides** - Required for breaking changes

---

## Migration Timeline and Phases

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Establish shared utilities structure and documentation

- Create `shared/` directory structure
- Set up TypeScript configuration
- Create package.json and build setup
- Write architecture documentation
- Create initial shared utilities (history hook, design system)

**Deliverables:**
- `shared/` directory with structure
- `shared/README.md` and `shared/ARCHITECTURE.md`
- Basic shared utilities (history hook)

---

### Phase 2: High-Priority Consolidations (Weeks 3-6)
**Goal:** Migrate high-priority items

**2.1 Design System Consolidation**
- Merge `shared/design-system` and `all-components/errl-design-system`
- Create unified React-focused design system
- Migrate 2-3 projects as pilot
- Document migration process

**2.2 History Hook Migration**
- Complete `shared/hooks/useHistory.ts` implementation
- Migrate `figma-clone-engine` (pilot)
- Migrate `errl_scene_builder`
- Migrate `svg_editor`
- Migrate `multi-tool-app`
- Migrate `psychedelic-liquid-light-show`

**2.3 Liquid Light Show Consolidation**
- Archive `liquid-light-show-simulator` or merge features
- Document decision in ADR

**Deliverables:**
- Unified design system
- Shared history hook with 5+ projects migrated
- Liquid light show consolidation complete

---

### Phase 3: Medium-Priority Consolidations (Weeks 7-10)
**Goal:** Migrate medium-priority items

**3.1 Paper.js Utilities**
- Create `shared/utils/paper/` utilities
- Migrate `svg_editor`
- Migrate `multi-tool-app`

**3.2 Export Utilities**
- Create `shared/utils/export/` utilities
- Migrate `multi-tool-app`
- Migrate `figma-clone-engine`
- Migrate `errl_scene_builder`

**3.3 Interaction Utilities**
- Create `shared/utils/interaction/` utilities
- Migrate drag/drop patterns
- Migrate selection systems
- Migrate transform utilities

**Deliverables:**
- Shared Paper.js utilities
- Shared export utilities
- Shared interaction utilities

---

### Phase 4: Low-Priority Consolidations (Weeks 11-14)
**Goal:** Migrate low-priority items

**4.1 Keyboard Shortcuts**
- Create `shared/hooks/useKeyboardShortcuts.ts`
- Migrate projects using keyboard shortcuts

**4.2 Scene Graph Utilities**
- Create `shared/utils/scene/` utilities
- Migrate scene graph patterns

**4.3 Three.js Utilities** (if needed)
- Evaluate if shared utilities are beneficial
- Create if consensus reached

**Deliverables:**
- Shared keyboard shortcuts hook
- Shared scene graph utilities
- Three.js utilities (if applicable)

---

### Phase 5: Documentation and Cleanup (Weeks 15-16)
**Goal:** Complete documentation and cleanup

- Update all project READMEs
- Complete migration guides
- Create pattern reference guide
- Update dependency map
- Archive old code

**Deliverables:**
- Complete documentation
- All projects using shared utilities
- Old duplicated code archived

---

## Risk Assessment

### High Risk

**Design System Consolidation**
- **Risk:** Breaking changes in UI across multiple projects
- **Mitigation:** 
  - Maintain backward compatibility layer
  - Migrate one project at a time
  - Comprehensive visual regression testing
  - Rollback plan ready

**History Hook Migration**
- **Risk:** Data loss or corruption during migration
- **Mitigation:**
  - Thorough testing of history operations
  - Migration scripts with validation
  - Backup procedures
  - Gradual rollout

### Medium Risk

**Paper.js Utilities**
- **Risk:** Performance degradation
- **Mitigation:**
  - Benchmark before/after
  - Optimize wrapper functions
  - Allow direct Paper.js access if needed

**Export Utilities**
- **Risk:** Export format incompatibilities
- **Mitigation:**
  - Comprehensive format testing
  - Maintain project-specific exporters if needed
  - Version export formats

### Low Risk

**Keyboard Shortcuts**
- **Risk:** Shortcut conflicts
- **Mitigation:**
  - Conflict detection in shared hook
  - Project-specific override mechanism

---

## Success Criteria

### Quantitative Metrics

1. **Code Reduction**
   - Reduce duplicated code by 30%+
   - Reduce total lines of code by 15%+

2. **Maintenance Improvement**
   - Bug fixes in one place affect all projects
   - New features available to all projects using shared utilities

3. **Migration Completion**
   - 100% of high-priority items migrated
   - 80% of medium-priority items migrated
   - 50% of low-priority items migrated

### Qualitative Metrics

1. **Developer Experience**
   - Easier to add new projects
   - Consistent patterns across projects
   - Better documentation

2. **Code Quality**
   - Shared utilities have 90%+ test coverage
   - All shared code reviewed
   - Type safety maintained

3. **Project Health**
   - No regressions introduced
   - Performance maintained or improved
   - Projects remain independent

---

## Rollback Strategy

### For Each Migration

1. **Pre-Migration**
   - Create git branch for migration
   - Document current state
   - Create backup of project

2. **During Migration**
   - Test thoroughly in development
   - Use feature flags if possible
   - Monitor for issues

3. **Post-Migration**
   - Keep old code commented for 2 releases
   - Document rollback procedure
   - Test rollback process

### Rollback Triggers

- Critical bugs introduced
- Performance degradation >20%
- Breaking changes not documented
- User complaints about functionality

---

## Communication Plan

### Stakeholders

- Project maintainers
- Developers working on projects
- Design system users

### Communication Channels

- GitHub issues for tracking
- Documentation updates
- Migration guides
- ADR documents for decisions

### Update Frequency

- Weekly progress updates during active migration
- Monthly status reports
- Immediate notification for breaking changes

---

## Next Steps

1. Review and approve this strategy
2. Begin Phase 1: Foundation
3. Create first shared utilities
4. Start pilot migrations
5. Iterate based on feedback

---

## References

- [Project Similarity Analysis](PROJECT_SIMILARITY_ANALYSIS.md) - Detailed findings
- [Consolidation Roadmap](CONSOLIDATION_ROADMAP.md) - Implementation timeline
- [Migration Guides](docs/migration-guides/) - Step-by-step migration instructions
- [Architecture Decision Records](docs/decisions/) - Decision documentation
