# Errl OS Plugin - Updated Manual Testing Checklist
**Date:** December 21, 2025  
**Status:** Updated for Phase 1-3 Features

## New Features to Test

### ErrorHandler Integration
- [ ] Test error handling in all organs with file operations
- [ ] Verify user-friendly error messages appear
- [ ] Test error recovery scenarios
- [ ] Verify error context is preserved
- [ ] Test race condition handling

### Command Documentation & Discoverability
- [ ] Open Settings → Errl OS
- [ ] Click "View All Commands" button
- [ ] Verify CommandHelpModal opens
- [ ] Test search/filter functionality
- [ ] Verify commands are categorized by organ
- [ ] Check keyboard shortcuts are displayed
- [ ] Verify command descriptions are clear

### Session Ghost Status Indicator
- [ ] Enable Session Ghost organ
- [ ] Open Dashboard
- [ ] Verify status indicator shows "○ Not Tracking"
- [ ] Run "Session Ghost: Start Tracking" command
- [ ] Verify status indicator changes to "● Tracking"
- [ ] Run "Session Ghost: Stop Tracking" command
- [ ] Verify status indicator changes back to "○ Not Tracking"

## Updated Testing Sections

### Settings Tab Testing

#### Layered Control UI
- [ ] Verify Global Controls section exists
- [ ] Verify Feature-Level Controls section exists
- [ ] Verify Fine-Grained Controls section exists
- [ ] Test collapsible sections
- [ ] Verify help buttons appear next to organs
- [ ] Click help button and verify HelpModal opens
- [ ] Verify organ documentation displays correctly

#### Organ Enable/Disable with Walkthroughs
- [ ] Enable an organ that hasn't been enabled before
- [ ] Verify walkthrough modal appears
- [ ] Complete walkthrough and consent
- [ ] Verify organ enables successfully
- [ ] Disable organ
- [ ] Re-enable organ (should not show walkthrough again)
- [ ] Test organ version change scenario (if applicable)

#### Dependency Checking
- [ ] Try to enable organ with missing required dependency
- [ ] Verify error message appears
- [ ] Enable required dependency first
- [ ] Try to enable dependent organ again
- [ ] Verify it enables successfully
- [ ] Test optional dependency warnings
- [ ] Test conflict detection

### Error Handling Testing

#### File Operations
- [ ] Test file creation errors
- [ ] Test file modification errors
- [ ] Test file read errors
- [ ] Verify user-friendly error messages
- [ ] Test error recovery (race conditions)
- [ ] Verify errors don't crash the plugin

#### Path Validation
- [ ] Test invalid paths in settings
- [ ] Test path traversal attempts
- [ ] Verify validation feedback
- [ ] Test empty paths
- [ ] Verify suggestions appear

## Original Checklist Items (Still Valid)

### Pre-Testing Setup
- [ ] Verify plugin installation
- [ ] Enable plugin
- [ ] Check console for errors
- [ ] Verify dashboard opens

### Dashboard Testing
- [ ] Auto-open test
- [ ] Dashboard content verification
- [ ] Interactive buttons test
- [ ] Card layout verification

### Organ Testing
- [ ] Enable/disable organs
- [ ] Test organ commands
- [ ] Verify organ status
- [ ] Test organ interactions

## Testing Notes

### New Error Handling
- All file operations now have robust error handling
- User-friendly messages replace technical errors
- Errors are categorized for better handling
- Race conditions are handled gracefully

### New Command Help
- All commands are discoverable through settings
- Search and filter make finding commands easy
- Keyboard shortcuts are clearly displayed
- Commands are organized by organ

### New Status Indicators
- Session Ghost tracking status is visible
- Status updates in real-time
- Clear visual feedback (● active, ○ inactive)

## Test Execution

1. Start with new features (ErrorHandler, Command Help, Status Indicators)
2. Test updated workflows (walkthroughs, dependencies)
3. Verify existing functionality still works
4. Test error scenarios
5. Document any issues found

## Expected Results

- ✅ All new features work correctly
- ✅ Error handling is user-friendly
- ✅ Commands are discoverable
- ✅ Status indicators are accurate
- ✅ Walkthroughs appear when needed
- ✅ Dependencies are checked correctly
- ✅ No regressions in existing features

