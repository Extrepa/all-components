# Errl OS Plugin - Testing Procedures

## Overview

This document outlines testing procedures for the Errl OS plugin, including test scenarios, edge cases, and known limitations.

## Test Scenarios

### Scenario 1: Fresh Installation

**Setup:**
- Clean Obsidian vault
- Plugin files copied to `.obsidian/plugins/errl-os/`

**Steps:**
1. Enable plugin in settings
2. Verify dashboard auto-opens
3. Check console for errors
4. Verify default files are created

**Expected:**
- Dashboard opens automatically
- `ErrlOS/Dashboard.md` created
- `ErrlOS/Capture.md` created (on first capture)
- No console errors

### Scenario 2: Capture Workflow

**Steps:**
1. Press `Ctrl/Cmd + Shift + C`
2. Enter test text
3. Add tag "test"
4. Click Capture
5. Open capture file
6. Verify entry appears

**Expected:**
- Modal opens on hotkey
- Entry appended to file
- Timestamp and tag present
- Notice shows "Thought captured!"

### Scenario 3: Project Pulse

**Prerequisites:**
- `Projects/` folder exists with subfolders

**Steps:**
1. Enable Project Pulse in settings
2. Refresh dashboard
3. Verify projects appear
4. Click on a project name
5. Adjust thresholds in settings
6. Refresh dashboard

**Expected:**
- Projects show with correct status icons
- Clicking opens project folder
- Threshold changes update statuses
- Status icons match modification times

### Scenario 4: Time Machine

**Steps:**
1. Enable Time Machine in settings
2. Create session log
3. Verify log file created
4. Create another log (same day)
5. View Time Machine
6. Check dashboard shows recent logs

**Expected:**
- Log file created with date format
- Multiple sessions append to same file
- Dashboard shows recent logs
- Clicking log date opens file

### Scenario 5: Settings Persistence

**Steps:**
1. Change dashboard path
2. Change capture path
3. Toggle organs on/off
4. Restart Obsidian
5. Verify settings persisted

**Expected:**
- All settings persist after restart
- Organs maintain enabled/disabled state
- File paths remain configured

### Scenario 6: Error Handling

**Steps:**
1. Set invalid file paths
2. Try to capture
3. Disable required organs
4. Test with missing folders

**Expected:**
- Graceful error messages
- Console logs helpful errors
- Plugin doesn't crash
- User notices explain issues

## Edge Cases

### Empty Vault
- No projects folder
- No existing files
- Verify graceful handling

### Large Vault
- Many projects
- Many files
- Verify performance acceptable

### Rapid Operations
- Multiple captures quickly
- Multiple dashboard refreshes
- Multiple organ toggles

### Invalid Paths
- Non-existent directories
- Invalid characters
- Very long paths

### Missing Files
- Dashboard file deleted
- Capture file deleted
- Log files deleted

## Known Limitations

1. **Project Pulse**: Only scans direct subdirectories of Projects/ folder
2. **Time Machine**: Cursor positioning may not work in all Obsidian versions
3. **Dashboard**: Project Pulse data fetched synchronously (may be slow with many projects)
4. **File Operations**: Some operations may fail silently if vault is locked

## Performance Testing

### Metrics to Check
- Dashboard generation time
- Project Pulse scanning time
- Capture operation speed
- Settings save/load time

### Thresholds
- Dashboard should generate in < 1 second
- Project Pulse should scan in < 5 seconds (for 50 projects)
- Capture should complete in < 500ms

## Regression Testing

After changes, verify:
- All existing features still work
- Settings persist correctly
- No console errors
- Dashboard displays correctly
- All commands accessible
- Hotkeys functional

## Browser Console Testing

Always check console for:
- Error messages
- Warning messages
- Unexpected logs
- Performance issues

## Manual Testing Checklist

See `MANUAL_TESTING_CHECKLIST.md` for comprehensive checklist.

## Automated Testing (Future)

Consider adding:
- Unit tests for kernel/organ logic
- Integration tests for workflows
- Performance benchmarks
- Error scenario tests

## Test Data

### Sample Projects Structure
```
Projects/
├── ActiveProject/
│   └── notes.md (modified today)
├── WarmProject/
│   └── notes.md (modified 5 days ago)
├── DormantProject/
│   └── notes.md (modified 30 days ago)
└── AbandonedProject/
    └── notes.md (modified 100 days ago)
```

### Sample Capture Entries
- Test with various text lengths
- Test with/without tags
- Test special characters
- Test empty captures (should be rejected)

## Reporting Issues

When reporting issues, include:
1. Obsidian version
2. Plugin version
3. Steps to reproduce
4. Expected behavior
5. Actual behavior
6. Console errors (if any)
7. Screenshots (if applicable)

## Test Environment

Recommended setup:
- Clean test vault
- Multiple test projects
- Various file structures
- Different settings configurations

## Continuous Testing

After each change:
1. Run manual testing checklist
2. Check console for errors
3. Verify all features work
4. Test edge cases
5. Check performance

