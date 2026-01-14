# Errl OS Plugin - Performance Check Guide

## Overview

This guide provides procedures for checking plugin performance metrics, including load times, render times, and resource usage.

## Performance Metrics

### Built-in Metrics

The Dashboard Organ tracks performance metrics internally:
- Post-processor runs
- Interval checks
- Mutation observer triggers
- Styles applied

**Location:** `src/organs/dashboard/DashboardOrgan.ts` (lines 18-25)

**Note:** These metrics are tracked but not currently exposed in UI. They can be viewed in console logs if DEBUG mode is enabled.

## Performance Checks

### 1. Plugin Load Time

**Procedure:**
1. Open Obsidian Developer Tools (Help → Toggle Developer Tools)
2. Go to Console tab
3. Clear console
4. Reload plugin (Settings → Community plugins → Toggle OFF/ON)
5. Note the time between "Loading Errl OS plugin" and "Errl OS plugin loaded"

**Expected:** < 2 seconds for initial load, < 1 second for reload

**Measurement:**
```javascript
// In console, check timestamps
console.time('Plugin Load');
// After reload
console.timeEnd('Plugin Load');
```

### 2. Dashboard Render Time

**Procedure:**
1. Open Developer Tools → Performance tab
2. Start recording
3. Open dashboard (Command Palette → "Errl: Open Dashboard")
4. Stop recording
5. Check render time in timeline

**Expected:** < 500ms for dashboard to appear and render

**Alternative Method:**
1. Open dashboard
2. Check console for `[Errl OS] Dashboard rendered` message
3. Note time from file open to render complete

### 3. Organ Enable/Disable Time

**Procedure:**
1. Open Developer Tools → Console
2. Enable an organ (Settings → Errl OS → Toggle organ ON)
3. Note time from toggle to organ enabled
4. Disable organ
5. Note time from toggle to organ disabled

**Expected:** < 1 second per organ

**Measurement:**
- Check console for `[Errl OS] Organ enabled: <organId>` messages
- Time between toggle and message

### 4. Settings Save Time

**Procedure:**
1. Open Settings → Errl OS
2. Change a setting (e.g., dashboard path)
3. Note time from change to save confirmation
4. Reload plugin
5. Verify setting persisted

**Expected:** < 100ms for settings save

**Measurement:**
- Settings are saved automatically on change
- Check `data.json` file modification time

### 5. Memory Usage

**Procedure:**
1. Open Developer Tools → Memory tab
2. Take heap snapshot before enabling plugin
3. Enable plugin
4. Take heap snapshot after plugin loaded
5. Compare snapshots

**Expected:** < 10MB additional memory for plugin

**Alternative:**
- Use Activity Monitor (macOS) or Task Manager (Windows)
- Check Obsidian process memory before/after plugin enable

### 6. First-Run Wizard Performance

**Procedure:**
1. Reset plugin settings (delete `data.json`)
2. Reload plugin
3. Time wizard appearance
4. Time each wizard step navigation
5. Time settings application on completion

**Expected:**
- Wizard appears: < 1 second after plugin load
- Step navigation: < 100ms per step
- Settings application: < 500ms

## Performance Benchmarks

### Target Metrics

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Plugin Load | < 1s | < 2s | > 2s |
| Dashboard Render | < 300ms | < 500ms | > 500ms |
| Organ Enable | < 500ms | < 1s | > 1s |
| Settings Save | < 50ms | < 100ms | > 100ms |
| Memory Usage | < 5MB | < 10MB | > 10MB |
| Wizard Load | < 500ms | < 1s | > 1s |

### Current Performance (Estimated)

Based on code analysis:
- **Plugin Load:** ~500ms-1s (depends on organ count)
- **Dashboard Render:** ~200-400ms (depends on content)
- **Organ Enable:** ~200-500ms (includes walkthrough if shown)
- **Settings Save:** ~10-50ms (file I/O)
- **Memory Usage:** ~2-5MB (estimated)

## Performance Optimization

### Already Implemented

1. **Event Delegation:** Single document-level click handler
2. **Scoped Observers:** MutationObserver scoped to dashboard view only
3. **Throttled Intervals:** 1s max interval, only re-applies when needed
4. **Computed Style Checks:** Avoids unnecessary DOM writes
5. **WeakSet Tracking:** Prevents duplicate processing

### Potential Optimizations

1. **Lazy Loading:** Load organs only when enabled
2. **Caching:** Cache dashboard content between renders
3. **Debouncing:** Debounce settings saves
4. **Batch Operations:** Batch multiple settings changes

## Performance Monitoring

### Console Logging

Enable detailed logging:
```javascript
// In console
localStorage.setItem('errl-os-debug', 'true');
// Reload plugin
```

### Metrics Collection

Performance metrics are tracked in `DashboardOrgan`:
- `performanceMetrics.postProcessorRuns`
- `performanceMetrics.intervalChecks`
- `performanceMetrics.mutationObserverTriggers`
- `performanceMetrics.stylesApplied`

**Access:** Currently internal only. Could be exposed via settings or debug command.

## Troubleshooting Performance Issues

### Slow Plugin Load

**Symptoms:** Plugin takes > 2 seconds to load

**Possible Causes:**
- Too many organs enabled
- Large settings file
- Network requests (if any)

**Solutions:**
- Disable unused organs
- Check settings file size
- Review console for errors

### Slow Dashboard Render

**Symptoms:** Dashboard takes > 500ms to render

**Possible Causes:**
- Large dashboard content
- Many cards enabled
- Complex post-processing

**Solutions:**
- Reduce dashboard content
- Hide unused cards
- Check console for performance warnings

### High Memory Usage

**Symptoms:** Plugin uses > 10MB memory

**Possible Causes:**
- Memory leaks in event listeners
- Large data structures
- Unclosed resources

**Solutions:**
- Check for proper cleanup in `onUnload()`
- Review event listener management
- Check for circular references

## Performance Testing Checklist

- [ ] Plugin load time measured
- [ ] Dashboard render time measured
- [ ] Organ enable/disable time measured
- [ ] Settings save time measured
- [ ] Memory usage checked
- [ ] Wizard performance checked
- [ ] All metrics within acceptable ranges
- [ ] No performance regressions

## Notes

- Performance metrics are tracked but not currently exposed in UI
- Most performance optimizations are already implemented
- Plugin is designed for efficiency with minimal overhead
- Performance may vary based on vault size and enabled organs

---

**Last Updated:** December 22, 2025  
**Status:** Performance check procedures documented

