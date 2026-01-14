# Getting Started for Developers

Welcome! This guide will help you get up and running with the Figma Clone Engine codebase.

## Prerequisites

- **Node.js 18+** and npm
- **Git** (for version control)
- **Code Editor** (VS Code recommended)
- **Basic Knowledge**: React, TypeScript, HTML5 Canvas

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This installs:
- React 18 & TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)

### 2. Start Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3. Verify It Works

You should see:
- A dark canvas with a sample card design
- Left sidebar with layers
- Right sidebar with property inspector
- Top toolbar with tools

Try:
- Click and drag the card to move it
- Select different tools from the toolbar
- Switch to "Dev Mode" to see code generation

## Understanding the Codebase

### Project Structure

```
figma-clone-engine/
├── src/
│   ├── App.tsx                    # Main application (1949 lines - core canvas logic)
│   ├── main.tsx                   # React entry point
│   ├── types.ts                   # Type definitions
│   ├── components/                # UI components
│   │   ├── BottomDock.tsx         # Tool dock
│   │   ├── FloatingTopNav.tsx     # Top navigation
│   │   ├── LayersPanel.tsx        # Left sidebar
│   │   ├── InspectorPanel.tsx     # Right sidebar
│   │   └── inspector/             # Inspector sub-components
│   ├── hooks/
│   │   └── useDesignHistory.ts    # History hook
│   ├── utils/                     # Utility functions
│   │   ├── helpers.ts
│   │   ├── layout.ts
│   │   ├── codeGeneration.ts
│   │   └── ...
│   └── index.css                  # Global styles
├── docs/                          # Documentation
└── package.json                   # Dependencies
```
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file

### Key Concepts to Understand

1. **Normalized State** - All nodes stored in a flat map, not nested
2. **Canvas Rendering** - Everything drawn on HTML5 Canvas, not DOM
3. **Coordinate Systems** - Screen space vs World space
4. **History System** - Undo/redo with time-travel
5. **Auto-Layout** - Flexbox-like layout engine

### Reading Order

1. **Start Here**: [Codebase Guide](./codebase_guide.md) - Overview of structure
2. **Then Read**: [Architecture](./architecture.md) - How it all fits together
3. **Reference**: [Quick Reference](./quick_reference.md) - Common patterns
4. **Before Coding**: [Development Guidelines](./development_guidelines.md) - Standards

## Your First Change

Let's add a simple feature: a console log when a node is selected.

### Step 1: Find the Selection Code

Open `src/App.tsx` and search for `setState(p => ({ ...p, selection:`

You'll find it around line 487 in `handlePointerDown`:

```typescript
if (hitId) {
    setState(p => ({ ...p, selection: [hitId] }));
    // ... rest of code
}
```

### Step 2: Add Your Log

```typescript
if (hitId) {
    setState(p => ({ ...p, selection: [hitId] }));
    console.log('Selected node:', state.nodes[hitId]); // Add this line
    // ... rest of code
}
```

### Step 3: Test It

1. Save the file
2. The dev server will hot-reload
3. Click on a node in the canvas
4. Check the browser console - you should see the log!

## Common Development Tasks

### Adding a New Node Type

See [Codebase Guide - Adding New Features](./codebase_guide.md#adding-new-features)

### Debugging

1. **Add console logs**:
   ```typescript
   console.log('State:', state);
   console.log('Selection:', state.selection);
   ```

2. **Use React DevTools**:
   - Install React DevTools browser extension
   - Inspect component state
   - Profile performance

3. **Check the console**:
   - Look for errors
   - Check warnings
   - Verify state updates

### Testing Changes

1. **Manual Testing Checklist**:
   - [ ] Feature works as expected
   - [ ] No console errors
   - [ ] Works with existing features
   - [ ] Undo/redo still works
   - [ ] Performance is acceptable

2. **Test Scenarios**:
   - Create nodes
   - Select and move nodes
   - Use auto-layout
   - Switch to Dev Mode
   - Try undo/redo

## Development Workflow

### Making Changes

1. **Create a branch** (if using Git):
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**:
   - Follow [Development Guidelines](./development_guidelines.md)
   - Write clear code
   - Add comments for complex logic

3. **Test thoroughly**:
   - Test your changes
   - Test edge cases
   - Verify no regressions

4. **Commit**:
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

### Code Style

- Use TypeScript types explicitly
- Follow naming conventions
- Use immutable state updates
- Add comments for complex logic
- Keep functions focused

See [Development Guidelines](./development_guidelines.md) for details.

## Understanding Key Functions

### State Management

```typescript
// Update state (doesn't commit to history)
setState(prev => ({ ...prev, property: newValue }));

// Commit to history (for undo/redo)
pushToHistory(newState);

// Undo/Redo
undo();
redo();
```

### Coordinate Transforms

```typescript
// Convert screen to world coordinates
const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

// Get absolute position (including parent offsets)
const absPos = getAbsolutePosition(nodeId, state.nodes);
```

### Rendering

```typescript
// Render function (called automatically)
const renderScene = useCallback(() => {
  // ... rendering logic
}, [state, hoveredId]);
```

## Common Issues

### "Canvas not rendering"
- Check canvas ref is attached
- Verify context is not null
- Check state has nodes

### "Elements in wrong position"
- Verify using `screenToWorld` for input
- Check absolute position calculation
- Ensure viewport transform applied

### "Undo not working"
- Check `pushToHistory` is called
- Verify state updates are immutable
- Check history state structure

See [Troubleshooting](./troubleshooting.md) for more solutions.

## Next Steps

1. **Explore the codebase**:
   - Read through `App.tsx`
   - Understand the state structure
   - Study the rendering pipeline

2. **Try small changes**:
   - Add a console log
   - Change a color
   - Modify a tool behavior

3. **Read the docs**:
   - [Codebase Guide](./codebase_guide.md)
   - [Development Guidelines](./development_guidelines.md)
   - [Quick Reference](./quick_reference.md)

4. **Pick a feature**:
   - Check [Roadmap](./roadmap.md) for ideas
   - Start with something small
   - Build up to larger features

## Getting Help

- **Check documentation**: Most questions answered in docs
- **Review code comments**: Code is well-commented
- **Study existing code**: Learn from existing implementations
- **Ask questions**: File an issue or start a discussion

## Resources

- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **Vite Docs**: https://vitejs.dev

## Tips for Success

1. **Start small** - Make small, incremental changes
2. **Test often** - Verify changes work as expected
3. **Read the code** - Understand before modifying
4. **Follow patterns** - Use existing code as examples
5. **Ask questions** - Don't hesitate to seek help

---

**Ready to code?** Check out [Contributing](./contributing.md) for the full workflow, or dive into [Codebase Guide](./codebase_guide.md) to understand the structure!

