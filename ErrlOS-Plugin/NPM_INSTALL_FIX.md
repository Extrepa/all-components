# npm Install Fix Guide

## Issue

npm install is failing with:
```
npm error Log files were not written due to an error writing to the directory: /Users/extrepa/.npm/_logs
```

## Root Cause

System-level npm log file permissions issue. This is not a code problem but a system configuration issue.

## Solutions

### Solution 1: Fix npm Permissions (Recommended)

```bash
# Fix npm log directory permissions
sudo chown -R $(whoami) ~/.npm

# Then try install again
cd /Users/extrepa/Projects/ErrlOS-Plugin
npm install
```

### Solution 2: Use npm with Different Log Location

```bash
# Set npm log location to project directory
npm config set cache ~/.npm-cache
npm config set logs-dir ./npm-logs

# Then install
npm install
```

### Solution 3: Install Jest Manually

If npm install continues to fail, you can install Jest manually:

```bash
cd /Users/extrepa/Projects/ErrlOS-Plugin

# Create node_modules if it doesn't exist
mkdir -p node_modules

# Install Jest directly (if you have access to npm cache)
# Or download and extract Jest manually
```

### Solution 4: Use Alternative Package Manager

If you have yarn or pnpm installed:

```bash
# Using yarn
yarn add -D jest @types/jest ts-jest

# Using pnpm
pnpm add -D jest @types/jest ts-jest
```

## Verification

After fixing npm install:

```bash
# Verify Jest is installed
npm list jest

# Verify test scripts work
npm test -- --version

# Run tests
npm test
```

## Current Status

- ✅ Jest configuration complete (`jest.config.js`)
- ✅ Test scripts added to `package.json`
- ✅ Test setup files exist
- ⏳ npm install pending (requires manual sudo command)

## Manual Fix Required

The npm log directory permission fix requires sudo access with password. This must be run manually in a terminal:

```bash
# Run this in your terminal (requires password)
sudo chown -R $(whoami) ~/.npm

# Then install dependencies
cd /Users/extrepa/Projects/ErrlOS-Plugin
npm install
```

**Note:** The sudo command cannot be automated as it requires password input.

## Workaround

Tests can be run once npm install is fixed. All configuration is complete and ready.

## Alternative: Manual Test Execution

If npm install cannot be fixed immediately, you can:
1. Use manual testing checklist
2. Test in Obsidian directly
3. Fix npm permissions when convenient

---

**Last Updated:** December 22, 2025  
**Status:** Configuration complete, npm install fix needed

