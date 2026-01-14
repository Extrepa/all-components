# Codex Asset Integration Test Checklist

This document outlines the test procedures for verifying Codex asset integration functionality.

## Pre-Test Setup

1. ✅ Ensure dev server is running: `npm run dev`
2. ✅ Open browser console to monitor for errors
3. ✅ Have audio file ready for audio-reactive testing (optional)

## Test 1: Asset Loading

### 1.1 Initial Load
- [ ] Open game in browser
- [ ] Check console for asset loading messages
- [ ] Verify no 404 errors for asset files
- [ ] Confirm loading screen shows "Loading Codex assets..." message

### 1.2 Asset Visibility
- [ ] **The Shroom Bar Nightclub** is visible in scene (stage area)
- [ ] **Futuristic Geodesic Space Station** is visible (floating above stage)
- [ ] **Khronos BoomBox** is visible (on stage)
- [ ] **Khronos DamagedHelmet** is visible (centerpiece near spawn)

### 1.3 Asset Scaling
- [ ] All assets are appropriately sized (not too large/small)
- [ ] Assets fit within scene bounds
- [ ] No clipping through walls or floor

## Test 2: Material Enhancement

### 2.1 Material Conversion
- [ ] No console warnings about "emissive not supported"
- [ ] All assets have proper materials (MeshStandardMaterial)
- [ ] No MeshBasicMaterial warnings

### 2.2 Emissive Properties
- [ ] Assets show neon glow/emissive colors
- [ ] Geodesic Station has holographic effect (additive blending)
- [ ] DamagedHelmet has holographic effect (additive blending)
- [ ] BoomBox has green emissive tint

### 2.3 Shadow Support
- [ ] Assets cast shadows appropriately
- [ ] Assets receive shadows from lights

## Test 3: Audio-Reactive Features

### 3.1 Frequency Band Wiring
- [ ] Load audio file via ErrlPhone music tab
- [ ] Play audio track
- [ ] Verify frequency bands are extracted (check console logs)

### 3.2 Asset Response
- [ ] **BoomBox** emissive intensity changes with bass
- [ ] **Geodesic Station** emissive intensity changes with mid frequencies
- [ ] **DamagedHelmet** emissive intensity changes with treble
- [ ] Response is smooth (no jittery updates)

### 3.3 Beat Detection
- [ ] Beat detection triggers strobe flashes
- [ ] Assets pulse on detected beats
- [ ] No performance degradation during audio playback

## Test 4: Interaction System

### 4.1 DamagedHelmet Interaction
- [ ] Hover over DamagedHelmet shows interaction prompt
- [ ] Click/interact with DamagedHelmet triggers event
- [ ] Console shows "Interacted with holographic centerpiece!"
- [ ] Notification appears (if eventSystem is working)

### 4.2 Interaction Registration
- [ ] No console errors about missing interaction handlers
- [ ] InteractionSystem recognizes DamagedHelmet as interactive

## Test 5: Asset Tagging

### 5.1 Metadata
- [ ] Check browser console for asset source tags
- [ ] Verify `userData.assetSource` is set on all meshes
- [ ] Verify `userData.license` is set on all meshes

### 5.2 Traceability
- [ ] Asset metadata can be queried via `mesh.userData.assetSource`
- [ ] License information is accessible

## Test 6: Performance

### 6.1 Frame Rate
- [ ] Frame rate remains stable (60 FPS target)
- [ ] No significant drops when assets are visible
- [ ] Performance is acceptable on mid-range hardware

### 6.2 Memory Usage
- [ ] No memory leaks (monitor over 5+ minutes)
- [ ] Assets are properly cached (no duplicate loads)

## Test 7: Integration with Existing Systems

### 7.1 Scene Integration
- [ ] Assets don't interfere with avatar movement
- [ ] Assets don't block camera view
- [ ] Assets don't interfere with collectibles
- [ ] Assets don't interfere with portals

### 7.2 Collision System
- [ ] Avatar can move around assets
- [ ] No getting stuck on asset geometry
- [ ] Collision detection still works correctly

### 7.3 Lighting System
- [ ] Assets respond to scene lighting
- [ ] Assets don't break existing lighting effects
- [ ] Audio-reactive lighting still works

## Test 8: Error Handling

### 8.1 Missing Assets
- [ ] Game still loads if an asset fails to load
- [ ] Console shows appropriate error messages
- [ ] No crashes or white screens

### 8.2 Network Issues
- [ ] Assets handle network timeouts gracefully
- [ ] Loading screen shows appropriate progress

## Test 9: Regression Tests

### 9.1 Core Functionality
- [ ] Avatar movement still works
- [ ] Camera controls still work
- [ ] Collectibles still spawn and work
- [ ] Portals still function
- [ ] ErrlPhone still works
- [ ] DevTools still accessible

### 9.2 UI Systems
- [ ] Loading screen appears and works
- [ ] ErrlPhone tabs all functional
- [ ] Audio player in ErrlPhone works
- [ ] DevTools shortcuts work (F1, Ctrl+D)

## Test 10: Documentation Verification

### 10.1 Code Documentation
- [ ] `CodexAssetIntegration.js` is well-documented
- [ ] Methods have JSDoc comments
- [ ] Usage examples are clear

### 10.2 User Documentation
- [ ] `MODEL_INTEGRATION_GUIDE.md` includes Codex section
- [ ] `public/models/external/README.md` is up to date
- [ ] Daily notes reflect implementation status

## Known Issues / Limitations

- Manual downloads required for some assets (documented in README)
- Post-processing currently disabled (unrelated to Codex integration)
- Some linter warnings (trailing commas, console statements) - non-critical

## Test Results Template

```
Date: __________
Tester: __________
Browser: __________
OS: __________

Test Results:
- Test 1: Asset Loading: [ ] Pass [ ] Fail [ ] Partial
- Test 2: Material Enhancement: [ ] Pass [ ] Fail [ ] Partial
- Test 3: Audio-Reactive Features: [ ] Pass [ ] Fail [ ] Partial
- Test 4: Interaction System: [ ] Pass [ ] Fail [ ] Partial
- Test 5: Asset Tagging: [ ] Pass [ ] Fail [ ] Partial
- Test 6: Performance: [ ] Pass [ ] Fail [ ] Partial
- Test 7: Integration: [ ] Pass [ ] Fail [ ] Partial
- Test 8: Error Handling: [ ] Pass [ ] Fail [ ] Partial
- Test 9: Regression: [ ] Pass [ ] Fail [ ] Partial
- Test 10: Documentation: [ ] Pass [ ] Fail [ ] Partial

Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

