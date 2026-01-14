# Contributing & Extending

## Architecture Overview

Errl Forge is designed to be extensible. The main extension points are:

1. **AI Providers** - Add new AI services
2. **Asset Types** - Add new game asset categories
3. **Style Modifiers** - Add new aesthetic styles
4. **Presets** - Add new template assets
5. **Components** - Add new UI features

## Adding a New AI Provider

### Step 1: Create Provider Class

Create a new file in `services/providers/`:

```typescript
// services/providers/myProvider.ts
import { AIProvider, ProviderConfig } from '../aiProvider';
import { AssetMetadata } from '../../types';

export class MyProvider implements AIProvider {
  name = 'My Provider';
  private apiKey: string;

  constructor(config: ProviderConfig) {
    const apiKey = config.apiKey || process.env.MY_PROVIDER_API_KEY;
    if (!apiKey) {
      throw new Error('My Provider API key is required.');
    }
    this.apiKey = apiKey;
  }

  async generateImage(prompt: string, inputImageBase64?: string): Promise<string> {
    // Implement image generation
    // Return data URL: "data:image/png;base64,..."
  }

  async generateMetadata(name: string, visualDescription: string): Promise<AssetMetadata> {
    // Implement metadata generation
    // Return AssetMetadata object
  }
}
```

### Step 2: Register Provider

Update `services/aiService.ts`:

```typescript
import { MyProvider } from './providers/myProvider';

function createProvider(config: ProviderConfig): AIProvider {
  switch (config.type) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'myprovider':  // Add new case
      return new MyProvider(config);
    default:
      throw new Error(`Unsupported provider type: ${config.type}`);
  }
}
```

### Step 3: Update Types

Update `services/aiProvider.ts`:

```typescript
export type AIProviderType = 'gemini' | 'openai' | 'anthropic' | 'myprovider';
```

### Step 4: Add UI Option

Update `App.tsx`:

```typescript
<select
  value={aiProvider}
  onChange={(e) => setAiProvider(e.target.value as AIProviderType)}
>
  <option value="gemini">Gemini</option>
  <option value="openai">OpenAI</option>
  <option value="anthropic">Anthropic</option>
  <option value="myprovider">My Provider</option>  {/* Add option */}
</select>
```

### Step 5: Add Environment Variable

Update `vite.config.ts`:

```typescript
define: {
  // ... existing
  'process.env.MY_PROVIDER_API_KEY': JSON.stringify(env.MY_PROVIDER_API_KEY),
}
```

Update `.env.example`:

```
MY_PROVIDER_API_KEY=your_key_here
```

## Adding New Asset Types

### Step 1: Update Type Definition

Update `types.ts`:

```typescript
export interface GameAsset {
  // ... existing fields
  type: 'monster' | 'item' | 'npc' | 'platform' | 'background' | 'weapon';  // Add new type
}
```

### Step 2: Update Category Mapping

Update `App.tsx` in `handleSelectMapleAsset`:

```typescript
let assetType: GameAsset['type'] = 'monster';
if (asset.category === 'item' || asset.category === 'equip') assetType = 'item';
if (asset.category === 'npc') assetType = 'npc';
if (asset.category === 'map') assetType = 'background';
if (asset.category === 'weapon') assetType = 'weapon';  // Add mapping
```

### Step 3: Update Metadata Generation (Optional)

Modify the metadata generation prompt in providers to handle new types appropriately.

## Adding Style Modifiers

### Step 1: Add to Constants

Update `constants.ts`:

```typescript
export const STYLE_MODIFIERS = {
  neon: 'neon glowing outlines, cyberpunk aesthetic...',
  drip: 'melting texture, gooey drips...',
  glitch: 'digital glitch effects...',
  void: 'dark purple and black color scheme...',
  retro: '8-bit pixel art, classic arcade style, vibrant colors',  // Add new
};
```

### Step 2: UI Updates Automatically

The `AssetEditor` component automatically picks up new style modifiers from the constants.

## Adding Presets

### Step 1: Add to Constants

Update `constants.ts`:

```typescript
export const ASSET_PRESETS: Preset[] = [
  // ... existing presets
  {
    id: 'new-preset',
    name: 'New Asset',
    type: 'monster',
    basePrompt: 'A detailed description of the asset, pixel art style, MapleStory aesthetic, white background'
  }
];
```

### Step 2: UI Updates Automatically

The `AssetLibrary` component automatically displays new presets.

## Extending Components

### Adding New UI Features

1. **Create new component** in `components/` directory
2. **Import and use** in `App.tsx` or existing components
3. **Follow existing patterns** for styling and state management

### Example: Adding a History Panel

```typescript
// components/AssetHistory.tsx
import React from 'react';
import { GameAsset } from '../types';

interface AssetHistoryProps {
  assets: GameAsset[];
  onSelect: (asset: GameAsset) => void;
}

export const AssetHistory: React.FC<AssetHistoryProps> = ({ assets, onSelect }) => {
  return (
    <div className="asset-history">
      {/* Implementation */}
    </div>
  );
};
```

Then use in `App.tsx`:

```typescript
import { AssetHistory } from './components/AssetHistory';

// In component:
const [history, setHistory] = useState<GameAsset[]>([]);

// Add to JSX
<AssetHistory assets={history} onSelect={handleSelectFromHistory} />
```

## Code Style Guidelines

### TypeScript

- Use strict type checking
- Prefer interfaces over types for object shapes
- Use `const` assertions where appropriate
- Avoid `any` - use `unknown` if type is truly unknown

### React

- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic to custom hooks
- Use TypeScript for props interfaces

### Naming Conventions

- **Components:** PascalCase (`AssetEditor.tsx`)
- **Services:** camelCase (`aiService.ts`)
- **Types/Interfaces:** PascalCase (`GameAsset`)
- **Constants:** UPPER_SNAKE_CASE or camelCase (`ASSET_PRESETS`)

### File Organization

```
components/        # React components
services/          # Business logic
  providers/       # AI provider implementations
docs/              # Documentation
types.ts           # Type definitions
constants.ts       # Constants and presets
utils.ts           # Utility functions
```

## Testing Your Changes

### Manual Testing Checklist

- [ ] Test with all AI providers
- [ ] Test with different asset types
- [ ] Test error scenarios (invalid API keys, network failures)
- [ ] Test UI responsiveness
- [ ] Test export functionality
- [ ] Test with v62 and v210 MapleStory versions

### Build Verification

```bash
# Ensure project builds
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Run linter (if configured)
npm run lint
```

## Submitting Changes

### Before Submitting

1. **Test thoroughly** - Ensure all features work
2. **Update documentation** - Add docs for new features
3. **Follow code style** - Match existing patterns
4. **Add comments** - Document complex logic
5. **Update types** - Ensure TypeScript types are correct

### Pull Request Guidelines

- Clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Update relevant documentation
- Ensure build passes

## Common Extension Patterns

### Pattern 1: Adding Configuration Options

```typescript
// Add to ProviderConfig
interface ProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  model?: string;
  imageModel?: string;
  customOption?: string;  // Add new option
}

// Use in provider
constructor(config: ProviderConfig) {
  this.customOption = config.customOption || 'default';
}
```

### Pattern 2: Adding New Service Methods

```typescript
// In aiService.ts
class AIService {
  // ... existing methods
  
  async newFeatureMethod(param: string): Promise<Result> {
    return this.provider.newFeatureMethod(param);
  }
}

// In AIProvider interface
interface AIProvider {
  // ... existing methods
  newFeatureMethod?(param: string): Promise<Result>;  // Optional
}
```

### Pattern 3: Adding UI State

```typescript
// In App.tsx
const [newState, setNewState] = useState<Type>(initialValue);

// Pass to components
<Component 
  newProp={newState}
  onNewAction={setNewState}
/>
```

## Troubleshooting Extensions

### Provider Not Appearing in UI

- Check provider is registered in `createProvider()`
- Verify type is added to `AIProviderType`
- Ensure option is added to select dropdown
- Check for TypeScript errors

### API Key Not Working

- Verify environment variable name matches
- Check `vite.config.ts` defines the variable
- Restart dev server after adding env vars
- Check API key format is correct

### Type Errors

- Ensure all types are exported
- Check imports are correct
- Verify interface implementations match
- Run `npx tsc --noEmit` to see all errors

## Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

### AI Provider Docs
- [Gemini API](https://ai.google.dev/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Anthropic API](https://docs.anthropic.com/)

### External APIs
- [MapleStory.io API](https://maplestory.io/api)

## Questions?

If you have questions about extending Errl Forge:

1. Check existing provider implementations for examples
2. Review the architecture documentation
3. Examine the codebase for patterns
4. Open an issue for discussion

