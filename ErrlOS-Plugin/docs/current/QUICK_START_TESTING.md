# Quick Start - Testing Setup

## npm Install Fix (Required First)

The npm install requires fixing log directory permissions. Run these commands in your terminal:

```bash
# Fix npm log directory permissions (requires password)
sudo chown -R $(whoami) ~/.npm

# Install dependencies
cd /Users/extrepa/Projects/ErrlOS-Plugin
npm install
```

## Run Tests

Once npm install completes:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Verify Setup

```bash
# Check Jest is installed
npm list jest

# Check test files are found
npm test -- --listTests
```

## Expected Output

After `npm install`, you should see:
- `node_modules/jest/` directory created
- `node_modules/@types/jest/` directory created
- `node_modules/ts-jest/` directory created

After `npm test`, you should see:
- Test execution results
- Pass/fail status for each test
- Coverage report (if using `npm run test:coverage`)

## Troubleshooting

If npm install still fails:
1. Check `~/.npm/_logs` directory permissions
2. Try: `mkdir -p ~/.npm/_logs && chmod 755 ~/.npm/_logs`
3. Or use alternative package manager (yarn/pnpm)

See [NPM_INSTALL_FIX.md](NPM_INSTALL_FIX.md) for detailed troubleshooting.

---

**Status:** Configuration complete, awaiting npm install

