# Contributing to Theme Lab

Guidelines for contributing themes, components, and improvements.

## How to Contribute

### Adding a New Theme

1. **Open `shared/theme.css`**
2. **Add theme block:**
```css
:root[data-theme="your-theme-name"] {
  --bg: #02070a;
  --bg-alt: #041017;
  --surface: #071b25;
  --surface-alt: #092231;
  --border: #163a4a;
  --border-soft: #0c2732;
  --border-gradient-from: #34e1ff;
  --border-gradient-to: #ff34f5;
  --accent: #34e1ff;
  --accent-soft: #0d3344;
  --accent-alt: #ff34f5;
  --accent-boost: #f5ffb7;
  --danger: #ff4b6a;
  --success: #5af29c;
  --text: #ecf9ff;
  --muted: #8eb7c7;
}
```

3. **Add to `THEMES` array in `index.html`:**
```javascript
{ id: "your-theme-name", label: "Your Theme Label" }
```

4. **Test your theme:**
   - Switch to it in the app
   - Validate accessibility
   - Check all components
   - Test responsive

5. **Follow naming:**
   - Use kebab-case for IDs
   - Use descriptive labels
   - Keep consistent with existing themes

### Adding a New Component

1. **Add HTML to preview area in `index.html`:**
```html
<article class="card">
  <div class="card-header">
    <h2>Your Component</h2>
  </div>
  <div class="card-body">
    <!-- Your component HTML -->
  </div>
</article>
```

2. **Add styles to `shared/ui/core.css`:**
```css
.your-component {
  /* Use CSS custom properties */
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
}
```

3. **Test component:**
   - Works with all themes
   - Responsive behavior
   - Accessibility (keyboard, screen readers)
   - All states (hover, focus, disabled)

### Improving Documentation

1. **Update relevant docs:**
   - `README.md` for major features
   - `docs/` files for specific topics
   - Inline code comments

2. **Follow style:**
   - Clear, concise language
   - Code examples where helpful
   - Screenshots for UI changes

### Reporting Issues

1. **Check existing issues** - Don't duplicate
2. **Provide details:**
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if helpful

3. **Be specific:**
   - Which feature
   - What went wrong
   - Error messages

### Suggesting Features

1. **Check `PLAN.md`** - May already be planned
2. **Describe clearly:**
   - What you want
   - Why it's useful
   - How it might work

3. **Consider:**
   - Fits with existing architecture
   - Zero-dependency approach
   - Accessibility impact

## Code Style

### CSS Guidelines
- Use CSS custom properties for all colors
- Follow existing naming conventions
- Comment complex styles
- Group related styles together

### JavaScript Guidelines
- Use modern ES6+ syntax
- Keep functions focused and small
- Add comments for complex logic
- Follow existing patterns

### HTML Guidelines
- Use semantic HTML
- Include ARIA labels where needed
- Keep structure clean
- Comment complex sections

## Testing Checklist

Before submitting:

- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Responsive on mobile
- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ] All themes work
- [ ] No console errors
- [ ] Validates accessibility

## Theme Guidelines

### Color Selection
- **Contrast** - Meet WCAG AA minimum (4.5:1)
- **Harmony** - Colors work together
- **Purpose** - Each color has clear purpose
- **Consistency** - Follow token structure

### Naming
- **Descriptive** - Name reflects theme mood
- **Unique** - Don't duplicate existing names
- **Clear** - Easy to understand

### Testing
- **All Components** - Test every component
- **All States** - Hover, focus, disabled, etc.
- **Accessibility** - Run validation
- **Responsive** - Test at all sizes

## Component Guidelines

### Design Principles
- **Theme-Aware** - Uses CSS custom properties
- **Accessible** - Keyboard and screen reader support
- **Responsive** - Works on all screen sizes
- **Consistent** - Matches existing components

### Implementation
- **Semantic HTML** - Proper element usage
- **ARIA Labels** - Where needed
- **Focus States** - Visible focus indicators
- **Error Handling** - Graceful degradation

## Documentation Guidelines

### Writing Style
- **Clear** - Easy to understand
- **Concise** - Get to the point
- **Complete** - Cover all aspects
- **Examples** - Show, don't just tell

### Structure
- **Headings** - Clear hierarchy
- **Lists** - For multiple items
- **Code Blocks** - For examples
- **Links** - Connect related topics

## Review Process

1. **Submit** - Create issue or pull request
2. **Review** - Maintainer reviews
3. **Feedback** - Suggestions provided
4. **Update** - Make requested changes
5. **Merge** - Accepted and merged

## Recognition

Contributors will be:
- Listed in documentation
- Credited in commit messages
- Acknowledged in releases

## Questions?

- Check existing documentation
- Review code comments
- Ask in issues
- Study existing implementations

Thank you for contributing to Theme Lab! 🎨

