# Test Execution Guide - 2025-12-15

**Date:** 2025-12-15  
**Purpose:** Guide for executing the 17 comprehensive test workflows  
**Status:** Ready for Use

---

## Overview

This guide provides step-by-step instructions for executing all 17 test workflows documented in `TEST_WORKFLOWS_2025-12-15.md`. Use this guide alongside the test workflows document to systematically test all features of the Errl OS plugin.

---

## Pre-Execution Setup

### 1. Environment Preparation

**Required:**
- Obsidian installed and running
- Errl OS plugin installed and enabled
- Test vault (or use existing vault)
- Console access (Help → Toggle Developer Tools)

**Optional:**
- Fresh test vault for clean testing
- Backup of existing vault (if using production vault)

### 2. Plugin Verification

Before starting tests:
1. Open Obsidian Settings → Community plugins
2. Verify "Errl OS" is enabled
3. Open console (Cmd/Ctrl + Option/Alt + I)
4. Check for any error messages
5. Verify dashboard opens (if auto-open enabled)

### 3. Test Data Preparation

**For New User Workflows:**
- Use fresh vault or reset test vault
- Clear plugin settings if needed

**For Feature Workflows:**
- Ensure test data exists (projects, lore entities, etc.)
- Or create test data as part of workflow

---

## Execution Procedures

### General Execution Steps

For each workflow:

1. **Read the Workflow**
   - Review objective and prerequisites
   - Understand expected results
   - Note test variations

2. **Prepare Environment**
   - Set up prerequisites
   - Configure paths if needed
   - Enable required organs

3. **Execute Steps**
   - Follow steps in order
   - Document any deviations
   - Note any issues encountered

4. **Verify Results**
   - Check expected results
   - Compare with actual results
   - Document discrepancies

5. **Record Results**
   - Use `TEST_RESULTS_TEMPLATE.md`
   - Mark pass/fail
   - Document issues found

---

## Workflow Execution Order

### Recommended Order

**Day 1: Foundation Testing**
1. Workflow 1.1: First-Time Installation
2. Workflow 1.2: Path Configuration Journey
3. Workflow 2.1: Idea Capture and Development

**Day 2: Core Features**
4. Workflow 2.2: Project Management Workflow
5. Workflow 2.3: Lore Development Workflow
6. Workflow 3.1: Time Machine Logging
7. Workflow 3.2: Session Ghost Tracking

**Day 3: Creative Tools**
8. Workflow 4.1: Dream Buffer Workflow
9. Workflow 4.2: Thought Recycler Workflow
10. Workflow 4.3: Idea DNA Splicer Workflow
11. Workflow 4.4: Prompt Forge Workflow

**Day 4: Energy and Advanced**
12. Workflow 5.1: Energy System Workflow
13. Workflow 5.2: Friction Scanner Workflow
14. Workflow 6.1: Reality Map Workflow
15. Workflow 6.2: Asset Brain Workflow
16. Workflow 6.3: Entropy Dial Workflow
17. Workflow 6.4: Ritual Engine Workflow

---

## Troubleshooting Common Test Issues

### Issue: Plugin Not Loading

**Symptoms:**
- Dashboard doesn't open
- Console shows errors
- Settings tab not visible

**Solutions:**
1. Check console for error messages
2. Verify plugin files exist in `.obsidian/plugins/errl-os/`
3. Disable and re-enable plugin
4. Restart Obsidian
5. Check file permissions

### Issue: Path Validation Failing

**Symptoms:**
- Path validation shows errors
- Suggestions not appearing
- Paths not saving

**Solutions:**
1. Verify path format (should end with `/` for folders)
2. Check path exists in vault
3. Try creating folder manually first
4. Check for path traversal attempts (should be blocked)
5. Verify vault structure

### Issue: Features Not Working

**Symptoms:**
- Commands not appearing
- Organs not responding
- Settings not persisting

**Solutions:**
1. Check organ is enabled in settings
2. Verify paths are configured
3. Check console for errors
4. Reload plugin
5. Verify settings saved correctly

### Issue: Dashboard Not Updating

**Symptoms:**
- Dashboard content stale
- Cards not showing
- Buttons not working

**Solutions:**
1. Click "Refresh Dashboard" button
2. Close and reopen dashboard
3. Check console for errors
4. Verify dashboard file exists
5. Check file permissions

---

## Result Recording

### Using the Template

1. Open `TEST_RESULTS_TEMPLATE.md`
2. Copy template for each workflow
3. Fill in:
   - Workflow name and date
   - Tester name
   - Pass/fail status
   - Notes and observations
   - Issues found (if any)
   - Screenshots (if applicable)

### Result Categories

**Pass:** All expected results achieved, no issues found

**Partial:** Most results achieved, minor issues found

**Fail:** Expected results not achieved, issues found

**Blocked:** Cannot execute due to missing prerequisites or blockers

---

## Post-Execution

### 1. Review Results

- Review all test results
- Identify patterns in failures
- Note common issues
- Prioritize fixes

### 2. Document Issues

- Create issue reports for failures
- Include steps to reproduce
- Add console errors
- Note environment details

### 3. Update Documentation

- Update test workflows if needed
- Add new test cases for edge cases found
- Update troubleshooting guide
- Document workarounds

---

## Best Practices

### During Testing

1. **Test One Workflow at a Time**
   - Complete each workflow before moving to next
   - Don't skip steps
   - Document as you go

2. **Test Variations**
   - Try different test variations
   - Test edge cases
   - Test error conditions

3. **Document Everything**
   - Take notes during testing
   - Screenshot issues
   - Copy console errors

4. **Be Thorough**
   - Don't assume features work
   - Verify all expected results
   - Test error handling

### Result Quality

1. **Be Specific**
   - Describe issues clearly
   - Include exact error messages
   - Note reproduction steps

2. **Be Honest**
   - Mark failures honestly
   - Don't skip tests
   - Document partial passes

3. **Be Helpful**
   - Suggest fixes if possible
   - Note workarounds
   - Provide context

---

## Quick Reference

### Test Workflow Categories

- **Section 1:** New User Onboarding (2 workflows)
- **Section 2:** Daily Creative Workflows (3 workflows)
- **Section 3:** Session Management (2 workflows)
- **Section 4:** Creative Tools (4 workflows)
- **Section 5:** Energy & Adaptation (2 workflows)
- **Section 6:** Advanced Features (4 workflows)

### Key Files

- `TEST_WORKFLOWS_2025-12-15.md` - Detailed workflows
- `TEST_RESULTS_TEMPLATE.md` - Result recording template
- `TEST_EXECUTION_CHECKLIST.md` - Execution checklist
- `MANUAL_TESTING_CHECKLIST.md` - Manual testing checklist

### Console Commands

- Open Console: `Cmd/Ctrl + Option/Alt + I`
- Reload Plugin: Disable/enable in settings
- Reload App: Command Palette → "Reload app without saving"

---

## Notes

- Execute tests in order for best results
- Some workflows depend on previous workflows
- Document all deviations from expected results
- Take breaks between test sessions
- Review results before moving to next workflow

---

**Status:** Ready for Execution  
**Last Updated:** 2025-12-15

