# ErrlStory - Developer Notes

## For Human Developers & Agents

This document contains notes, tips, and gotchas for developers working on ErrlStory.

---

## Getting Started

### Setup
```bash
npm install
npm run dev
```

### Tech Stack
- **React 19**: UI shell
- **TypeScript 5.8**: Type safety
- **Vite 6**: Build tool
- **HTML5 Canvas**: Game rendering
- **WebAudio API**: Sound synthesis

### Project Structure
- `App.tsx`: React root component
- `components/GameCanvas.tsx`: Canvas wrapper
- `game/`: Game engine code
- `docs/`: Documentation

---

## Development Workflow

### Making Changes
1. **Read existing code**: Understand patterns before adding features
2. **Follow architecture**: Don't break core systems (Loop, Input, Scenes)
3. **Test incrementally**: Small changes, test often
4. **Check console**: Look for errors or warnings
5. **Test save/load**: Ensure compatibility

### Code Style
- Use TypeScript strict mode
- Follow existing naming conventions
- One class per file (usually)
- Add comments for complex logic
- Keep functions focused and small

---

## Common Tasks

### Adding a New Enemy
1. Create new file in `game/entities/`
2. Extend `Mob` class
3. Implement `update()` and `render()`
4. Add to scene's mob array
5. Add quest tracking if needed

### Adding a New Item
1. Add definition to data file
2. Add icon in `IconRenderer.ts`
3. Add usage logic in `Game.useItem()`
4. Add to merchant if sellable
5. Update HUD if needed

### Adding a New Quest
1. Add definition to `quests.ts`
2. Quest system handles automatically
3. Add dialogue text
4. Test quest flow (accept → progress → complete)

### Adding a New Scene
1. Create scene file in `game/scenes/`
2. Implement `Scene` interface
3. Register in `Game._registerScenes()`
4. Add portal/transition logic
5. Test scene switching

---

## Debugging Tips

### Game Loop Issues
- Check console for frame time spikes
- Verify fixed timestep is 1/60
- Check input buffering is working

### Physics Issues
- Check collision detection (AABB)
- Verify gravity and friction constants
- Test with different platforms

### Rendering Issues
- Check camera transform is applied
- Verify world space vs screen space
- Check render order (background → entities → UI)

### State Issues
- Check `Game.state` in console
- Verify save/load compatibility
- Check state mutations go through Game methods

### Input Issues
- Use `wasPressed()` for one-frame events
- Use `isDown()` for held keys
- Check input is cleared at frame end

---

## Performance Considerations

### Current Limits
- ~100 entities (mobs, drops, projectiles)
- ~500 particles
- 60 FPS target (fixed timestep)

### Optimization Tips
- Remove dead entities from arrays
- Limit particle counts
- Only render visible entities (camera culling)
- Avoid creating objects in update loops

### Profiling
- Use browser DevTools Performance tab
- Check frame times in console
- Monitor memory usage

---

## Save System Notes

### Save Format
- JSON stored in LocalStorage
- Key: `'errlstory_save'`
- Structure matches `GameState` interface

### Save Compatibility
- Always handle missing fields in `loadState()`
- Migrate old save formats if needed
- Test with old saves after changes

### Save Triggers
- Quest completion
- Boss victory
- (Planned: Manual save)

---

## Known Issues

### Current Limitations
- No music system
- No volume controls
- Limited quest variety
- No item rarity system
- No entity pooling
- No camera culling

### Technical Debt
- Hardcoded values (magic numbers)
- No event system (direct method calls)
- Limited error handling
- No automated tests

---

## Testing Checklist

### Before Committing
- [ ] Game runs without errors
- [ ] Input feels responsive
- [ ] Save/load works
- [ ] UI doesn't break game loop
- [ ] No console errors
- [ ] Performance is acceptable

### Feature Testing
- [ ] New feature works as intended
- [ ] Doesn't break existing features
- [ ] Handles edge cases
- [ ] Works with save/load
- [ ] UI updates correctly

---

## Architecture Decisions

### Why Fixed Timestep?
- Consistent gameplay regardless of frame rate
- Predictable physics
- Better for networked games (future)

### Why Scene System?
- Clean separation of game states
- Easy to add new areas
- Clear lifecycle management

### Why No ECS?
- Current scope doesn't need it
- OOP inheritance is sufficient
- Can migrate later if needed

### Why Canvas API?
- Full control over rendering
- No external dependencies
- Lightweight and fast

---

## Future Considerations

### Potential Additions
- Event system for decoupling
- Component system (ECS-lite)
- Asset loading pipeline
- State machine for AI
- More sophisticated collision

### Scalability
- Current architecture supports current scope
- Can refactor if complexity grows
- Entity pooling if needed
- Camera culling for large maps

---

## Resources

### Documentation
- `docs/features.md`: Feature list
- `docs/progression.md`: Milestones
- `docs/architecture.md`: Technical details
- `docs/ai-notes.md`: AI agent instructions
- `docs/future-ideas.md`: Future features

### Code References
- `DEV_NOTES.md`: Original dev notes
- `README.md`: Project overview
- `types.ts`: Type definitions

---

## Tips & Tricks

### Quick Debugging
```typescript
// Log state
console.log(this.game.state);

// Log entity position
console.log(this.player.x, this.player.y);

// Check collision
console.log(this.aabb(a, b));
```

### Visual Debugging
- Draw collision boxes
- Draw camera bounds
- Draw interaction radii
- Draw particle spawn points

### Performance Debugging
```typescript
// Measure frame time
const start = performance.now();
// ... code ...
const end = performance.now();
console.log(`Frame time: ${end - start}ms`);
```

---

## Code Review Checklist

### Before Submitting
- [ ] Code follows style guidelines
- [ ] No console.logs left in
- [ ] No commented-out code
- [ ] Types are correct
- [ ] No `any` types (unless necessary)
- [ ] Comments explain complex logic
- [ ] Tests pass (if applicable)

---

## Contact & Support

### Questions?
- Check documentation first
- Review existing code patterns
- Test in isolation
- Ask for clarification

---

**Last Updated**: Based on Milestone 19 completion (Errl Sprite & Platform Mechanics)

