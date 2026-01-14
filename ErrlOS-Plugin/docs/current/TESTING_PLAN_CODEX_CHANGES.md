# Manual Testing Plan: Codex Work Summary Changes

This document provides a manual testing checklist for the three key changes from the December 22 work summary.

## Overview

The changes to test:
1. **Centralized organ metadata** in `src/organs/metadata.ts` - drives registrations, defaults, and UI lists
2. **Hardened settings persistence** with deep-merge behavior in `src/kernel/ErrlKernel.ts`
3. **Removed redundant command registration** on startup - commands only register on enable

---

## Pre-Testing Setup

- [ ] Build the plugin: `npm run build`
- [ ] Verify build succeeded (check for errors)
- [ ] Deploy to Obsidian vault: `npm run deploy`
- [ ] Open Obsidian and enable the plugin
- [ ] Open Developer Console (Help → Toggle Developer Tools → Console)

---

## Phase 1: Metadata Completeness Verification

### 1.1 Verify Metadata File
- [ ] Open `src/organs/metadata.ts`
- [ ] Verify exactly 16 organs are defined in `ORGAN_METADATA` array
- [ ] Check that each organ has all required fields:
  - [ ] `id` (string)
  - [ ] `name` (string, non-empty)
  - [ ] `description` (string, non-empty)
  - [ ] `phase` (one of the 5 phases)
  - [ ] `order` (number, unique)
  - [ ] `recommended` (boolean)
- [ ] Verify no duplicate IDs
- [ ] Verify `dashboard` and `capture` are marked as `recommended: true`

### 1.2 Verify Metadata Usage
- [ ] Open `src/organs/index.ts`
- [ ] Verify `ORGANS` array is built from `ORGAN_METADATA`
- [ ] Verify all organs in metadata have corresponding creators in `ORGAN_CREATORS`
- [ ] Open `src/settings/ErrlSettings.ts`
- [ ] Verify `DEFAULT_SETTINGS.enabledOrgans` is built from `ORGAN_METADATA` (line 122)
- [ ] Verify all 16 organs appear in `enabledOrgans` with default value `false`

---

## Phase 2: Settings Deep-Merge Testing

### 2.1 Test Nested Object Merging
- [ ] Open Obsidian Settings → Errl OS
- [ ] Navigate to Project Pulse settings
- [ ] Change "Active threshold" to `5` days
- [ ] Verify "Warm threshold" and "Dormant threshold" remain unchanged (14 and 90)
- [ ] Change "Warm threshold" to `20` days
- [ ] Verify "Active threshold" is still `5` and "Dormant threshold" is still `90`
- [ ] Close settings and reopen
- [ ] Verify all three thresholds are preserved correctly

### 2.2 Test Array Replacement
- [ ] Open Settings → Errl OS
- [ ] Find Lore Engine paths setting
- [ ] Add paths: `path1`, `path2`
- [ ] Save and close settings
- [ ] Reopen settings
- [ ] Replace with new paths: `path3`, `path4`
- [ ] Save and close settings
- [ ] Reopen settings
- [ ] Verify only `path3` and `path4` are present (not `path1` or `path2`)

### 2.3 Test Multiple Sequential Updates
- [ ] Open Settings → Errl OS
- [ ] Change "Dashboard path" to `Custom/Dashboard.md`
- [ ] Change "Active threshold" to `7` days
- [ ] Change "Capture file path" to `Custom/Capture.md`
- [ ] Close and reopen settings
- [ ] Verify all three changes are preserved:
  - [ ] Dashboard path is `Custom/Dashboard.md`
  - [ ] Active threshold is `7` days
  - [ ] Capture file path is `Custom/Capture.md`
- [ ] Verify other settings (like Warm threshold) are unchanged

### 2.4 Test Settings Persistence Across Reloads
- [ ] Make several setting changes (paths, thresholds, toggles)
- [ ] Close Obsidian completely
- [ ] Reopen Obsidian
- [ ] Open Settings → Errl OS
- [ ] Verify all changes persisted correctly
- [ ] Verify no settings were lost or reset to defaults

---

## Phase 3: Command Registration Testing

### 3.1 Verify Commands Not Registered on Startup
- [ ] Open Developer Console
- [ ] Reload Obsidian (disable and re-enable plugin, or restart Obsidian)
- [ ] Check console for any command registration errors
- [ ] Open Command Palette (`Ctrl/Cmd + P`)
- [ ] Type "Errl:"
- [ ] Verify NO commands appear if no organs are enabled
- [ ] This confirms commands are not registered on startup

### 3.2 Test Command Registration on Enable
- [ ] Open Settings → Errl OS
- [ ] Find "Dashboard" in Organs section
- [ ] Toggle it ON
- [ ] Open Command Palette (`Ctrl/Cmd + P`)
- [ ] Type "Errl:"
- [ ] Verify Dashboard commands appear:
  - [ ] "Errl: Open Dashboard"
  - [ ] "Errl: Refresh Dashboard"
- [ ] This confirms commands register when organ is enabled

### 3.3 Test Command Unregistration on Disable
- [ ] With Dashboard enabled (from previous step)
- [ ] Open Settings → Errl OS
- [ ] Toggle "Dashboard" OFF
- [ ] Open Command Palette (`Ctrl/Cmd + P`)
- [ ] Type "Errl:"
- [ ] Verify Dashboard commands are gone
- [ ] This confirms commands are unregistered when organ is disabled

### 3.4 Test Command Re-registration on Re-enable
- [ ] With Dashboard disabled (from previous step)
- [ ] Open Settings → Errl OS
- [ ] Toggle "Dashboard" ON again
- [ ] Open Command Palette (`Ctrl/Cmd + P`)
- [ ] Type "Errl:"
- [ ] Verify Dashboard commands appear again
- [ ] Verify commands are not duplicated (should see each command once)
- [ ] This confirms commands re-register correctly

### 3.5 Test Multiple Organs
- [ ] Enable multiple organs: Dashboard, Capture, Project Pulse
- [ ] Open Command Palette (`Ctrl/Cmd + P`)
- [ ] Type "Errl:"
- [ ] Verify commands from all enabled organs appear
- [ ] Disable one organ (e.g., Capture)
- [ ] Verify only that organ's commands disappear
- [ ] Verify other organs' commands remain

---

## Phase 4: Integration Testing

### 4.1 First-Run Wizard Uses Metadata
- [ ] Delete plugin data: `.obsidian/plugins/errl-os/data.json` (if exists)
- [ ] Reload plugin or restart Obsidian
- [ ] First-run wizard should appear
- [ ] Navigate to Step 4: Organ Selection
- [ ] Verify all 16 organs are listed
- [ ] Verify "Dashboard" and "Capture" are pre-selected (recommended)
- [ ] Verify other organs are not pre-selected
- [ ] This confirms wizard uses `getRecommendedOrganIds()` from metadata

### 4.2 Settings Tab Uses Metadata
- [ ] Open Settings → Errl OS
- [ ] Scroll to "Organs" section
- [ ] Verify all 16 organs are listed as toggles
- [ ] Verify organ names and descriptions match metadata
- [ ] Verify organ phases are shown in descriptions
- [ ] Toggle some organs on/off
- [ ] Verify changes persist
- [ ] This confirms Settings Tab uses `ORGAN_METADATA`

### 4.3 Main Registration Uses Metadata
- [ ] Open `src/main.ts`
- [ ] Verify line 21-23 uses `ORGANS` array (not hardcoded list)
- [ ] Verify it iterates `for (const organMetadata of ORGANS)`
- [ ] This confirms main.ts is metadata-driven

---

## Phase 5: Edge Cases

### 5.1 Empty Settings
- [ ] Delete `.obsidian/plugins/errl-os/data.json`
- [ ] Reload plugin
- [ ] Verify plugin loads with defaults
- [ ] Verify all 16 organs appear in settings
- [ ] Verify no errors in console

### 5.2 Partial Settings
- [ ] Manually edit `data.json` to have only partial settings
- [ ] Reload plugin
- [ ] Verify missing settings use defaults
- [ ] Verify existing settings are preserved
- [ ] Verify deep-merge works correctly

### 5.3 Invalid Settings
- [ ] Manually edit `data.json` with invalid values (null, wrong types)
- [ ] Reload plugin
- [ ] Verify plugin handles gracefully
- [ ] Verify defaults are used for invalid values
- [ ] Verify no crashes or errors

---

## Phase 6: Console Verification

### 6.1 Check for Errors
- [ ] Open Developer Console
- [ ] Reload plugin
- [ ] Check for any errors or warnings
- [ ] Verify no command registration errors
- [ ] Verify no metadata-related errors
- [ ] Verify no settings merge errors

### 6.2 Check for Expected Logs
- [ ] Look for "Loading Errl OS plugin"
- [ ] Look for "Errl OS plugin loaded"
- [ ] Verify no unexpected command registration logs on startup
- [ ] Verify command registration logs only when organs are enabled

---

## Test Results Summary

### Metadata Tests
- [ ] All 16 organs verified in metadata
- [ ] Metadata drives all systems correctly
- [ ] No duplicate IDs or missing fields

### Settings Tests
- [ ] Deep-merge preserves nested values
- [ ] Arrays replace correctly
- [ ] Multiple updates preserve all values
- [ ] Settings persist across reloads

### Command Registration Tests
- [ ] Commands not registered on startup
- [ ] Commands register on enable
- [ ] Commands unregister on disable
- [ ] No command duplication

### Integration Tests
- [ ] First-Run Wizard uses metadata
- [ ] Settings Tab uses metadata
- [ ] Main registration uses metadata

---

## Issues Found

Document any issues, bugs, or unexpected behavior:

**Issues:**
- 

**Suggestions:**
- 

**Notes:**
- 

---

## Completion Checklist

- [ ] All Phase 1 tests completed
- [ ] All Phase 2 tests completed
- [ ] All Phase 3 tests completed
- [ ] All Phase 4 tests completed
- [ ] All Phase 5 tests completed
- [ ] All Phase 6 tests completed
- [ ] All issues documented
- [ ] Test results summary completed

---

**Date:** _______________  
**Tester:** _______________  
**Status:** ⏳ In Progress / ✅ Complete

