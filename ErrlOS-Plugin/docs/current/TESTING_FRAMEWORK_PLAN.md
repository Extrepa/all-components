# Testing Framework Plan

## Date: 2025-12-16

## Overview

Create a comprehensive testing framework for Errl OS to ensure reliability and catch regressions.

## Testing Strategy

### 1. Unit Tests
**Focus:** Individual components and utilities

**Targets:**
- `ErrorHandler` - Error categorization and handling
- `FileUtils` - File operations and validation
- `DependencyChecker` - Dependency validation logic
- `LayeredControlHelper` - Control organization
- `PathValidator` - Path validation
- Individual organ methods (isolated)

**Framework:** Jest or Vitest (lightweight, fast)

### 2. Integration Tests
**Focus:** Component interactions

**Targets:**
- Kernel initialization
- Organ registration and lifecycle
- Settings persistence
- Event bus communication
- Service routing

**Framework:** Jest with Obsidian mock

### 3. Manual Testing Checklist
**Focus:** User workflows and edge cases

**Targets:**
- All organ enable/disable flows
- Settings UI interactions
- Command palette commands
- File operations
- Error scenarios
- Dependency checks

**Format:** Markdown checklist for manual execution

### 4. E2E Testing (Future)
**Focus:** Complete user workflows

**Targets:**
- First-run wizard
- Organ walkthroughs
- Dashboard creation and updates
- Capture workflow
- Full organ interactions

**Framework:** Playwright or Puppeteer (if Obsidian supports it)

## Implementation Plan

### Phase 1: Setup Testing Infrastructure
1. Install testing framework (Jest/Vitest)
2. Configure test environment
3. Create Obsidian API mocks
4. Setup test utilities

### Phase 2: Unit Tests
1. ErrorHandler tests
2. FileUtils tests
3. DependencyChecker tests
4. PathValidator tests
5. Utility function tests

### Phase 3: Integration Tests
1. Kernel tests
2. ModuleRegistry tests
3. Settings tests
4. Event bus tests

### Phase 4: Manual Testing Guide
1. Create comprehensive checklist
2. Document test procedures
3. Create test scenarios
4. Document expected behaviors

## Test Coverage Goals

- **Unit Tests:** 80%+ coverage for utilities
- **Integration Tests:** All major workflows covered
- **Manual Tests:** All user-facing features

## Testing Tools Needed

1. **Test Framework:** Jest or Vitest
2. **Mocking:** Mock Obsidian API
3. **Assertions:** Built-in or Chai
4. **Coverage:** Istanbul/NYC or Vitest coverage

## File Structure

```
tests/
├── unit/
│   ├── utils/
│   │   ├── ErrorHandler.test.ts
│   │   ├── FileUtils.test.ts
│   │   ├── DependencyChecker.test.ts
│   │   └── PathValidator.test.ts
│   └── organs/
│       └── (organ-specific tests)
├── integration/
│   ├── kernel.test.ts
│   ├── registry.test.ts
│   └── settings.test.ts
├── mocks/
│   ├── obsidian.ts
│   └── vault.ts
└── helpers/
    └── test-utils.ts

MANUAL_TESTING_CHECKLIST.md
```

## Priority

**High Priority:**
- ErrorHandler tests (critical for reliability)
- FileUtils tests (critical for file operations)
- DependencyChecker tests (critical for workflow prevention)

**Medium Priority:**
- Integration tests for core flows
- Manual testing checklist

**Low Priority:**
- E2E tests
- Performance tests

## Notes

- Obsidian plugin testing requires mocking Obsidian's API
- Manual testing will be essential since UI interactions are complex
- Focus on critical paths first (error handling, file operations, dependencies)
- Testing framework should be lightweight to not slow development

