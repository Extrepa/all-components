# TV Nightclub Implementation

## Overview
The nightclub is now rendered **inside the TV screen** using a render-to-texture system. The player views the TV from outside, and the entire club experience happens inside the TV.

## Architecture

### Two-Scene System
1. **TV Room Scene** (`tvRoomScene`)
   - Minimal room containing just the TV
   - Simple lighting (ambient + point light on TV)
   - Main camera views this scene
   - Background: Dark gray (`0x1a1a1a`)

2. **Club Scene** (`clubScene`)
   - Full nightclub with all features
   - Enhanced lighting and atmosphere
   - Club camera follows avatar
   - Rendered to TV screen texture
   - Background: Very dark (`0x0a0a0a`)

### Rendering Pipeline
1. **Club Scene → TV Texture**
   - Club scene renders to `WebGLRenderTarget` (1920x1080)
   - Post-processing applied to club scene
   - Texture applied to TV screen mesh

2. **TV Room Scene → Main View**
   - TV room scene renders to main canvas
   - Shows TV with club scene displayed on screen
   - No post-processing (simple scene)

## Implementation Details

### Files Created
- `src/systems/TVRenderSystem.js` - Render-to-texture system for TV screen

### Files Modified
- `src/interactions/TVProp.js` - Creates TV screen mesh with render texture
- `src/core/GameInitializer.js` - Two-scene architecture setup
- `src/core/GameLoop.js` - Renders club to TV, then TV room to main view
- `src/core/initializers/SetupInitializer.js` - Uses club scene/camera for updates
- `src/scene/LightingSetup.js` - Enhanced lighting (ambient 0.8, spot 2.5, point lights 2.5)
- `src/ui/BasePanel.js` - Added `box-sizing: border-box` and `overflow: hidden` to prevent stretching
- `src/style.css` - Added `overflow: hidden` to HUD

## Lighting Enhancements

### Club Scene Lighting
- **Ambient Light**: 0.8 intensity (bright atmosphere)
- **Spot Light**: 2.5 intensity, wider angle, longer range
- **Point Lights**: 2.5 intensity, 20 unit range (ceiling lights)
- **LED Strips**: Enhanced emissive intensity

### TV Room Lighting
- **Ambient Light**: 0.3 intensity (minimal, just to see TV)
- **Point Light**: 1.5 intensity on TV itself

## UI Stretching Fixes

### Changes Made
1. **BasePanel**: Added `box-sizing: border-box` and `overflow: hidden`
2. **HUD Container**: Added `overflow: hidden` to prevent stretching
3. **UIScalingSystem**: Already handles scaling properly

### Why It Works
- `box-sizing: border-box` ensures padding doesn't expand element size
- `overflow: hidden` prevents content from stretching containers
- Proper scaling system prevents UI elements from distorting

## Camera System

### Club Camera
- Follows avatar in club scene
- Controlled by player input
- Renders to TV screen texture
- Aspect ratio matches TV screen (1920:1080)

### TV Room Camera
- Static view of TV
- Not controlled by player
- Views the TV from outside

## Update System

### UpdateManager
- Updates club scene (where avatar is)
- Uses club camera for camera controller
- All systems operate on club scene

### GameLoop
1. Update all systems (club scene)
2. Render club scene to TV texture
3. Render TV room scene to main view

## Testing Checklist

- [ ] TV appears in scene
- [ ] Club scene renders inside TV screen
- [ ] Avatar spawns in club scene
- [ ] Camera controls work (club camera)
- [ ] Lighting is bright and atmospheric
- [ ] UI doesn't stretch or distort
- [ ] Post-processing effects work on club scene
- [ ] Performance is acceptable (render-to-texture)

## Known Considerations

- **Performance**: Rendering two scenes (club to texture, then TV room) may impact FPS
- **Resolution**: TV screen is 1920x1080 - may need adjustment for performance
- **Camera Control**: Player controls club camera, not TV room camera
- **Aspect Ratio**: Club camera matches TV screen aspect ratio

## Future Enhancements

- [ ] Add TV room environment (walls, floor, etc.)
- [ ] Add multiple TVs showing different views
- [ ] Add TV screen effects (scanlines, glow, etc.)
- [ ] Optimize render target resolution based on performance
- [ ] Add TV room interactions (change channel, adjust settings, etc.)

