# Errl OS Plugin - Manual Testing Checklist

Use this checklist to systematically test all features of the Errl OS plugin.

## Pre-Testing Setup

### 1. Verify Plugin Installation
- [ ] Check that files exist in `.obsidian/plugins/errl-os/`:
  - [ ] `main.js` (should be ~237-239KB)
  - [ ] `manifest.json` (236B)
  - [ ] `styles.css` (54KB)
- [ ] Open Obsidian Settings → Community plugins
- [ ] Find "Errl OS" in the list
- [ ] Toggle it ON
- [ ] Open console (Help → Toggle Developer Tools → Console tab)
- [ ] Check for any error messages (should see "Loading Errl OS plugin" and "Errl OS plugin loaded")

### 2. First-Run Wizard (New Install)
- [ ] First-run wizard appears automatically
- [ ] Step 1: Welcome screen displays correctly
- [ ] Step 2: Path auto-detection shows detected paths (if any)
- [ ] Step 3: Path configuration shows all essential paths:
  - [ ] Dashboard path (default: `ErrlOS/Dashboard.md`)
  - [ ] Capture file path (default: `ErrlOS/Capture.md`)
  - [ ] Time Machine log path (default: `ErrlOS/Logs/`)
  - [ ] Project Pulse path (optional)
  - [ ] Lore Engine paths (optional)
- [ ] Step 4: Organ selection shows all 16 organs
- [ ] Step 4: Auto-open dashboard toggle is visible and works
- [ ] Step 5: Completion summary shows configured settings
- [ ] "Next" button visible on steps 1-4
- [ ] "Previous" button visible on steps 2-5
- [ ] "Complete Setup" button visible on step 5
- [ ] All buttons are clickable and functional
- [ ] Settings are saved after completing wizard

---

## Phase 1 Testing

### Dashboard Testing

#### Auto-Open Test
- [ ] Close Obsidian completely
- [ ] Reopen Obsidian
- [ ] Dashboard should auto-open automatically (if enabled)
- [ ] If dashboard doesn't open:
  - [ ] Go to Settings → Errl OS
  - [ ] Check "Auto-open dashboard" is enabled
  - [ ] Try again

#### Dashboard Content Verification
- [ ] Open dashboard manually (Command Palette → "Errl: Open Dashboard")
- [ ] Verify dashboard shows these cards:
  - [ ] Capture card
  - [ ] Dashboard card
  - [ ] Project Pulse card
  - [ ] Time Machine card
  - [ ] Modules card
  - [ ] Today's Context card
- [ ] Check tagline appears: "Reality is slightly optional"
- [ ] Verify card layout is a responsive grid (cards should wrap on smaller screens)
- [ ] Check that cards have proper spacing and styling

#### Interactive Buttons Test
- [ ] **Capture Idea Button**
  - [ ] Click "Capture Idea" button on dashboard
  - [ ] Capture modal should open
  - [ ] Modal should have text area and tag field
  - [ ] Type test text and click "Capture"
  - [ ] Modal should close
  - [ ] Notice should appear: "Thought captured!"

- [ ] **Open Gravity Well Button**
  - [ ] Click "Open Gravity Well" button
  - [ ] Capture file should open (default: `ErrlOS/Capture.md`)
  - [ ] Verify file exists and contains captured entries

- [ ] **Refresh Dashboard Button**
  - [ ] Click "Refresh Dashboard" button
  - [ ] Dashboard should update/reload
  - [ ] Content should refresh

### Capture Testing

#### Hotkey Test
- [ ] Press `Ctrl/Cmd + Shift + C`
- [ ] Capture modal should open immediately
- [ ] Type a test thought: "This is a test capture"
- [ ] Add a tag: "test"
- [ ] Click "Capture" button
- [ ] Verify notice appears: "Thought captured!"
- [ ] Modal should close

#### Capture File Verification
- [ ] Open capture file (default: `ErrlOS/Capture.md`)
- [ ] Verify the entry was appended (not overwritten)
- [ ] Check timestamp format (ISO format)
- [ ] Verify tag appears: `#test`
- [ ] Create another capture with different text
- [ ] Verify both entries are in the file

#### Command Palette Test
- [ ] Press `Ctrl/Cmd + P` to open command palette
- [ ] Type "Errl: Capture Thought"
- [ ] Command should appear in results
- [ ] Execute the command
- [ ] Capture modal should open

### Settings Testing

#### Settings Tab Access
- [ ] Go to Settings → Errl OS
- [ ] Settings tab should open
- [ ] Verify all sections are visible:
  - [ ] Dashboard settings
  - [ ] Capture settings
  - [ ] Project Pulse settings
  - [ ] Time Machine settings
  - [ ] Organs section

#### Dashboard Path Setting
- [ ] Change "Dashboard path" to a different path (e.g., `ErrlOS/MyDashboard.md`)
- [ ] Close settings
- [ ] Open dashboard (should use new path)
- [ ] Verify dashboard file was created at new location
- [ ] Change back to default if desired

#### Capture File Path Setting
- [ ] Change "Capture file path" to a different path (e.g., `ErrlOS/MyCapture.md`)
- [ ] Close settings
- [ ] Create a new capture
- [ ] Verify capture goes to new file location
- [ ] Change back to default if desired

#### Auto-Open Dashboard Toggle
- [ ] Toggle "Auto-open dashboard" OFF
- [ ] Close and reopen Obsidian
- [ ] Dashboard should NOT auto-open
- [ ] Toggle back ON
- [ ] Close and reopen Obsidian
- [ ] Dashboard should auto-open

#### Organ Toggles
- [ ] Toggle "Dashboard" OFF
- [ ] Reload plugin (disable and re-enable)
- [ ] Dashboard should not auto-open
- [ ] Toggle "Dashboard" back ON
- [ ] Toggle "Capture" OFF
- [ ] Try capture hotkey - should not work
- [ ] Toggle "Capture" back ON
- [ ] Verify changes persist after Obsidian restart

---

## Phase 2 Testing

### Project Pulse Testing

#### Enable Project Pulse
- [ ] Go to Settings → Errl OS
- [ ] Find "Project Pulse" in Organs section
- [ ] Toggle it ON
- [ ] Reload plugin (disable and re-enable) or restart Obsidian

#### Dashboard Integration
- [ ] Open dashboard
- [ ] Project Pulse card should show real projects (if `Projects/` folder exists)
- [ ] Verify status icons appear:
  - [ ] 🔥 for active projects (modified ≤3 days ago)
  - [ ] ✨ for warm projects (modified 3-14 days ago)
  - [ ] 🌙 for dormant projects (modified 14-90 days ago)
  - [ ] 🪦 for abandoned projects (not modified in 90+ days)
- [ ] Check "last touched X days ago" format is correct
- [ ] Verify projects are sorted by most recent first

#### Project Links
- [ ] Click on a project name in the Project Pulse card
- [ ] Should open the project folder (or first file in folder)
- [ ] Test with multiple projects

#### Project Pulse Settings
- [ ] Go to Settings → Errl OS
- [ ] Change "Project Pulse path" to a different folder (if you have one)
- [ ] Refresh dashboard
- [ ] Verify it scans the new location
- [ ] Change back to default `Projects/` if desired

#### Threshold Settings
- [ ] In Settings, change "Active threshold" to 5 days
- [ ] Refresh dashboard
- [ ] Verify project statuses update (more projects may show as active)
- [ ] Change "Warm threshold" to 20 days
- [ ] Refresh dashboard
- [ ] Verify statuses update accordingly
- [ ] Reset thresholds to defaults (3, 14, 90) if desired

#### Project Pulse Command
- [ ] Press `Ctrl/Cmd + P`
- [ ] Type "Errl: View Project Pulse"
- [ ] Command should execute
- [ ] Notice should show summary: "🔥 X active | ✨ X warm | 🌙 X dormant | 🪦 X abandoned"

### Time Machine Testing

#### Enable Time Machine
- [ ] Go to Settings → Errl OS
- [ ] Find "Time Machine" in Organs section
- [ ] Toggle it ON
- [ ] Reload plugin

#### Create Session Log
- [ ] Press `Ctrl/Cmd + P`
- [ ] Type "Errl: Create Session Log"
- [ ] Command should execute
- [ ] Log file should be created (format: `YYYY-MM-DD.md` in `ErrlOS/Logs/`)
- [ ] File should open automatically for editing
- [ ] Verify file has header: "# Session Log - [Date]"
- [ ] Verify session entry format: "## [Time]" with placeholder text

#### Multiple Sessions
- [ ] Create another session log (same day)
- [ ] Verify it appends to the same file (doesn't create new file)
- [ ] Check both session entries are present
- [ ] Verify entries are separated properly

#### View Time Machine
- [ ] Press `Ctrl/Cmd + P`
- [ ] Type "Errl: View Time Machine"
- [ ] Should open `ErrlOS/Logs/Time-Machine-Index.md`
- [ ] If file doesn't exist, it should be created

#### Dashboard Integration
- [ ] Open dashboard
- [ ] Time Machine card should show recent logs (if any exist)
- [ ] Should show up to 3 most recent log dates
- [ ] Click on a log date → Should open that log file
- [ ] Click "View Time Machine" button → Should open index
- [ ] If no logs exist, should show "Create First Log" button
- [ ] Click "Create First Log" → Should create and open a log

#### Time Machine Settings
- [ ] Go to Settings → Errl OS
- [ ] Change "Time Machine log path" to a different location
- [ ] Create a new session log
- [ ] Verify it's created in the new location
- [ ] Change back to default if desired

---

## Integration Testing

### Multiple Organs
- [ ] Enable all Phase 1 and Phase 2 organs:
  - [ ] Dashboard: ON
  - [ ] Capture: ON
  - [ ] Project Pulse: ON
  - [ ] Time Machine: ON
- [ ] Open dashboard
- [ ] Verify all cards show appropriate content:
  - [ ] Capture card works
  - [ ] Project Pulse shows projects
  - [ ] Time Machine shows logs
  - [ ] Modules shows all organs with correct status
- [ ] Test that all features work together without conflicts

### Disable/Enable Testing
- [ ] Disable Project Pulse in settings
- [ ] Refresh dashboard
- [ ] Project Pulse card should show: "*Project Pulse organ not enabled*"
- [ ] Re-enable Project Pulse
- [ ] Refresh dashboard
- [ ] Project Pulse should show real data again

- [ ] Disable Time Machine in settings
- [ ] Refresh dashboard
- [ ] Time Machine card should show: "*Time Machine organ not enabled*"
- [ ] Re-enable Time Machine
- [ ] Refresh dashboard
- [ ] Time Machine should show logs again

### Error Handling
- [ ] Try setting invalid file paths in settings:
  - [ ] Set dashboard path to invalid location
  - [ ] Verify plugin handles gracefully
  - [ ] Check console for helpful error messages
- [ ] Try capturing with empty text
- [ ] Verify appropriate error handling
- [ ] Test with missing folders (e.g., no `Projects/` folder)
- [ ] Verify graceful degradation

---

## Design System Testing

### Visual Check
- [ ] Verify dashboard respects custom Errl design system
- [ ] Check colors match your theme
- [ ] Verify typography is consistent with vault
- [ ] Check layout is responsive (resize window, cards should wrap)
- [ ] Verify no style conflicts with other plugins
- [ ] Check button hover effects work
- [ ] Verify card shadows and borders look correct

### Accessibility
- [ ] Test keyboard navigation (Tab through buttons)
- [ ] Verify buttons are clearly clickable
- [ ] Check text is readable
- [ ] Verify contrast is adequate

---

## Performance Testing

- [ ] Test with large vault (if applicable)
- [ ] Verify Project Pulse scanning doesn't freeze Obsidian
- [ ] Check dashboard generation is fast
- [ ] Test with many projects in Projects/ folder
- [ ] Verify plugin doesn't slow down Obsidian startup

---

## Edge Cases

- [ ] Test with empty vault (no projects, no logs)
- [ ] Test with very old projects (should show as abandoned)
- [ ] Test with projects modified today (should show as active)
- [ ] Test creating multiple session logs in quick succession
- [ ] Test refreshing dashboard multiple times quickly
- [ ] Test enabling/disabling organs rapidly

---

## Final Verification

- [ ] All Phase 1 features work correctly
- [ ] All Phase 2 features work correctly
- [ ] Settings persist across sessions
- [ ] No console errors
- [ ] Plugin can be disabled and re-enabled without issues
- [ ] All commands are accessible via command palette
- [ ] All hotkeys work
- [ ] Dashboard is functional and responsive

---

## Notes Section

Use this space to document any issues, bugs, or observations:

**Issues Found:**
- 

**Suggestions:**
- 

**Performance Notes:**
- 

**Design System Notes:**
- 

---

## Testing Complete

Once all items are checked:
- [ ] Document any bugs found
- [ ] Note any improvements needed
- [ ] Verify plugin is ready for daily use

