# Comprehensive Test Workflows - 2025-12-15

**Date:** 2025-12-15  
**Purpose:** Detailed test workflows for all user scenarios  
**Status:** Ready for Execution

---

## Quick Reference

- **New User Workflows:** Section 1
- **Daily Creative Workflows:** Section 2
- **Session Management:** Section 3
- **Creative Tools:** Section 4
- **Energy & Adaptation:** Section 5
- **Advanced Features:** Section 6

---

## Section 1: New User Onboarding Workflows

### Workflow 1.1: First-Time Installation

**Objective:** Verify plugin works correctly on fresh installation

**Prerequisites:**
- Clean Obsidian vault (or test vault)
- Plugin files ready

**Steps:**
1. Copy plugin files to `.obsidian/plugins/errl-os/`
2. Open Obsidian
3. Go to Settings → Community plugins
4. Enable "Errl OS"
5. Check console for errors
6. Verify dashboard auto-opens (if enabled)
7. Open dashboard manually if needed
8. Verify dashboard content displays

**Expected Results:**
- ✅ Plugin loads without errors
- ✅ Console shows "Loading Errl OS plugin" and "Errl OS plugin loaded"
- ✅ Dashboard opens (auto or manual)
- ✅ Dashboard shows all cards
- ✅ No error messages in console

**Test Variations:**
- Vault with no existing structure
- Vault with existing structure
- Vault with conflicting paths
- Dashboard auto-open enabled/disabled

---

### Workflow 1.2: Path Configuration Journey

**Objective:** Verify path configuration works correctly

**Prerequisites:**
- Plugin installed and enabled
- Vault with some folder structure

**Steps:**
1. Open Settings → Errl OS
2. Navigate to "Project Pulse" section
3. Enter a path (e.g., `Projects/`)
4. Observe validation feedback
5. Try invalid path (e.g., `../`)
6. Observe security warning
7. Try non-existent path
8. Observe suggestions (if available)
9. Enter valid path
10. Save settings
11. Verify path is saved
12. Restart Obsidian
13. Verify path persists

**Expected Results:**
- ✅ Validation provides clear feedback
- ✅ Invalid paths show warnings
- ✅ Path traversal attempts blocked
- ✅ Suggestions appear when available
- ✅ Valid paths save correctly
- ✅ Settings persist after restart

**Test Variations:**
- Valid existing path
- Non-existent path
- Path with suggestions
- Path traversal attempt
- Empty path
- Invalid characters

---

## Section 2: Daily Creative Workflows

### Workflow 2.1: Idea Capture and Development

**Objective:** Verify complete idea capture and promotion flow

**Prerequisites:**
- Plugin installed and enabled
- Paths configured (optional for capture)

**Steps:**
1. Press `Ctrl/Cmd + Shift + C` (capture hotkey)
2. Enter test idea: "Test idea for workflow"
3. Add tag: "test"
4. Click "Capture"
5. Verify notice: "Thought captured!"
6. Open capture file (default: `ErrlOS/Capture.md`)
7. Verify entry appears with timestamp and tag
8. Capture another idea
9. Verify both entries in file
10. Open dashboard
11. Click "Promote to Project" (if configured)
12. Enter project name
13. Verify project folder created
14. Verify project tracked by Project Pulse

**Expected Results:**
- ✅ Hotkey opens capture modal
- ✅ Entry appended to file (not overwritten)
- ✅ Timestamp and tag correct
- ✅ Multiple entries work
- ✅ Promotion creates project structure
- ✅ Project Pulse tracks new project

**Test Variations:**
- Single capture
- Multiple rapid captures
- Capture with/without tags
- Promotion to project
- Promotion to lore
- Invalid promotion inputs

---

### Workflow 2.2: Project Management Workflow

**Objective:** Verify project tracking and management

**Prerequisites:**
- Plugin installed and enabled
- Project Pulse path configured
- At least one project folder exists

**Steps:**
1. Open dashboard
2. Locate Project Pulse card
3. Verify projects listed with status icons
4. Click on an active project
5. Verify project folder opens
6. Edit a file in project folder
7. Refresh dashboard
8. Verify project status updated
9. View project details
10. Complete project (if applicable)
11. Verify ritual log created

**Expected Results:**
- ✅ Projects listed with correct status
- ✅ Status icons match activity levels
- ✅ Clicking projects opens folders
- ✅ Status updates after file edits
- ✅ Project details accurate
- ✅ Rituals create logs correctly

**Test Variations:**
- Active project (recent edits)
- Warm project (moderate activity)
- Dormant project (old activity)
- Abandoned project (very old)
- New project
- Project status transitions

---

### Workflow 2.3: Lore Development Workflow

**Objective:** Verify lore entity management and linking

**Prerequisites:**
- Plugin installed and enabled
- Lore Engine paths configured
- Some lore entities exist

**Steps:**
1. Create a new lore entity file
2. Add entity metadata (if using frontmatter)
3. Save file
4. Open Lore Engine (if command available)
5. Verify entity indexed
6. Create related entity
7. Verify relationship detected
8. View related entities
9. Promote content to lore
10. Verify lore file created
11. Verify auto-linking (if enabled)

**Expected Results:**
- ✅ Entities indexed correctly
- ✅ Relationships detected
- ✅ Related entities shown
- ✅ Promotion creates lore files
- ✅ Auto-linking works (if enabled)

**Test Variations:**
- Single entity
- Multiple related entities
- Entity with no relations
- Entity with many relations
- Promotion to lore
- Auto-linking enabled/disabled

---

## Section 3: Session Management Workflows

### Workflow 3.1: Time Machine Logging

**Objective:** Verify session logging works correctly

**Prerequisites:**
- Plugin installed and enabled
- Time Machine enabled

**Steps:**
1. Start a work session
2. Verify Time Machine creates/updates log
3. Work on multiple files
4. End session
5. Verify log updated with session entry
6. Open dashboard
7. Locate Time Machine card
8. Verify recent logs shown
9. Click on a log entry
10. Verify log file opens
11. Verify log content correct
12. Create another session (same day)
13. Verify sessions append to same file

**Expected Results:**
- ✅ Logs created with correct date format
- ✅ Multiple sessions append correctly
- ✅ Dashboard shows recent logs
- ✅ Clicking logs opens files
- ✅ Log content accurate

**Test Variations:**
- First session of day
- Multiple sessions same day
- Session spanning midnight
- Viewing old logs
- Log file creation
- Log file appending

---

### Workflow 3.2: Session Ghost Tracking

**Objective:** Verify activity tracking and persistence

**Prerequisites:**
- Plugin installed and enabled
- Session Ghost enabled

**Steps:**
1. Open various notes
2. Edit some notes
3. Verify tracking data collected
4. Check tracking data file exists
5. Reload plugin (disable/enable)
6. Verify tracking data persists
7. Open more notes
8. Verify tracking continues
9. View tracking data (if command available)

**Expected Results:**
- ✅ Activity tracked correctly
- ✅ Data persists across reloads
- ✅ File operations work correctly
- ✅ No data loss on reload

**Test Variations:**
- Single note tracking
- Multiple notes tracking
- Note editing tracking
- Plugin reload persistence
- Data file creation
- Data file loading

---

## Section 4: Creative Tools Workflows

### Workflow 4.1: Dream Buffer Workflow

**Objective:** Verify dream capture and promotion

**Prerequisites:**
- Plugin installed and enabled
- Dream Buffer enabled

**Steps:**
1. Open Dream Buffer (command or dashboard)
2. Capture a dream/logic-free thought
3. Verify dream saved to buffer
4. Review dreams
5. Promote dream to project/lore
6. Verify dream moved to appropriate location

**Expected Results:**
- ✅ Dreams saved correctly
- ✅ Promotion works correctly
- ✅ Dreams accessible for review

**Test Variations:**
- Single dream capture
- Multiple dreams
- Dream promotion
- Dream review

---

### Workflow 4.2: Thought Recycler Workflow

**Objective:** Verify old thought recycling

**Prerequisites:**
- Plugin installed and enabled
- Thought Recycler enabled
- Capture file with old entries

**Steps:**
1. Ensure capture file has old entries
2. Open Thought Recycler (command or dashboard)
3. Verify old thoughts identified
4. View recycled thoughts
5. Revive a thought
6. Verify thought promoted or updated

**Expected Results:**
- ✅ Old thoughts identified correctly
- ✅ Recycled thoughts shown
- ✅ Revival process works

**Test Variations:**
- Old capture entries
- Recent capture entries
- Multiple old entries
- Thought revival

---

### Workflow 4.3: Idea DNA Splicer Workflow

**Objective:** Verify idea combination functionality

**Prerequisites:**
- Plugin installed and enabled
- Idea DNA Splicer enabled
- Capture file with multiple ideas

**Steps:**
1. Open Idea DNA Splicer (command)
2. Select first idea
3. Select second idea
4. Choose combination strategy
5. Verify ideas combined
6. Verify combined idea saved
7. Review splice

**Expected Results:**
- ✅ Ideas combined correctly
- ✅ Strategy applied correctly
- ✅ Splice saved correctly
- ✅ Error handling works

**Test Variations:**
- Merge strategy
- Contrast strategy
- Apply-to strategy
- Transform strategy
- Invalid input handling

---

### Workflow 4.4: Prompt Forge Workflow

**Objective:** Verify prompt generation from notes

**Prerequisites:**
- Plugin installed and enabled
- Prompt Forge enabled
- Note with content

**Steps:**
1. Open a note with content
2. Open Prompt Forge (command)
3. Generate prompt from note
4. Verify prompt created
5. Verify prompt saved
6. Use prompt (if applicable)

**Expected Results:**
- ✅ Prompts generated correctly
- ✅ Prompts saved correctly
- ✅ Content extracted correctly

**Test Variations:**
- Note with content
- Empty note
- Note with tags
- Multiple prompts from same note

---

## Section 5: Energy and Adaptation Workflows

### Workflow 5.1: Energy System Workflow

**Objective:** Verify energy level management

**Prerequisites:**
- Plugin installed and enabled
- Energy Organ enabled

**Steps:**
1. Open Settings → Errl OS
2. Navigate to Energy settings
3. Set energy level (e.g., "high")
4. Verify low-energy mode disabled
5. Enable low-energy mode
6. Verify organs hidden/dimmed
7. Adjust energy level
8. Verify organ visibility updates
9. Check momentum tracking

**Expected Results:**
- ✅ Energy levels work correctly
- ✅ Low-energy mode functions
- ✅ Momentum tracked correctly
- ✅ Organ visibility updates

**Test Variations:**
- High energy mode
- Low energy mode
- Energy level changes
- Momentum tracking
- Organ visibility

---

### Workflow 5.2: Friction Scanner Workflow

**Objective:** Verify friction detection and reporting

**Prerequisites:**
- Plugin installed and enabled
- Friction Scanner enabled
- Some projects and capture entries

**Steps:**
1. Ensure some projects exist
2. Ensure some capture entries exist
3. Open Friction Scanner (command or dashboard)
4. Verify scanner runs
5. Verify abandoned projects detected
6. Verify capture gaps identified
7. View friction report
8. Address friction (if applicable)
9. Verify friction resolved

**Expected Results:**
- ✅ Friction detected correctly
- ✅ Reports accurate
- ✅ User can address issues

**Test Variations:**
- Abandoned projects
- Capture gaps
- Session ghost data analysis
- Friction resolution

---

## Section 6: Advanced Features Workflows

### Workflow 6.1: Reality Map Workflow

**Objective:** Verify knowledge mapping functionality

**Prerequisites:**
- Plugin installed and enabled
- Reality Map enabled
- Vault with various files and tags

**Steps:**
1. Open Reality Map (command or dashboard)
2. Verify map scans vault
3. Verify map clusters by theme
4. View map
5. Explore clusters
6. Navigate connections

**Expected Results:**
- ✅ Map generated correctly
- ✅ Clustering works
- ✅ Navigation functional
- ✅ Performance acceptable

**Test Variations:**
- Map generation
- Theme clustering
- Tag inclusion
- Map navigation
- Large vault handling

---

### Workflow 6.2: Asset Brain Workflow

**Objective:** Verify asset detection and management

**Prerequisites:**
- Plugin installed and enabled
- Asset Brain enabled
- Vault with assets (SVGs, images, etc.)

**Steps:**
1. Ensure vault has assets
2. Open Asset Brain (command or dashboard)
3. Verify assets detected
4. View asset list
5. Filter assets by type
6. Search assets
7. Open an asset
8. Verify asset usage tracked

**Expected Results:**
- ✅ Assets detected correctly
- ✅ Filtering works
- ✅ Assets accessible
- ✅ Usage tracked

**Test Variations:**
- Asset detection
- Asset filtering
- Asset viewing
- Usage tracking
- Multiple asset types

---

### Workflow 6.3: Entropy Dial Workflow

**Objective:** Verify entropy level management

**Prerequisites:**
- Plugin installed and enabled
- Entropy Dial enabled

**Steps:**
1. Open Entropy Dial (command or dashboard)
2. Adjust entropy level (low)
3. Verify system adapts to level
4. Verify entropy effects visible
5. Change entropy level (high)
6. Verify system adapts again

**Expected Results:**
- ✅ Entropy levels work
- ✅ System adapts correctly
- ✅ Effects visible

**Test Variations:**
- Low entropy (order)
- High entropy (chaos)
- Entropy level changes
- System adaptation

---

### Workflow 6.4: Ritual Engine Workflow

**Objective:** Verify ritual logging functionality

**Prerequisites:**
- Plugin installed and enabled
- Ritual Organ enabled
- Ritual log path configured

**Steps:**
1. Start session ritual
2. Verify ritual log created
3. Work on project
4. Complete project ritual
5. Verify completion log created
6. Declare canon ritual
7. Verify canon log created
8. Verify log content accurate
9. Verify file names sanitized

**Expected Results:**
- ✅ Rituals create logs correctly
- ✅ Log content accurate
- ✅ File names sanitized
- ✅ Logs organized correctly

**Test Variations:**
- Session start ritual
- Session end ritual
- Project complete ritual
- Canon declare ritual
- Abandon ritual
- Multiple rituals

---

## Test Execution Checklist

### Pre-Testing
- [ ] Plugin installed correctly
- [ ] Plugin enabled in Obsidian
- [ ] Console open for error checking
- [ ] Test vault prepared (if needed)

### During Testing
- [ ] Follow workflow steps exactly
- [ ] Document any deviations
- [ ] Note any errors or issues
- [ ] Take screenshots if needed

### Post-Testing
- [ ] Document results
- [ ] Note any failures
- [ ] Report issues found
- [ ] Update test results document

---

## Test Results Template

For each workflow tested:

**Workflow:** [Name]  
**Date:** [Date]  
**Tester:** [Name]  
**Result:** [Pass/Fail/Partial]  
**Notes:** [Any observations]  
**Issues Found:** [List any issues]  
**Screenshots:** [If applicable]

---

**Status:** Ready for Execution  
**Last Updated:** 2025-12-15

