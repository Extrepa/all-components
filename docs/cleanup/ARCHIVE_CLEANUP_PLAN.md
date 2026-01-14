# Archive Cleanup Plan

**Date:** 2027-01-09  
**Status:** Planning Complete  
**Phase:** Phase 5

## Summary

Analysis of errl-portal archive folder (505MB total) with recommendations for organization and cleanup.

## Archive Contents Analysis

### Size Breakdown

| Directory | Size | Files | Type |
|-----------|------|-------|------|
| **snapshots/** | 277MB | 29 zip files | Backup snapshots |
| **site-trim-20251222/** | 170MB | 374 files (73 md, 55 html, 55 js) | Site backup |
| **docs-site-20251031/** | 46MB | 130+ files | Documentation site backup |
| **legacy-portal-pages-backup/** | 4.6MB | 141 files (126 html) | Old portal pages |
| **component-rips-20251112/** | 4.6MB | Component HTML files | Component backups |
| **legacy/** | 2.4MB | 52 files | Legacy code |
| **portal-attic/** | 280KB | Portal scaffold | Old portal code |
| **dev-panel-backup/** | 196KB | CSS files | Dev panel backup |
| **portal-pixi-gl-20251030/** | 188KB | HTML file | Portal version |
| **Tools temporary/** | 80KB | 6 files | Temporary tools |
| **assets-central-20251101/** | 76KB | SVG file | Asset backup |
| **moved/** | 64KB | JS file | Moved file |
| **unreferenced-20251030/** | 48KB | HTML, config | Unreferenced files |
| **duplicate-js-20251030/** | 36KB | JS duplicates | Duplicate files |
| **root-duplicates-20251031/** | 32KB | HTML file | Duplicate file |
| **redirect-stubs-20251030/** | 4KB | HTML stubs | Redirect stubs |

**Total:** ~505MB

### File Counts

- HTML files: 432
- JavaScript files: 1,057
- CSS files: 94
- Other: Various (markdown, images, zip, etc.)

## Archive Organization Plan

### Recommended Structure

```
archive/
├── README.md (archive documentation)
├── snapshots/ (keep - historical backups)
│   └── README.md (document snapshot dates/purposes)
├── backups/ (consolidate old backups)
│   ├── site-trim-20251222/
│   ├── docs-site-20251031/
│   └── legacy-portal-pages-backup/
├── components/ (component backups)
│   └── component-rips-20251112/
├── legacy/ (legacy code - review for deletion)
└── temp/ (temporary files - candidate for deletion)
    ├── Tools temporary/
    ├── duplicate-js-20251030/
    ├── root-duplicates-20251031/
    └── unreferenced-20251030/
```

## Cleanup Recommendations

### ✅ Keep (Historical Value)

1. **snapshots/** (277MB)
   - **Reason:** Historical backups, may be needed for rollback
   - **Action:** Keep, but document dates and purposes
   - **Recommendation:** Create README.md documenting each snapshot

2. **site-trim-20251222/** (170MB)
   - **Reason:** Recent site backup (Dec 2025)
   - **Action:** Keep for now, review after 6 months
   - **Recommendation:** Archive to external storage if space needed

3. **docs-site-20251031/** (46MB)
   - **Reason:** Documentation site backup
   - **Action:** Keep, may contain reference material
   - **Recommendation:** Review contents, extract useful docs

4. **component-rips-20251112/** (4.6MB)
   - **Reason:** Component backups, may contain useful code
   - **Action:** Keep, organize into components/
   - **Recommendation:** Review and extract useful components

### ⚠️ Review Before Deletion

5. **legacy-portal-pages-backup/** (4.6MB)
   - **Reason:** Old portal pages
   - **Action:** Review contents, delete if obsolete
   - **Recommendation:** Check if any pages are still referenced

6. **legacy/** (2.4MB)
   - **Reason:** Legacy code
   - **Action:** Review, delete if obsolete
   - **Recommendation:** Check if code is still needed

### ❌ Candidate for Deletion

7. **Tools temporary/** (80KB)
   - **Reason:** Temporary files
   - **Action:** Delete if no longer needed
   - **Recommendation:** Safe to delete

8. **duplicate-js-20251030/** (36KB)
   - **Reason:** Duplicate files
   - **Action:** Delete duplicates
   - **Recommendation:** Safe to delete

9. **root-duplicates-20251031/** (32KB)
   - **Reason:** Duplicate files
   - **Action:** Delete duplicates
   - **Recommendation:** Safe to delete

10. **unreferenced-20251030/** (48KB)
    - **Reason:** Unreferenced files
    - **Action:** Delete if truly unreferenced
    - **Recommendation:** Verify not referenced, then delete

11. **moved/** (64KB)
    - **Reason:** Files that were moved
    - **Action:** Delete if move is complete
    - **Recommendation:** Verify moved successfully, then delete

12. **redirect-stubs-20251030/** (4KB)
    - **Reason:** Redirect stubs
    - **Action:** Delete if redirects are handled elsewhere
    - **Recommendation:** Verify redirects work, then delete

### 📝 Keep but Organize

13. **portal-attic/** (280KB)
    - **Reason:** Old portal code
    - **Action:** Keep, organize
    - **Recommendation:** Move to legacy/ or backups/

14. **dev-panel-backup/** (196KB)
    - **Reason:** Dev panel backup
    - **Action:** Keep if dev panel code is useful
    - **Recommendation:** Review and extract if useful

15. **portal-pixi-gl-20251030/** (188KB)
    - **Reason:** Portal version backup
    - **Action:** Keep if contains useful code
    - **Recommendation:** Review and extract if useful

16. **assets-central-20251101/** (76KB)
    - **Reason:** Asset backup
    - **Action:** Keep, may contain useful assets
    - **Recommendation:** Review and move to assets/ if useful

## Cleanup Actions

### Phase 1: Documentation (Safe)

1. **Create archive README.md**
   - Document archive structure
   - Explain what each folder contains
   - Note dates and purposes

2. **Create snapshot README.md**
   - Document each snapshot
   - Note dates and what they contain
   - Document restoration process

### Phase 2: Organization (Low Risk)

3. **Reorganize archive structure**
   - Create backups/ folder
   - Move old backups into backups/
   - Create components/ folder
   - Move component backups into components/
   - Create temp/ folder
   - Move temporary files into temp/

### Phase 3: Deletion (Requires Verification)

4. **Delete temporary files**
   - Tools temporary/
   - duplicate-js-20251030/
   - root-duplicates-20251031/
   - unreferenced-20251030/ (after verification)
   - moved/ (after verification)
   - redirect-stubs-20251030/ (after verification)

5. **Review and delete legacy code**
   - legacy/ (after review)
   - legacy-portal-pages-backup/ (after review)

### Phase 4: External Storage (Optional)

6. **Move large backups to external storage**
   - snapshots/ (if not needed locally)
   - site-trim-20251222/ (if not needed locally)
   - Consider cloud storage or external drive

## Estimated Space Savings

### Immediate (Safe Deletions)
- Tools temporary: 80KB
- duplicate-js: 36KB
- root-duplicates: 32KB
- redirect-stubs: 4KB
- **Total:** ~152KB (minimal)

### After Review (Potential)
- legacy: 2.4MB
- legacy-portal-pages-backup: 4.6MB
- unreferenced: 48KB
- moved: 64KB
- **Total:** ~7.1MB (if all deleted)

### External Storage (Optional)
- snapshots: 277MB
- site-trim: 170MB
- **Total:** 447MB (if moved externally)

## Implementation Notes

1. **Backup First**
   - Create backup of archive before cleanup
   - Verify backup is accessible

2. **Verify Before Delete**
   - Check if files are referenced elsewhere
   - Verify moved files are in new location
   - Confirm redirects work without stubs

3. **Document Decisions**
   - Document what was deleted and why
   - Note dates of cleanup
   - Keep record of archive contents

4. **Gradual Cleanup**
   - Start with safe deletions
   - Review before deleting legacy code
   - Move to external storage last

## Archive README Template

```markdown
# Archive Directory

This directory contains historical backups, legacy code, and temporary files from errl-portal development.

## Structure

- **snapshots/** - Historical backup snapshots (277MB)
- **backups/** - Old site and documentation backups
- **components/** - Component backups and rips
- **legacy/** - Legacy code (review before deletion)
- **temp/** - Temporary files (candidate for deletion)

## Cleanup Status

Last cleaned: [Date]
Next review: [Date + 6 months]

See ARCHIVE_CLEANUP_PLAN.md for detailed cleanup recommendations.
```

## Next Steps

1. ✅ Analyze archive contents (done)
2. ⏳ Create archive README.md
3. ⏳ Create snapshot README.md
4. ⏳ Reorganize archive structure
5. ⏳ Delete temporary files (after verification)
6. ⏳ Review and delete legacy code (after verification)
7. ⏳ Consider external storage for large backups

## Notes

- Archive is 505MB total
- Largest items: snapshots (277MB) and site-trim (170MB)
- Most files are HTML/JS backups
- Cleanup should be gradual and verified
- External storage recommended for large backups
