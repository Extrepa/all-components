# Asset Size Requirements

This document lists all asset dimensions needed for the ErrlStory game. All sizes are in pixels unless otherwise noted.

---

## 🎮 Entity Sprites

### Player Character
- **Errl Sprite**: `32x32` pixels
  - Recommended: `32x32` or `64x64` (will be scaled down)
  - Format: PNG with transparency
  - Current scale factor: `1.3x` (rendered at ~41.6x41.6 within 32x32 bounds)
  - Location: `/public/Errl.png` or `/public/errl.png`

### Enemies
- **Slime**: `32x24` pixels
- **Royal Slime**: `80x60` pixels

### NPCs
- **NPC Base**: `32x32` pixels
- **Merchant**: `32x32` pixels (extends NPC)

### Interactive Entities
- **Portal**: `60x90` pixels
- **Bounce Pad**: `64x16` pixels (wide, thin platform)
- **Projectile**: `20x20` pixels
- **Drop (Goo/Potion)**: `16x16` pixels

---

## 🎨 UI Icons & Graphics

### Item Icons
- **Base Grid**: `32x32` pixels
  - All item icons are designed on a 32x32 grid
  - Rendered at various sizes (scaled):
    - Inventory: Scaled to fit row height
    - Shop: Scaled to fit row height
    - Quick Slots: `24x24` pixels (scaled from 32x32)
  - Items include:
    - Potions (Red/Blue Flask)
    - Weapons (Iron Sword)
    - Armor (Leather Armor)
    - Cosmetics (Crown, Viking Hat, Cowboy Hat, etc.)

### UI Icons
- **Base Grid**: `32x32` pixels
  - Types: `bag`, `scroll`, `gear`
  - Rendered at various sizes (scaled):
    - Menu Buttons: `40x40` pixels (scaled from 32x32)
    - Other contexts: Variable scaling

### Avatar Badge
- **Errl Badge**: `24x24` pixels (scaled from 32x32 sprite)
  - Uses same Errl sprite as player character
  - Location: Top-left of MainHUD

---

## 📱 UI Panels & Windows

### Main HUD
- **Main Bar Height**: `60` pixels
- **EXP Bar Height**: `4` pixels (thin bar at bottom)
- **Menu Buttons**: `40x40` pixels each
  - Inventory button
  - Quest button
  - Menu/Settings button
- **Quick Slot Buttons**: `32x24` pixels each (4 slots)
- **Skill Buttons**: `32x24` pixels each (4 buttons: Z, X, Shift, Space)
- **Button Row Gap**: `2` pixels between rows
- **Total HUD Height**: `55` pixels from bottom (24 + 2 + 24 + 5)

### Inventory UI
- **Window Size**: `600x400` pixels
- **Header Height**: `40` pixels
- **Left Panel (Item List)**: `280x320` pixels
- **Right Panel (Item Details)**: `280x320` pixels
- **Item Row Height**: `35` pixels
- **Items Per Page**: `9` items visible

### Quest Log UI
- **Window Size**: `700x450` pixels
- **Header Height**: `40` pixels
- **Quest Row Height**: Variable (text-based)

### Quest Tracker UI
- **Base Panel Width**: `110` pixels
- **Dynamic Width**: Expands up to `300` pixels (for long text)
- **Header Height**: `25` pixels
- **Row Height**: `38` pixels (optimized for text)
- **Position**: Top-right, `100px` from top, `20px` from right edge
- **Max Regular Quests**: `3` visible
- **Max Daily Quests**: `1` visible

### Shop UI
- **Window Size**: `600x400` pixels
- **Header Height**: `40` pixels
- **Item Row Height**: `35` pixels
- **Items Per Page**: `8` items visible

### Dialogue Manager
- **Box Height**: `150` pixels
- **Box Width**: Variable (screen width - 200px margin)
- **Box Position**: `20px` from bottom
- **Line Height**: `28` pixels
- **Padding**: `20px` horizontal, `15px` vertical

### Minimap
- **Max Width**: `200` pixels
- **Max Height**: `100` pixels
- **Header Height**: `24` pixels
- **Position**: Top-left, `20px` from left, `20px` from top
- **Legend**:
  - Font Size: `7px`
  - Dot Size: `2px` radius
  - Single row layout

### Touch Controls (Mobile)
- **D-Pad Area**: `200x200` pixels
- **Button Size**: `60x60` pixels each
  - Left button
  - Right button
  - Jump button
  - Attack button
  - Magic button
- **Button Gap**: `10` pixels
- **Position**: 
  - D-Pad: Left side, `20px` margin from left, `20px` margin from bottom
  - Action Buttons: Right side, `20px` margin from right, `20px` margin from bottom

### Dev Menu
- **Panel Size**: `900x500` pixels
- **Button Size**: `50x50` pixels (grid buttons)
- **Button Gap**: `8` pixels
- **Grid Layout**: `8 columns x 5 rows` (40 buttons total)
- **Grid Start Position**: `20px` from left, `80px` from top
- **Control Panel**: Right side, `600px` from left, `80px` from top
- **Slider Width**: `200` pixels

---

## 🎯 Visual Effects

### Particles
- **Spark Size**: `1-8` pixels (random)
- **Dust Size**: `2-4` pixels (random)
- **Ghost Trail Size**: `32` pixels (player size)
- **Hitstop Duration**: 
  - Normal hit: `1` frame
  - Critical hit: `3` frames

### Floating Text
- **Normal Damage**: `12px` font
- **Critical Damage**: `16px` font (yellow, with bounce animation)

### Attack Visuals
- **Melee Attack Reach**: `25` pixels
- **Melee Attack Height**: `40` pixels
- **Charge Attack Glow**: `20-60` pixels radius (scales with charge level)

---

## 🗺️ World/Scene Elements

### Ground Tiles & Floor
- **Base Tile Size**: `32x32` pixels (standard tile grid)
- **Ground Tile Variants** (per scene theme):
  - **Field Scene**:
    - Ground Top: `32x32` (top surface with grass/dirt texture)
    - Ground Middle: `32x32` (vertical fill sections)
    - Ground Corner Left: `32x32` (left edge)
    - Ground Corner Right: `32x32` (right edge)
    - Ground Fill: `32x32` (middle sections for wide platforms)
  - **Town Scene**:
    - Ground Top: `32x32` (paved/cobblestone surface)
    - Ground Middle: `32x32` (vertical fill sections)
    - Ground Corner Left: `32x32` (left edge)
    - Ground Corner Right: `32x32` (right edge)
    - Ground Fill: `32x32` (middle sections)
  - **Boss Scene**:
    - Ground Top: `32x32` (arena floor/dark stone)
    - Ground Middle: `32x32` (vertical fill sections)
    - Ground Corner Left: `32x32` (left edge)
    - Ground Corner Right: `32x32` (right edge)
    - Ground Fill: `32x32` (middle sections)
  - **Dev Room**:
    - Ground Top: `32x32` (tech/platform surface)
    - Ground Middle: `32x32` (vertical fill sections)
    - Ground Corner Left: `32x32` (left edge)
    - Ground Corner Right: `32x32` (right edge)
    - Ground Fill: `32x32` (middle sections)

### Platform Tiles
- **Standard Platform Height**: `16-32` pixels (typically `20-24` pixels)
- **Platform Tile Set** (per scene theme):
  - **Top Surface**: `32x16` to `32x32` (platform top, seamless when repeated)
  - **Side Left**: `8x16` to `8x32` (left edge/cap)
  - **Side Right**: `8x16` to `8x32` (right edge/cap)
  - **Top Left Corner**: `8x8` to `16x16` (decorative corner piece)
  - **Top Right Corner**: `8x8` to `16x16` (decorative corner piece)
  - **Platform Fill**: `32x16` to `32x32` (middle sections, seamless)

### Wall Tiles
- **Wall Tile Size**: `32x32` pixels
- **Wall Variants**:
  - **Wall Left Edge**: `32x32` (left side of wall)
  - **Wall Right Edge**: `32x32` (right side of wall)
  - **Wall Middle**: `32x32` (repeating middle section)
  - **Wall Top**: `32x32` (top cap of wall)
  - **Wall Bottom**: `32x32` (bottom/base of wall)

### Background Layers

#### Sky & Atmosphere
- **Sky Gradient**: Full screen height, seamless horizontal repeat
  - Field Scene: `1920x1080` (dark blue-green gradient, `#03141d` to `#061f2b`)
  - Town Scene: `1920x1080` (blue gradient, `#071b25` to `#102a3a`)
  - Boss Scene: `1920x1080` (purple/red gradient, `#2a0e36` to `#0d0212`)
  - Dev Room: `1920x1080` (dark tech background, `#0a0a1a`)

#### Parallax Background Layers (Field Scene)
- **Layer 1 - Far Mountains** (Parallax: 0.2x):
  - **Sprite**: `1000x600` pixels (seamless horizontal repeat)
  - **Content**: Distant mountain silhouettes
  - **Colors**: Darker than Layer 2, very subtle
  
- **Layer 2 - Mid Mountains** (Parallax: 0.4x):
  - **Sprite**: `1200x600` pixels (seamless horizontal repeat)
  - **Content**: Medium-distance mountains with more detail
  - **Colors**: Slightly lighter than Layer 1
  
- **Layer 3 - Near Hills** (Parallax: 0.6x):
  - **Sprite**: `1400x600` pixels (seamless horizontal repeat)
  - **Content**: Close hills/terrain features
  - **Colors**: More detailed, closer to foreground

#### Parallax Background Layers (Town Scene)
- **Layer 1 - Buildings Far** (Parallax: 0.15x):
  - **Sprite**: `2000x400` pixels (seamless horizontal repeat)
  - **Content**: Distant building silhouettes
  
- **Layer 2 - Buildings Near** (Parallax: 0.3x):
  - **Sprite**: `2000x500` pixels (seamless horizontal repeat)
  - **Content**: Closer building details

#### Parallax Background Layers (Boss Scene)
- **Arena Background** (Static):
  - **Sprite**: `1920x1080` pixels (full screen)
  - **Content**: Arena environment (columns, arches, etc.)
  - **Parallax**: None (static background)

#### Decorative Elements
- **Clouds**: `64x32` to `128x64` pixels (various sizes, transparent PNG)
  - Used in parallax layers
  - Multiple variations for variety
  
- **Stars/Particles**: `2x2` to `4x4` pixels (small decorative dots)
  - Used in night/space scenes
  
- **Decorative Objects**: Variable sizes (scene-specific)
  - Plants: `16x16` to `32x32`
  - Rocks: `16x16` to `24x24`
  - Props: Scene-specific dimensions

### Platforms
- **Ground Platforms**: Width > `500` pixels (treated as ground)
- **Floating Platforms**: Variable width (typically `100-400` pixels)
- **Platform Height**: Variable (typically `16-32` pixels)
- **Current Implementation**: Solid color rectangles (to be replaced with tiles)

### Camera
- **Viewport**: Matches game canvas size (typically `1920x1080` or similar)
- **Map Dimensions**: Variable per scene
  - **Town**: `2000x600` pixels
  - **Field**: `2400x600` pixels
  - **Boss Arena**: `960x540` pixels
  - **Dev Room**: `2000x600` pixels

---

## 📐 Font Sizes

### Main HUD
- **HP/MP Text**: `14px` bold
- **Level Text**: `12px` bold
- **Button Labels**: `10px` bold (above buttons)
- **Key Labels**: `10px` bold (on skill buttons)

### Inventory UI
- **Title**: `20px` bold
- **Item Name**: `14px`
- **Item Description**: `11px`
- **Stats Text**: `12px`

### Quest Log UI
- **Title**: `24px` bold
- **Quest Name**: `16px` bold
- **Quest Description**: `12px`

### Quest Tracker UI
- **Header**: `12px` bold
- **Quest Name**: `9px` bold
- **Quest Description**: `9px`
- **Progress Text**: `8px`
- **Daily Label**: `8px` bold
- **Minimize Indicator**: `10px`

### Shop UI
- **Title**: `20px` bold
- **Money Display**: `16px` bold
- **Item Name**: `14px`
- **Item Description**: `11px`
- **Price**: `14px` bold

### Dialogue Manager
- **Speaker Name**: `14px` bold
- **Dialogue Text**: `14px`
- **Line Height**: `28px`

### Minimap
- **Header**: `12px` bold
- **Legend Text**: `7px`

### Dev Menu
- **Section Headers**: `14px` bold
- **Button Labels**: `10px`

---

## 🎨 Color & Style Notes

### Transparency
- All sprites should have transparent backgrounds (PNG with alpha channel)
- UI overlays use rgba for semi-transparent backgrounds

### Pixel Art Style
- Recommended: Clean edges, no anti-aliasing
- Character sprites: Centered in frame
- Icons: Designed on 32x32 grid for consistency

### Scaling
- Most assets are designed at base size and scaled up/down as needed
- Maintain aspect ratios when scaling
- Use nearest-neighbor or pixel-perfect scaling for pixel art

---

## 📝 Notes

- **Sprite Sheets**: If using sprite sheets, maintain consistent frame sizes
  - Player animation frames: `32x32` each
  - Frame count: Variable (idle, walk, jump, etc.)
- **Icon Consistency**: All icons use a `32x32` base grid for easy scaling
- **UI Responsiveness**: Some UI elements (Quest Tracker) have dynamic sizing based on content
- **Mobile Optimization**: Touch controls are larger (`60x60`) for better mobile interaction

---

## 🔄 Asset Loading

- **Player Sprite**: `/public/Errl.png` or `/public/errl.png`
- **All Other Assets**: Currently procedurally generated or use IconRenderer
- **Future**: Consider adding sprite sheets for animations

---

*Last Updated: Based on current codebase state*
*For questions or updates, refer to the main codebase files in `game/entities/` and `game/ui/`*

