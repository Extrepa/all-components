# Development Guide

This guide is for developers who want to contribute to VibeCheck or understand how to extend it.

## Table of Contents

- [Setup](#setup)
- [Project Structure](#project-structure)
- [Adding a New Mode](#adding-a-new-mode)
- [Adding a New Model](#adding-a-new-model)
- [Code Style](#code-style)
- [State Management](#state-management)
- [Testing](#testing)
- [Debugging](#debugging)
- [Common Patterns](#common-patterns)

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Initial Setup

```bash
# Install dependencies
npm install

# Create .env.local file
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Start development server
npm run dev
```

### Development Server

- **URL**: `http://localhost:5173`
- **Hot Reload**: Enabled
- **TypeScript**: Strict mode enabled

## Project Structure

```
src/
├── components/          # React components
│   ├── App.tsx        # Main app component
│   ├── Intro.tsx      # Landing page
│   ├── FeedItem.tsx   # Feed item display
│   ├── Renderer.tsx   # Code renderer
│   └── ...
├── lib/                # Core logic
│   ├── store.ts       # Zustand store
│   ├── actions.ts     # State actions
│   ├── llm.ts         # AI API integration
│   ├── models.ts      # Model configurations
│   ├── modes.ts       # Mode configurations
│   ├── types.ts       # TypeScript types
│   └── utils.ts       # Utility functions
```

## Adding a New Mode

### Step 1: Define Mode Configuration

Edit `src/lib/modes.ts`:

```typescript
export default {
  // ... existing modes
  myNewMode: {
    name: 'My New Mode',
    emoji: '🎨',
    syntax: 'javascript', // or 'html', 'xml', 'shader', 'image'
    imageOutput: false,
    systemInstruction: `You are an expert at creating [description].
    When given a prompt, [instructions].
    Return ONLY the code, nothing else.`,
    getTitle: (s: string) => `Create ${s}`,
    presets: [
      {label: '🎯 example', prompt: 'example prompt'},
      // ... more presets
    ]
  }
} satisfies Modes
```

### Step 2: Add to Frontpage Order (Optional)

If you want it on the intro page:

```typescript
export const frontpageOrder = [
  // ... existing modes
  'myNewMode'
] as const
```

### Step 3: Add Scaffold Function

Edit `src/components/Renderer.tsx`:

```typescript
const scaffolds: {[key in ModeKey]: (code: string) => string} = {
  // ... existing scaffolds
  myNewMode: (code: string) => `
    <!DOCTYPE html>
    <html>
      <!-- Your scaffold HTML here -->
      <script>
        ${code}
      </script>
    </html>
  `
}
```

### Step 4: Update Types

The types should automatically update, but verify in `src/lib/types.ts`:

```typescript
export type ModeKey = keyof typeof modes // Should include your new mode
```

### Step 5: Test

1. Start dev server
2. Select your new mode
3. Generate a test output
4. Verify rendering works

## Adding a New Model

### Step 1: Add Model Configuration

Edit `src/lib/models.ts`:

```typescript
const models = {
  // ... existing models
  myNewModel: {
    name: 'My New Model',
    version: '2.5',
    modelString: 'gemini-2.5-my-model',
    shortName: 'MyModel',
    thinkingCapable: true,
    thinking: false, // or true
    imageOutput: false,
    order: 5
  }
} as const
```

### Step 2: Add to Active Models

```typescript
export const activeModelKeys = [
  // ... existing models
  'myNewModel'
] as const
```

### Step 3: Update Defaults (Optional)

If you want it as a default:

```typescript
const initialState: AppState = {
  // ...
  batchModel: 'myNewModel', // or keep existing
  versusModels: {
    // ...
    myNewModel: true // if you want it in versus mode
  }
}
```

### Step 4: Test

1. Select your new model
2. Generate a test output
3. Verify API calls work
4. Check error handling

## Code Style

### TypeScript

- **Strict mode**: Enabled
- **No `any` types**: Use proper types or `unknown`
- **Explicit returns**: Prefer explicit return types for functions
- **Type imports**: Use `import type` for type-only imports

```typescript
// ✅ Good
import type {Round, Output} from './types.ts'
export const addRound = (prompt: string): void => { ... }

// ❌ Bad
import {Round, Output} from './types.ts' // types should use 'type'
export const addRound = (prompt: string) => { ... } // missing return type
```

### React Components

- **Functional components**: Use function components, not classes
- **Hooks**: Use hooks for state and effects
- **Memoization**: Use `memo()` for expensive components
- **Props**: Define prop types explicitly

```typescript
// ✅ Good
interface Props {
  id: string
  onClose: () => void
}
export function Component({id, onClose}: Props) { ... }

// ❌ Bad
export function Component(props: any) { ... }
```

### File Organization

- **One component per file**: Each component in its own file
- **Co-location**: Keep related files together
- **Barrel exports**: Use index files for clean imports (if needed)

### Naming Conventions

- **Components**: PascalCase (`FeedItem.tsx`)
- **Functions**: camelCase (`addRound`)
- **Constants**: UPPER_SNAKE_CASE or camelCase (`outputWidth`)
- **Types**: PascalCase (`AppState`, `ModeKey`)
- **Files**: Match export (component files match component name)

### Comments

- **JSDoc**: Use JSDoc for public functions
- **Explain why**: Not what (code should be self-documenting)
- **License headers**: Keep at top of files

```typescript
/**
 * Adds a new round to the feed and generates outputs.
 * 
 * @param prompt - The user's prompt text
 * @param inputImage - Optional base64 image data
 * @param options - Optional configuration (mode, batch settings, etc.)
 * @returns Promise that resolves when round is added
 */
export const addRound = async (
  prompt: string,
  inputImage: string | null,
  options?: {...}
) => { ... }
```

## State Management

### Zustand Store

- **Immer middleware**: All state updates are immutable
- **Persist middleware**: Selected state persists to localStorage
- **Custom selectors**: Use `use.selectorName()` pattern

### Adding New State

1. **Update types** (`src/lib/types.ts`):
```typescript
export type AppState = {
  // ... existing state
  myNewState: string | null
}
```

2. **Update initial state** (`src/lib/store.ts`):
```typescript
const initialState: AppState = {
  // ...
  myNewState: null
}
```

3. **Add action** (`src/lib/actions.ts`):
```typescript
export const setMyNewState = (value: string | null) =>
  set(state => {
    state.myNewState = value
  })
```

4. **Use in components**:
```typescript
const myNewState = use.myNewState()
```

### State Updates

Always use Immer (automatic with `set()`):

```typescript
// ✅ Good - Immer handles immutability
set(state => {
  state.feed.push(newRound)
})

// ❌ Bad - Direct mutation (breaks React)
const state = get()
state.feed.push(newRound)
set(state)
```

## Testing

### Setup (Future)

We plan to use Vitest for testing:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Test Structure

```
tests/
├── unit/
│   ├── utils.test.ts
│   ├── actions.test.ts
│   └── ...
├── integration/
│   ├── store.test.ts
│   └── ...
└── e2e/
    └── user-flows.test.ts
```

### Writing Tests

```typescript
import {describe, it, expect} from 'vitest'
import {addRound} from '../lib/actions.ts'

describe('addRound', () => {
  it('should create a new round', async () => {
    // Test implementation
  })
})
```

## Debugging

### Browser DevTools

- **React DevTools**: Install for component inspection
- **Redux DevTools**: Works with Zustand (install browser extension)
- **Console**: Check for errors and warnings

### Common Issues

#### API Errors

```typescript
// Check API key
console.log(process.env.API_KEY) // Should not be undefined

// Check network tab for API calls
// Look for 429 (rate limit) or 401 (auth) errors
```

#### State Not Updating

```typescript
// Verify state update
console.log(get().myState)

// Check if component is subscribed
const myState = use.myState() // Should trigger re-render
```

#### Rendering Issues

```typescript
// Check if code is valid
console.log(output.srcCode)

// Check if scaffold is correct
console.log(scaffolds[mode](code))

// Check iframe sandbox
// Should be: sandbox="allow-same-origin allow-scripts"
```

### Debug Mode

Add temporary logging:

```typescript
// In actions.ts
export const addRound = async (...) => {
  console.log('[addRound]', {prompt, options})
  // ... rest of function
}
```

## Common Patterns

### Async Operations

```typescript
// ✅ Good - Handle errors
try {
  const result = await llmGen({...})
  set(state => {
    state.output.srcCode = result
  })
} catch (error) {
  console.error(error)
  set(state => {
    state.output.state = 'error'
  })
}
```

### Conditional Rendering

```typescript
// ✅ Good
{isVisible && <Component />}

// ✅ Good - Complex conditions
{activeCollectionId ? (
  <Collection id={activeCollectionId} />
) : feed.length === 0 ? (
  <Intro />
) : (
  <Feed />
)}
```

### Event Handlers

```typescript
// ✅ Good - Inline for simple handlers
<button onClick={() => setMode('p5')}>P5.js</button>

// ✅ Good - Extracted for complex logic
const handleGenerate = async () => {
  await addRound(prompt, null)
}
<button onClick={handleGenerate}>Generate</button>
```

### Refs and Effects

```typescript
// ✅ Good - Cleanup
useEffect(() => {
  const timer = setTimeout(() => {...}, 1000)
  return () => clearTimeout(timer)
}, [deps])

// ✅ Good - Ref for DOM access
const ref = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (ref.current) {
    ref.current.scrollIntoView()
  }
}, [])
```

## Performance Considerations

### Lazy Loading

- Use `IntersectionObserver` for renderers
- Only load visible components
- Unload when not visible

### Memoization

- Use `memo()` for expensive components
- Use `useMemo()` for expensive calculations
- Use `useCallback()` for stable function references

### State Updates

- Batch updates when possible
- Avoid unnecessary re-renders
- Use selectors to subscribe to minimal state

## Git Workflow

### Branch Naming

- `feature/add-new-mode` - New features
- `fix/renderer-bug` - Bug fixes
- `docs/update-readme` - Documentation
- `refactor/state-management` - Refactoring

### Commit Messages

- Use conventional commits format
- Be descriptive
- Reference issues if applicable

```
feat: add export functionality
fix: handle API rate limits properly
docs: update development guide
refactor: simplify state management
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Vite Guide](https://vitejs.dev/guide/)
- [Google Gemini API](https://ai.google.dev/docs)

## Getting Help

- Check existing documentation
- Review similar implementations in codebase
- Check browser console for errors
- Review API documentation
- Ask in issues/discussions

