# Errl Avatar Asset Catalog

This directory contains all SVG assets for the Errl avatar character system.

**Note**: These are 2D design assets, primarily used for:
- **Design Reference**: Color schemes, pose inspiration, and visual design
- **UI Elements**: Character selection screens, icons, thumbnails
- **Documentation**: Visual reference for developers and designers

The actual 3D avatar rendering uses Three.js geometry and materials. Color values are extracted from these SVGs and applied to 3D materials.

```mermaid
flowchart TD
  Colors[colors/ (25 variants)] --> Files[errl_01...25.svg]
  Poses[viscous/ (20)] --> Visc2[viscous-v2/ (20)]
  Poses --> Dynamic[dynamic/ (30)]
  Poses --> Grid[grid-poses/ (50)]
  Poses --> GridRef[grid-ref/ (50)]
  Poses --> Random[random-dynamic/ (50)]
```

## Asset Collections

### 🎨 Colors Collection (`colors/`)
- **Count**: 25 color variants
- **Format**: Complete SVG files with different color schemes
- **Structure**: Each file contains body, face, eyes, mouth, and outline elements
- **Usage**: 
  - **3D Integration**: Color hex codes extracted and applied to Three.js materials (see `AvatarColorVariants.js`)
  - **Design Reference**: Visual reference for color schemes
  - **UI**: Character selection thumbnails

**Files:**
- `errl_01_classic_purple.svg` through `errl_25_cobalt_blue.svg`
- See `colors/README.md` for full color reference

### 💧 Viscous Body Poses (`viscous/`)
- **Count**: 20 poses
- **Format**: Individual transparent SVG files
- **Description**: Liquid/viscous body deformation poses
- **Naming**: `visc-body-XX-description.svg`
- **Usage**: Design reference for deformation ideas, potential UI elements

### 💧 Viscous Body v2 (`viscous-v2/`)
- **Count**: 20 poses  
- **Format**: Individual transparent SVG files
- **Description**: Alternative viscous body poses with softer deformations
- **Naming**: `visc2-body-XX-description.svg`
- **Usage**: Design reference for alternative deformation styles

### ⚡ Dynamic Poses (`dynamic/`)
- **Count**: 30 poses
- **Format**: Individual transparent SVG files
- **Description**: Dynamic action poses
- **Naming**: `errl-XX.svg`
- **Usage**: Animation inspiration, UI icons, design reference

### 📐 Grid Poses (`grid-poses/`)
- **Count**: 50 poses
- **Format**: Individual transparent SVG files
- **Description**: Structured grid-based pose variations
- **Naming**: `errl-XX.svg`
- **Usage**: Design system reference, pose library for documentation

### 📐 Grid Reference (`grid-ref/`)
- **Count**: 50 poses
- **Format**: Individual transparent SVG files
- **Description**: Reference poses matching grid structure
- **Naming**: `errl-XX.svg`
- **Usage**: Design system reference, pose library for documentation

### 🎲 Random Dynamic (`random-dynamic/`)
- **Count**: 50 poses
- **Format**: Individual transparent SVG files
- **Description**: Random dynamic pose variations
- **Naming**: `errl-XX.svg`
- **Usage**: Animation inspiration, UI elements, design reference

## Total Assets
- **245 SVG files** total
- All files are optimized for web use
- ViewBox: 0 0 1480 2046 (color variants) or 0 0 1024 1024 (pose variants)

## Usage Notes

### 3D Integration
- **Colors**: Color hex codes from SVG files are extracted and configured in `src/config/AvatarColorVariants.js`
- **3D Materials**: Colors are applied to Three.js `MeshStandardMaterial` with emissive properties
- **No Direct SVG Rendering**: The 3D avatar uses geometry (spheres, etc.), not 2D sprite rendering

### Design & UI Usage
- All SVG files use transparent backgrounds
- Color variants maintain consistent path structure
- Pose variants useful for:
  - UI character selection screens
  - Documentation and design reference
  - Animation planning and inspiration
  - Social media/website assets
- Assets are organized by category for easy reference

### Technical Details
- **Color SVGs**: ViewBox `0 0 1480 2046`, ~66KB each
- **Pose SVGs**: ViewBox `0 0 1024 1024`, various sizes
- All files optimized for web use
