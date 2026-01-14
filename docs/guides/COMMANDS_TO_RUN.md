# Commands to Run - Complete List

**Date:** 2027-01-09  
**Purpose:** Comprehensive list of all commands needed to complete the implementation

## Quick Start

Run these commands in order for each project. Commands are organized by priority and purpose.

---

## Phase 1: Install Dependencies

### High Priority (Updated Test Infrastructure - Vitest 1.6.1)

**Note:** Vitest versions updated to 1.6.1 with compatible coverage/UI packages. Import resolution fixed.

#### 1. figma-clone-engine
```bash
cd /Users/extrepa/Projects/figma-clone-engine
npm install  # Installs vitest 1.6.1, @vitest/ui, @vitest/coverage-v8
```

#### 2. multi-tool-app
```bash
cd /Users/extrepa/Projects/multi-tool-app
npm install  # Installs vitest 1.6.1, @vitest/ui, @vitest/coverage-v8
```

#### 3. errlstory_pivot_v8
```bash
cd /Users/extrepa/Projects/errlstory_pivot_v8
npm install  # Installs vitest 1.6.1, @vitest/ui, @vitest/coverage-v8
```

#### 4. ErrlFXLab
```bash
cd /Users/extrepa/Projects/ErrlFXLab
npm install  # Installs vitest 1.6.1, @vitest/ui, @vitest/coverage-v8
```

### Medium Priority (Dependency Updates)

#### 5. errl_vibecheck
```bash
cd /Users/extrepa/Projects/errl_vibecheck
npm install  # Updates @google/genai to ^1.30.0
```

#### 6. svg_editor
```bash
cd /Users/extrepa/Projects/svg_editor
npm install  # May need shared dependencies
```

---

## Phase 2: Verify Builds

### Projects with Fixed Build Issues

#### 7. shared (Already installed, verify build)
```bash
cd /Users/extrepa/Projects/shared
npm run build
```

#### 8. figma-clone-engine
```bash
cd /Users/extrepa/Projects/figma-clone-engine
npm run build
```

#### 9. multi-tool-app
```bash
cd /Users/extrepa/Projects/multi-tool-app
npm run build
```

#### 10. svg_editor
```bash
cd /Users/extrepa/Projects/svg_editor
npm run build
```

#### 11. ErrlOS-Plugin
```bash
cd /Users/extrepa/Projects/ErrlOS-Plugin
npm run build  # TypeScript errors fixed, may have sandbox write restrictions
```

#### 12. errlstory_pivot_v8
```bash
cd /Users/extrepa/Projects/errlstory_pivot_v8
npm run build  # Should already work
```

---

## Phase 3: Run Tests

### Projects with New Test Infrastructure

#### 13. figma-clone-engine
```bash
cd /Users/extrepa/Projects/figma-clone-engine
npm test  # Run smoke tests
# Or with UI:
npm run test:ui
# Or with coverage:
npm run test:coverage
```

#### 14. multi-tool-app
```bash
cd /Users/extrepa/Projects/multi-tool-app
npm test
npm run test:ui
npm run test:coverage
```

#### 15. errlstory_pivot_v8
```bash
cd /Users/extrepa/Projects/errlstory_pivot_v8
npm test
npm run test:ui
npm run test:coverage
```

#### 16. ErrlFXLab
```bash
cd /Users/extrepa/Projects/ErrlFXLab
npm test
npm run test:ui
npm run test:coverage
```

### Projects with Existing Tests

#### 17. ErrlOS-Plugin
```bash
cd /Users/extrepa/Projects/ErrlOS-Plugin
npm test  # Jest tests (TypeScript errors fixed, but has pre-existing test failures)
# Note: See ERRLOS_PLUGIN_TEST_ISSUES.md for details on 36 failing tests
```

#### 18. errl_vibecheck
```bash
cd /Users/extrepa/Projects/errl_vibecheck
npm test  # Existing Vitest tests
```

#### 19. errl-portal
```bash
cd /Users/extrepa/Projects/errl-portal
npm test  # Playwright E2E tests (if configured)
```

---

## Phase 4: Runtime Verification

### Projects Ready for Runtime Testing

#### 20. errlstory_pivot_v8
```bash
cd /Users/extrepa/Projects/errlstory_pivot_v8
npm run dev
# Open http://localhost:5173 (or port shown)
# Test basic functionality
```

#### 21. figma-clone-engine
```bash
cd /Users/extrepa/Projects/figma-clone-engine
npm run dev
# Test: Typography, Borders, Shadows, Export features
```

#### 22. multi-tool-app
```bash
cd /Users/extrepa/Projects/multi-tool-app
npm run dev
# Test: Timeline, Vector Editing, Pen Tool
```

#### 23. svg_editor
```bash
cd /Users/extrepa/Projects/svg_editor
npm run dev
# Test: Core tools, Path operations
```

### Other Projects (May have sandbox restrictions)

#### 24. errl_vibecheck
```bash
cd /Users/extrepa/Projects/errl_vibecheck
npm run dev
```

#### 25. errl-forge---asset-remixer
```bash
cd /Users/extrepa/Projects/errl-forge---asset-remixer
npm run dev
```

#### 26. Errl_Components
```bash
cd /Users/extrepa/Projects/Errl_Components
npm run dev
```

#### 27. psychedelic-liquid-light-show
```bash
cd /Users/extrepa/Projects/psychedelic-liquid-light-show
npm run dev
```

#### 28. liquid-light-show-simulator
```bash
cd /Users/extrepa/Projects/liquid-light-show-simulator
npm run dev
```

#### 29. errl-fluid
```bash
cd /Users/extrepa/Projects/errl-fluid
npm run dev
```

#### 30. errl-galaxy
```bash
cd /Users/extrepa/Projects/errl-galaxy
npm run dev  # Next.js dev server
```

#### 31. errl-portal
```bash
cd /Users/extrepa/Projects/errl-portal
npm run portal:dev  # Or check package.json for correct script
```

#### 32. universal-component-extractor
```bash
cd /Users/extrepa/Projects/universal-component-extractor
npm run electron:dev  # Electron app
```

#### 33. errl-club
```bash
cd /Users/extrepa/Projects/errl-club
npm run dev
```

#### 34. errl_scene_builder
```bash
cd /Users/extrepa/Projects/errl_scene_builder
npm run dev
```

---

## Phase 5: Code Quality Checks (Optional)

### Linting (if configured)

```bash
# For projects with ESLint
cd <project>
npm run lint
```

### Security Audit

```bash
# For all projects
cd <project>
npm audit
npm audit fix  # Auto-fixable issues
```

### Dependency Updates

```bash
# Check for outdated packages
cd <project>
npm outdated
npm update  # Update patch/minor versions
```

---

## Complete Command Sequence

### For Each Project (Recommended Order)

```bash
# 1. Install dependencies
cd /Users/extrepa/Projects/<project-name>
npm install

# 2. Verify build
npm run build

# 3. Run tests (if available)
npm test

# 4. Start dev server (for runtime testing)
npm run dev
```

---

## Project-Specific Notes

### figma-clone-engine
- **New:** Test infrastructure added
- **Fixed:** Shared dependencies, TypeScript errors
- **Test:** `npm test` to verify new test setup

### multi-tool-app
- **New:** Test infrastructure added
- **Fixed:** Shared dependencies, TypeScript errors
- **Test:** `npm test` to verify new test setup

### errlstory_pivot_v8
- **New:** Test infrastructure added
- **Status:** Build already working
- **Test:** `npm test` to verify new test setup

### ErrlFXLab
- **New:** Test infrastructure and package.json added
- **Note:** Vanilla JS project, no React
- **Test:** `npm test` to verify new test setup

### errl_vibecheck
- **Updated:** @google/genai to ^1.30.0
- **Run:** `npm install` to update dependency

### svg_editor
- **Fixed:** Shared dependencies
- **Run:** `npm install` then `npm run build`

### ErrlOS-Plugin
- **Fixed:** Jest types, ORGAN_CREATORS export
- **Test:** `npm test` (TypeScript errors fixed)

### shared
- **Fixed:** Dependencies, TypeScript errors
- **Status:** Already installed and building
- **Note:** Used by other projects

---

## Quick Reference: All Projects

| # | Project | Install | Build | Test | Dev |
|---|---------|---------|-------|------|-----|
| 1 | figma-clone-engine | ✅ | ✅ | ✅ | ✅ |
| 2 | multi-tool-app | ✅ | ✅ | ✅ | ✅ |
| 3 | errlstory_pivot_v8 | ✅ | ✅ | ✅ | ✅ |
| 4 | ErrlFXLab | ✅ | - | ✅ | - |
| 5 | errl_vibecheck | ✅ | ✅ | ✅ | ✅ |
| 6 | svg_editor | ✅ | ✅ | - | ✅ |
| 7 | ErrlOS-Plugin | - | ✅ | ✅ | - |
| 8 | shared | ✅ | ✅ | ✅ | - |
| 9 | errl-forge---asset-remixer | - | - | - | ✅ |
| 10 | Errl_Components | - | - | - | ✅ |
| 11 | psychedelic-liquid-light-show | - | - | ✅ | ✅ |
| 12 | liquid-light-show-simulator | - | - | ✅ | ✅ |
| 13 | errl-fluid | - | - | - | ✅ |
| 14 | errl-galaxy | - | - | - | ✅ |
| 15 | errl-portal | - | - | ✅ | ✅ |
| 16 | universal-component-extractor | - | - | ✅ | ✅ |
| 17 | errl-club | - | - | - | ✅ |
| 18 | errl_scene_builder | - | - | - | ✅ |
| 19 | Errl-Verse | - | - | - | - |
| 20 | all-components | - | - | - | - |
| 21 | rainbowrider | - | - | - | - |

**Legend:**
- ✅ = Command available and recommended
- - = Not applicable or no command available

---

## Troubleshooting

### npm install fails with EPERM
```bash
# Fix npm cache permissions
sudo chown -R $(whoami) ~/.npm
# Or for project-specific:
sudo chown -R $(whoami) <project>/.npm-cache
```

### Build fails with TypeScript errors
- Check that shared package dependencies are installed
- Verify path aliases in tsconfig.json
- Run `npm install` in shared directory first

### Tests fail
- Ensure dependencies are installed
- Check that test files exist
- Verify vitest.config.ts is correct

---

## Summary

**Total Projects:** 21  
**Projects Needing npm install:** 6 (high priority)  
**Projects with New Tests:** 4  
**Projects Ready for Build:** 6  
**Projects Ready for Runtime:** 15+

**Estimated Time:** 
- Install dependencies: ~10-15 minutes
- Build verification: ~5-10 minutes
- Test runs: ~5-10 minutes
- Runtime testing: ~30-60 minutes (per project)

**Total Estimated Time:** 1-2 hours for complete verification
