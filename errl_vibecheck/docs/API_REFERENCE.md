# API Reference

Complete reference for VibeCheck's internal APIs, functions, and types.

## Table of Contents

- [Actions](./API_REFERENCE.md#actions)
- [Store](./API_REFERENCE.md#store)
- [LLM Service](./API_REFERENCE.md#llm-service)
- [Utilities](./API_REFERENCE.md#utilities)
- [Filter Functions](./API_REFERENCE.md#filter-functions)
- [Sort Functions](./API_REFERENCE.md#sort-functions)
- [Export Functions](./API_REFERENCE.md#export-functions)
- [Keyboard Shortcuts](./API_REFERENCE.md#keyboard-shortcuts)
- [Types](./API_REFERENCE.md#types)

## Actions

Functions for modifying application state. Located in `src/lib/actions.ts`.

### `init()`

Initializes the application state. Cleans up failed outputs from persisted user rounds on first load.

```typescript
init(): void
```

**Returns**: `void`

**Example**:
```typescript
import {init} from './lib/actions.ts'
init() // Called automatically on import
```

---

### `addRound(prompt, inputImage, options?)`

Adds a new round to the feed and generates outputs using AI.

```typescript
addRound(
  prompt: string,
  inputImage: string | null,
  options?: {
    outputMode?: ModeKey
    batchMode?: boolean
    batchSize?: number
    batchModel?: ModelKey
    versusModels?: {[key in ModelKey]?: boolean}
  }
): Promise<void>
```

**Parameters**:
- `prompt` (string): The user's prompt text for code generation
- `inputImage` (string | null): Optional base64-encoded image data
- `options` (object, optional): Configuration overrides
  - `outputMode` (ModeKey, optional): Override current output mode
  - `batchMode` (boolean, optional): Enable batch mode
  - `batchSize` (number, optional): Number of outputs in batch
  - `batchModel` (ModelKey, optional): Model for batch generation
  - `versusModels` (object, optional): Model selection for versus mode

**Returns**: `Promise<void>`

**Example**:
```typescript
// Simple generation
await addRound('create a bouncing ball', null)

// Batch mode
await addRound('minimalist clock', null, {
  batchMode: true,
  batchSize: 5,
  batchModel: 'flash'
})

// Versus mode
await addRound('cat wearing jetpack', null, {
  versusModels: { flash: true, pro: true }
})
```

---

### `removeRound(id)`

Removes a round from both the feed and user rounds.

```typescript
removeRound(id: string): void
```

**Parameters**:
- `id` (string): The ID of the round to remove

**Returns**: `void`

---

### `toggleFavorite(roundId, outputId)`

Toggles the favorite status of an output.

```typescript
toggleFavorite(roundId: string, outputId: Id): void
```

**Parameters**:
- `roundId` (string): The ID of the round containing the output
- `outputId` (Id): The ID of the output to toggle

**Returns**: `void`

---

### `showFavorites()`

Filters the feed to show only favorited outputs.

```typescript
showFavorites(): void
```

**Returns**: `void`

---

### `setOutputMode(mode)`

Sets the current output mode.

```typescript
setOutputMode(mode: ModeKey): void
```

**Parameters**:
- `mode` (ModeKey): The mode to set (e.g., 'p5', 'svg', 'html')

**Returns**: `void`

---

### `setBatchModel(model)`

Sets the model to use for batch generation.

```typescript
setBatchModel(model: ModelKey): void
```

**Parameters**:
- `model` (ModelKey): The model to use (e.g., 'flash', 'pro')

**Returns**: `void`

---

### `setBatchMode(active)`

Enables or disables batch mode.

```typescript
setBatchMode(active: boolean): void
```

**Parameters**:
- `active` (boolean): Whether batch mode is active

**Returns**: `void`

---

### `setBatchSize(size)`

Sets the batch size for batch generation.

```typescript
setBatchSize(size: number): void
```

**Parameters**:
- `size` (number): Number of outputs to generate

**Returns**: `void`

---

### `setVersusModel(model, active)`

Toggles a model in versus mode.

```typescript
setVersusModel(model: ModelKey, active: boolean): void
```

**Parameters**:
- `model` (ModelKey): The model to toggle
- `active` (boolean): Whether the model is active

**Returns**: `void`

---

### `reset()`

Clears the feed (but keeps userRounds).

```typescript
reset(): void
```

**Returns**: `void`

---

### `setFullscreenActiveId(id)`

Sets the active fullscreen output ID.

```typescript
setFullscreenActiveId(id: Id | null): void
```

**Parameters**:
- `id` (Id | null): The output ID or null to close

**Returns**: `void`

---

### `setFullscreenAnimate(active)`

Toggles fullscreen animations.

```typescript
setFullscreenAnimate(active: boolean): void
```

**Parameters**:
- `active` (boolean): Whether animations are enabled

**Returns**: `void`

---

### `setFullscreenShowCode(active)`

Toggles code overlay in fullscreen.

```typescript
setFullscreenShowCode(active: boolean): void
```

**Parameters**:
- `active` (boolean): Whether to show code

**Returns**: `void`

---

### `setFullscreenSound(active)`

Toggles sound in fullscreen mode.

```typescript
setFullscreenSound(active: boolean): void
```

**Parameters**:
- `active` (boolean): Whether sound is enabled

**Returns**: `void`

---

### `setScreensaverSound(active)`

Toggles sound in screensaver mode.

```typescript
setScreensaverSound(active: boolean): void
```

**Parameters**:
- `active` (boolean): Whether sound is enabled

**Returns**: `void`

---

### `setFeed(feed)`

Sets the feed directly (used for collections).

```typescript
setFeed(feed: Round[]): void
```

**Parameters**:
- `feed` (Round[]): Array of rounds to display

**Returns**: `void`

---

### `setScreensaverMode(active)`

Toggles screensaver mode.

```typescript
setScreensaverMode(active: boolean): void
```

**Parameters**:
- `active` (boolean): Whether screensaver is active

**Returns**: `void`

---

### `setActiveCollectionId(id)`

Sets the active collection ID.

```typescript
setActiveCollectionId(id: string | null): void
```

**Parameters**:
- `id` (string | null): Collection ID or null

**Returns**: `void`

---

### `setActiveResultId(id)`

Sets the active result ID.

```typescript
setActiveResultId(id: string | null): void
```

**Parameters**:
- `id` (string | null): Result ID or null

**Returns**: `void`

---

### `setHeaderHeight(height)`

Sets the header height (for sticky positioning).

```typescript
setHeaderHeight(height: number): void
```

**Parameters**:
- `height` (number): Header height in pixels

**Returns**: `void`

---

### `setSearchQuery(query)`

Sets the search query for filtering the feed.

```typescript
setSearchQuery(query: string): void
```

**Parameters**:
- `query` (string): Search query string (empty string to clear)

**Returns**: `void`

---

### `setFilter(mode, value)`

Sets the filter mode for the feed.

```typescript
setFilter(
  mode: 'all' | 'mode' | 'model',
  value: string | null
): void
```

**Parameters**:
- `mode` ('all' | 'mode' | 'model'): Filter mode
- `value` (string | null): Filter value (mode key, model key, or null)

**Returns**: `void`

**Example**:
```typescript
// Filter by mode
setFilter('mode', 'p5')

// Filter by model
setFilter('model', 'flash')

// Clear filter
setFilter('all', null)
```

---

### `setSortOption(option)`

Sets the sort option for the feed.

```typescript
setSortOption(
  option: 'newest' | 'oldest' | 'prompt-asc' | 'prompt-desc' | 'mode' | 'fastest' | 'slowest'
): void
```

**Parameters**:
- `option` (SortOption): Sort option

**Returns**: `void`

**Example**:
```typescript
setSortOption('newest')  // Sort by newest first
setSortOption('fastest')  // Sort by fastest generation
```

---

## Store

Zustand store for state management. Located in `src/lib/store.ts`.

### `get()`

Gets the current state (non-reactive).

```typescript
get(): AppState
```

**Returns**: `AppState` - Current application state

**Example**:
```typescript
import {get} from './lib/store.ts'
const state = get()
console.log(state.feed.length)
```

---

### `set(updater)`

Updates the state (with Immer).

```typescript
set(updater: (state: AppState) => void): void
```

**Parameters**:
- `updater` (function): Function that mutates state (Immer handles immutability)

**Returns**: `void`

**Example**:
```typescript
import {set} from './lib/store.ts'
set(state => {
  state.feed.push(newRound)
})
```

---

### `use`

Custom selector hooks for reactive state access.

```typescript
use: {
  [K in keyof AppState]: () => AppState[K]
}
```

**Usage**:
```typescript
import {use} from './lib/store.ts'

// In component
const feed = use.feed()
const outputMode = use.outputMode()
```

**Available Selectors**:
- `use.feed()` - Current feed
- `use.userRounds()` - User's rounds
- `use.outputMode()` - Current output mode
- `use.batchMode()` - Batch mode status
- `use.batchSize()` - Batch size
- `use.batchModel()` - Batch model
- `use.versusModels()` - Versus model selection
- `use.activeCollectionId()` - Active collection ID
- `use.activeResultId()` - Active result ID
- `use.fullscreenActiveId()` - Fullscreen output ID
- `use.fullscreenAnimate()` - Fullscreen animation
- `use.fullscreenShowCode()` - Fullscreen code display
- `use.fullScreenSound()` - Fullscreen sound
- `use.screensaverMode()` - Screensaver mode
- `use.screensaverSound()` - Screensaver sound
- `use.headerHeight()` - Header height
- `use.searchQuery()` - Current search query
- `use.filterMode()` - Current filter mode
- `use.filterValue()` - Current filter value
- `use.sortOption()` - Current sort option

---

## LLM Service

AI code generation service. Located in `src/lib/llm.ts`.

### `llmGen(params)`

Generates content using Google Gemini AI models.

```typescript
llmGen(params: LlmGenParams): Promise<string>
```

**Parameters**:
- `params` (LlmGenParams): Generation parameters
  - `model` (string): Model string (e.g., 'gemini-2.5-flash')
  - `systemInstruction` (string): System prompt
  - `prompt` (string): User prompt
  - `promptImage` (string | null): Optional base64 image
  - `imageOutput` (boolean, optional): Request image output
  - `thinking` (boolean, optional): Enable thinking mode
  - `thinkingCapable` (boolean, optional): Model supports thinking

**Returns**: `Promise<string>` - Generated text or base64 image data URL

**Example**:
```typescript
import llmGen from './lib/llm.ts'

const code = await llmGen({
  model: 'gemini-2.5-flash',
  systemInstruction: 'You are an expert P5.js developer...',
  prompt: 'create a bouncing ball',
  promptImage: null,
  imageOutput: false,
  thinking: false,
  thinkingCapable: true
})
```

**Features**:
- Automatic retry with exponential backoff (5 attempts)
- Timeout protection (193 seconds)
- Rate limiting (1 concurrent request)
- Error handling

---

## Utilities

Helper functions. Located in `src/lib/utils.ts`.

### `keys(obj)`

Type-safe wrapper for Object.keys().

```typescript
keys<O extends object>(obj: O): (keyof O)[]
```

**Parameters**:
- `obj` (O): Object to get keys from

**Returns**: Array of keys with proper typing

**Example**:
```typescript
import {keys} from './lib/utils.ts'
const modeKeys = keys(modes) // Type: ModeKey[]
```

---

### `values(obj)`

Type-safe wrapper for Object.values().

```typescript
values<O extends object>(obj: O): O[keyof O][]
```

**Parameters**:
- `obj` (O): Object to get values from

**Returns**: Array of values with proper typing

---

### `entries(obj)`

Type-safe wrapper for Object.entries().

```typescript
entries<O extends object>(obj: O): [keyof O, O[keyof O]][]
```

**Parameters**:
- `obj` (O): Object to get entries from

**Returns**: Array of [key, value] tuples

---

### `fromEntries(entries)`

Type-safe wrapper for Object.fromEntries().

```typescript
fromEntries<O extends object>(
  entries: [keyof O, O[keyof O]][]
): O
```

**Parameters**:
- `entries`: Array of [key, value] tuples

**Returns**: Object reconstructed from entries

---

### `identity(x)`

Identity function - returns input unchanged.

```typescript
identity<T>(x: T): T
```

**Parameters**:
- `x` (T): Value to return

**Returns**: The input value

---

### `scrollToPosition(container, targetY, duration?)`

Smoothly scrolls a container to a target Y position.

```typescript
scrollToPosition(
  container: HTMLElement,
  targetY: number,
  duration?: number
): Promise<void>
```

**Parameters**:
- `container` (HTMLElement): Element to scroll
- `targetY` (number): Target scroll position
- `duration` (number, optional): Animation duration in ms (default: 300)

**Returns**: Promise that resolves when animation completes

**Example**:
```typescript
await scrollToPosition(element, element.scrollHeight, 2000)
```

---

## Filter Functions

Functions for filtering rounds. Located in `src/lib/filter.ts`.

### `filterRounds(rounds, searchQuery, filterMode, filterValue)`

Filters rounds based on search query and filter criteria.

```typescript
filterRounds(
  rounds: Round[],
  searchQuery: string,
  filterMode: 'mode' | 'model' | null,
  filterValue: string | null
): Round[]
```

**Parameters**:
- `rounds` (Round[]): Array of rounds to filter
- `searchQuery` (string): Text to search for in prompts
- `filterMode` ('mode' | 'model' | null): Filter type
- `filterValue` (string | null): Filter value (mode key, model key, or null)

**Returns**: Filtered array of rounds

**Example**:
```typescript
// Search only
const results = filterRounds(rounds, 'bouncing ball', null, null)

// Filter by mode
const p5Rounds = filterRounds(rounds, '', 'mode', 'p5')

// Combined search and filter
const filtered = filterRounds(rounds, 'ball', 'mode', 'p5')
```

---

### `getUniqueModes(rounds)`

Gets unique modes from rounds.

```typescript
getUniqueModes(rounds: Round[]): ModeKey[]
```

**Parameters**:
- `rounds` (Round[]): Array of rounds

**Returns**: Array of unique mode keys

---

### `getUniqueModels(rounds)`

Gets unique models from rounds.

```typescript
getUniqueModels(rounds: Round[]): ModelKey[]
```

**Parameters**:
- `rounds` (Round[]): Array of rounds

**Returns**: Array of unique model keys

---

## Sort Functions

Functions for sorting rounds. Located in `src/lib/sort.ts`.

### `sortRounds(rounds, option)`

Sorts rounds based on the specified option.

```typescript
sortRounds(
  rounds: Round[],
  option: SortOption
): Round[]
```

**Parameters**:
- `rounds` (Round[]): Array of rounds to sort
- `option` (SortOption): Sort option ('newest' | 'oldest' | 'prompt-asc' | 'prompt-desc' | 'mode' | 'fastest' | 'slowest')

**Returns**: Sorted array of rounds

**Example**:
```typescript
// Sort by newest
const sorted = sortRounds(rounds, 'newest')

// Sort by fastest generation
const fastest = sortRounds(rounds, 'fastest')
```

---

### `getDefaultSort()`

Gets the default sort option.

```typescript
getDefaultSort(): SortOption
```

**Returns**: Default sort option ('newest')

---

## Export Functions

Functions for exporting outputs and rounds. Located in `src/lib/export.ts`.

### `exportOutput(round, output)`

Exports a single output to the ExportFormat.

```typescript
exportOutput(round: Round, output: Output): ExportFormat
```

**Parameters**:
- `round` (Round): The round containing the output
- `output` (Output): The output to export

**Returns**: ExportFormat object

---

### `exportRound(round)`

Exports a round (all outputs) to JSON format.

```typescript
exportRound(round: Round): string
```

**Parameters**:
- `round` (Round): The round to export

**Returns**: JSON string

---

### `downloadFile(content, filename, mimeType?)`

Downloads a file with the given content and filename.

```typescript
downloadFile(
  content: string | Blob,
  filename: string,
  mimeType?: string
): void
```

**Parameters**:
- `content` (string | Blob): File content
- `filename` (string): Name of the file to download
- `mimeType` (string, optional): MIME type (default: 'text/plain')

**Returns**: `void`

---

### `exportOutputCode(round, output, format?)`

Exports an output's code as a file.

```typescript
exportOutputCode(
  round: Round,
  output: Output,
  format?: string
): void
```

**Parameters**:
- `round` (Round): The round containing the output
- `output` (Output): The output to export
- `format` (string, optional): File format ('js', 'html', 'svg', 'glsl', 'auto')

**Returns**: `void`

---

### `exportRoundJSON(round)`

Exports a round as JSON file.

```typescript
exportRoundJSON(round: Round): void
```

**Parameters**:
- `round` (Round): The round to export

**Returns**: `void`

---

### `copyToClipboard(code)`

Copies code to clipboard.

```typescript
copyToClipboard(code: string): Promise<void>
```

**Parameters**:
- `code` (string): Code to copy

**Returns**: Promise that resolves when copy is complete

**Example**:
```typescript
await copyToClipboard('function setup() {}')
```

---

## Keyboard Shortcuts

Keyboard shortcut handler. Located in `src/lib/keyboard.ts`.

### `setupKeyboardShortcuts()`

Sets up global keyboard shortcuts for the application.

```typescript
setupKeyboardShortcuts(): () => void
```

**Returns**: Cleanup function to remove event listeners

**Shortcuts**:
- **Escape**: Exit fullscreen/screensaver mode
- **Ctrl/Cmd + K**: Focus search input
- **Ctrl/Cmd + F**: Focus search input (alternative)

**Example**:
```typescript
// In component
useEffect(() => {
  const cleanup = setupKeyboardShortcuts()
  return cleanup
}, [])
```

---

## Types

TypeScript type definitions. Located in `src/lib/types.ts`.

### `Id`

UUID format type.

```typescript
type Id = `${string}-${string}-${string}-${string}-${string}`
```

---

### `ModeKey`

Key of available modes.

```typescript
type ModeKey = keyof typeof modes
// 'p5' | 'svg' | 'html' | 'image' | 'wireframes' | 'voxels' | 'glsl'
```

---

### `ModelKey`

Key of available models.

```typescript
type ModelKey = keyof typeof models
// 'lite' | 'flash' | 'flashThinking' | 'pro' | 'threePro'
```

---

### `OutputState`

State of an output.

```typescript
type OutputState = 'loading' | 'success' | 'error'
```

---

### `Output`

An individual output from AI generation.

```typescript
type Output = {
  id: Id
  model: ModelKey
  mode: ModeKey
  srcCode: string
  state: OutputState
  startTime: number
  totalTime: number
}
```

---

### `Round`

A round containing a prompt and multiple outputs.

```typescript
type Round = {
  id: Id
  prompt: string
  inputImage: string | null
  systemInstructions: string
  outputs: {[key: Id]: Output}
  mode: ModeKey
  createdBy: string
  createdAt: number
  isDeleted?: boolean
  favoritedOutputIds?: Id[]
  hasFavorites?: boolean
  favoritesOnly?: boolean
}
```

---

### `AppState`

Complete application state.

```typescript
type AppState = {
  didInit: boolean
  feed: Round[]
  userRounds: Round[]
  outputMode: ModeKey
  batchMode: boolean
  batchSize: number
  batchModel: ModelKey
  versusModels: {[key in ModelKey]: boolean}
  activeCollectionId: string | null
  activeResultId: string | null
  fullscreenActiveId: Id | null
  fullscreenAnimate: boolean
  fullscreenShowCode: boolean
  fullScreenSound: boolean
  screensaverMode: boolean
  screensaverSound: boolean
  headerHeight: number
  specialAllCollectionScreensaverMode: boolean
  searchQuery: string
  filterMode: 'mode' | 'model' | null
  filterValue: string | null
  sortOption: 'newest' | 'oldest' | 'prompt-asc' | 'prompt-desc' | 'mode' | 'fastest' | 'slowest'
}
```

---

## Constants

Located in `src/lib/consts.ts`.

### `outputWidth`

Default output width in pixels.

```typescript
export const outputWidth = 800
```

---

### `outputHeight`

Default output height in pixels.

```typescript
export const outputHeight = 600
```

---

### `isTouch`

Whether device supports touch.

```typescript
export const isTouch = 'ontouchstart' in window
```

---

### `isIframe`

Whether app is running in iframe.

```typescript
export const isIframe = window.self !== window.top
```

