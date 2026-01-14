# Organ Integration Tests

**Purpose:** Integration tests for organ interactions with kernel and other organs

---

## Test Structure

Each organ should have integration tests covering:
- Registration with kernel
- Settings loading
- Command registration
- Capability registration
- Event handling
- Inter-organ communication

---

## Test Template

```typescript
import { ErrlKernel } from '../../../src/kernel/ErrlKernel';
import { DashboardOrgan } from '../../../src/organs/dashboard/DashboardOrgan';
import { MockApp, TestUtils } from '../../setup';

describe('DashboardOrgan Integration', () => {
    let kernel: ErrlKernel;
    let organ: DashboardOrgan;
    let app: MockApp;
    
    beforeEach(async () => {
        app = TestUtils.createTestApp();
        // Initialize kernel and organ
    });
    
    it('should register with kernel', () => {
        // Test registration
    });
    
    it('should load settings correctly', async () => {
        // Test settings loading
    });
    
    it('should register commands', async () => {
        // Test command registration
    });
});
```

---

## Testing Guidelines

1. **Isolation:** Each test should be independent
2. **Mocks:** Use mocks for Obsidian API
3. **Coverage:** Test success and error cases
4. **Documentation:** Document test assumptions

---

**Status:** Templates Ready  
**Last Updated:** 2025-12-15

