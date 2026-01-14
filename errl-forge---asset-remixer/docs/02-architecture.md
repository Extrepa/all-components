# Architecture

## System Overview

Errl Forge is a client-side React application that integrates with multiple external services:

```
┌─────────────────────────────────────────────────────────┐
│                    Errl Forge App                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ AssetLibrary │  │ AssetEditor   │  │   App.tsx   │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │BatchGenerator│  │AnimationGen │  │HitboxEditor│ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐
│ mapleStoryService│  │   aiService     │  │    utils     │
│ mapleCacheService│  │ batchService    │  │ spriteSheet  │
│ storageService   │  │ animationService│  │virtualScroll │
│                  │  │                │  │serviceWorker │
│                  │  │                │  │spriteSheetWkr│
└─────────────────┘  └─────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────────────────┐
│ MapleStory.io   │  │  AI Providers                │
│   API           │  │  • Gemini                     │
│                 │  │  • OpenAI                     │
│                 │  │  • Anthropic                  │
└─────────────────┘  └─────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   IndexedDB     │
│  (Local Storage)│
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Service Worker  │
│  (Offline Cache)│
└─────────────────┘
```

## Component Structure

### Core Components

#### `App.tsx`
- **Purpose:** Main application container and state management
- **Responsibilities:**
  - Manages current asset state
  - Handles AI provider selection
  - Coordinates between AssetLibrary and AssetEditor
  - Orchestrates asset generation workflow

#### `AssetLibrary.tsx`
- **Purpose:** Main asset browsing and selection interface (orchestrator)
- **Features:**
  - Tab management (Presets, MapleStory Database, My Assets, Archived)
  - Infinite scroll pagination for Maple DB
  - Search and filtering
  - Coordinates child components
  - Manages programmatic search state (prevents infinite loops)
- **Child Components:**
  - `VersionSelector` - Version selection and download progress
  - `CategorySelector` - Category and subcategory navigation
  - `PresetsTab` - Preset selection and archived assets
  - `MyAssetsTab` - Saved assets management
  - `ArchivedTab` - Archived database assets
  - `DownloadButton` - Category download functionality

#### `AssetEditor.tsx`
- **Purpose:** Asset editing and generation interface
- **Features:**
  - Visual, metadata, and history preview tabs
  - Prompt editing
  - Style modifier buttons
  - Custom style preset management
  - Generation controls with progress indicators
  - Export functionality
  - Hitbox visualization overlay
  - Animation generator integration
  - Error display with retry functionality

#### `BatchGenerator.tsx`
- **Purpose:** Batch asset generation interface
- **Features:**
  - Create batch jobs with multiple items
  - Job queue management
  - Progress tracking
  - Pause/resume functionality
  - Retry failed items
  - Export batch results

#### `AnimationGenerator.tsx`
- **Purpose:** Animation frame generation interface
- **Features:**
  - Select animation types (idle, walk, run, etc.)
  - Configure frame counts
  - Generate animation sequences
  - Preview frames with playback controls
  - Adjustable playback speed
  - Export individual frames or sprite sheets
  - Sprite sheet layout options (horizontal, vertical, grid)

#### `HitboxEditor.tsx`
- **Purpose:** Visual hitbox editing interface
- **Features:**
  - Canvas-based visual editor
  - Drag-and-drop hitbox positioning
  - Corner resize handles
  - Real-time visual feedback
  - Direct numeric input for precise values
  - Reset to original functionality

### AssetLibrary Sub-Components

#### `VersionSelector.tsx`
- **Purpose:** Version selection and download progress display
- **Features:**
  - Version dropdown (GMS v210, v177, v95, v83, v62)
  - Download button integration
  - Download progress indicator
  - Manages download state internally or via props

#### `CategorySelector.tsx`
- **Purpose:** Category and subcategory navigation
- **Features:**
  - Main category buttons (Mobs, NPCs, Pets, Maps, Items, Equip, Character)
  - Subcategory navigation for Items, Equip, Character, and Maps
  - Map subcategories (towns) with search query integration
  - Auto-scroll with visual indicators
  - Uses `useSubcategoryScroll` hook for scroll behavior

#### `PresetsTab.tsx`
- **Purpose:** Preset selection interface
- **Features:**
  - Displays base model presets with thumbnails
  - Integrates `ArchivedTab` component
  - Handles preset and archived asset selection

#### `MyAssetsTab.tsx`
- **Purpose:** Saved assets management interface
- **Features:**
  - Displays all saved generated assets
  - Search and filter functionality
  - Bulk selection and operations (delete, export)
  - Virtual scrolling for large lists (100+ items)
  - Asset deletion and export
  - Resized preview display

#### `ArchivedTab.tsx`
- **Purpose:** Archived database assets interface
- **Features:**
  - Displays archived MapleStory database assets
  - Category and version filtering
  - Search functionality
  - Bulk selection and operations (delete, export)
  - Virtual scrolling for large lists
  - Archive status management

#### `DownloadButton.tsx`
- **Purpose:** Category download functionality
- **Features:**
  - Dropdown menu with download options (thumbnails, JSON, both)
  - Progress tracking during downloads
  - ZIP file generation for thumbnails
  - Handles pet image fetching
  - CORS-aware image downloading
  - Fallback URL handling

### Custom Hooks

#### `useSubcategoryScroll.ts`
- **Purpose:** Auto-scroll behavior for subcategory lists
- **Features:**
  - Mouse position detection for scroll zones
  - Smooth auto-scrolling animation
  - Arrow visibility management
  - Scroll position tracking
  - Dependency-based effect re-running

### Constants

#### `constants/categories.ts`
- **Purpose:** Centralized category definitions
- **Exports:**
  - `mainCategories` - Main category definitions with icons
  - `itemSubcategories` - Item subcategory definitions
  - `equipSubcategories` - Equipment subcategory definitions
  - `characterSubcategories` - Character subcategory definitions
  - `mapSubcategories` - Map town subcategories with search queries
  - `allCategories` - Combined category array

## Service Layer

### `aiService.ts`
**Purpose:** Unified interface for AI operations

**Architecture Pattern:** Factory + Singleton

```typescript
getAIService(config?) → AIService
  ├─ generateAssetImage(prompt, inputImage?)
  └─ generateAssetMetadata(name, description)
```

**Provider Abstraction:**
- `AIProvider` interface ensures consistent API
- Factory pattern creates provider instances
- Singleton pattern for global access

### Provider Implementations

#### `providers/geminiProvider.ts`
- Uses `@google/genai` SDK
- Supports image generation with source images
- Structured JSON output for metadata
- Models: `gemini-2.5-flash-image`, `gemini-2.5-flash`

#### `providers/openaiProvider.ts`
- Uses OpenAI REST API
- DALL-E 3 for image generation
- GPT-4o-mini for metadata
- Base64 image responses

#### `providers/anthropicProvider.ts`
- Uses Anthropic REST API
- Metadata generation only (no image generation)
- Claude 3.5 Sonnet for text generation

### `mapleStoryService.ts`
**Purpose:** Integration with MapleStory.io API

**Key Functions:**
- `getPagedMapleData()` - Paginated asset fetching
- `getMapleSpriteUrl()` - Generate sprite URLs
- `downloadCategoryArchive()` - Bulk download utility

**Version Handling:**
- **v62:** Client-side filtering (small dataset)
- **v210:** Server-side pagination (large dataset)

**Features:**
- Circuit breaker pattern for API stability
- Exponential backoff with jitter for retries
- Request queuing for v210 API (max 3 concurrent)
- Automatic retry logic for 5xx errors
- Request timeout handling (10s)
- Response caching (memory + IndexedDB)
- Failed request caching
- Automatic fallback to v62 when v210 fails
- Error recovery strategies

### `storageService.ts`
**Purpose:** Persistent storage for generated assets

**Key Functions:**
- `saveAsset()` - Save asset to IndexedDB
- `getAsset()` - Retrieve asset by ID
- `getAllAssets()` - Get all saved assets
- `deleteAsset()` - Delete asset and history
- `getAssetHistory()` - Get version history
- `exportAssets()` - Export as JSON
- `importAssets()` - Import from JSON
- `savePreset()` - Save custom style preset
- `getAllPresets()` - Get all custom presets
- `deletePreset()` - Delete custom preset

**Storage Structure:**
- Assets store: Main asset data
- Metadata store: Separated for efficient querying
- History store: Version history
- Presets store: Custom style presets

### `batchService.ts`
**Purpose:** Batch generation orchestration

**Key Functions:**
- `createJob()` - Create new batch job
- `startJob()` - Start processing job
- `pauseJob()` - Pause running job
- `resumeJob()` - Resume paused job
- `retryFailedItems()` - Retry failed items
- `exportJobResults()` - Export results as JSON

**Features:**
- Job queue system
- Concurrency limits (2 items at a time)
- Progress tracking
- Automatic saving of results

### `animationService.ts`
**Purpose:** Animation frame generation

**Key Functions:**
- `generateAnimationFrames()` - Generate single animation sequence
- `generateMultipleAnimations()` - Generate multiple sequences

**Features:**
- Frame-specific prompt variations
- Animation context injection
- Progress callbacks
- Consistent style across frames

### `mapleCacheService.ts`
**Purpose:** IndexedDB caching for MapleStory data

**Key Functions:**
- `get()` - Retrieve cached data
- `set()` - Cache data
- `clear()` - Clear all cache
- `cleanup()` - Remove expired entries

**Features:**
- 24-hour cache TTL
- Automatic expiration
- Efficient querying

### `utils.ts`
**Purpose:** Utility functions

- `imageUrlToBase64()` - Convert image URLs to base64 for AI input
- `createAppError()` - Create structured error objects with context

### `utils/spriteSheet.ts`
**Purpose:** Sprite sheet generation utilities

**Key Functions:**
- `generateSpriteSheet()` - Generate sprite sheet from animation sequences
- `exportSpriteSheet()` - Export sprite sheet as PNG + JSON
- `generatePhaserMetadata()` - Generate Phaser 3 compatible metadata

**Features:**
- Multiple layout options (horizontal, vertical, grid)
- Phaser 3 compatible output
- Automatic frame positioning

### `utils/spriteSheetWorker.ts`
**Purpose:** Web Worker wrapper for sprite sheet generation

**Key Functions:**
- `generateSpriteSheetWithWorker()` - Generate sprite sheet off main thread
- Progress callbacks for UI updates

**Features:**
- Non-blocking sprite sheet generation
- Progress reporting
- Better performance for large sprite sheets

### `utils/virtualScroll.ts`
**Purpose:** Virtual scrolling utilities for large lists

**Key Functions:**
- `calculateVisibleItems()` - Calculate which items should be rendered

**Features:**
- Only renders visible items
- Configurable overscan
- Smooth scrolling performance

### `utils/serviceWorker.ts`
**Purpose:** Service Worker registration and management

**Key Functions:**
- `registerServiceWorker()` - Register service worker
- `unregisterServiceWorker()` - Unregister service worker
- `isServiceWorkerSupported()` - Check browser support
- `isOnline()` - Check online status
- `cacheAsset()` - Cache asset in service worker
- `clearAPICache()` - Clear API cache

**Features:**
- Automatic registration
- Online/offline detection
- Cache management utilities

### `public/service-worker.js`
**Purpose:** Service Worker for offline support

**Features:**
- Caches static assets on install
- Caches API responses when online
- Network-first strategy for API calls
- Cache-first strategy for static assets
- Automatic cache versioning and cleanup
- Message handling for cache management

## Data Flow

### Asset Generation Workflow

```
User Action: Click "Generate"
    ↓
App.tsx: handleGenerate()
    ↓
1. Convert sourceImageUrl → base64 (if exists)
    ↓
2. aiService.generateAssetImage(prompt, base64?)
    ↓
   Provider.generateImage()
    ↓
   AI API Call
    ↓
   Return: data:image/png;base64,...
    ↓
3. aiService.generateAssetMetadata(name, prompt)
    ↓
   Provider.generateMetadata()
    ↓
   AI API Call
    ↓
   Return: AssetMetadata JSON
    ↓
4. Update currentAsset state
    ↓
UI Updates: Image + Metadata displayed
```

### Asset Selection Workflow

```
User: Select MapleStory Asset
    ↓
AssetLibrary: onSelectMapleAsset()
    ↓
1. Get sprite URL from mapleStoryService
    ↓
2. Convert to base64 (async)
    ↓
3. Determine asset type from category
    ↓
4. Generate appropriate prompts
    ↓
5. Update currentAsset with sourceImageUrl
    ↓
AssetEditor: Shows source image, ready for remix
```

## State Management

### Local Component State
- Uses React `useState` hooks
- No global state management library
- State flows down, callbacks flow up

### Key State Objects

**GameAsset:**
```typescript
{
  id: string
  name: string
  type: 'monster' | 'item' | 'npc' | 'platform' | 'background'
  originalPrompt: string
  remixPrompt: string
  imageUrl?: string
  sourceImageUrl?: string
  metadata: AssetMetadata
  status: 'idle' | 'generating' | 'complete' | 'error'
  error?: AppError
  progress?: {
    imageProgress?: number
    metadataProgress?: number
    currentStep?: string
  }
  timestamp?: number
  version?: number
}
```

**BatchJob:**
```typescript
{
  id: string
  name: string
  items: BatchJobItem[]
  status: 'pending' | 'running' | 'paused' | 'completed' | 'error'
  progress: {
    total: number
    completed: number
    failed: number
  }
  createdAt: number
  completedAt?: number
}
```

**AnimationSequence:**
```typescript
{
  id: string
  name: string
  animationKey: string
  frames: AnimationFrame[]
  frameCount: number
  createdAt: number
}
```

**AssetMetadata:**
```typescript
{
  hp: number
  exp: number
  speed: number
  behavior: string
  description: string
  hitbox: { width, height, offsetX, offsetY }
  animations: string[]
}
```

## Configuration

### Environment Variables
Loaded via Vite's `loadEnv()`:
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `AI_PROVIDER` (default: 'gemini')

### Build Configuration
- **Vite:** ES modules, React plugin
- **TypeScript:** Strict mode, ES2022 target
- **Path Aliases:** `@/*` → project root

## Error Handling

### Strategy
1. **Service Level:** Structured error creation with context
2. **Component Level:** Error state display with retry buttons
3. **User Feedback:** User-friendly messages, actionable guidance
4. **API Retries:** Exponential backoff with jitter
5. **Circuit Breaker:** Prevents cascading failures

### Error Types
- `api_error` - API returned error response
- `network_error` - Network/connection issues
- `timeout_error` - Request timed out
- `rate_limit` - Rate limit exceeded
- `auth_error` - Authentication/API key issues
- `generation_error` - Image/metadata generation failed
- `provider_error` - Provider-specific error
- `unknown_error` - Unknown error

### Fallback Behavior
- If image generation fails → Error status with retry option
- If metadata generation fails → Default metadata returned
- If API unavailable → User-friendly error message with provider guidance
- If circuit breaker open → Automatic fallback to v62 (for v210 only)

## Performance Optimizations

1. **IndexedDB Caching:** Persistent caching of MapleStory data (24-hour TTL)
2. **Service Worker Caching:** Offline support with static asset and API response caching
3. **Virtual Scrolling:** Only renders visible items for large lists (100+ items)
4. **Web Workers:** Off-main-thread processing for sprite sheet generation
5. **Image Loading:** Lazy loading with intersection observer
6. **Pagination:** Infinite scroll to limit initial load
7. **Caching:** Multi-layer caching (memory + IndexedDB + Service Worker)
8. **Debouncing:** Search input debounced (800ms)
9. **Prefetching:** Next page results prefetched automatically
10. **Request Queuing:** API request queuing to respect rate limits (max 3 concurrent)
11. **Base64 Conversion:** Async, non-blocking
12. **Circuit Breaker:** Prevents unnecessary API calls during outages (v210 only)
13. **Asset Deduplication:** Prevents duplicate assets from appearing in database and archive views
13. **Batch Processing:** Concurrency limits for batch operations (2 items at a time)
14. **Asset Storage:** IndexedDB for persistent asset storage with versioning

## Security Considerations

- API keys stored in environment variables (not in code)
- CORS handling for external image fetching
- No user data transmitted to external servers (except AI providers)
- Client-side only (no backend)
- IndexedDB data stored locally in browser
- Service Worker runs in secure context
- No authentication required (local tool)
- Cache management prevents storage bloat
- Automatic cache cleanup on version updates

