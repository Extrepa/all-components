# Settings Structure Review - December 16, 2025

## Summary of Changes

The settings structure has been simplified and clarified to eliminate confusion.

## Before (Confusing)

**Dashboard Customization Section:**
- Card Layout dropdown
- "Organ cards" - toggles to show/hide organ cards (16 organs duplicated here)
- "System sections" - toggles for context and modules

**Organs Section:**
- Toggles to enable/disable organs (16 organs shown again)

**Problem**: Organs appeared twice, making it unclear what each toggle did.

## After (Simplified)

**Dashboard Customization Section:**
- Card Layout dropdown
- "System Sections" - only for non-organ dashboard elements:
  - Today's Context (context)
  - Modules (modules)

**Organs Section:**
- Toggles to enable/disable organs
- **When you enable an organ**: Its dashboard card automatically appears
- **When you disable an organ**: Its dashboard card automatically hides

**Result**: No duplication, clearer purpose for each section.

## Organ Definitions Verification

✅ **ORGAN_DEFINITIONS** (16 organs):
1. dashboard
2. capture
3. projectPulse
4. timeMachine
5. loreEngine
6. realityMap
7. promotion
8. energy
9. frictionScanner
10. ritual
11. entropyDial
12. dreamBuffer
13. thoughtRecycler
14. sessionGhost
15. assetBrain
16. promptForge

**Note:** ideaDnaSplicer was removed on December 16, 2025.

✅ **enabledOrgans in ErrlSettings** (16 organs):
- Matches ORGAN_DEFINITIONS exactly
- All organ IDs are consistent

## Terminology Clarification

- **Organs**: Functional systems (dashboard, capture, projectPulse, etc.)
- **System Sections**: Non-organ dashboard UI elements (Today's Context, Modules)
- **Dashboard Cards**: Visual representation of organs/sections on the dashboard

## How It Works Now

1. **Enable an organ** → Organ system activates + card appears on dashboard
2. **Disable an organ** → Organ system deactivates + card hides from dashboard
3. **System sections** → Can be shown/hidden independently (they're not organs)

## Files Modified

- `src/settings/ErrlSettingsTab.ts`:
  - Removed "Organ cards" from Dashboard Customization
  - Updated Organs section to automatically manage card visibility
  - Improved descriptions for clarity

## Reset Instructions

See `RESET_SETTINGS.md` for instructions on resetting plugin settings to defaults.

