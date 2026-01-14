# Audio-Reactive Features Verification Test
**Date**: December 10, 2025  
**Tester**: [Your Name]  
**Test Type**: Manual Audio-Reactive Feature Verification

## Overview

This document provides comprehensive testing procedures for all Codex audio-reactive features. These tests require actual audio playback to verify frequency band extraction, beat detection, and visual responses.

## Prerequisites

1. **Audio Files Required**:
   - Bass-heavy track (e.g., electronic/dubstep with prominent bass drops)
   - Mid-frequency focused track (e.g., vocals, guitars)
   - Treble-rich track (e.g., high-pitched synths, cymbals)
   - Mixed track with all frequency ranges

2. **Test Environment**:
   - Browser: Chrome/Firefox (latest)
   - Audio system: Working speakers/headphones
   - DevTools: Open console (F12) for monitoring

3. **Setup**:
   - Start dev server: `npm run dev`
   - Open `localhost:5173`
   - Click "Ready" to start game
   - Open ErrlPhone (bottom-right) → Music tab
   - Load test audio file

## Test Procedures

### Test 1: Portal Rift Beat Synchronization

**Objective**: Verify portal rifts pulse and change color on detected beats

**Steps**:
1. Locate portal rifts in the scene (should be visible as glowing rings)
2. Load a track with clear, consistent beats (120-140 BPM recommended)
3. Observe portal rifts during playback

**Expected Results**:
- ✅ Portal ring color pulses/changes on each detected beat
- ✅ Ring rotation speed increases with beat intensity
- ✅ Portal center swirl intensity increases on beats
- ✅ Particle system radius expands on beats
- ✅ Color transitions are smooth (not jarring)

**Verification Checklist**:
- [ ] Ring color changes visible on beats
- [ ] Rotation speed correlates with beat intensity
- [ ] Portal center emissive intensity pulses
- [ ] Particles respond to beats
- [ ] No visual glitches or stuttering

**Notes**: 
- Beat detection threshold may need adjustment if beats aren't detected
- Check console for beat detection logs (if enabled)

---

### Test 2: Chromatic Fog Color Mapping

**Objective**: Verify fog color changes based on frequency bands (bass→red, mid→green, treble→blue)

**Steps**:
1. Load bass-heavy track first
2. Observe fog color in scene
3. Switch to mid-frequency track
4. Switch to treble-rich track
5. Load mixed track with all frequencies

**Expected Results**:
- ✅ Bass-heavy sections → Fog shifts toward red hue
- ✅ Mid-frequency sections → Fog shifts toward green hue
- ✅ Treble-rich sections → Fog shifts toward blue hue
- ✅ Mixed frequencies → Fog blends colors appropriately
- ✅ Fog density increases with bass energy
- ✅ Color transitions are smooth

**Verification Checklist**:
- [ ] Red tint visible during bass-heavy sections
- [ ] Green tint visible during mid-frequency sections
- [ ] Blue tint visible during treble-rich sections
- [ ] Color blending works with mixed frequencies
- [ ] Fog density responds to bass
- [ ] No color flickering or artifacts

**Notes**:
- Fog color may be subtle - look for hue shifts rather than dramatic color changes
- Check `updateAudioReactiveFog()` in main.js for color mapping logic

---

### Test 3: Spark Trails from Assets on Bass Hits

**Objective**: Verify assets spawn spark particles from edges on heavy bass hits

**Steps**:
1. Position avatar near Codex assets (BoomBox, Geodesic Station, DamagedHelmet)
2. Load bass-heavy track with prominent bass drops
3. Observe assets during bass hits (bass > 0.7 threshold)
4. Move avatar to different assets to test each one

**Expected Results**:
- ✅ Spark particles spawn from asset edges on bass hits
- ✅ Particle count scales with bass intensity
- ✅ Particles appear along bounding box edges
- ✅ Particles fade out naturally
- ✅ Multiple assets can spawn particles simultaneously

**Verification Checklist**:
- [ ] Spark particles visible from BoomBox on bass hits
- [ ] Spark particles visible from Geodesic Station on bass hits
- [ ] Spark particles visible from DamagedHelmet on bass hits
- [ ] Particle count increases with bass intensity
- [ ] Particles spawn from edges, not center
- [ ] No performance issues with multiple particles

**Notes**:
- Threshold is bass > 0.7 (70% of max bass energy)
- Particles may be subtle - watch closely during bass drops
- Check console for `spawnSparkTrails` logs (if enabled)

---

### Test 4: Laser Ribbons on Heavy Bass Drops

**Objective**: Verify laser ribbons spawn on heavy bass drops (bass > 0.7)

**Steps**:
1. Load bass-heavy track with prominent drops
2. Observe scene during heavy bass sections
3. Verify laser ribbons appear and animate

**Expected Results**:
- ✅ Laser ribbons spawn when bass > 0.7
- ✅ Lasers sweep across the scene
- ✅ Multiple colors used (red, green, blue)
- ✅ Laser intensity scales with bass energy
- ✅ Lasers fade out after sweep

**Verification Checklist**:
- [ ] Laser ribbons appear on heavy bass drops
- [ ] Lasers sweep across scene (not static)
- [ ] Multiple colors visible (red, green, blue)
- [ ] Intensity correlates with bass energy
- [ ] No visual artifacts or glitches
- [ ] Performance remains stable

**Notes**:
- Threshold is bass > 0.7
- Lasers use `createSweepingLasers()` from VisualEffects
- Check console for laser spawn logs (if enabled)

---

### Test 5: BoomBox Bass Response

**Objective**: Verify BoomBox responds to bass frequencies

**Steps**:
1. Position avatar near BoomBox (should be on stage, left side)
2. Load bass-heavy track
3. Observe BoomBox during playback

**Expected Results**:
- ✅ BoomBox emissive intensity pulses with bass
- ✅ Color may shift with bass intensity
- ✅ Visible pulsing/breathing effect
- ✅ Response is smooth, not jerky

**Verification Checklist**:
- [ ] Emissive intensity changes with bass
- [ ] Pulsing effect visible
- [ ] Response is smooth
- [ ] No visual artifacts

**Notes**:
- BoomBox is wired to bass frequencies via `updateAudioReactive()`
- Check `CodexAssetIntegration.js` for bass mapping

---

### Test 6: Geodesic Station Mid-Frequency Response

**Objective**: Verify Geodesic Station responds to mid frequencies

**Steps**:
1. Position avatar near Geodesic Station (floating mezzanine)
2. Load mid-frequency focused track (vocals, guitars)
3. Observe Geodesic Station during playback

**Expected Results**:
- ✅ Geodesic Station emissive intensity pulses with mid frequencies
- ✅ Holographic effects intensify with mid frequencies
- ✅ Visible pulsing/breathing effect
- ✅ Response is smooth

**Verification Checklist**:
- [ ] Emissive intensity changes with mid frequencies
- [ ] Holographic effects respond
- [ ] Pulsing effect visible
- [ ] Response is smooth

**Notes**:
- Geodesic Station is wired to mid frequencies
- Check `CodexAssetIntegration.js` for mid frequency mapping

---

### Test 7: DamagedHelmet Treble Response

**Objective**: Verify DamagedHelmet responds to treble frequencies

**Steps**:
1. Position avatar near DamagedHelmet (centerpiece, position 0, 1, 5)
2. Load treble-rich track (high-pitched synths, cymbals)
3. Observe DamagedHelmet during playback

**Expected Results**:
- ✅ DamagedHelmet emissive intensity pulses with treble
- ✅ Holographic effects intensify with treble
- ✅ Visible pulsing/breathing effect
- ✅ Response is smooth

**Verification Checklist**:
- [ ] Emissive intensity changes with treble
- [ ] Holographic effects respond
- [ ] Pulsing effect visible
- [ ] Response is smooth

**Notes**:
- DamagedHelmet is wired to treble frequencies
- Check `CodexAssetIntegration.js` for treble mapping

---

### Test 8: Frequency Band Extraction Accuracy

**Objective**: Verify frequency bands are extracted correctly

**Steps**:
1. Open DevTools console (F12)
2. Load different audio tracks
3. Monitor frequency band values (if logged)
4. Verify bands match expected frequencies

**Expected Results**:
- ✅ Bass band responds to low frequencies (20-250 Hz)
- ✅ Mid band responds to mid frequencies (250-4000 Hz)
- ✅ Treble band responds to high frequencies (4000-20000 Hz)
- ✅ Band values normalize to 0-1 range
- ✅ Bands update smoothly (no sudden jumps)

**Verification Checklist**:
- [ ] Bass band values increase with bass-heavy tracks
- [ ] Mid band values increase with mid-frequency tracks
- [ ] Treble band values increase with treble-rich tracks
- [ ] Values stay in 0-1 range
- [ ] Updates are smooth

**Notes**:
- Frequency bands extracted via `FrequencyBandExtractor`
- Check console for band values (if logging enabled)

---

### Test 9: Beat Detection Accuracy

**Objective**: Verify beat detection works correctly

**Steps**:
1. Load track with clear, consistent beats
2. Observe visual responses (portal rifts, strobe flashes)
3. Count beats manually vs detected beats
4. Test with different BPM tracks

**Expected Results**:
- ✅ Beats detected consistently
- ✅ Visual responses match beat timing
- ✅ No false positives (detections when no beat)
- ✅ No missed beats (beats not detected)
- ✅ Works across different BPM ranges

**Verification Checklist**:
- [ ] Beats detected consistently
- [ ] Visual responses match beats
- [ ] No false positives
- [ ] No missed beats
- [ ] Works with different BPMs

**Notes**:
- Beat detection uses `BeatDetector` class
- Threshold may need adjustment for different music styles
- Check console for beat detection logs

---

### Test 10: Performance During Heavy Audio Sections

**Objective**: Verify performance remains stable during intense audio sections

**Steps**:
1. Load bass-heavy track with many drops
2. Monitor FPS (F1 to open DevTools)
3. Observe during heavy bass sections
4. Check for frame drops or stuttering

**Expected Results**:
- ✅ FPS remains stable (60 FPS target)
- ✅ No frame drops during bass hits
- ✅ No stuttering or lag
- ✅ Particle system doesn't cause performance issues
- ✅ Multiple effects can run simultaneously

**Verification Checklist**:
- [ ] FPS stable during heavy sections
- [ ] No frame drops
- [ ] No stuttering
- [ ] Particle performance acceptable
- [ ] Multiple effects work together

**Notes**:
- Use DevTools (F1) to monitor FPS
- Check memory usage if performance issues occur
- Particle count may need optimization if FPS drops

---

## Test Results Summary

### Overall Status: ⏳ PENDING

**Tests Completed**: 0/10  
**Tests Passed**: 0/10  
**Tests Failed**: 0/10  
**Tests Skipped**: 0/10

### Individual Test Results

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Portal Rift Beat Synchronization | ⏳ Pending | |
| 2 | Chromatic Fog Color Mapping | ⏳ Pending | |
| 3 | Spark Trails from Assets | ⏳ Pending | |
| 4 | Laser Ribbons on Bass Drops | ⏳ Pending | |
| 5 | BoomBox Bass Response | ⏳ Pending | |
| 6 | Geodesic Station Mid Response | ⏳ Pending | |
| 7 | DamagedHelmet Treble Response | ⏳ Pending | |
| 8 | Frequency Band Extraction | ⏳ Pending | |
| 9 | Beat Detection Accuracy | ⏳ Pending | |
| 10 | Performance During Heavy Sections | ⏳ Pending | |

## Issues Found

_List any issues discovered during testing:_

1. **Issue**: [Description]
   - **Severity**: [Low/Medium/High/Critical]
   - **Steps to Reproduce**: [Steps]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]
   - **Screenshot/Log**: [If available]

## Recommendations

_List recommendations for improvements:_

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

1. Complete all manual tests with audio playback
2. Document any issues found
3. Verify fixes if issues are addressed
4. Update test results table
5. Create follow-up tests if needed

---

## Test Audio File Recommendations

### Bass-Heavy Tracks
- Electronic/dubstep tracks with prominent bass drops
- Hip-hop tracks with heavy bass lines
- EDM tracks with bass-heavy sections

### Mid-Frequency Tracks
- Vocal tracks (pop, rock, acoustic)
- Guitar-focused tracks
- Piano/instrumental tracks

### Treble-Rich Tracks
- High-pitched synth tracks
- Cymbal-heavy drum tracks
- Electronic tracks with high-frequency elements

### Mixed Tracks
- Full-range music (pop, rock, electronic)
- Orchestral music
- Complex electronic compositions

---

**Test Document Version**: 1.0  
**Last Updated**: December 10, 2025  
**Next Review**: After initial testing complete

