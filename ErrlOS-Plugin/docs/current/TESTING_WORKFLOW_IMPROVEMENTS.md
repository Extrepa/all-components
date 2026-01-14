# Testing Plan: Workflow and Logic Improvements

This document outlines testing procedures for the workflow improvements that make the plugin work with any vault structure.

## Overview

The improvements include:
1. Generic default paths (no vault-specific defaults)
2. Path validation in settings
3. User-facing notices for missing folders
4. Improved dashboard error messages
5. Path suggestion system

## Test Scenarios

### Scenario 1: Fresh Install (New User)

**Setup:**
- New Obsidian vault (empty or minimal)
- Plugin installed and enabled for the first time

**Test Steps:**
1. Install plugin and enable it
2. Verify plugin loads without errors (check console)
3. Verify dashboard auto-opens
4. Check dashboard shows:
   - ✅ Capture card works
   - ✅ Dashboard card works
   - ✅ Project Pulse shows "*Configure project path in settings*"
   - ✅ Time Machine shows "*No logs yet*" (or creates logs folder)
   - ✅ Lore Engine shows "*Configure entity paths in settings*" (if enabled)

**Expected Results:**
- Plugin loads successfully
- Dashboard shows helpful messages for unconfigured paths
- No errors in console
- Core features (Capture, Dashboard) work without configuration

### Scenario 2: Existing User (Backward Compatibility)

**Setup:**
- User with existing plugin installation
- Has configured paths in settings (e.g., `Projects/`, `03-Creative/Lore Hub/`)

**Test Steps:**
1. Update plugin to new version
2. Verify existing settings are preserved
3. Verify all configured features still work:
   - Project Pulse shows projects (if path configured and folder exists)
   - Lore Engine works (if paths configured)
   - Promotion works (if paths configured)
4. Check no breaking changes

**Expected Results:**
- Existing settings preserved
- All features continue working as before
- No data loss or configuration reset

### Scenario 3: Path Validation in Settings

**Test Steps:**
1. Go to Settings → Errl OS
2. Test Project Pulse path:
   - Leave empty → Should show suggestion message
   - Enter invalid path (e.g., `Nonexistent/`) → Should show warning
   - Enter valid path that exists → Should show "Folder found"
   - Enter valid path that doesn't exist → Should show warning with suggestions
3. Test Lore Engine paths:
   - Leave empty → Should show suggestion message
   - Enter invalid paths → Should show warnings
   - Enter mix of valid/invalid → Should show which ones are invalid
4. Test Promotion paths:
   - Test project path validation
   - Test lore path validation
   - Both should show suggestions if empty

**Expected Results:**
- Settings show helpful validation messages
- Suggestions appear when paths are empty or invalid
- Warnings are clear and actionable

### Scenario 4: Project Pulse with Various Path States

**Test Steps:**
1. **Empty path:**
   - Set Project Pulse path to empty
   - Enable Project Pulse organ
   - Check dashboard → Should show "*Configure project path in settings*"
   - Run "View Project Pulse" command → Should show notice about path not configured

2. **Invalid path:**
   - Set Project Pulse path to `Nonexistent/`
   - Enable Project Pulse organ
   - Check dashboard → Should show "*Project folder not found. Check path in settings.*"
   - Run "View Project Pulse" command → Should show notice about folder not found

3. **Valid path, empty folder:**
   - Set Project Pulse path to existing empty folder
   - Enable Project Pulse organ
   - Check dashboard → Should show "*No projects found*"
   - Run "View Project Pulse" command → Should show "No projects found"

4. **Valid path with projects:**
   - Set Project Pulse path to folder with project subfolders
   - Enable Project Pulse organ
   - Check dashboard → Should show project list with status icons
   - Run "View Project Pulse" command → Should show summary

**Expected Results:**
- Each state shows appropriate message
- No silent failures
- User always knows what's happening

### Scenario 5: Lore Engine with Various Path States

**Test Steps:**
1. **Empty paths:**
   - Set Lore Engine paths to empty
   - Enable Lore Engine organ
   - Check dashboard → Should show "*Configure entity paths in settings*"
   - Run "Scan Lore Entities" command → Should show notice about paths not configured

2. **Invalid paths:**
   - Set Lore Engine paths to `Nonexistent/`
   - Enable Lore Engine organ
   - Check dashboard → Should show "*Entity folders not found. Check paths in settings.*"
   - Run "Scan Lore Entities" command → Should show notice about folders not found

3. **Mixed valid/invalid:**
   - Set Lore Engine paths to `ValidPath/, InvalidPath/`
   - Enable Lore Engine organ
   - Check dashboard → Should show "*Some paths not found. Check settings.*"
   - Run "Scan Lore Entities" command → Should show notice about missing paths

4. **Valid paths:**
   - Set Lore Engine paths to existing folders with lore entities
   - Enable Lore Engine organ
   - Check dashboard → Should show "View Lore Index" button
   - Run "Scan Lore Entities" command → Should scan and show success notice

**Expected Results:**
- Clear messages for each state
- Partial failures handled gracefully
- User guidance is helpful

### Scenario 6: Promotion with Various Path States

**Test Steps:**
1. **Empty project path:**
   - Set Promotion project path to empty
   - Try "Promote Capture to Project" command
   - Should show error: "Project path not configured. Set it in Settings → Errl OS."

2. **Invalid project path:**
   - Set Promotion project path to `Nonexistent/`
   - Try "Promote Capture to Project" command
   - Should show error: "Project folder not found at 'Nonexistent/'. Configure path in Settings → Errl OS."

3. **Empty lore path:**
   - Set Promotion lore path to empty
   - Try "Promote Capture to Lore" command
   - Should show error: "Lore path not configured. Set it in Settings → Errl OS."

4. **Valid paths:**
   - Set both paths to valid folders
   - Try promotion commands
   - Should work successfully

**Expected Results:**
- Clear error messages for missing configuration
- Promotion works when paths are valid
- No silent failures

### Scenario 7: Dashboard Messages

**Test Steps:**
1. Enable Project Pulse with empty path → Check dashboard message
2. Enable Project Pulse with invalid path → Check dashboard message
3. Enable Time Machine → Check dashboard shows logs or appropriate message
4. Enable Lore Engine with empty paths → Check dashboard message
5. Enable Lore Engine with invalid paths → Check dashboard message

**Expected Results:**
- All dashboard messages are clear and actionable
- Messages guide users to settings
- No confusing or technical error messages

### Scenario 8: Path Suggestions

**Test Steps:**
1. Create folders: `Projects/`, `projects/`, `02-Projects/`
2. Go to Settings → Errl OS
3. Set Project Pulse path to empty
4. Check if suggestions appear in description
5. Create folders: `Creative/Lore/`, `Lore/`
6. Set Lore Engine paths to empty
7. Check if suggestions appear

**Expected Results:**
- Suggestions detect common folder patterns
- Suggestions appear in settings descriptions
- Helpful for users discovering their vault structure

### Scenario 9: All Organs Still Work

**Test Steps:**
1. Test each organ individually:
   - Dashboard ✅
   - Capture ✅
   - Project Pulse (with configured path) ✅
   - Time Machine ✅
   - Lore Engine (with configured paths) ✅
   - Promotion (with configured paths) ✅
   - Energy System ✅
   - Friction Scanner ✅
   - Ritual Engine ✅
   - Entropy Dial ✅
   - Dream Buffer ✅
   - Thought Recycler ✅
   - Session Ghost ✅
   - Asset Brain ✅
   - Prompt Forge ✅
   - Idea DNA Splicer ✅

**Expected Results:**
- All organs work as before
- No regressions
- Organs that don't need path configuration work without changes

## Regression Testing

### Core Features
- [ ] Dashboard auto-opens (if enabled)
- [ ] Dashboard refresh works
- [ ] Capture hotkey works
- [ ] Capture modal works
- [ ] Capture file is created/updated
- [ ] All commands appear in Command Palette
- [ ] Settings tab opens and saves correctly

### Path-Dependent Features
- [ ] Project Pulse works with configured path
- [ ] Project Pulse shows helpful messages when path not configured
- [ ] Lore Engine works with configured paths
- [ ] Lore Engine shows helpful messages when paths not configured
- [ ] Promotion works with configured paths
- [ ] Promotion shows helpful errors when paths not configured

## Success Criteria

✅ Plugin works for users with any vault structure
✅ Users get clear guidance when paths need configuration
✅ All existing functionality preserved
✅ No silent failures - users always know what's wrong
✅ Settings validation prevents invalid configurations
✅ Path suggestions help users discover their vault structure
✅ Backward compatibility maintained for existing users

## Notes

- Test with both empty vaults and vaults with existing structure
- Test with various folder naming conventions
- Verify console doesn't show errors (only warnings for missing folders)
- Check that user-facing messages are clear and non-technical

