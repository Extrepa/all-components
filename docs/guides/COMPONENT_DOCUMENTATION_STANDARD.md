# Component Documentation Standard

**Date:** 2027-01-09  
**Status:** Complete  
**Phase:** Phase 6

## Purpose

Standard template and guidelines for documenting React components across all Errl projects.

## Component Documentation Template

```markdown
# ComponentName

**File:** `path/to/ComponentName.tsx`  
**Type:** [Component Type]  
**Purpose:** [Brief description]

**Props:**
```typescript
interface ComponentNameProps {
  prop1: Type;
  prop2?: OptionalType;
  // ... other props
}
```

**Usage:**
```tsx
import { ComponentName } from '@package/name';

<ComponentName prop1={value} prop2={optional} />
```

**Features:**
- Feature 1
- Feature 2
- Feature 3

**Dependencies:**
- External dependency 1
- External dependency 2
- Internal dependency 1

**Notes:**
- Additional notes
- Usage considerations
- Performance notes
```

## Documentation Sections

### Required Sections

1. **Component Name** - Clear heading
2. **File Path** - Location of component
3. **Type** - Component category
4. **Purpose** - What the component does
5. **Props** - TypeScript interface
6. **Usage** - Code example

### Optional Sections

7. **Features** - Key features list
8. **Dependencies** - Required dependencies
9. **Notes** - Additional information
10. **Examples** - Extended examples
11. **API Reference** - Detailed API docs
12. **Performance** - Performance considerations

## Component Types

### Core Components
- Main orchestrator components
- Layout components
- Wrapper components

### UI Components
- Buttons, inputs, modals
- Form components
- Display components

### WebGL Components
- Three.js components
- Shader components
- 3D rendering components

### Editor Components
- Tool panels
- Inspector components
- Canvas components

### Utility Components
- Helper components
- Controller components
- Sync components

## Props Documentation Format

### Required Props
```typescript
interface Props {
  requiredProp: Type; // Description
}
```

### Optional Props
```typescript
interface Props {
  optionalProp?: Type; // Description, default: value
}
```

### Complex Props
```typescript
interface Props {
  complexProp: {
    nested: Type;
    properties: Type;
  };
}
```

## Usage Examples

### Basic Usage
```tsx
import { Component } from '@package';

<Component prop={value} />
```

### Advanced Usage
```tsx
import { Component } from '@package';

<Component 
  prop1={value1}
  prop2={value2}
  onEvent={handler}
>
  {children}
</Component>
```

### With Error Handling
```tsx
import { Component, ErrorBoundary } from '@package';

<ErrorBoundary fallback={<Error />}>
  <Component />
</ErrorBoundary>
```

## Documentation Guidelines

### Clarity
- Use clear, concise language
- Explain purpose clearly
- Provide context when needed

### Completeness
- Document all props
- Include usage examples
- Note dependencies
- Mention known issues

### Consistency
- Follow template structure
- Use consistent formatting
- Maintain style across components

### Examples
- Provide basic usage
- Show common patterns
- Include edge cases if relevant

## Component Catalog Format

### Catalog Entry Structure

```markdown
### ComponentName

**File:** `path/to/ComponentName.tsx`  
**Type:** Component Type  
**Purpose:** Brief description

**Props:**
- `prop1` (Type): Description
- `prop2` (OptionalType): Description, default: value

**Usage:**
[Code example]

**Features:**
- Feature 1
- Feature 2

**Dependencies:**
- Dependency 1
- Dependency 2
```

## Integration Documentation

### Usage Across Projects

Document how components are used across projects:

```markdown
## Usage in Projects

### Project A
- Used for: Purpose
- Import: `import { Component } from '@package'`
- Notes: Usage notes

### Project B
- Used for: Purpose
- Import: `import { Component } from '@package'`
- Notes: Usage notes
```

### Version Compatibility

Document version requirements:

```markdown
## Version Requirements

- React: ^18.0.0 || ^19.0.0
- Three.js: ^0.150.0
- Other dependencies...
```

## Best Practices

1. **Document Early** - Document as you create
2. **Keep Updated** - Update docs when components change
3. **Be Specific** - Include type information
4. **Provide Examples** - Show real usage
5. **Note Dependencies** - List all requirements
6. **Explain Purpose** - Why does this component exist?

## Examples

See:
- `Errl_Components/docs/COMPONENT_CATALOG.md` - Complete catalog example
- `all-components/docs/COMPONENT_CATALOG.md` - Reference catalog example

## Notes

- Documentation should be in markdown
- Use TypeScript interfaces for props
- Include code examples
- Keep documentation close to code
- Update when components change
