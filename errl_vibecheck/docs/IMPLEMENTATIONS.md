# Implementation Details

This document covers the technical implementation details of VibeCheck's key features and systems.

## State Management Implementation

### Zustand Store Setup
```typescript
// Custom selector pattern
type WithSelectors<S> = S extends {getState: () => infer T}
  ? S & {use: {[K in keyof T]: () => T[K]}}
  : never

// Creates use.selectors() for each state property
const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (const k of Object.keys(store.getState())) {
    ;(store.use as Record<string, () => unknown>)[k] = () =>
      store(s => s[k as keyof typeof s])
  }
  return store
}
```

**Benefits**:
- Type-safe selectors
- Automatic re-renders only when selected state changes
- Clean API: `use.feed()` instead of `use(state => state.feed)`

### Persistence Strategy
- **Persisted**: userRounds, outputMode, batchMode, batchSize, batchModel, versusModels
- **Not Persisted**: feed (rebuilt from userRounds), UI state, active IDs
- **Cleanup**: Failed outputs pruned on init

## LLM Integration Implementation

### Rate Limiting
```typescript
const limiter = limit(1) // Concurrency: 1 request at a time
```

**Why**: Prevents hitting Google API rate limits (429 errors)

### Retry Logic
```typescript
for (let attempt = 0; attempt < maxRetries; attempt++) {
  try {
    // API call
  } catch (error) {
    if (attempt === maxRetries - 1) throw error
    const delay = baseDelay * 2 ** attempt // Exponential backoff
    await new Promise(res => setTimeout(res, delay))
  }
}
```

**Strategy**:
- 5 retry attempts
- Exponential backoff: 1233ms, 2466ms, 4932ms, 9864ms, 19728ms
- Timeout: 193 seconds per attempt

### Safety Settings
All safety categories set to `BLOCK_NONE`:
- HATE_SPEECH
- SEXUALLY_EXPLICIT
- DANGEROUS_CONTENT
- HARASSMENT

**Rationale**: Creative coding prompts may trigger false positives

## Rendering System Implementation

### Scaffolding Functions
Each mode has a scaffold that wraps generated code:

**P5.js Scaffold**:
- Injects P5.js CDN
- Sets up canvas with proper sizing
- Handles window resize
- Black background

**GLSL Scaffold**:
- Sets up Three.js scene
- Creates shader material
- Provides u_time and u_resolution uniforms
- Fullscreen canvas

**SVG Scaffold**:
- Minimal CSS wrapper
- Centered display
- Responsive sizing

### Sandboxing
```typescript
<iframe
  sandbox="allow-same-origin allow-scripts"
  srcDoc={scaffoldedCode}
/>
```

**Restrictions**:
- ✅ Same-origin (for iframe communication)
- ✅ Scripts (required for code execution)
- ❌ No network access
- ❌ No localStorage
- ❌ No forms
- ❌ No popups

### Lazy Loading
```typescript
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    })
  },
  {threshold: 0.1}
)
```

**Benefits**:
- Only visible renderers are active
- Reduces memory usage
- Improves performance
- Fullscreen/screensaver bypasses lazy loading

## Screensaver Implementation

### Layout Calculation
```typescript
const allLayouts = [
  {cols: 1, rows: 1},
  {cols: 1, rows: 2},
  {cols: 2, rows: 1},
  {cols: 2, rows: 2},
  {cols: 3, rows: 2}
]

// Filter based on window size
const minColWidth = 400
const minRowHeight = 400
layouts.filter(layout => 
  layout.cols * minColWidth <= windowSize.width &&
  layout.rows * minRowHeight <= windowSize.height
)
```

### Animation Sequence
1. **Prompt Typing**: Character-by-character with sound
2. **Code Display**: Code scrolls into view
3. **Render**: Output fades in
4. **Transition**: Wait, then next item

**Timing**:
- Start delay: 200ms
- Between videos: 0ms
- Between layouts: 2000ms

### Idle Detection
```typescript
let idleTimeout = window.setTimeout(() => {
  setIsIdle(true)
}, 2000)

// Reset on any interaction
window.addEventListener('mousemove', resetIdleTimer)
window.addEventListener('mousedown', resetIdleTimer)
window.addEventListener('touchstart', resetIdleTimer)
```

**Behavior**:
- 2 seconds of inactivity → controls fade
- Hover over controls → suspend idle timer
- Any interaction → reset timer

## Audio System Implementation

### Tone.js Setup
```typescript
await Tone.start() // User interaction required
synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sine" }
}).toDestination()
```

**Initialization**:
- Lazy: Only when first sound needed
- Requires user interaction (browser security)
- Single PolySynth instance for all sounds

### Sound Presets
```typescript
const presets = {
  typing: {
    notes: ["G2"],
    attack: 0.002,
    decay: 0.01,
    sustain: 0.2,
    release: 0.003,
    volume: -10
  }
  // ... more presets
}
```

**Playback**:
```typescript
synth.set({
  volume: sound.volume,
  envelope: { attack, decay, sustain, release }
})
synth.triggerAttack(sound.notes, now)
synth.triggerRelease(sound.notes, now + attack + decay)
```

**Design**:
- Short attack/decay for typing
- Longer release for success
- Different pitches for different actions

## Collection System Implementation

### Data Structure
```typescript
type CloudCollectionData = {
  collection: {
    id: string
    name: string
    slug: string
    shareIds: string
    isActive: boolean
    isDeleted: boolean
    sortOrder: number
  }
  rounds: Round[]
}
```

### Storage
- **Location**: Google Cloud Storage
- **Format**: JSON files
- **Naming**: `{collectionId}.json`
- **Index**: `active.json` contains list of active collection IDs

### Loading Strategy
1. Fetch `active.json` for collection list
2. Fetch individual collection files
3. Cache in component state
4. Update feed when collection changes

### Sharing
```typescript
const newUrl = `https://aistudio.google.com/apps/bundled/vibecheck?showPreview=true&appParams=vibecheckcollection${collectionData.id}`
```

**URL Structure**:
- Base: AI Studio app URL
- Query: `appParams=vibecheckcollection{id}`
- Hash: Parsed by app for routing

## Routing Implementation

### Hash-Based Routing
```typescript
function processHash() {
  const hash = window.location.hash
  const collectionMatch = hash.match(/vibecheckcollection([^&]+)/)
  const resultMatch = hash.match(/vibecheck_([^&]+)/)
  
  if (collectionMatch) {
    setActiveCollectionId(collectionMatch[1])
  }
  if (resultMatch) {
    setActiveResultId(resultMatch[1])
  }
}
```

**Patterns**:
- Collection: `#vibecheckcollection{id}`
- Result: `#vibecheck_{id}` (file extension stripped)

**Benefits**:
- No server-side routing needed
- Works in iframe
- Shareable URLs
- Browser back/forward support

## Error Handling Implementation

### Output States
```typescript
type OutputState = 'loading' | 'success' | 'error'
```

### Error Flow
1. API call fails
2. Catch error
3. Retry up to 5 times
4. If all retries fail → set state to 'error'
5. UI displays error indicator

### Error Display
```typescript
{showError && (
  <div className="error">
    <span className="icon">error</span>
    This code produced an error.
  </div>
)}
```

**User Experience**:
- Visual error indicator
- Error state persists
- Can retry by regenerating
- Console logs for debugging

## Performance Optimizations

### Request Batching
- All outputs in a round generated in parallel
- Rate limiter ensures only 1 concurrent request
- Queue processes sequentially

### Memory Management
```typescript
// Cleanup on unmount
useEffect(() => {
  return () => {
    clearTimeout(timeoutRef.current)
    clearInterval(intervalRef.current)
  }
}, [])
```

**Cleanup**:
- Timeouts cleared
- Intervals cleared
- Event listeners removed
- Refs nullified

### State Updates
- Immer ensures immutable updates
- Only changed state triggers re-renders
- Selectors prevent unnecessary renders

## Code Generation Flow

### Complete Flow
1. User enters prompt
2. `addRound()` creates Round with Outputs
3. Each Output triggers `llmGen()` request
4. Request queued via p-limit
5. API call with retry logic
6. Response processed (code extraction)
7. Output state updated to 'success'
8. UI re-renders with new code
9. Renderer component loads code
10. Scaffold wraps code
11. Iframe renders output

### Code Extraction
```typescript
res
  .replace(/```\w+/gm, '')  // Remove opening code fences
  .replace(/```\n?$/gm, '')  // Remove closing code fences
  .trim()
```

**Handles**:
- Markdown code blocks
- Language identifiers
- Extra whitespace

## Type Safety Implementation

### ID Type
```typescript
type Id = `${string}-${string}-${string}-${string}-${string}`
```

**Enforces**: UUID format (5 segments)

### Mode/Model Keys
```typescript
type ModeKey = keyof typeof modes
type ModelKey = keyof typeof models
```

**Benefits**:
- Type-safe mode/model references
- Autocomplete in IDE
- Compile-time error checking

### State Types
- All state properties typed
- Actions typed with parameters
- Components typed with props
- No `any` types used

## Filter & Search Implementation

### Filter System
```typescript
// Filter rounds by search query and filter criteria
export function filterRounds(
  rounds: Round[],
  searchQuery: string,
  filterMode: 'mode' | 'model' | null,
  filterValue: string | null
): Round[]
```

**Features**:
- Case-insensitive search
- Searches both prompts and code content
- Mode and model filtering
- Combines search and filter
- Real-time updates

**Performance**:
- Memoized in App component
- Only re-filters when dependencies change
- Efficient string matching

## Sort Implementation

### Sort System
```typescript
export function sortRounds(
  rounds: Round[],
  option: SortOption
): Round[]
```

**Sort Options**:
- `newest` / `oldest`: By creation timestamp
- `prompt-asc` / `prompt-desc`: Alphabetical by prompt
- `mode`: By output mode
- `fastest` / `slowest`: By generation time

**Implementation**:
- Creates new array (immutable)
- Handles edge cases (no outputs, missing times)
- Efficient sorting algorithms

## Export Implementation

### Export System
```typescript
// Export code as file
exportOutputCode(round, output, format)

// Copy to clipboard
copyToClipboard(code)

// Download file
downloadFile(content, filename, mimeType)
```

**Features**:
- Multiple export formats
- Clipboard API with fallback
- Blob API for downloads
- Proper MIME types
- File extension detection

**Error Handling**:
- Clipboard API fallback to execCommand
- Proper cleanup of DOM elements
- URL object cleanup

## Keyboard Shortcuts Implementation

### Shortcut Handler
```typescript
export function setupKeyboardShortcuts(): () => void
```

**Features**:
- Global event listener
- Smart detection (ignores input fields)
- Cleanup function for unmount
- Prevents default browser behavior

**Shortcuts**:
- Escape: Exit fullscreen/screensaver
- Ctrl/Cmd + K: Focus search
- Ctrl/Cmd + F: Focus search (alternative)

**Integration**:
- Set up in App component
- Automatic cleanup on unmount
- Works across all views

## Testing Considerations

### Current State
- ✅ Unit tests for utilities
- ✅ Unit tests for filters
- ✅ Unit tests for sorting
- ✅ Unit tests for exports
- Manual testing for UI components
- Console logging for debugging

### Test Coverage
1. **Unit Tests** ✅:
   - Utility functions (6 tests)
   - Filter functions (6 tests)
   - Sort functions (8 tests)
   - Export functions (10 tests)
   - Total: 30 tests, all passing

2. **Integration Tests** (Recommended):
   - State management
   - API integration
   - Routing
   - Filter + Sort + Search combination

3. **E2E Tests** (Recommended):
   - User flows
   - Error scenarios
   - Performance
   - Keyboard shortcuts

## Security Considerations

### Sandboxing
- All user-generated code runs in sandboxed iframes
- No network access
- No localStorage access
- Isolated execution

### API Key
- Stored in environment variable
- Never exposed to client (in production)
- Server-side proxy recommended for production

### Input Validation
- Prompts: No validation (trust AI safety)
- Images: Base64 validation
- URLs: Hash parsing with regex

## Browser Compatibility

### Required Features
- ES6+ support
- Intersection Observer API
- Web Audio API (for Tone.js)
- LocalStorage
- Iframes with sandbox

### Tested Browsers
- Chrome/Edge (Chromium)
- Firefox
- Safari (with limitations)

### Known Issues
- Safari: Web Audio requires user interaction
- Mobile: Performance may vary
- Older browsers: May not support all features

