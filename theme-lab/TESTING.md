# Theme Lab Testing Checklist

Comprehensive testing checklist for Theme Lab features.

## ✅ Core Functionality

### Theme Switching
- [ ] Click theme name switches theme
- [ ] Random theme button works
- [ ] Keyboard shortcuts (1-9, ↑/↓, R) work
- [ ] Search filters themes correctly
- [ ] Active theme highlighted in list
- [ ] Theme persists on page refresh (if shared URL)

### Layout Controls
- [ ] Density toggle (compact/cozy/spacious) works
- [ ] Borders toggle works
- [ ] Shadows toggle works
- [ ] Sidebar background toggle works
- [ ] Header show/hide works
- [ ] All layout changes apply instantly

## 📤 Export & Import

### Export
- [ ] Export JSON downloads file
- [ ] Copy CSS copies to clipboard
- [ ] Code snippets generate correctly
- [ ] All 5 code formats work (React, Tailwind, styled-components, Emotion, TypeScript)
- [ ] Toast notifications appear

### Import
- [ ] Import button opens dialog
- [ ] Valid JSON imports successfully
- [ ] Invalid JSON shows error
- [ ] Missing tokens detected
- [ ] Imported theme appears in list
- [ ] Imported theme works correctly

## 🎨 Theme Editor

### Visual Editor
- [ ] Editor opens with current theme
- [ ] Color pickers update text inputs
- [ ] Text inputs update color pickers
- [ ] Live preview updates as you edit
- [ ] Reset restores original values
- [ ] Apply changes works (temporary)
- [ ] Export as new theme creates JSON

## 💾 Presets

### Save/Load
- [ ] Save preset button works
- [ ] Preset name saves correctly
- [ ] Preset includes theme + layout
- [ ] Load preset restores state
- [ ] Delete preset removes it
- [ ] Presets persist in localStorage
- [ ] Presets button appears when presets exist

## ✅ Validation

### Accessibility Check
- [ ] Validate button opens results
- [ ] Contrast ratios calculated correctly
- [ ] Errors shown for failures
- [ ] Warnings shown for issues
- [ ] Fix suggestions provided
- [ ] Score bar displays correctly
- [ ] All validation checks run

## ⚖️ Comparison

### Theme Comparison
- [ ] Compare button opens dialog
- [ ] Theme dropdowns work
- [ ] Comparison shows all tokens
- [ ] Color swatches display
- [ ] Differences highlighted
- [ ] Updates when themes change

## 🎨 Token Reference

### Token Viewer
- [ ] Tokens button opens viewer
- [ ] All tokens displayed
- [ ] Organized by category
- [ ] Color swatches show correctly
- [ ] Click copies variable name
- [ ] Hex values displayed

## 🧩 Component Playground

### Live Editor
- [ ] Playground opens
- [ ] HTML editor works
- [ ] Preview updates in real-time
- [ ] Copy HTML works
- [ ] Reset restores template
- [ ] Errors handled gracefully

## 🎬 Animation Playground

### Animation Testing
- [ ] Animations button opens
- [ ] Fast transition preview works
- [ ] Medium transition preview works
- [ ] Button animations work
- [ ] Card hover effects work
- [ ] Loading spinner animates

## 📱 Responsive Preview

### Viewport Controls
- [ ] Controls bar appears
- [ ] Mobile button works (375px)
- [ ] Tablet button works (768px)
- [ ] Desktop button works (1024px)
- [ ] Full button works (100%)
- [ ] Current viewport displays
- [ ] Preview grid adjusts width

## 🔗 Sharing

### Theme Sharing
- [ ] Share button opens dialog
- [ ] URL generated correctly
- [ ] Copy URL works
- [ ] Shared URL loads theme
- [ ] Shared URL loads layout
- [ ] URL cleans after load

## ⌨️ Keyboard Shortcuts

### Shortcuts Testing
- [ ] R - Random theme
- [ ] E - Export
- [ ] C - Copy CSS
- [ ] V - Validate
- [ ] T - Tokens
- [ ] I - Import
- [ ] P - Preset
- [ ] 1-9 - Quick switch
- [ ] ↑/↓ - Navigate
- [ ] Cmd/Ctrl + K - Command palette
- [ ] Cmd/Ctrl + ? - Help
- [ ] Esc - Close modals

### Command Palette
- [ ] Opens with Cmd/Ctrl + K
- [ ] Search filters commands
- [ ] Enter executes command
- [ ] Click executes command
- [ ] Esc closes palette

## 🧪 Component Testing

### Buttons
- [ ] All button variants display
- [ ] Hover states work
- [ ] Disabled state works
- [ ] Loading state works
- [ ] Danger variant works
- [ ] Success variant works

### Inputs
- [ ] Text input works
- [ ] Select dropdown works
- [ ] Textarea works
- [ ] Error state displays
- [ ] Success state displays
- [ ] Disabled state works
- [ ] Focus states work

### Form Controls
- [ ] Checkboxes work
- [ ] Radio buttons work
- [ ] Toggles work
- [ ] All states display correctly

### Cards
- [ ] Cards display correctly
- [ ] Card header works
- [ ] Card body works
- [ ] Span modifier works
- [ ] Hover effects work

### Progress & Loading
- [ ] Progress bars display
- [ ] Loading spinner animates
- [ ] Uses theme colors

### Badges
- [ ] All badge variants display
- [ ] Colors use theme tokens

### Typography
- [ ] All heading levels display
- [ ] Body text displays
- [ ] Muted text displays
- [ ] Code blocks display
- [ ] Blockquotes display
- [ ] Links work

## 🌐 Browser Testing

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Responsive works
- [ ] Keyboard shortcuts work

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Responsive works
- [ ] Keyboard shortcuts work

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Responsive works
- [ ] Keyboard shortcuts work

### Edge
- [ ] All features work
- [ ] No console errors
- [ ] Responsive works
- [ ] Keyboard shortcuts work

## 📱 Responsive Testing

### Mobile (375px)
- [ ] Layout stacks correctly
- [ ] Sidebar accessible
- [ ] All buttons work
- [ ] Modals display correctly
- [ ] Touch interactions work

### Tablet (768px)
- [ ] Layout works
- [ ] All features accessible
- [ ] Touch interactions work

### Desktop (1024px+)
- [ ] Full layout displays
- [ ] All features work
- [ ] Keyboard shortcuts work

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] Modals trap focus
- [ ] Esc closes modals

### Screen Reader
- [ ] Semantic HTML used
- [ ] ARIA labels present
- [ ] Button labels clear
- [ ] Form labels associated

### Contrast
- [ ] All themes pass validation
- [ ] Text readable on backgrounds
- [ ] Interactive elements visible
- [ ] Error states visible

## 🐛 Error Handling

### Invalid Input
- [ ] Invalid JSON shows error
- [ ] Missing tokens detected
- [ ] Invalid colors handled
- [ ] Error messages clear

### Edge Cases
- [ ] Empty search handled
- [ ] No presets handled
- [ ] Invalid theme ID handled
- [ ] Clipboard failure handled

## 🔄 State Management

### Theme State
- [ ] Theme persists in URL
- [ ] Theme loads from URL
- [ ] Theme switches correctly
- [ ] Active state updates

### Layout State
- [ ] Layout persists in URL
- [ ] Layout loads from URL
- [ ] Layout toggles work
- [ ] Active states update

### Preset State
- [ ] Presets save to localStorage
- [ ] Presets load from localStorage
- [ ] Presets persist across sessions

## 📊 Performance

### Load Time
- [ ] Page loads quickly
- [ ] No blocking resources
- [ ] CSS loads efficiently

### Runtime
- [ ] Theme switching instant
- [ ] Layout changes instant
- [ ] Modals open quickly
- [ ] No lag in interactions

### Memory
- [ ] No memory leaks
- [ ] Event listeners cleaned up
- [ ] Modals removed properly

## 🎯 Integration Testing

### Export Formats
- [ ] React code works
- [ ] Tailwind config works
- [ ] styled-components works
- [ ] Emotion works
- [ ] TypeScript compiles

### Import
- [ ] Imported themes work
- [ ] Imported themes validate
- [ ] Imported themes display

## 📝 Documentation

### Code Comments
- [ ] Functions documented
- [ ] Complex logic explained
- [ ] Examples provided

### User Docs
- [ ] README complete
- [ ] Usage guide clear
- [ ] API reference accurate

## ✅ Final Checklist

- [ ] All features tested
- [ ] All browsers tested
- [ ] All devices tested
- [ ] No console errors
- [ ] No accessibility issues
- [ ] Documentation complete
- [ ] Code commented
- [ ] Ready for production

---

**Testing Date:** _____________  
**Tester:** _____________  
**Notes:** _____________

