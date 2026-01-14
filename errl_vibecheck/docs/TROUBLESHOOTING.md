# Troubleshooting Guide

Common issues and their solutions when using or developing VibeCheck.

## Table of Contents

- [Setup Issues](#setup-issues)
- [API Issues](#api-issues)
- [Rendering Issues](#rendering-issues)
- [Performance Issues](#performance-issues)
- [Browser Issues](#browser-issues)
- [State Management Issues](#state-management-issues)
- [Audio Issues](#audio-issues)

## Setup Issues

### API Key Not Working

**Symptoms:**
- "API key not found" errors
- All generations fail
- 401 Unauthorized errors

**Solutions:**

1. **Check .env.local file exists:**
   ```bash
   cat .env.local
   # Should show: GEMINI_API_KEY=your_key_here
   ```

2. **Verify API key format:**
   - Should start with your API key prefix
   - No quotes around the key
   - No extra spaces

3. **Check environment variable loading:**
   ```typescript
   // In llm.ts, temporarily add:
   console.log('API Key:', process.env.API_KEY ? 'Set' : 'Missing')
   ```

4. **Restart dev server:**
   - Environment variables load on startup
   - Changes require server restart

5. **Verify API key is valid:**
   - Check at https://aistudio.google.com/apikey
   - Ensure key has proper permissions
   - Check if key is expired

### Dependencies Not Installing

**Symptoms:**
- `npm install` fails
- Missing module errors
- Version conflicts

**Solutions:**

1. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version  # Should be 18+
   ```

3. **Use specific npm version:**
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Check for conflicting packages:**
   - Review `package.json` for conflicts
   - Update to latest compatible versions

### Port Already in Use

**Symptoms:**
- "Port 5173 is already in use"
- Server won't start

**Solutions:**

1. **Kill process on port:**
   ```bash
   # Find process
   lsof -ti:5173
   # Kill it
   kill -9 $(lsof -ti:5173)
   ```

2. **Use different port:**
   ```bash
   npm run dev -- --port 3000
   ```

3. **Check for other Vite instances:**
   - Close other terminal windows
   - Check background processes

## API Issues

### Rate Limit Errors (429)

**Symptoms:**
- "RESOURCE_EXHAUSTED" errors
- Generations fail after many requests
- Slow response times

**Solutions:**

1. **Wait and retry:**
   - Rate limits reset over time
   - Wait 1-2 minutes before retrying

2. **Reduce concurrency:**
   - Already set to 1 in code
   - Don't generate multiple batches simultaneously

3. **Use faster models:**
   - Flash-Lite is fastest
   - Pro models are slower

4. **Check API quota:**
   - Review usage at Google Cloud Console
   - Consider upgrading quota if needed

### Timeout Errors

**Symptoms:**
- Generations hang
- "timeout" errors after 193 seconds
- Long-running prompts fail

**Solutions:**

1. **Simplify prompt:**
   - Shorter prompts generate faster
   - Remove complex requirements

2. **Use faster model:**
   - Flash instead of Pro
   - Disable thinking mode

3. **Check network:**
   - Slow connections cause timeouts
   - Try different network

4. **Increase timeout (development only):**
   ```typescript
   // In llm.ts
   const timeoutMs = 300_000 // 5 minutes
   ```

### Invalid Model Errors

**Symptoms:**
- "Model not found" errors
- Specific model fails

**Solutions:**

1. **Check model string:**
   - Verify in `src/lib/models.ts`
   - Ensure model name matches API

2. **Check model availability:**
   - Some models may be deprecated
   - Preview models may be unavailable

3. **Update model configuration:**
   - Check Google AI documentation
   - Update model strings if changed

### No Response from API

**Symptoms:**
- Generations hang indefinitely
- No error, no response
- Network tab shows pending request

**Solutions:**

1. **Check network connection:**
   - Verify internet connectivity
   - Check firewall settings

2. **Check API status:**
   - Visit Google Cloud Status page
   - Check for service outages

3. **Verify API endpoint:**
   - Check `@google/genai` package version
   - Update if outdated

4. **Check browser console:**
   - Look for CORS errors
   - Check for blocked requests

## Rendering Issues

### Code Doesn't Render

**Symptoms:**
- Blank iframe
- No output visible
- Error in console

**Solutions:**

1. **Check generated code:**
   ```typescript
   console.log(output.srcCode)
   // Should contain valid code
   ```

2. **Check scaffold function:**
   - Verify scaffold exists for mode
   - Check scaffold returns valid HTML

3. **Check iframe sandbox:**
   ```typescript
   // Should be: sandbox="allow-same-origin allow-scripts"
   ```

4. **Check browser console:**
   - Look for JavaScript errors
   - Check for syntax errors in code

5. **Test code manually:**
   - Copy generated code
   - Test in separate HTML file
   - Verify it works standalone

### P5.js Not Rendering

**Symptoms:**
- Blank canvas
- P5.js errors in console

**Solutions:**

1. **Check P5.js CDN:**
   - Verify CDN URL in scaffold
   - Check if CDN is accessible

2. **Check setup function:**
   - Generated code should have `setup()` function
   - Verify canvas creation

3. **Check canvas size:**
   - Should match output dimensions (800x600)
   - Verify CSS sizing

### Three.js Not Rendering

**Symptoms:**
- Black screen
- Three.js errors

**Solutions:**

1. **Check Three.js import:**
   - Verify ESM.run CDN URL
   - Check import syntax

2. **Check renderer setup:**
   - Verify `setPixelRatio(2)`
   - Check camera setup

3. **Check scene:**
   - Verify objects are added to scene
   - Check lighting if needed

### Shader Not Rendering

**Symptoms:**
- Black or white screen
- Shader compilation errors

**Solutions:**

1. **Check shader syntax:**
   - Verify GLSL syntax
   - Check for typos

2. **Check uniforms:**
   - Must include `u_time` and `u_resolution`
   - Verify uniform values

3. **Check precision:**
   - Must start with `precision mediump float;`
   - Verify fragment shader structure

### SVG Not Displaying

**Symptoms:**
- Blank area
- SVG not visible

**Solutions:**

1. **Check SVG structure:**
   - Verify root `<svg>` tag
   - Check `viewBox` attribute

2. **Check dimensions:**
   - Should include width/height or viewBox
   - Verify CSS sizing

3. **Check content:**
   - Verify SVG has visible elements
   - Check fill/stroke colors

## Performance Issues

### Slow Generation

**Symptoms:**
- Long wait times
- UI freezes

**Solutions:**

1. **Use faster model:**
   - Flash-Lite is fastest
   - Pro models are slower

2. **Reduce batch size:**
   - Smaller batches = faster
   - Generate fewer at once

3. **Simplify prompts:**
   - Shorter prompts = faster
   - Remove complex requirements

4. **Check network:**
   - Slow connection = slow API calls
   - Try different network

### Slow Rendering

**Symptoms:**
- Laggy UI
- Slow scrolling
- Frame drops

**Solutions:**

1. **Reduce visible renderers:**
   - Close fullscreen when done
   - Don't open too many at once

2. **Check lazy loading:**
   - Verify IntersectionObserver works
   - Only visible items should render

3. **Close unused tabs:**
   - Each iframe uses memory
   - Close when not viewing

4. **Check browser:**
   - Use Chrome/Edge for best performance
   - Close other tabs/apps

### Memory Issues

**Symptoms:**
- Browser slows down
- Crashes after many generations
- High memory usage

**Solutions:**

1. **Clear old rounds:**
   - Remove old generations
   - Keep only recent ones

2. **Limit feed size:**
   - Don't generate too many
   - Clear feed periodically

3. **Close iframes:**
   - Unused renderers consume memory
   - Close fullscreen when done

4. **Refresh browser:**
   - Clear memory
   - Restart if needed

## Browser Issues

### Safari Issues

**Symptoms:**
- Audio doesn't work
- Some features broken

**Solutions:**

1. **Audio requires user interaction:**
   - Click to initialize audio
   - First sound needs user action

2. **Use Chrome/Edge:**
   - Better compatibility
   - More features supported

### Mobile Issues

**Symptoms:**
- Touch not working
- Layout broken
- Performance poor

**Solutions:**

1. **Check viewport:**
   - Verify meta viewport tag
   - Check responsive design

2. **Test on device:**
   - Emulators may differ
   - Test on real device

3. **Optimize for mobile:**
   - Reduce batch size
   - Simplify UI

### CORS Errors

**Symptoms:**
- API calls blocked
- CORS errors in console

**Solutions:**

1. **Check API configuration:**
   - Verify API allows browser origins
   - Check CORS settings

2. **Use proxy (development):**
   - Configure Vite proxy
   - Route through backend

3. **Check headers:**
   - Verify request headers
   - Check response headers

## State Management Issues

### State Not Updating

**Symptoms:**
- UI doesn't reflect changes
- Components don't re-render

**Solutions:**

1. **Check selector:**
   ```typescript
   // ✅ Good
   const feed = use.feed()
   
   // ❌ Bad - won't trigger re-render
   const feed = get().feed
   ```

2. **Verify state update:**
   ```typescript
   set(state => {
     state.feed.push(newRound) // Immer handles immutability
   })
   ```

3. **Check component subscription:**
   - Component must use `use.selector()`
   - Direct `get()` won't trigger re-render

### Persistence Not Working

**Symptoms:**
- Settings not saved
- Rounds disappear on refresh

**Solutions:**

1. **Check localStorage:**
   ```javascript
   // In browser console
   localStorage.getItem('vibecheck')
   ```

2. **Check persist configuration:**
   - Verify `partialize` includes needed state
   - Check persist middleware setup

3. **Clear and reset:**
   ```javascript
   localStorage.removeItem('vibecheck')
   // Refresh page
   ```

### State Corruption

**Symptoms:**
- App crashes on load
- Invalid state errors

**Solutions:**

1. **Clear localStorage:**
   ```javascript
   localStorage.clear()
   ```

2. **Check state structure:**
   - Verify types match
   - Check for missing properties

3. **Add migration:**
   - Handle old state format
   - Migrate to new format

## Audio Issues

### No Sound

**Symptoms:**
- Audio doesn't play
- Silent interactions

**Solutions:**

1. **Initialize audio:**
   ```typescript
   // Must be called after user interaction
   await initializeAudio()
   ```

2. **Check browser permissions:**
   - Some browsers block autoplay
   - User must interact first

3. **Check audio toggle:**
   - Verify sound is enabled
   - Check `screensaverSound` state

4. **Check Tone.js:**
   - Verify Tone.js loads
   - Check for errors in console

### Audio Delays

**Symptoms:**
- Sounds play late
- Out of sync

**Solutions:**

1. **Pre-initialize:**
   - Call `initializeAudio()` early
   - On first user interaction

2. **Check browser:**
   - Some browsers have audio latency
   - Chrome/Edge usually best

3. **Reduce complexity:**
   - Simpler sounds = faster
   - Fewer simultaneous sounds

## Getting More Help

If none of these solutions work:

1. **Check browser console:**
   - Look for error messages
   - Check network tab

2. **Review documentation:**
   - [Architecture](./ARCHITECTURE.md)
   - [Implementations](./IMPLEMENTATIONS.md)
   - [Development Guide](./DEVELOPMENT.md)

3. **Check GitHub issues:**
   - Search for similar issues
   - Create new issue if needed

4. **Debug mode:**
   - Add console.logs
   - Use React DevTools
   - Use Redux DevTools (Zustand)

5. **Minimal reproduction:**
   - Isolate the issue
   - Create minimal test case

