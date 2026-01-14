# API Reference

## Service APIs

### AI Service (`services/aiService.ts`)

#### `getAIService(config?: ProviderConfig): AIService`

Get or create the AI service singleton instance.

**Parameters:**
- `config?: ProviderConfig` - Optional provider configuration

**Returns:** `AIService` instance

**Example:**
```typescript
const service = getAIService({ type: 'gemini' });
```

#### `generateAssetImage(prompt: string, inputImageBase64?: string): Promise<string>`

Generate an asset image from a prompt, optionally using a source image.

**Parameters:**
- `prompt: string` - Text description of the desired asset
- `inputImageBase64?: string` - Optional base64-encoded source image (without data URL prefix)

**Returns:** `Promise<string>` - Data URL string (`data:image/png;base64,...`)

**Example:**
```typescript
const imageUrl = await generateAssetImage(
  "A neon slime monster, pixel art style",
  sourceImageBase64
);
```

#### `generateAssetMetadata(name: string, visualDescription: string): Promise<AssetMetadata>`

Generate game metadata for an asset.

**Parameters:**
- `name: string` - Asset name
- `visualDescription: string` - Description of the asset's appearance

**Returns:** `Promise<AssetMetadata>` - Complete metadata object

**Example:**
```typescript
const metadata = await generateAssetMetadata(
  "Neon Slime",
  "A glowing green slime with neon outlines"
);
```

### AI Provider Interface (`services/aiProvider.ts`)

#### `AIProvider`

Interface that all AI providers must implement.

```typescript
interface AIProvider {
  name: string;
  generateImage(prompt: string, inputImageBase64?: string): Promise<string>;
  generateMetadata(name: string, visualDescription: string): Promise<AssetMetadata>;
}
```

#### `ProviderConfig`

Configuration for AI providers.

```typescript
interface ProviderConfig {
  type: AIProviderType;  // 'gemini' | 'openai' | 'anthropic'
  apiKey?: string;
  model?: string;        // Text model name
  imageModel?: string;    // Image model name
}
```

### MapleStory Service (`services/mapleStoryService.ts`)

#### `getPagedMapleData(category, version, page, limit, query?, fetchAll?): Promise<{items, hasMore}>`

Fetch paginated MapleStory asset data.

**Parameters:**
- `category: MapleCategory` - Asset category ('mob', 'npc', 'pet', etc.)
- `version: MapleVersion` - Game version ('62' or '210')
- `page: number` - Page number (0-indexed)
- `limit: number` - Items per page
- `query?: string` - Optional search query
- `fetchAll?: boolean` - If true, fetch all items (ignores query)

**Returns:** `Promise<{items: MapleData[], hasMore: boolean}>`

**Example:**
```typescript
const { items, hasMore } = await getPagedMapleData(
  'mob',
  '210',
  0,
  24,
  'Snail',
  false
);
```

#### `getMapleSpriteUrl(id, category, version?): string`

Generate the sprite URL for a MapleStory asset.

**Parameters:**
- `id: number` - Asset ID
- `category: MapleCategory` - Asset category
- `version?: MapleVersion` - Game version (default: '210')

**Returns:** `string` - Full sprite URL

**Example:**
```typescript
const url = getMapleSpriteUrl(100100, 'mob', '210');
// Returns: "https://maplestory.io/api/GMS/210/mob/100100/render/stand"
```

#### `downloadCategoryArchive(category, version, onProgress): Promise<number>`

Download all assets in a category as JSON.

**Parameters:**
- `category: MapleCategory` - Asset category
- `version: MapleVersion` - Game version
- `onProgress: (count: number) => void` - Progress callback

**Returns:** `Promise<number>` - Total items downloaded

**Example:**
```typescript
await downloadCategoryArchive(
  'mob',
  '210',
  (count) => console.log(`Downloaded ${count} items`)
);
```

### Utils (`utils.ts`)

#### `imageUrlToBase64(url: string): Promise<string>`

Convert an image URL to base64 string.

**Parameters:**
- `url: string` - Image URL

**Returns:** `Promise<string>` - Base64 string (without data URL prefix)

**Example:**
```typescript
const base64 = await imageUrlToBase64('https://example.com/image.png');
```

#### `createAppError(error: unknown, context: ErrorContext): AppError`

Create a structured error from various error sources.

**Parameters:**
- `error: unknown` - Error object or message
- `context: ErrorContext` - Error context with provider and operation info

**Returns:** `AppError` - Structured error object

**Example:**
```typescript
const error = createAppError(new Error('API failed'), {
  provider: 'Gemini',
  operation: 'image'
});
```

### Storage Service (`services/storageService.ts`)

#### `saveAsset(asset: GameAsset): Promise<void>`

Save an asset to IndexedDB storage.

**Parameters:**
- `asset: GameAsset` - Asset to save

**Returns:** `Promise<void>`

**Example:**
```typescript
await storageService.saveAsset(asset);
```

#### `getAsset(id: string): Promise<GameAsset | null>`

Get an asset by ID from storage.

**Parameters:**
- `id: string` - Asset ID

**Returns:** `Promise<GameAsset | null>`

#### `getAllAssets(): Promise<GameAsset[]>`

Get all saved assets, sorted by timestamp (most recent first).

**Returns:** `Promise<GameAsset[]>`

#### `deleteAsset(id: string): Promise<void>`

Delete an asset and its history from storage.

**Parameters:**
- `id: string` - Asset ID

**Returns:** `Promise<void>`

#### `getAssetHistory(assetId: string): Promise<GameAsset[]>`

Get version history for an asset.

**Parameters:**
- `assetId: string` - Asset ID

**Returns:** `Promise<GameAsset[]>` - Array of historical versions

#### `exportAssets(assetIds?: string[]): Promise<string>`

Export assets as JSON string.

**Parameters:**
- `assetIds?: string[]` - Optional array of asset IDs (exports all if omitted)

**Returns:** `Promise<string>` - JSON string

#### `importAssets(json: string): Promise<number>`

Import assets from JSON string.

**Parameters:**
- `json: string` - JSON string containing assets

**Returns:** `Promise<number>` - Number of assets imported

#### `savePreset(preset): Promise<void>`

Save a custom style preset.

**Parameters:**
- `preset: { id: string; name: string; modifiers: string[]; description?: string }`

**Returns:** `Promise<void>`

#### `getAllPresets(): Promise<Array<...>>`

Get all custom style presets.

**Returns:** `Promise<Array<{ id, name, modifiers, description?, timestamp }>>`

#### `deletePreset(id: string): Promise<void>`

Delete a custom style preset.

**Parameters:**
- `id: string` - Preset ID

**Returns:** `Promise<void>`

### Batch Service (`services/batchService.ts`)

#### `createJob(name: string, items: BatchJobItem[]): BatchJob`

Create a new batch generation job.

**Parameters:**
- `name: string` - Job name
- `items: BatchJobItem[]` - Array of items to generate

**Returns:** `BatchJob` - Created job

**Example:**
```typescript
const job = batchService.createJob('My Batch', [
  { name: 'Slime', prompt: '...', type: 'monster' },
  { name: 'Potion', prompt: '...', type: 'item' }
]);
```

#### `startJob(jobId: string, provider: AIProviderType, onProgress?): Promise<void>`

Start processing a batch job.

**Parameters:**
- `jobId: string` - Job ID
- `provider: AIProviderType` - AI provider to use
- `onProgress?: (job: BatchJob) => void` - Optional progress callback

**Returns:** `Promise<void>`

#### `pauseJob(jobId: string): void`

Pause a running batch job.

**Parameters:**
- `jobId: string` - Job ID

#### `resumeJob(jobId: string, provider: AIProviderType, onProgress?): Promise<void>`

Resume a paused batch job.

**Parameters:**
- `jobId: string` - Job ID
- `provider: AIProviderType` - AI provider to use
- `onProgress?: (job: BatchJob) => void` - Optional progress callback

**Returns:** `Promise<void>`

#### `retryFailedItems(jobId: string, provider: AIProviderType, onProgress?): Promise<void>`

Retry failed items in a batch job.

**Parameters:**
- `jobId: string` - Job ID
- `provider: AIProviderType` - AI provider to use
- `onProgress?: (job: BatchJob) => void` - Optional progress callback

**Returns:** `Promise<void>`

#### `exportJobResults(jobId: string): string`

Export batch job results as JSON string.

**Parameters:**
- `jobId: string` - Job ID

**Returns:** `string` - JSON string

### Animation Service (`services/animationService.ts`)

#### `generateAnimationFrames(name, animationKey, basePrompt, frameCount, assetType, sourceImageUrl?, onProgress?): Promise<AnimationSequence>`

Generate animation frames for a single animation type.

**Parameters:**
- `name: string` - Asset name
- `animationKey: string` - Animation type ('idle', 'walk', etc.)
- `basePrompt: string` - Base generation prompt
- `frameCount: number` - Number of frames (4, 8, or 12)
- `assetType: GameAsset['type']` - Asset type
- `sourceImageUrl?: string` - Optional source image for remixing
- `onProgress?: (frameNumber: number, total: number) => void` - Progress callback

**Returns:** `Promise<AnimationSequence>`

**Example:**
```typescript
const sequence = await animationService.generateAnimationFrames(
  'Slime',
  'walk',
  'A green slime monster',
  8,
  'monster'
);
```

#### `generateMultipleAnimations(name, animationKeys, basePrompt, frameCount, assetType, sourceImageUrl?, onProgress?): Promise<AnimationSequence[]>`

Generate multiple animation sequences.

**Parameters:**
- `name: string` - Asset name
- `animationKeys: string[]` - Array of animation types
- `basePrompt: string` - Base generation prompt
- `frameCount: number` - Number of frames per animation
- `assetType: GameAsset['type']` - Asset type
- `sourceImageUrl?: string` - Optional source image
- `onProgress?: (animationKey: string, frameNumber: number, total: number) => void` - Progress callback

**Returns:** `Promise<AnimationSequence[]>`

### Sprite Sheet Utils (`utils/spriteSheet.ts`)

#### `generateSpriteSheet(sequences: AnimationSequence[], layout?: SpriteSheetLayout): Promise<{image: string, metadata: SpriteSheetMetadata}>`

Generate a sprite sheet from animation sequences.

**Parameters:**
- `sequences: AnimationSequence[]` - Array of animation sequences
- `layout?: SpriteSheetLayout` - Layout type ('horizontal', 'vertical', or 'grid')

**Returns:** `Promise<{image: string, metadata: SpriteSheetMetadata}>` - Data URL and metadata

**Example:**
```typescript
const { image, metadata } = await generateSpriteSheet(sequences, {
  type: 'horizontal'
});
```

#### `exportSpriteSheet(sequences: AnimationSequence[], layout?: SpriteSheetLayout, filename?: string): Promise<void>`

Export sprite sheet as PNG and JSON files.

**Parameters:**
- `sequences: AnimationSequence[]` - Array of animation sequences
- `layout?: SpriteSheetLayout` - Layout type
- `filename?: string` - Base filename (default: 'sprite-sheet')

**Returns:** `Promise<void>`

### Maple Cache Service (`services/mapleCacheService.ts`)

#### `get(version, category, query, page): Promise<MapleData[] | null>`

Get cached MapleStory data from IndexedDB.

**Parameters:**
- `version: MapleVersion` - Game version
- `category: MapleCategory` - Asset category
- `query: string` - Search query
- `page: number` - Page number

**Returns:** `Promise<MapleData[] | null>`

#### `set(version, category, query, page, data): Promise<void>`

Cache MapleStory data in IndexedDB.

**Parameters:**
- `version: MapleVersion` - Game version
- `category: MapleCategory` - Asset category
- `query: string` - Search query
- `page: number` - Page number
- `data: MapleData[]` - Data to cache

**Returns:** `Promise<void>`

#### `clear(): Promise<void>`

Clear all cached data.

**Returns:** `Promise<void>`

#### `cleanup(): Promise<void>`

Remove expired cache entries.

**Returns:** `Promise<void>`

## Type Definitions

### `GameAsset`

```typescript
interface GameAsset {
  id: string;
  name: string;
  type: 'monster' | 'item' | 'npc' | 'platform' | 'background';
  originalPrompt: string;
  remixPrompt: string;
  imageUrl?: string;
  sourceImageUrl?: string;
  metadata: AssetMetadata;
  status: 'idle' | 'generating' | 'complete' | 'error';
  error?: AppError;
  progress?: {
    imageProgress?: number;
    metadataProgress?: number;
    currentStep?: string;
  };
  timestamp?: number;
  version?: number;
}
```

### `AppError`

```typescript
interface AppError {
  category: ErrorCategory;
  message: string;
  userMessage: string;
  provider?: string;
  operation?: string;
  retryable: boolean;
  retryAfter?: number;
  originalError?: Error;
}
```

### `BatchJob`

```typescript
interface BatchJob {
  id: string;
  name: string;
  items: BatchJobItem[];
  status: 'pending' | 'running' | 'paused' | 'completed' | 'error';
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  createdAt: number;
  completedAt?: number;
}
```

### `AnimationSequence`

```typescript
interface AnimationSequence {
  id: string;
  name: string;
  animationKey: string;
  frames: AnimationFrame[];
  frameCount: number;
  createdAt: number;
}
```

### `AssetMetadata`

```typescript
interface AssetMetadata {
  hp: number;
  exp: number;
  speed: number;
  behavior: string;
  description: string;
  hitbox: {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  };
  animations: string[];
}
```

### `MapleData`

```typescript
interface MapleData {
  id: number;
  name: string;
  category: MapleCategory;
  imgUrl: string;
}
```

### `Preset`

```typescript
interface Preset {
  id: string;
  name: string;
  type: GameAsset['type'];
  basePrompt: string;
  imageUrl?: string;
}
```

## Component Props

### `AssetLibrary`

```typescript
interface AssetLibraryProps {
  onSelectPreset: (preset: Preset) => void;
  onSelectMapleAsset: (asset: MapleData) => void;
  onNewCustom: () => void;
}
```

### `AssetEditor`

```typescript
interface AssetEditorProps {
  asset: GameAsset;
  onUpdateAsset: (updates: Partial<GameAsset>) => void;
  onGenerate: () => void;
  aiProvider?: AIProviderType;
}
```

### `BatchGenerator`

```typescript
interface BatchGeneratorProps {
  provider: AIProviderType;
  onAssetGenerated?: (asset: GameAsset) => void;
}
```

### `AnimationGenerator`

```typescript
interface AnimationGeneratorProps {
  assetName: string;
  basePrompt: string;
  assetType: GameAsset['type'];
  sourceImageUrl?: string;
  provider: AIProviderType;
  onComplete?: (sequences: AnimationSequence[]) => void;
  onCancel?: () => void;
}
```

## Constants

### `ASSET_PRESETS`

Array of pre-configured asset presets.

```typescript
const ASSET_PRESETS: Preset[] = [
  { id: 'slime-base', name: 'Green Slime', type: 'monster', ... },
  // ...
];
```

### `STYLE_MODIFIERS`

Object mapping style names to prompt modifiers.

```typescript
const STYLE_MODIFIERS = {
  neon: 'neon glowing outlines, cyberpunk aesthetic...',
  drip: 'melting texture, gooey drips...',
  // ...
};
```

## Error Handling

### AI Service Errors

All AI service methods throw errors that should be caught:

```typescript
try {
  const image = await generateAssetImage(prompt);
} catch (error) {
  console.error('Generation failed:', error);
  // Handle error (show user message, set error state, etc.)
}
```

### MapleStory Service Errors

The service includes advanced error handling:
- Circuit breaker pattern to prevent cascading failures (v210 only)
- Exponential backoff with jitter for retries
- Request queuing for v210 API to respect rate limits
- Automatic fallback to v62 when v210 is consistently failing
- Failed request caching to avoid repeated failures
- 5xx server errors (retries 3 times with exponential backoff)
- Request timeouts (10s timeout, retries 3 times)
- Network errors
- Asset deduplication to prevent duplicate listings

Errors are thrown if all retries fail or circuit breaker is open (v210 only).

## Provider-Specific Details

### Gemini Provider

**Models:**
- Image: `gemini-2.5-flash-image`
- Text: `gemini-2.5-flash`

**Features:**
- Native image-to-image support
- Structured JSON output with schema validation
- Aspect ratio control

### OpenAI Provider

**Models:**
- Image: `dall-e-3`
- Text: `gpt-4o-mini`

**Features:**
- Base64 JSON response format
- JSON object response format for metadata
- Limited image-to-image (uses prompt enhancement)

### Anthropic Provider

**Models:**
- Text: `claude-3-5-sonnet-20241022`

**Features:**
- Metadata generation only
- JSON extraction from markdown responses
- No image generation support

## Environment Variables

All environment variables are loaded via Vite and available as `process.env.*`:

- `GEMINI_API_KEY` - Google Gemini API key
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `AI_PROVIDER` - Default provider ('gemini', 'openai', or 'anthropic')

