# Errl OS Plugin - Test Suite

**Purpose:** Automated and manual testing infrastructure for Errl OS Plugin

---

## Test Structure

```
tests/
├── unit/           # Unit tests for individual components
│   └── utils/      # Utility function tests
├── integration/    # Integration tests for organ interactions
│   └── organs/     # Organ integration tests
└── setup.ts        # Test setup and utilities
```

---

## Test Framework

**Framework:** Jest (recommended) or Vitest

**Setup Required:**
1. Install test framework: `npm install --save-dev jest @types/jest`
2. Configure Jest in `package.json` or `jest.config.js`
3. Add test scripts to `package.json`

---

## Running Tests

### Unit Tests

```bash
npm test                    # Run all tests
npm test -- unit            # Run only unit tests
npm test -- pathValidator   # Run specific test file
```

### Integration Tests

```bash
npm test -- integration     # Run only integration tests
```

### Watch Mode

```bash
npm test -- --watch         # Watch mode for development
```

---

## Writing Tests

### Unit Test Template

```typescript
import { PathValidator } from '../../src/utils/pathValidator';

describe('PathValidator', () => {
    describe('validatePath', () => {
        it('should validate empty path', () => {
            // Test implementation
        });
        
        it('should detect path traversal attempts', () => {
            // Test implementation
        });
    });
});
```

### Integration Test Template

```typescript
import { ErrlKernel } from '../../src/kernel/ErrlKernel';
import { DashboardOrgan } from '../../src/organs/dashboard/DashboardOrgan';

describe('DashboardOrgan Integration', () => {
    it('should register with kernel', () => {
        // Test implementation
    });
});
```

---

## Test Coverage

**Target Coverage:** 80%+ for critical paths

**Focus Areas:**
- Utility functions (PathValidator, FileUtils)
- Security functions (path traversal, sanitization)
- Core kernel functionality
- Organ registration and lifecycle

---

## Notes

- Tests should be isolated and independent
- Use mocks for Obsidian API when needed
- Test both success and error cases
- Document test assumptions

---

**Status:** Setup in Progress  
**Last Updated:** 2025-12-15

