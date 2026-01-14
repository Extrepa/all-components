# Manual Test Workflow Guides

**Date:** 2025-12-15  
**Purpose:** Detailed guides for testing each workflow category  
**Status:** Ready for Use

---

## Overview

This document provides detailed testing guides for each workflow category from `TEST_WORKFLOWS_2025-12-15.md`. Use these guides alongside the main test workflows document for comprehensive testing.

---

## Section 1: New User Onboarding Workflows

### Guide 1.1: First-Time Installation Testing

**Focus Areas:**
- Plugin installation process
- Initial plugin load
- Dashboard auto-open behavior
- Error handling on first load

**Key Test Points:**
1. **File Installation**
   - Verify all three files present
   - Check file sizes are correct
   - Verify file permissions

2. **Plugin Enablement**
   - Enable plugin in settings
   - Watch console for errors
   - Verify plugin appears in list

3. **Dashboard Behavior**
   - Check auto-open setting
   - Verify dashboard file created
   - Check dashboard content displays

4. **Error Scenarios**
   - Test with missing files
   - Test with corrupted files
   - Test with permission issues

**Common Issues:**
- Dashboard not auto-opening: Check settings
- Console errors: Check file paths
- Missing files: Verify installation

---

### Guide 1.2: Path Configuration Journey Testing

**Focus Areas:**
- Path validation feedback
- Suggestion system
- Security checks
- Settings persistence

**Key Test Points:**
1. **Path Validation**
   - Test empty paths
   - Test invalid paths
   - Test valid paths
   - Test path traversal attempts

2. **Suggestion System**
   - Verify suggestions appear
   - Test suggestion selection
   - Check suggestion accuracy

3. **Security Checks**
   - Test path traversal blocking
   - Test invalid character blocking
   - Verify error messages clear

4. **Settings Persistence**
   - Save settings
   - Restart Obsidian
   - Verify settings persist

**Common Issues:**
- Suggestions not appearing: Check vault structure
- Settings not saving: Check file permissions
- Validation not working: Check console errors

---

## Section 2: Daily Creative Workflows

### Guide 2.1: Idea Capture and Development Testing

**Focus Areas:**
- Capture hotkey functionality
- Modal behavior
- File appending
- Tag handling
- Promotion flow

**Key Test Points:**
1. **Hotkey Testing**
   - Test hotkey opens modal
   - Test hotkey from different contexts
   - Test hotkey conflicts

2. **Capture Modal**
   - Test text input
   - Test tag input
   - Test capture button
   - Test cancel button

3. **File Operations**
   - Verify entry appended
   - Check timestamp format
   - Verify tag format
   - Test multiple entries

4. **Promotion Flow**
   - Test promotion to project
   - Test promotion to lore
   - Verify folder/file creation
   - Check content transfer

**Common Issues:**
- Hotkey not working: Check keybind conflicts
- Modal not opening: Check console errors
- Entries not saving: Check file permissions

---

### Guide 2.2: Project Management Workflow Testing

**Focus Areas:**
- Project Pulse display
- Status calculation
- Project navigation
- Status updates

**Key Test Points:**
1. **Project Pulse Display**
   - Verify projects listed
   - Check status icons correct
   - Verify status matches activity
   - Test empty state

2. **Status Calculation**
   - Test active threshold
   - Test warm threshold
   - Test dormant threshold
   - Test abandoned threshold

3. **Project Navigation**
   - Test clicking projects
   - Verify folders open
   - Test invalid projects

4. **Status Updates**
   - Edit project files
   - Refresh dashboard
   - Verify status updates
   - Check threshold changes

**Common Issues:**
- Projects not showing: Check path configuration
- Status incorrect: Check file modification times
- Clicking not working: Check console errors

---

### Guide 2.3: Lore Development Workflow Testing

**Focus Areas:**
- Entity indexing
- Relationship detection
- Related entities display
- Auto-linking

**Key Test Points:**
1. **Entity Indexing**
   - Create lore entities
   - Verify indexing
   - Check index file
   - Test multiple entities

2. **Relationship Detection**
   - Create related entities
   - Verify relationships detected
   - Check relationship types
   - Test complex relationships

3. **Related Entities Display**
   - View related entities
   - Verify accuracy
   - Test empty relationships
   - Test many relationships

4. **Auto-Linking**
   - Enable auto-linking
   - Create entities
   - Verify links created
   - Test link accuracy

**Common Issues:**
- Entities not indexed: Check path configuration
- Relationships not detected: Check entity format
- Auto-linking not working: Check setting enabled

---

## Section 3: Session Management Workflows

### Guide 3.1: Time Machine Logging Testing

**Focus Areas:**
- Log file creation
- Session entry format
- Multiple sessions
- Log viewing

**Key Test Points:**
1. **Log File Creation**
   - Create first session
   - Verify log file created
   - Check date format
   - Verify file location

2. **Session Entry Format**
   - Check entry structure
   - Verify timestamp
   - Check content format
   - Test special characters

3. **Multiple Sessions**
   - Create multiple sessions same day
   - Verify appending works
   - Test sessions different days
   - Check file organization

4. **Log Viewing**
   - View Time Machine
   - Click log entries
   - Verify files open
   - Test navigation

**Common Issues:**
- Logs not creating: Check path configuration
- Entries not appending: Check file permissions
- Viewing not working: Check console errors

---

### Guide 3.2: Session Ghost Tracking Testing

**Focus Areas:**
- Activity tracking
- Data persistence
- File operations
- Data loading

**Key Test Points:**
1. **Activity Tracking**
   - Open various notes
   - Edit notes
   - Verify tracking
   - Check tracking data

2. **Data Persistence**
   - Track activity
   - Reload plugin
   - Verify data persists
   - Check data file

3. **File Operations**
   - Verify file creation
   - Check file format
   - Test file loading
   - Test error handling

4. **Data Loading**
   - Start with existing data
   - Verify loading works
   - Test corrupted data
   - Test missing file

**Common Issues:**
- Tracking not working: Check organ enabled
- Data not persisting: Check file permissions
- Loading errors: Check data file format

---

## Section 4: Creative Tools Workflows

### Guide 4.1: Dream Buffer Workflow Testing

**Focus Areas:**
- Dream capture
- Buffer storage
- Dream review
- Promotion

**Key Test Points:**
1. **Dream Capture**
   - Capture dreams
   - Verify storage
   - Check format
   - Test multiple dreams

2. **Buffer Storage**
   - Check buffer file
   - Verify content
   - Test file location
   - Check file format

3. **Dream Review**
   - View dreams
   - Verify display
   - Test filtering
   - Check navigation

4. **Promotion**
   - Promote to project
   - Promote to lore
   - Verify content transfer
   - Check file creation

**Common Issues:**
- Dreams not saving: Check path configuration
- Buffer not accessible: Check file permissions
- Promotion not working: Check target paths

---

### Guide 4.2: Thought Recycler Workflow Testing

**Focus Areas:**
- Old thought detection
- Recycled thought display
- Thought revival
- Promotion

**Key Test Points:**
1. **Old Thought Detection**
   - Ensure old entries exist
   - Run recycler
   - Verify detection
   - Check thresholds

2. **Recycled Thought Display**
   - View recycled thoughts
   - Verify accuracy
   - Test filtering
   - Check categorization

3. **Thought Revival**
   - Revive thoughts
   - Verify process
   - Check updates
   - Test promotion

4. **Promotion**
   - Promote revived thoughts
   - Verify content transfer
   - Check file creation
   - Test multiple promotions

**Common Issues:**
- Thoughts not detected: Check thresholds
- Display not working: Check console errors
- Revival not working: Check file permissions

---

### Guide 4.3: Idea DNA Splicer Workflow Testing

**Focus Areas:**
- Idea selection
- Strategy application
- Idea combination
- Splice saving

**Key Test Points:**
1. **Idea Selection**
   - Select first idea
   - Select second idea
   - Verify selection
   - Test invalid selection

2. **Strategy Application**
   - Test merge strategy
   - Test contrast strategy
   - Test apply-to strategy
   - Test transform strategy

3. **Idea Combination**
   - Verify combination
   - Check content
   - Test strategy effects
   - Verify output format

4. **Splice Saving**
   - Verify file creation
   - Check file location
   - Test file format
   - Verify content

**Common Issues:**
- Ideas not selecting: Check capture file
- Strategies not working: Check console errors
- Splices not saving: Check path configuration

---

### Guide 4.4: Prompt Forge Workflow Testing

**Focus Areas:**
- Note selection
- Prompt generation
- Prompt format
- Prompt saving

**Key Test Points:**
1. **Note Selection**
   - Select note with content
   - Select empty note
   - Test invalid selection
   - Verify selection

2. **Prompt Generation**
   - Generate prompt
   - Verify generation
   - Check content extraction
   - Test format

3. **Prompt Format**
   - Check prompt structure
   - Verify content included
   - Test special characters
   - Check formatting

4. **Prompt Saving**
   - Verify file creation
   - Check file location
   - Test file format
   - Verify multiple prompts

**Common Issues:**
- Prompts not generating: Check note content
- Format incorrect: Check generation logic
- Saving not working: Check path configuration

---

## Section 5: Energy and Adaptation Workflows

### Guide 5.1: Energy System Workflow Testing

**Focus Areas:**
- Energy level setting
- Low-energy mode
- Organ visibility
- Momentum tracking

**Key Test Points:**
1. **Energy Level Setting**
   - Set different levels
   - Verify setting saves
   - Test level changes
   - Check persistence

2. **Low-Energy Mode**
   - Enable low-energy mode
   - Verify organs hidden
   - Test dimming
   - Check visibility updates

3. **Organ Visibility**
   - Test visibility changes
   - Verify hidden organs
   - Check dimmed organs
   - Test restoration

4. **Momentum Tracking**
   - Track momentum
   - Verify calculation
   - Test decay
   - Check thresholds

**Common Issues:**
- Energy levels not saving: Check settings
- Low-energy mode not working: Check organ visibility
- Momentum not tracking: Check calculation logic

---

### Guide 5.2: Friction Scanner Workflow Testing

**Focus Areas:**
- Friction detection
- Report generation
- Issue identification
- Resolution tracking

**Key Test Points:**
1. **Friction Detection**
   - Run scanner
   - Verify detection
   - Check abandoned projects
   - Test capture gaps

2. **Report Generation**
   - View friction report
   - Verify accuracy
   - Check report format
   - Test report updates

3. **Issue Identification**
   - Identify issues
   - Verify categorization
   - Check severity
   - Test multiple issues

4. **Resolution Tracking**
   - Address issues
   - Verify resolution
   - Check report updates
   - Test recurring issues

**Common Issues:**
- Friction not detected: Check scan intervals
- Reports not generating: Check console errors
- Issues not identified: Check detection logic

---

## Section 6: Advanced Features Workflows

### Guide 6.1: Reality Map Workflow Testing

**Focus Areas:**
- Map generation
- Theme clustering
- Map navigation
- Performance

**Key Test Points:**
1. **Map Generation**
   - Generate map
   - Verify generation
   - Check map content
   - Test large vaults

2. **Theme Clustering**
   - Enable clustering
   - Verify clusters
   - Check cluster accuracy
   - Test cluster navigation

3. **Map Navigation**
   - Navigate map
   - Click clusters
   - Verify navigation
   - Test filtering

4. **Performance**
   - Test with large vault
   - Check generation time
   - Verify responsiveness
   - Test memory usage

**Common Issues:**
- Maps not generating: Check vault size
- Clustering not working: Check theme detection
- Performance issues: Check optimization

---

### Guide 6.2: Asset Brain Workflow Testing

**Focus Areas:**
- Asset detection
- Asset filtering
- Asset viewing
- Usage tracking

**Key Test Points:**
1. **Asset Detection**
   - Scan for assets
   - Verify detection
   - Check asset types
   - Test multiple types

2. **Asset Filtering**
   - Filter by type
   - Search assets
   - Verify filtering
   - Test multiple filters

3. **Asset Viewing**
   - View asset list
   - Open assets
   - Verify display
   - Test navigation

4. **Usage Tracking**
   - Track usage
   - Verify tracking
   - Check usage counts
   - Test updates

**Common Issues:**
- Assets not detected: Check scan paths
- Filtering not working: Check filter logic
- Viewing not working: Check modal display

---

### Guide 6.3: Entropy Dial Workflow Testing

**Focus Areas:**
- Entropy level setting
- System adaptation
- Effect visibility
- Level changes

**Key Test Points:**
1. **Entropy Level Setting**
   - Set different levels
   - Verify setting
   - Test level changes
   - Check persistence

2. **System Adaptation**
   - Verify adaptation
   - Check effects
   - Test different levels
   - Verify changes

3. **Effect Visibility**
   - Check low entropy effects
   - Check high entropy effects
   - Verify visibility
   - Test transitions

4. **Level Changes**
   - Change levels
   - Verify updates
   - Check adaptation speed
   - Test rapid changes

**Common Issues:**
- Levels not saving: Check settings
- Adaptation not working: Check logic
- Effects not visible: Check implementation

---

### Guide 6.4: Ritual Engine Workflow Testing

**Focus Areas:**
- Ritual execution
- Log creation
- Log format
- File sanitization

**Key Test Points:**
1. **Ritual Execution**
   - Execute different rituals
   - Verify execution
   - Check ritual types
   - Test error handling

2. **Log Creation**
   - Verify log files created
   - Check file locations
   - Test file organization
   - Verify file format

3. **Log Format**
   - Check log content
   - Verify structure
   - Test special characters
   - Check date format

4. **File Sanitization**
   - Test with special characters
   - Verify sanitization
   - Check file names
   - Test edge cases

**Common Issues:**
- Rituals not executing: Check organ enabled
- Logs not creating: Check path configuration
- Sanitization not working: Check utility function

---

## Testing Best Practices

### General Guidelines

1. **Test Systematically**
   - Follow workflow order
   - Complete each workflow before next
   - Document as you go

2. **Test Thoroughly**
   - Test all variations
   - Test edge cases
   - Test error conditions

3. **Document Everything**
   - Record all results
   - Document all issues
   - Note all observations

4. **Be Patient**
   - Some tests take time
   - Allow for async operations
   - Wait for completions

### Error Handling

1. **Check Console**
   - Always check console
   - Copy error messages
   - Note error context

2. **Verify Settings**
   - Check path configuration
   - Verify organ enabled
   - Check other settings

3. **Test Workarounds**
   - Try different approaches
   - Test manual steps
   - Document workarounds

---

## Quick Reference

### Workflow Categories

- **Section 1:** New User Onboarding (2 workflows)
- **Section 2:** Daily Creative Workflows (3 workflows)
- **Section 3:** Session Management (2 workflows)
- **Section 4:** Creative Tools (4 workflows)
- **Section 5:** Energy & Adaptation (2 workflows)
- **Section 6:** Advanced Features (4 workflows)

### Key Files

- `TEST_WORKFLOWS_2025-12-15.md` - Main workflows
- `TEST_EXECUTION_GUIDE_2025-12-15.md` - Execution guide
- `TEST_RESULTS_TEMPLATE.md` - Results template
- `TEST_EXECUTION_CHECKLIST.md` - Execution checklist

---

**Status:** Ready for Use  
**Last Updated:** 2025-12-15

