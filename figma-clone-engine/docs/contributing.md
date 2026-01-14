# Contributing Guide

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)

### Setup

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd figma-clone-engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the [Development Guidelines](./development_guidelines.md)
   - Write clear, self-documenting code
   - Add comments for complex logic

3. **Test your changes**
   - Manually test the feature
   - Check for console errors
   - Verify performance isn't degraded

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

### Commit Message Format

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add circle tool
fix: correct coordinate transform in nested frames
docs: update development guidelines
perf: optimize hit testing with spatial index
```

## Code Standards

### TypeScript

- Use explicit types (avoid `any`)
- Prefer interfaces over types for object shapes
- Use type guards for union types
- Follow naming conventions from [Development Guidelines](./development_guidelines.md)

### React

- Use functional components with hooks
- Memoize expensive calculations
- Use `useCallback` for event handlers
- Keep components focused and single-purpose

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings (or double, be consistent)
- Add trailing commas in multi-line objects/arrays
- Use meaningful variable names
- Keep functions small and focused

## Adding Features

### Before You Start

1. **Check existing issues** - Your feature might already be requested
2. **Check the roadmap** - See if it's planned
3. **Propose your idea** - Discuss before implementing large features

### Implementation Steps

1. **Plan the feature**
   - What node types/tools are needed?
   - How does it affect state structure?
   - What UI changes are required?

2. **Update types** (if needed)
   - Add new node types to `SceneNode` union
   - Extend interfaces as needed

3. **Implement core logic**
   - Add utility functions
   - Update state management
   - Add rendering logic

4. **Add UI**
   - Tool buttons
   - Inspector panels
   - Keyboard shortcuts

5. **Update documentation**
   - Add to user guide
   - Update architecture docs if needed
   - Add examples

### Example: Adding a Circle Tool

```typescript
// 1. Add type
interface CircleNode extends BaseNode {
  type: 'CIRCLE';
  radius: number;
  fill: Color;
}

// 2. Add to union
type SceneNode = ... | CircleNode;

// 3. Add rendering
else if (props.type === 'CIRCLE') {
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.fill();
}

// 4. Add tool button
<button onClick={() => setActiveTool('CIRCLE')}>
  <Circle size={16}/>
</button>

// 5. Handle tool logic
if (activeTool === 'CIRCLE') {
  const newId = generateId();
  const circle: CircleNode = {
    id: newId,
    type: 'CIRCLE',
    name: 'Circle',
    radius: 50,
    // ... other properties
  };
  // ...
}
```

## Bug Fixes

### Reporting Bugs

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information
- Console errors (if any)
- Screenshots (if applicable)

### Fixing Bugs

1. **Reproduce the bug** - Ensure you can consistently reproduce it
2. **Identify the root cause** - Use debugging tools
3. **Write a fix** - Make minimal changes
4. **Test the fix** - Verify it works and doesn't break other things
5. **Document the fix** - Add comments explaining why the fix works

## Testing

### Manual Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Works with existing features
- [ ] Performance is acceptable
- [ ] Works in different browsers
- [ ] Works at different zoom levels
- [ ] Works with nested nodes
- [ ] Undo/redo works correctly
- [ ] Code generation works (if applicable)

### Testing Scenarios

Test these common scenarios:
- Creating nodes
- Selecting nodes
- Moving nodes
- Resizing nodes
- Grouping/ungrouping
- Auto-layout changes
- Undo/redo operations
- Save/load operations
- Dev mode code generation

## Documentation

### When to Update Docs

- Adding new features → Update user guide
- Changing architecture → Update architecture.md
- Adding guidelines → Update development_guidelines.md
- Performance changes → Update performance_guide.md

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add diagrams for complex concepts
- Keep examples up-to-date
- Link related documents

## Code Review Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] No console errors or warnings
- [ ] Documentation is updated
- [ ] Changes are tested
- [ ] Commit messages are clear

### Review Checklist

Reviewers should check:
- Code quality and style
- Correctness of implementation
- Performance implications
- Documentation completeness
- Test coverage
- Breaking changes

## Project Structure

### Current Structure

```
figma-clone-engine/
├── src/
│   ├── App.tsx          # Main application
│   ├── main.tsx         # Entry point
│   └── index.css        # Styles
├── docs/                # Documentation
└── package.json         # Dependencies
```

### Future Structure (Proposed)

As the project grows, consider:

```
src/
├── types/               # Type definitions
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── components/          # React components
├── stores/              # State management
└── App.tsx             # Main orchestrator
```

## Performance Considerations

When adding features, consider:

- **Rendering performance** - Will this slow down the canvas?
- **State size** - Will this increase memory usage?
- **Calculation complexity** - Are there O(n²) operations?
- **Event handler overhead** - Are handlers optimized?

See [Performance Guide](./performance_guide.md) for details.

## Common Contribution Areas

### Good First Contributions

- Adding new node types (Circle, Ellipse, etc.)
- Adding keyboard shortcuts
- Improving code generation
- Adding new tools
- UI/UX improvements
- Documentation improvements
- Bug fixes

### Advanced Contributions

- Refactoring into smaller modules
- Adding tests
- Performance optimizations
- Plugin system
- Multiplayer support
- Advanced layout features

## Questions?

- Check existing documentation
- Review code comments
- Ask in issues/discussions
- Study existing implementations

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn
- Follow project guidelines
- Communicate clearly

## License

[Add license information if applicable]

---

Thank you for contributing! 🎉

