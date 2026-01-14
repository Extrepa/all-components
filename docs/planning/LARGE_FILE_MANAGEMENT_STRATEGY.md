# Large File Management Strategy

**Date:** 2027-01-09  
**Status:** Complete  
**Phase:** Phase 7

## Summary

Strategy for managing large files and directories across all 20 projects, including Unity Library folders, node_modules, build outputs, and archives.

## Large Files Identified

### Very Large Directories

1. **rainbowrider/rainbowrider/Library/** - 1.9GB
   - **Type:** Unity cache/build artifacts
   - **Status:** Should be gitignored
   - **Action:** Add to .gitignore

2. **errl-portal/archive/** - 505MB
   - **Type:** Historical backups
   - **Status:** Already in archive, documented
   - **Action:** Keep, consider external storage

3. **Various node_modules/** - Varies by project
   - **Type:** Dependencies
   - **Status:** Should be gitignored (standard)
   - **Action:** Verify .gitignore includes node_modules

### Build Outputs

4. **dist/** directories
   - **Type:** Build outputs
   - **Status:** Should be gitignored
   - **Action:** Verify .gitignore

5. **.next/** directories (Next.js)
   - **Type:** Next.js build cache
   - **Status:** Should be gitignored
   - **Action:** Verify .gitignore

6. **build/** directories
   - **Type:** Build outputs
   - **Status:** Should be gitignored
   - **Action:** Verify .gitignore

## .gitignore Review

### Projects with .gitignore

**Found:** 16 .gitignore files across projects

**Projects with .gitignore:**
- errl-fluid
- multi-tool-app
- ErrlOS-Plugin
- errl-club
- errl_vibecheck
- errl-forge---asset-remixer
- errlstory_pivot_v8
- errl_scene_builder
- svg_editor
- universal-component-extractor
- errl-portal
- psychedelic-liquid-light-show
- all-components/preview

### Projects Missing .gitignore

**Projects that may need .gitignore:**
- rainbowrider (Unity project - Library folder not ignored)
- Errl_Components
- Errl-Verse (docs project, may not need)
- errl-galaxy
- errl-fluid (has .gitignore, verify contents)
- figma-clone-engine (has .gitignore, verify contents)

## .gitignore Patterns

### Standard Patterns (Should Be Present)

```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Build outputs
dist/
build/
.next/
out/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Cache
.cache/
.parcel-cache/
.vite/
```

### Unity-Specific Patterns

```gitignore
# Unity
Library/
Temp/
Obj/
*.csproj
*.unityproj
*.sln
*.suo
*.user
*.userprefs
```

### Next.js-Specific Patterns

```gitignore
# Next.js
.next/
out/
```

## Recommendations by Project

### rainbowrider (Unity)

**Issue:** Library folder (1.9GB) not gitignored

**Action:**
1. Create/update .gitignore
2. Add Unity patterns:
   ```
   Library/
   Temp/
   Obj/
   *.csproj
   *.unityproj
   *.sln
   ```
3. Consider removing Library from git if already tracked

**Priority:** High (1.9GB)

### errl-portal

**Issue:** Archive folder (505MB) in repository

**Action:**
1. Verify archive/ is in .gitignore
2. If not, add to .gitignore
3. Consider moving to external storage

**Priority:** Medium (already documented)

### All Node.js Projects

**Action:**
1. Verify node_modules/ in .gitignore
2. Verify dist/, build/, .next/ in .gitignore
3. Add if missing

**Priority:** Medium (standard practice)

## .gitignore Verification Checklist

### For Each Project

- [ ] Has .gitignore file
- [ ] node_modules/ is ignored
- [ ] dist/ or build/ is ignored
- [ ] .next/ is ignored (if Next.js)
- [ ] .DS_Store is ignored
- [ ] .env files are ignored
- [ ] Project-specific patterns (Unity Library, etc.)

## Implementation Plan

### Phase 1: Verify Existing .gitignore Files

1. **Review all .gitignore files**
   - Check for standard patterns
   - Check for project-specific patterns
   - Document missing patterns

### Phase 2: Create Missing .gitignore Files

2. **Create .gitignore for projects without one**
   - rainbowrider (Unity patterns)
   - Other projects as needed

### Phase 3: Update Incomplete .gitignore Files

3. **Add missing patterns to existing .gitignore files**
   - Add node_modules if missing
   - Add build outputs if missing
   - Add Unity Library if missing

### Phase 4: Remove Tracked Large Files

4. **Remove large files from git (if tracked)**
   - Use `git rm --cached` for Library/
   - Use `git rm --cached` for node_modules/ (if tracked)
   - Commit changes

## Large File Handling Guidelines

### What to Ignore

1. **Dependencies**
   - node_modules/
   - vendor/
   - .venv/

2. **Build Outputs**
   - dist/
   - build/
   - .next/
   - out/
   - *.tsbuildinfo

3. **Cache/Temp**
   - .cache/
   - .vite/
   - .parcel-cache/
   - Temp/ (Unity)

4. **IDE/OS**
   - .vscode/
   - .idea/
   - .DS_Store
   - Thumbs.db

5. **Environment**
   - .env
   - .env.local
   - .env.*.local

6. **Project-Specific**
   - Library/ (Unity)
   - archive/ (if not needed in repo)
   - snapshots/ (if not needed in repo)

### What NOT to Ignore

1. **Source Code**
   - All .ts, .tsx, .js, .jsx files
   - Configuration files (package.json, tsconfig.json)
   - Documentation

2. **Assets (Small)**
   - Images, SVGs (if reasonable size)
   - Fonts (if reasonable size)

3. **Configuration**
   - .gitignore itself
   - README files
   - Documentation

## Specific Recommendations

### rainbowrider

**Create .gitignore:**
```gitignore
# Unity
Library/
Temp/
Obj/
*.csproj
*.unityproj
*.sln
*.suo
*.user
*.userprefs

# OS
.DS_Store
Thumbs.db

# IDE
.vs/
.vscode/
```

**Action:** Create .gitignore file

### errl-portal

**Verify .gitignore includes:**
```gitignore
archive/
node_modules/
dist/
.next/
.DS_Store
```

**Action:** Verify and update if needed

### All Projects

**Standard .gitignore template:**
```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
build/
.next/
out/

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
*.log
```

## Space Savings Potential

### Immediate (Gitignore Only)

- **rainbowrider Library:** 1.9GB (if removed from git)
- **Various node_modules:** Varies (if removed from git)
- **Build outputs:** Varies (if removed from git)

**Note:** .gitignore prevents future tracking but doesn't remove already-tracked files.

### After Cleanup

- **Remove tracked large files:** Significant space savings
- **Archive cleanup:** 264KB+ (documented in ARCHIVE_CLEANUP_PLAN.md)
- **External storage:** 447MB (snapshots, site-trim)

## Next Steps

1. ✅ Review .gitignore files (done)
2. ⏳ Create .gitignore for rainbowrider
3. ⏳ Verify .gitignore patterns in all projects
4. ⏳ Remove tracked large files (requires git_write permission)
5. ⏳ Document .gitignore status

## Notes

- .gitignore prevents future tracking
- Already-tracked files need `git rm --cached`
- Large files in git history remain (consider BFG Repo-Cleaner if needed)
- Archive cleanup is separate from .gitignore
- Unity Library should always be gitignored
