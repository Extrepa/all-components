# Avatar Color Variants - Integration Guide

This document explains how to use the 25 color variants extracted from the SVG collection.

## Overview

The avatar system now supports **25 color variants** organized into 5 categories:
- 🟣 **Purple & Violet** (5 variants)
- 🟢 **Green** (5 variants)
- 🔴 **Red & Pink** (5 variants)
- 🟠 **Orange** (5 variants)
- 🔵 **Blue** (5 variants)

## Usage

### Basic Usage

```javascript
import { ErrlAvatar } from './avatar/ErrlAvatar.js';

// Avatar automatically uses all 25 variants
const avatar = new ErrlAvatar(scene, position);

// Randomize color variant
avatar.randomizeColorVariant();

// Set specific variant
avatar.setColorVariant('ocean_blue');

// Randomize from specific category
avatar.randomizeColorVariant(null, 'blue');
```

### Available Variants

All variants are defined in `AvatarColorVariants.js`. Use the variant keys:

**Purple & Violet:**
- `classic_purple`
- `royal_violet`
- `midnight_purple`
- `lavender_dream`
- `deep_plum`

**Green:**
- `forest_green`
- `emerald_teal`
- `lime_green`
- `mint_fresh`
- `jade_green`

**Red & Pink:**
- `cherry_red`
- `ruby_red`
- `crimson_fire`
- `scarlet_red`
- `rose_pink`

**Orange:**
- `sunset_orange`
- `coral_orange`
- `amber_orange`
- `tangerine_burst`
- `golden_orange`

**Blue:**
- `ocean_blue`
- `sky_blue`
- `sapphire_blue`
- `azure_sky`
- `cobalt_blue`

### Helper Functions

```javascript
import { 
    getAllVariantKeys,
    getVariantsByCategory,
    getRandomVariantKey,
    getVariant
} from './config/AvatarColorVariants.js';

// Get all variant keys
const allKeys = getAllVariantKeys(); // Returns array of 25 keys

// Get variants by category
const blueVariants = getVariantsByCategory('blue');

// Get random variant
const random = getRandomVariantKey();
const randomBlue = getRandomVariantKey('blue');

// Get variant data
const variant = getVariant('ocean_blue');
// Returns: { color: 0x01579b, glow: 0.35, name: 'Ocean Blue', ... }
```

### Backward Compatibility

Legacy variant names are automatically mapped:
- `base` → `classic_purple`
- `galaxy` → `midnight_purple`
- `jelly` → `mint_fresh`
- `rainbow` → `lavender_dream`

## Integration Points

### ErrlAvatar
- Constructor now uses all 25 variants
- Default variant: `classic_purple`
- `setColorVariant()` supports all new variants
- `randomizeColorVariant()` can filter by category

### RemotePlayer
- Updated to use all 25 variants
- Remote players will display correct colors from network state

### StateManager & PlayerState
- Default color variant updated to `classic_purple`
- Network synchronization supports all variants

## Color Variant Structure

Each variant includes:
```javascript
{
    color: 0x3d2b56,        // Three.js hex color
    glow: 0.3,              // Emissive intensity (0.0 - 1.0)
    name: 'Classic Purple', // Human-readable name
    category: 'purple',     // Category for grouping
    hex: '#3d2b56'         // Original hex string
}
```

## Source Assets

All color values are extracted from the SVG files in:
- `src/assets/avatars/colors/`

See `src/assets/avatars/ASSET_CATALOG.md` for full asset documentation.

