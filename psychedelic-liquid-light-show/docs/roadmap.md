# Feature Roadmap

Potential features for the Psychedelic Liquid Light Show, ordered by implementation difficulty.

## Current Progress ✅

**Completed Features**:
- ✅ Brush patterns (single, polkadots, stripes, line, text, stamp)
- ✅ Custom stamp image upload
- ✅ Fade speed control (up to 2 minutes)
- ✅ Mobile gesture controls (pinch/rotate)
- ✅ Oil/Water phase system
- ✅ Dropper widget with 3D visual
- ✅ Dropper & Symmetry (kaleidoscope mode)
- ✅ Preset cycling system
- ✅ Session persistence
- ✅ Gallery save/load
- ✅ Video export
- ✅ Audio reactivity (Web Audio API, FFT analysis)
- ✅ Tilt controls (DeviceOrientation)
- ✅ Advanced shader effects (kaleidoscope, displacement)
- ✅ Preset transitions (smooth interpolation)

---

## 🟢 Easy (1-2 hours each)

### 1. Quick preset switching with hotkeys
- Add keyboard shortcuts (1-9) to instantly switch presets
- Visual feedback when preset changes
- **Difficulty**: ⭐

### 2. Shake to clear
- Use device motion API to detect shake gestures
- Clear canvas on shake
- **Difficulty**: ⭐

### 3. Background patterns
- Add optional grid, dots, or gradient backgrounds
- Simple CSS/Canvas overlay
- **Difficulty**: ⭐

### 4. Color shifting over time
- Apply hue rotation to particles as they age
- Single parameter control
- **Difficulty**: ⭐⭐

### 5. Spray paint mode
- Continuous particle emission with randomization
- Alternative to single splats
- **Difficulty**: ⭐⭐

### 6. Eraser tool
- Click/drag to remove particles in a radius
- Simple particle filtering
- **Difficulty**: ⭐⭐

### 7. Glow/bloom intensity control
- Add post-processing blur pass
- Adjustable intensity slider
- **Difficulty**: ⭐⭐

---

## 🟡 Medium (2-5 hours each)

### 8. Multi-touch support
- Handle multiple pointer events simultaneously
- Track each finger independently
- **Difficulty**: ⭐⭐⭐

### 9. Particle trails with motion blur
- Store particle history
- Render semi-transparent trail segments
- **Difficulty**: ⭐⭐⭐

### 10. Animated brushes
- Add rotation, pulsation to brush patterns
- Time-based transformations
- **Difficulty**: ⭐⭐⭐

### 11. GIF export
- Use gif.js or similar library
- Capture canvas frames and encode
- **Difficulty**: ⭐⭐⭐

### 12. Undo/redo for brush strokes
- Track stroke history separately from config
- Replay strokes on undo
- **Difficulty**: ⭐⭐⭐⭐

### 13. Auto-record mode
- Circular buffer of last 30 seconds
- Save on demand
- **Difficulty**: ⭐⭐⭐⭐

### 14. Texture brushes
- Sample uploaded textures for stamp patterns
- Advanced image processing
- **Difficulty**: ⭐⭐⭐⭐

---

## 🟠 Advanced (5-10 hours each)

### 15. Turbulence/noise field
- Implement Perlin/Simplex noise
- Apply as force field to particles
- **Difficulty**: ⭐⭐⭐⭐

### 16. Gravity wells
- Click to create attraction points
- Calculate forces on all particles
- **Difficulty**: ⭐⭐⭐⭐

### 17. Wind simulation
- Directional force field
- Particle physics integration
- **Difficulty**: ⭐⭐⭐⭐

### 18. Particle attraction/repulsion
- Inter-particle forces
- Spatial hashing for performance
- **Difficulty**: ⭐⭐⭐⭐⭐

### 19. Vortex mode
- Swirling force fields
- Angular velocity calculations
- **Difficulty**: ⭐⭐⭐⭐⭐

### 20. Share to social media
- OAuth integration for multiple platforms
- Image/video upload APIs
- Handle platform-specific requirements
- **Difficulty**: ⭐⭐⭐⭐⭐

---

## 🔴 Expert (10+ hours each)

### 21. Webcam integration
- MediaDevices API for camera access
- Real-time frame processing
- Computer vision for body tracking/masking
- **Difficulty**: ⭐⭐⭐⭐⭐⭐

### 22. Layer system
- Multiple independent fluid simulations
- Layer blending modes
- Complex state management
- **Difficulty**: ⭐⭐⭐⭐⭐⭐

### 23. Timelapse mode
- Variable playback speed
- Frame interpolation for smooth slowmo
- Complex recording state machine
- **Difficulty**: ⭐⭐⭐⭐⭐⭐

---

## Near-Term Priorities

1. Performance mode toggle (reduced particles, disabled effects)
2. Sidebar preset manager (save/load custom presets)
3. Shareable URLs (encode palette + params)
4. Gallery export/import (JSON)
5. Quick preset switching with hotkeys
6. Multi-touch support (essential for mobile)

## Medium-Term Goals

- Controller/MIDI support (map knobs to parameters)
- OBS overlay mode (transparent background)
- PWA installability and offline mode
- Multi-pass composer with effect graph

## Long-Term Vision

- WebGPU backend (true fluid sim or high-performance particles)
- Community preset library (curation, ratings)
- Advanced shader effects library
- Real-time collaboration features

## Tech Debt

- Duplicate source trees (top-level vs src/)
- Missing linting/formatting pipeline
- Expand test suite coverage
- Performance monitoring and profiling tools

## Implementation Notes

### Quick Wins (Do First)
1. Quick preset switching with hotkeys
2. Shake to clear
3. Background patterns
4. Color shifting over time
5. Spray paint mode

### High Impact Features
- Multi-touch support (essential for mobile)
- Particle trails with motion blur (beautiful effect)
- Glow/bloom intensity (easy and looks amazing)
- GIF export (easy sharing)

### Performance Considerations
- Features 18-19 (inter-particle physics) may require WebGL acceleration
- Layer system needs careful memory management
- Webcam integration requires optimization for mobile

### Mobile Priority
- Multi-touch support
- Shake to clear
- Performance optimization for all features

## Notes

- Keep the analog aesthetic central; WebGL should enhance the vibe, not sterilize it
- Maintain zero-setup experience: run in modern browsers, no installs
- Prioritize features that enhance the creative experience
- Balance new features with performance and stability

---

*Last updated: 2025-01-XX*
