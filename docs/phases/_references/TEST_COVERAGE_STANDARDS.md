# Test Coverage Standards

**Purpose:** Standards and goals for test coverage across all projects.

## Coverage Goals

### By Project Category

**Category A Projects:**
- Minimum 80% code coverage
- All critical paths tested
- All utilities have unit tests
- Integration tests for key features

**Category B Projects:**
- Minimum 70% code coverage
- Critical paths tested
- Key utilities have unit tests
- Integration tests for main features

**Category C Projects:**
- Minimum 60% code coverage
- Critical functionality tested
- Important utilities have tests

## Test Types

### Unit Tests
**Purpose:** Test individual functions and components in isolation

**Coverage:**
- [ ] All utility functions
- [ ] Pure functions
- [ ] Helper functions
- [ ] Component logic (without rendering)

**Tools:**
- Vitest
- Jest
- Testing Library

### Component Tests
**Purpose:** Test React components

**Coverage:**
- [ ] Component rendering
- [ ] User interactions
- [ ] Props handling
- [ ] State changes
- [ ] Event handlers

**Tools:**
- React Testing Library
- Vitest/Jest
- Testing utilities

### Integration Tests
**Purpose:** Test feature integration

**Coverage:**
- [ ] Feature workflows
- [ ] Component interactions
- [ ] API integration
- [ ] State management

**Tools:**
- React Testing Library
- MSW (Mock Service Worker)
- Test utilities

### E2E Tests
**Purpose:** Test complete user flows

**Coverage:**
- [ ] Critical user flows
- [ ] Authentication flows
- [ ] Data submission flows
- [ ] Navigation flows

**Tools:**
- Playwright
- Cypress
- Puppeteer

## Test Infrastructure

### Test Framework Setup
- [ ] Test framework configured (Vitest/Jest)
- [ ] Test setup files created
- [ ] Test utilities available
- [ ] Mock data and fixtures created
- [ ] Test environment configured

### Test Configuration
```typescript
// vitest.config.ts example
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
```

## Test File Organization

### Structure
```
src/
├── components/
│   ├── MyComponent.tsx
│   └── MyComponent.test.tsx
├── utils/
│   ├── helpers.ts
│   └── helpers.test.ts
└── __tests__/
    └── integration/
        └── feature.test.ts
```

### Naming Conventions
- Test files: `*.test.ts` or `*.spec.ts`
- Test descriptions: Clear and descriptive
- Test groups: Organized by feature/component

## Test Quality Standards

### Test Writing
- [ ] Tests are readable and maintainable
- [ ] Tests are independent (no dependencies)
- [ ] Tests are fast (unit tests < 100ms)
- [ ] Tests cover edge cases
- [ ] Tests have clear assertions

### Test Coverage
- [ ] All branches tested
- [ ] All error paths tested
- [ ] Edge cases covered
- [ ] Boundary conditions tested

### Test Maintenance
- [ ] Tests updated with code changes
- [ ] Flaky tests identified and fixed
- [ ] Test performance monitored
- [ ] Test documentation updated

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- MyComponent.test.tsx
```

### CI/CD Integration
- [ ] Tests run on every commit
- [ ] Coverage reports generated
- [ ] Coverage thresholds enforced
- [ ] Test failures block deployment

## Coverage Reports

### Metrics to Track
- Line coverage
- Function coverage
- Branch coverage
- Statement coverage

### Coverage Goals
- Overall: Meet category minimum
- Critical paths: 100% coverage
- Utilities: 90%+ coverage
- Components: 80%+ coverage

## Common Test Patterns

### Component Testing
```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### Utility Testing
```typescript
import { myFunction } from './helpers'

test('myFunction returns expected value', () => {
  expect(myFunction(input)).toBe(expectedOutput)
})
```

### Integration Testing
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { MyFeature } from './MyFeature'

test('feature workflow', async () => {
  render(<MyFeature />)
  // Test user interaction flow
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

## Notes

- Focus on testing behavior, not implementation
- Write tests that are easy to understand
- Keep tests fast and reliable
- Update tests when requirements change
