# Rollback Procedures

**Created:** 2027-01-07  
**Purpose:** Procedures for rolling back migrations if issues occur

---

## Overview

This document provides step-by-step rollback procedures for each type of migration. Rollbacks should be rare but must be quick and safe when needed.

---

## General Rollback Principles

### Before Migration

1. **Create Backup**
   - Git branch for migration
   - Tag current state
   - Document current state

2. **Prepare Rollback**
   - Document rollback steps
   - Test rollback process
   - Have rollback ready

### During Migration

1. **Keep Old Code**
   - Don't delete immediately
   - Comment out old code
   - Keep for 2 releases

2. **Monitor Closely**
   - Watch for issues
   - Test frequently
   - Be ready to rollback

### After Migration

1. **Keep Rollback Available**
   - Don't delete old code immediately
   - Keep rollback documentation
   - Test rollback periodically

---

## Rollback by Migration Type

### Design System Migration Rollback

**Trigger:** Visual regressions, breaking changes, user complaints

**Steps:**

1. **Immediate Rollback**
   ```bash
   # Revert to old design system
   git checkout HEAD~1 shared/design-system/
   ```

2. **Project-Specific Rollback**
   ```typescript
   // Temporarily use old imports
   // Before (new)
   import { useErrlTheme } from '@/shared/design-system';
   
   // After (rollback)
   import { useErrlTheme } from '@/all-components/errl-design-system';
   // or
   import { DESIGN_SYSTEM } from '@/shared/design-system/design-system'; // Old format
   ```

3. **Update Imports**
   - Revert all imports to old design system
   - Test thoroughly
   - Fix any issues

4. **Document Issues**
   - Document what went wrong
   - Fix issues in shared design system
   - Retry migration after fixes

**Rollback Time:** 15-30 minutes per project

---

### History Hook Migration Rollback

**Trigger:** Data loss, corruption, performance issues

**Steps:**

1. **Immediate Rollback**
   ```bash
   # Revert shared hook
   git checkout HEAD~1 shared/hooks/useHistory.ts
   ```

2. **Project-Specific Rollback**
   ```typescript
   // Revert to old implementation
   // Before (new)
   import { useHistory } from '@/shared/hooks';
   
   // After (rollback)
   import { useHistory } from './hooks/useHistory'; // Old local version
   ```

3. **Restore Old Files**
   ```bash
   # Restore old history hook from git
   git checkout HEAD~1 [project]/src/hooks/useHistory.ts
   ```

4. **Test Thoroughly**
   - Test all undo/redo operations
   - Verify no data loss
   - Check performance

5. **Fix Issues**
   - Identify root cause
   - Fix in shared hook
   - Retry migration after fixes

**Rollback Time:** 10-20 minutes per project

---

### Paper.js Utilities Migration Rollback

**Trigger:** Performance degradation, broken operations

**Steps:**

1. **Immediate Rollback**
   ```bash
   # Revert shared utilities
   git checkout HEAD~1 shared/utils/paper/
   ```

2. **Project-Specific Rollback**
   ```typescript
   // Revert to old implementations
   // Before (new)
   import { unionPaths } from '@/shared/utils/paper';
   
   // After (rollback)
   import { unionPaths } from '@/utils/booleanOperations'; // Old local version
   ```

3. **Restore Old Files**
   ```bash
   # Restore old Paper.js utilities
   git checkout HEAD~1 [project]/src/utils/booleanOperations.ts
   git checkout HEAD~1 [project]/src/utils/pathOffset.ts
   git checkout HEAD~1 [project]/src/utils/pathSimplifier.ts
   ```

4. **Test Thoroughly**
   - Test all Paper.js operations
   - Verify performance
   - Check visual output

**Rollback Time:** 10-15 minutes per project

---

### Export Utilities Migration Rollback

**Trigger:** Export failures, format issues, file corruption

**Steps:**

1. **Immediate Rollback**
   ```bash
   # Revert shared utilities
   git checkout HEAD~1 shared/utils/export/
   ```

2. **Project-Specific Rollback**
   ```typescript
   // Revert to old implementations
   // Before (new)
   import { exportJSON } from '@/shared/utils/export';
   
   // After (rollback)
   import { exportFlashBundle } from '@/engine/exporters/FlashExporter'; // Old local version
   ```

3. **Restore Old Files**
   ```bash
   # Restore old export utilities
   git checkout HEAD~1 [project]/src/engine/exporters/
   ```

4. **Test Exports**
   - Test all export formats
   - Verify file validity
   - Check file names

**Rollback Time:** 10-15 minutes per project

---

## Emergency Rollback

### Complete Project Rollback

If entire migration causes critical issues:

```bash
# Rollback entire project to before migration
git checkout [commit-before-migration] [project]/

# Or revert all changes
git revert [migration-commit]
```

### Partial Rollback

If only specific utilities cause issues:

```bash
# Rollback specific utility
git checkout HEAD~1 shared/[utility-path]/

# Update projects to not use that utility
# Continue using other shared utilities
```

---

## Rollback Testing

### Before Rollback

1. **Document Current State**
   - What's broken?
   - What works?
   - Error messages?

2. **Plan Rollback**
   - Which files to revert?
   - Which imports to change?
   - What to test?

### During Rollback

1. **Execute Rollback**
   - Revert files
   - Update imports
   - Test immediately

2. **Verify Success**
   - All features work?
   - No regressions?
   - Performance OK?

### After Rollback

1. **Document Issues**
   - What went wrong?
   - Root cause?
   - How to fix?

2. **Fix and Retry**
   - Fix issues in shared utilities
   - Test fixes
   - Retry migration

---

## Rollback Checklist

### Pre-Migration

- [ ] Git branch created
- [ ] Current state tagged
- [ ] Rollback steps documented
- [ ] Rollback tested (dry run)

### During Migration

- [ ] Old code kept (commented)
- [ ] Monitoring for issues
- [ ] Ready to rollback if needed

### If Rollback Needed

- [ ] Identify issue
- [ ] Execute rollback
- [ ] Test thoroughly
- [ ] Document issue
- [ ] Fix and retry

---

## Rollback Time Estimates

| Migration Type | Rollback Time | Complexity |
|---------------|---------------|------------|
| Design System | 15-30 min/project | Medium |
| History Hook | 10-20 min/project | Low |
| Paper.js | 10-15 min/project | Low |
| Export | 10-15 min/project | Low |
| Complete Project | 30-60 min | High |

---

## Prevention Strategies

### Reduce Rollback Need

1. **Thorough Testing**
   - Test before migration
   - Test during migration
   - Test after migration

2. **Gradual Migration**
   - Migrate one project at a time
   - Test each migration
   - Fix issues before continuing

3. **Feature Flags**
   - Use feature flags if possible
   - Easy to toggle on/off
   - No code changes needed

4. **Backward Compatibility**
   - Maintain old APIs during migration
   - Gradual deprecation
   - Clear migration path

---

## Rollback Communication

### When to Rollback

- Critical bugs introduced
- Performance degradation >20%
- Breaking changes not documented
- User complaints about functionality
- Data loss or corruption

### Communication Plan

1. **Immediate Notification**
   - Notify team immediately
   - Document issue
   - Execute rollback

2. **Post-Rollback**
   - Document what happened
   - Root cause analysis
   - Fix plan
   - Timeline for retry

---

## References

- [Consolidation Verification](CONSOLIDATION_VERIFICATION.md) - Includes testing verification
- [Consolidation Strategy](CONSOLIDATION_STRATEGY.md)
- [Migration Guides](docs/migration-guides/)
