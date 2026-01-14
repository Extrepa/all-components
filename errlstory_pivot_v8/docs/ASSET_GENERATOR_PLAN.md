# Asset Generator Plan for ErrlStory

## Overview

This document outlines the plan for generating tiles, backgrounds, and environmental assets for ErrlStory. The asset generator will create procedurally generated pixel art assets that match the game's neon/dark aesthetic while maintaining consistency and seamless tiling.

---

## Goals

1. **Generate Seamless Tiles**: Create tile sets that tile seamlessly both horizontally and vertically
2. **Scene-Specific Themes**: Generate assets for each scene (Field, Town, Boss, Dev Room)
3. **Parallax Backgrounds**: Create multi-layer backgrounds for depth
4. **Consistent Style**: Maintain the neon/dark pixel art aesthetic
5. **Export in Game-Ready Format**: PNG files organized for easy integration

---

## Architecture

### Technology Stack

**Primary Generator: Python with Pillow (PIL)**
- `Pillow` for image generation and manipulation
- `numpy` for pixel array operations
- `noise` library (Perlin noise) for organic patterns
- Standard library for file I/O and organization

**Why Python?**
- Excellent image manipulation libraries
- Easy procedural generation algorithms
- Scriptable and maintainable
- Cross-platform compatibility

### Output Structure

```
public/assets/
├── tiles/
│   ├── field/
│   │   ├── ground_top.png
│   │   ├── ground_middle.png
│   │   ├── ground_corner_left.png
│   │   ├── ground_corner_right.png
│   │   ├── ground_fill.png
│   │   ├── platform_top.png
│   │   ├── platform_left.png
│   │   ├── platform_right.png
│   │   └── wall_*.png
│   ├── town/
│   │   └── ... (same structure)
│   ├── boss/
│   │   └── ... (same structure)
│   └── devroom/
│       └── ... (same structure)
├── backgrounds/
│   ├── field/
│   │   ├── sky.png
│   │   ├── parallax_layer1_far.png
│   │   ├── parallax_layer2_mid.png
│   │   └── parallax_layer3_near.png
│   ├── town/
│   │   ├── sky.png
│   │   ├── parallax_layer1_far.png
│   │   └── parallax_layer2_near.png
│   ├── boss/
│   │   └── arena_background.png
│   └── devroom/
│       └── sky.png
└── decorations/
    ├── clouds/
    │   ├── cloud_small.png
    │   ├── cloud_medium.png
    │   └── cloud_large.png
    └── particles/
        └── star.png
```

---

## Generator Implementation Plan

### Phase 1: Core Tile Generator

#### 1.1 Base Tile Class

```python
class TileGenerator:
    """Base class for tile generation"""
    
    def __init__(self, size=32, theme="field"):
        self.size = size  # 32x32 standard
        self.theme = theme
        self.colors = self.get_theme_colors()
    
    def get_theme_colors(self):
        """Return color palette for theme"""
        themes = {
            "field": {
                "primary": (15, 54, 71),      # #0f3647
                "secondary": (26, 92, 122),   # #1a5c7a
                "accent": (52, 225, 255),     # #34e1ff
                "dark": (3, 20, 29),          # #03141d
                "light": (97, 240, 255)       # #61f0ff
            },
            "town": {
                "primary": (26, 31, 46),      # #1a1f2e
                "secondary": (72, 240, 255),  # #48f0ff
                "accent": (112, 255, 255),    # #70ffff
                "dark": (7, 27, 37),          # #071b25
                "light": (16, 42, 58)         # #102a3a
            },
            "boss": {
                "primary": (31, 10, 41),      # #1f0a29
                "secondary": (94, 42, 117),   # #5e2a75
                "accent": (217, 72, 255),     # #d948ff
                "dark": (13, 2, 18),          # #0d0212
                "light": (42, 14, 54)         # #2a0e36
            },
            "devroom": {
                "primary": (26, 26, 42),      # #1a1a2a
                "secondary": (52, 225, 255),  # #34e1ff
                "accent": (255, 0, 255),      # #ff00ff
                "dark": (10, 10, 26),         # #0a0a1a
                "light": (42, 42, 62)         # #2a2a3e
            }
        }
        return themes.get(theme, themes["field"])
    
    def generate_seamless_pattern(self, pattern_func):
        """Generate a tile that tiles seamlessly"""
        # Implementation uses wrap-around sampling
        pass
```

#### 1.2 Ground Tile Generation

**Ground Top Tile (32x32)**
- **Top 8 pixels**: Surface detail (grass blades, cobblestones, cracks)
- **Middle 16 pixels**: Main fill with texture
- **Bottom 8 pixels**: Transition to middle tiles (subtle shading)
- **Technique**: 
  - Perlin noise for organic patterns
  - Pixel dithering for smooth gradients
  - Seamless wrapping for horizontal repeat

**Ground Middle Tile (32x32)**
- **Full tile**: Vertical fill pattern
- **Seamless on all sides**: Can be stacked vertically
- **Technique**: Vertical gradient with texture noise

**Ground Corner/Edge Tiles (32x32)**
- **Corner Left/Right**: Include side detail (grass overhang, edge highlight)
- **Technique**: Mirror and flip base pattern for consistency

**Ground Fill Tile (32x32)**
- **Full tile**: Seamless pattern for wide platforms
- **Technique**: Repeating pattern that tiles in both directions

#### 1.3 Platform Tile Generation

**Platform Top (32x16 or 32x24)**
- **Thin platform style**: Top surface only
- **Top edge**: Highlighted edge for depth
- **Bottom shadow**: Subtle shadow line
- **Seamless horizontal**: Can extend infinitely wide

**Platform Sides (8x16 or 8x24)**
- **Left/Right caps**: End pieces for platforms
- **Vertical shading**: 3D depth effect

**Platform Corners (8x8 or 16x16)**
- **Decorative elements**: Optional corner pieces
- **Used at platform intersections**

#### 1.4 Wall Tile Generation

**Wall Tiles (32x32)**
- **Left/Right edges**: Side caps with detail
- **Middle**: Seamless repeating pattern
- **Top/Bottom**: Cap pieces for vertical walls
- **Technique**: Brick/stone pattern with consistent styling

---

### Phase 2: Background Generator

#### 2.1 Sky Gradient Generator

**Single-Layer Sky (1920x1080)**
- **Gradient**: Top to bottom color transition
- **Seamless horizontal**: Repeats without seams
- **Optional noise**: Subtle texture overlay
- **Format**: Full-color PNG

#### 2.2 Parallax Layer Generator

**Layer 1 - Far Mountains (1000x600)**
- **Content**: Mountain silhouettes (very dark, low contrast)
- **Seamless**: Horizontal wrap-around
- **Height**: ~60% of tile height (bottom 40% transparent/sky)
- **Technique**: 
  - Perlin noise for mountain shapes
  - Multiple overlapping layers for depth
  - Anti-aliasing for smooth edges

**Layer 2 - Mid Mountains (1200x600)**
- **Content**: More detailed mountains
- **Higher contrast**: Slightly lighter than Layer 1
- **More detail**: Individual peaks visible

**Layer 3 - Near Hills (1400x600)**
- **Content**: Close terrain features
- **Highest detail**: Individual rocks, trees, features
- **Most contrast**: Closest to foreground

**Town Buildings**
- **Layer 1 - Far Buildings (2000x400)**
  - Silhouettes only
  - Simple rectangular shapes
  - Very dark, minimal detail
  
- **Layer 2 - Near Buildings (2000x500)**
  - Window details
  - Roof structures
  - More defined shapes

#### 2.3 Arena Background (Boss Scene)

**Static Background (1920x1080)**
- **Full screen**: Single image
- **Content**: Arena architecture (columns, arches, background elements)
- **No parallax**: Stays fixed with camera
- **Technique**: Detailed background illustration

---

### Phase 3: Decorative Elements

#### 3.1 Cloud Generator

**Cloud Variants**
- **Small (64x32)**: Subtle, atmospheric
- **Medium (96x48)**: Visible but not prominent
- **Large (128x64)**: Feature clouds
- **Technique**: Soft, fluffy shapes with transparency
- **Variations**: Multiple random seeds for variety

#### 3.2 Particle/Star Generator

**Stars (2x2 to 4x4)**
- **Small decorative dots**: Used in parallax layers
- **Variations**: Different sizes, subtle glow
- **Technique**: Simple circles with optional glow effect

---

## Generation Algorithms

### 1. Seamless Pattern Generation

```python
def generate_seamless_tile(size, pattern_func):
    """
    Generate a tile that tiles seamlessly by:
    1. Generating base pattern larger than needed
    2. Sampling with wrap-around
    3. Blending edges for smooth transition
    """
    # Generate pattern on 2x2 grid
    tile = Image.new('RGBA', (size * 2, size * 2))
    pattern_func(tile)
    
    # Sample center section with wrap-around
    result = Image.new('RGBA', (size, size))
    # ... sampling logic ...
    
    return result
```

### 2. Pixel Art Dithering

```python
def dither_gradient(img, colors, method='ordered'):
    """
    Apply ordered dithering to create smooth gradients
    in pixel art style
    """
    # Bayer matrix for ordered dithering
    # Apply to create pixel-art friendly gradients
    pass
```

### 3. Perlin Noise for Texture

```python
def generate_texture(size, scale=0.1, octaves=4):
    """
    Generate organic texture using Perlin noise
    - scale: Controls pattern size
    - octaves: Level of detail
    """
    noise_map = np.zeros((size, size))
    # ... Perlin noise generation ...
    return noise_map
```

### 4. Seamless Mountain Generation

```python
def generate_mountains(width, height, peaks=5):
    """
    Generate seamless mountain range
    - peaks: Number of major peaks
    - Returns: Alpha mask for mountains
    """
    # Use sine waves + Perlin noise
    # Ensure left and right edges match
    # Create silhouette shape
    pass
```

---

## Generator Script Structure

### Main Script: `generate_assets.py`

```python
#!/usr/bin/env python3
"""
ErrlStory Asset Generator
Generates tiles, backgrounds, and environmental assets
"""

import argparse
from pathlib import Path
from generators import (
    TileGenerator,
    BackgroundGenerator,
    DecorationGenerator
)

def main():
    parser = argparse.ArgumentParser(description='Generate ErrlStory assets')
    parser.add_argument('--theme', choices=['all', 'field', 'town', 'boss', 'devroom'],
                       default='all', help='Theme to generate')
    parser.add_argument('--type', choices=['all', 'tiles', 'backgrounds', 'decorations'],
                       default='all', help='Asset type to generate')
    parser.add_argument('--output', type=str, default='public/assets',
                       help='Output directory')
    
    args = parser.parse_args()
    
    themes = ['field', 'town', 'boss', 'devroom'] if args.theme == 'all' else [args.theme]
    
    for theme in themes:
        print(f"Generating {theme} assets...")
        
        if args.type in ['all', 'tiles']:
            tile_gen = TileGenerator(theme=theme)
            tile_gen.generate_all_tiles(Path(args.output) / 'tiles' / theme)
        
        if args.type in ['all', 'backgrounds']:
            bg_gen = BackgroundGenerator(theme=theme)
            bg_gen.generate_all_backgrounds(Path(args.output) / 'backgrounds' / theme)
        
        if args.type in ['all', 'decorations']:
            deco_gen = DecorationGenerator()
            deco_gen.generate_all_decorations(Path(args.output) / 'decorations')

if __name__ == '__main__':
    main()
```

### Module Structure

```
tools/asset_generator/
├── __init__.py
├── generate_assets.py          # Main script
├── generators/
│   ├── __init__.py
│   ├── base.py                 # Base generator class
│   ├── tile_generator.py       # Tile generation
│   ├── background_generator.py # Background generation
│   └── decoration_generator.py # Decorative elements
├── utils/
│   ├── __init__.py
│   ├── noise.py                # Perlin noise utilities
│   ├── dither.py               # Dithering algorithms
│   ├── colors.py               # Color palette management
│   └── image_utils.py          # Image manipulation helpers
└── requirements.txt
```

---

## Integration with Game

### Asset Loading System

**Update `AssetLoader.ts`:**

```typescript
export class AssetLoader {
  // ... existing code ...
  
  /**
   * Load tile set for a scene
   */
  public static async loadTileset(theme: string): Promise<Tileset> {
    const basePath = `/assets/tiles/${theme}/`;
    const tileset = {
      groundTop: await this.loadImage(`${basePath}ground_top.png`),
      groundMiddle: await this.loadImage(`${basePath}ground_middle.png`),
      groundCornerLeft: await this.loadImage(`${basePath}ground_corner_left.png`),
      groundCornerRight: await this.loadImage(`${basePath}ground_corner_right.png`),
      groundFill: await this.loadImage(`${basePath}ground_fill.png`),
      platformTop: await this.loadImage(`${basePath}platform_top.png`),
      platformLeft: await this.loadImage(`${basePath}platform_left.png`),
      platformRight: await this.loadImage(`${basePath}platform_right.png`),
      // ... etc
    };
    return tileset;
  }
  
  /**
   * Load background layers for a scene
   */
  public static async loadBackgrounds(theme: string): Promise<BackgroundLayers> {
    const basePath = `/assets/backgrounds/${theme}/`;
    // ... load parallax layers
  }
}
```

### Tile Rendering System

**New `TileRenderer.ts`:**

```typescript
export class TileRenderer {
  private tileset: Tileset;
  private ctx: CanvasRenderingContext2D;
  
  renderGround(platform: Rect, camera: Camera): void {
    // Determine which tiles to use based on platform size
    // Render ground top, fill, corners
  }
  
  renderPlatform(platform: Rect, camera: Camera): void {
    // Render platform with appropriate tiles
    // Handle left cap, right cap, top surface
  }
}
```

### Scene Updates

**Update scenes to use tile rendering:**

```typescript
// In FieldScene.ts
private tileRenderer: TileRenderer;
private backgrounds: BackgroundLayers;

async onEnter(): Promise<void> {
  const tileset = await AssetLoader.loadTileset('field');
  this.tileRenderer = new TileRenderer(this.game.ctx, tileset);
  this.backgrounds = await AssetLoader.loadBackgrounds('field');
}

render(ctx: CanvasRenderingContext2D): void {
  // Render parallax backgrounds
  this.backgrounds.render(ctx, this.game.camera);
  
  // Render tiles
  for (const platform of this.platforms) {
    if (platform.width > 500) {
      this.tileRenderer.renderGround(platform, this.game.camera);
    } else {
      this.tileRenderer.renderPlatform(platform, this.game.camera);
    }
  }
  
  // ... rest of rendering
}
```

---

## Workflow

### 1. Initial Generation

```bash
# Generate all assets
python tools/asset_generator/generate_assets.py --theme all --type all

# Generate only field tiles
python tools/asset_generator/generate_assets.py --theme field --type tiles

# Generate only backgrounds
python tools/asset_generator/generate_assets.py --theme all --type backgrounds
```

### 2. Iteration & Refinement

- Run generator with different parameters
- Manually edit generated assets if needed (GIMP, Aseprite)
- Re-generate and compare

### 3. Integration

- Assets automatically placed in `public/assets/`
- Game code updated to load and use assets
- Test rendering in game scenes

### 4. Version Control

- Generated assets should be committed to repo
- Generator scripts should be versioned
- Keep original parameters/seeds for regeneration

---

## Parameter Configuration

### Theme Configuration Files

**`tools/asset_generator/configs/field.json`:**

```json
{
  "theme": "field",
  "colors": {
    "primary": "#0f3647",
    "secondary": "#1a5c7a",
    "accent": "#34e1ff"
  },
  "tiles": {
    "size": 32,
    "texture_scale": 0.15,
    "noise_octaves": 3
  },
  "backgrounds": {
    "parallax_layers": 3,
    "mountain_peaks": 5,
    "color_transition": "smooth"
  }
}
```

---

## Quality Assurance

### Seamless Tiling Tests

1. **Visual Test**: Render 3x3 grid of tiles, check for seams
2. **Automated Test**: Compare edge pixels programmatically
3. **Game Test**: Render in actual game scenes

### Color Consistency

1. **Palette Validation**: Ensure colors match theme
2. **Contrast Check**: Verify readability against backgrounds
3. **Visual Review**: Playtest in game for aesthetic quality

### Performance

1. **File Size**: Optimize PNG compression
2. **Loading Time**: Test asset loading performance
3. **Rendering**: Profile tile rendering performance

---

## Future Enhancements

### Phase 4: Animation Support
- Animated tile frames (water, lava, etc.)
- Sprite sheets for tile animations

### Phase 5: Procedural Variations
- Random seed system for variations
- Runtime procedural generation (optional)

### Phase 6: Asset Editor Integration
- GUI tool for tweaking parameters
- Live preview of tile generation
- Export presets

---

## Dependencies

**Python Requirements (`requirements.txt`):**

```
Pillow>=10.0.0
numpy>=1.24.0
noise>=1.2.2
```

**Installation:**

```bash
cd tools/asset_generator
pip install -r requirements.txt
```

---

## Timeline

1. **Week 1**: Core tile generator (seamless patterns, ground tiles)
2. **Week 2**: Platform and wall tiles, theme variations
3. **Week 3**: Background generators (sky, parallax layers)
4. **Week 4**: Decorative elements, integration with game
5. **Week 5**: Testing, refinement, optimization

---

## Notes

- All generated assets should be pixel-perfect (no anti-aliasing unless specified)
- Maintain consistent color palettes per theme
- Test seamless tiling extensively
- Keep generator scripts well-documented for future modifications
- Consider creating a visual preview tool for generated assets

---

*Last Updated: [Current Date]*
*Next Steps: Begin implementation of core TileGenerator class*
