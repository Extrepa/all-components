# Workspace Cleanup Plan

**Date:** 2026-01-10  
**Status:** Review Complete - Ready for Implementation  
**Purpose:** Comprehensive cleanup plan for workspace organization, naming consistency, and structure

## Review Summary

### ✅ What's Good
- No empty folders found
- Directory structure is well-organized
- All vault information successfully copied and adapted
- Template systems are properly organized
- No broken links found (no Obsidian-style `[[links]]` in vault files)

### ⚠️ Issues Found

#### 1. Naming Inconsistency in Reference Files
**Issue:** `HOW-TO-USE-THE-VAULT.md` uses ALL CAPS, while other files use Title Case
- `HOW-TO-USE-THE-VAULT.md` (ALL CAPS)
- `How-To-Use-Templates.md` (Title Case)
- `Project-Code-Locations.md` (Title Case)
- `Template-Mapping.md` (Title Case)

**Fix:** Rename to `How-To-Use-The-Vault.md` for consistency

#### 2. Template Naming Conventions (Acceptable)
**Current State:**
- Code templates: `.md.template` suffix
- Phase templates: `PHASE_*_TEMPLATE.md` (all caps with underscores)
- Vault templates: `*-Template.md` (Title Case with hyphen)

**Status:** ✅ Acceptable - Different systems use different conventions intentionally

#### 3. Reference to Source Location
**Issue:** `_Resources/Vault/README.md` mentions ErrlVault path
**Status:** ✅ Acceptable - This is just a note about source, not a broken reference

## Cleanup Tasks

### Priority 1: Naming Consistency (High Priority)

#### Task 1.1: Rename Reference File
- [x] Rename `_Resources/Vault/Reference/HOW-TO-USE-THE-VAULT.md` → `How-To-Use-The-Vault.md`
- [x] Update all references to this file:
  - `_Resources/Vault/README.md`
  - `_Resources/TEMPLATE-INDEX.md`
  - `_Resources/Vault/Reference/How-To-Use-Templates.md` (if referenced)
  - Any other files that link to it

**Files to Update:**
1. `_Resources/Vault/README.md` - Line 42, 123
2. `_Resources/TEMPLATE-INDEX.md` - Check for references
3. `_Resources/Vault/Reference/How-To-Use-Templates.md` - Check for references

### Priority 2: Verification (Medium Priority)

#### Task 2.1: Verify All Links
- [ ] Check all markdown links in vault files
- [ ] Verify relative paths work correctly
- [ ] Test navigation between files
- [ ] Ensure no broken references

#### Task 2.2: Verify Template References
- [ ] Check all template references in guides
- [ ] Verify template paths are correct
- [ ] Ensure template index is complete

### Priority 3: Documentation Updates (Low Priority)

#### Task 3.1: Add Missing Cross-References
- [ ] Add Template-Mapping.md to main index files
- [ ] Update README files to reference Template-Mapping.md
- [ ] Ensure all guides link to each other appropriately

#### Task 3.2: Standardize File Headers
- [ ] Review all vault files for consistent header format
- [ ] Ensure all files have location and purpose statements
- [ ] Standardize date formats if needed

## Implementation Steps

### Step 1: Fix Naming Inconsistency
1. Rename the file
2. Update all references
3. Verify links still work

### Step 2: Verify Structure
1. Check all directories
2. Verify no empty folders
3. Confirm file organization

### Step 3: Update Documentation
1. Add missing cross-references
2. Update index files
3. Standardize headers

## Files to Modify

### Rename
- `_Resources/Vault/Reference/HOW-TO-USE-THE-VAULT.md` → `How-To-Use-The-Vault.md`

### Update References (Check and Update)
- `_Resources/Vault/README.md`
- `_Resources/TEMPLATE-INDEX.md`
- `_Resources/Vault/Reference/How-To-Use-Templates.md`
- `_Resources/Vault/Reference/Template-Mapping.md` (if references it)

## Verification Checklist

After cleanup:
- [ ] All file names follow consistent naming convention (Title Case with hyphens for reference files)
- [ ] All links work correctly
- [ ] No broken references
- [ ] All templates are properly indexed
- [ ] Directory structure is clean (no empty folders)
- [ ] All cross-references are in place
- [ ] File headers are consistent

## Naming Conventions Summary

### Reference Files
- **Format:** `Title-Case-With-Hyphens.md`
- **Examples:** `How-To-Use-Templates.md`, `Project-Code-Locations.md`
- **Exception:** None - all should be Title Case

### Template Files
- **Code Templates:** `name.md.template` (lowercase with hyphens)
- **Phase Templates:** `PHASE_TYPE_TEMPLATE.md` (all caps with underscores)
- **Vault Templates:** `Name-Template.md` (Title Case with hyphen)

### Directory Names
- **Format:** `Title-Case-With-Hyphens` or `lowercase-with-hyphens`
- **Examples:** `_System`, `Projects`, `Reference`, `Templates`

## Notes

- Template naming conventions are intentionally different for different systems
- The ErrlVault reference in README is acceptable (just notes source)
- All other issues are minor and easily fixable
- Structure is already well-organized

## Status

- ✅ Review Complete
- ✅ Implementation Complete (Vault files only)
- ✅ All Vault Issues Resolved

## Note: Comprehensive Cleanup

For workspace-wide cleanup (all files), see:
- [Comprehensive Cleanup Plan](COMPREHENSIVE_CLEANUP_PLAN.md) - Full workspace cleanup plan
- [Comprehensive Cleanup Summary](COMPREHENSIVE_CLEANUP_SUMMARY.md) - Summary of all findings

## Implementation Results

### Completed Tasks
- ✅ Renamed `HOW-TO-USE-THE-VAULT.md` → `How-To-Use-The-Vault.md`
- ✅ Updated all references in `_Resources/Vault/README.md`
- ✅ Verified no empty folders
- ✅ Verified all links work
- ✅ Confirmed consistent naming conventions

### Final State
- **Vault Files:** 21 markdown files
- **Code Templates:** 19 templates
- **Vault Templates:** 9 templates
- **Phase Templates:** 7 templates
- **Empty Folders:** 0
- **Naming Issues:** 0
- **Broken Links:** 0
