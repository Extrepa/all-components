# Phase 1: Task 1.2 - Command Documentation & Discoverability Plan
**Date:** December 21, 2025, 10pm PST  
**Status:** ⏳ **PLANNING**

## Current State

### Command Documentation:
- ✅ Commands documented in `OrganDocumentation.capabilities[]`
- ✅ Each capability has `name`, `description`, `commands[]`, `hotkeys[]`
- ❌ No command help modal
- ❌ No command search/filter in settings
- ❌ No help buttons in command palette
- ❌ No command discovery mechanism

### Current Command Registration:
- Commands registered via `organ.registerCommands()`
- Commands appear in Obsidian's command palette
- No additional help or documentation shown

## Task 1.2 Goals

1. **Command Help Modal**
   - Create `CommandHelpModal.ts` component
   - Display all commands with descriptions
   - Show organ context for each command
   - Allow filtering/searching

2. **Command Discovery**
   - Add "View Commands" button in settings
   - Add help icons next to organ cards in dashboard
   - Show available commands in organ documentation view

3. **Command Search**
   - Filter commands by organ
   - Filter commands by category
   - Search by command name or description

## Implementation Plan

### Step 1: Create CommandHelpModal Component
- Location: `src/utils/CommandHelpModal.ts`
- Features:
  - List all commands from all enabled organs
  - Group by organ
  - Show command ID, name, description
  - Show hotkeys if available
  - Search/filter functionality

### Step 2: Add Command Discovery UI
- In settings tab: Add "View All Commands" button
- In dashboard: Add help icons to organ cards
- In organ documentation: Show commands section

### Step 3: Enhance Command Registration
- Store command metadata for help display
- Link commands to organ documentation

## Estimated Time: 2-3 hours

