# Errl Sprite Preparation Guide

## PNG Requirements

### Size & Format
- **Recommended Size**: 32x32 pixels (matches current player size)
- **Alternative**: 64x64 pixels (2x scale, will be scaled down)
- **Format**: PNG with transparency (alpha channel)
- **Color Mode**: RGB or RGBA

### Image Quality
- ✅ **Good**: Clean edges, no anti-aliasing (pixel art style)
- ✅ **Good**: Transparent background
- ✅ **Good**: Character centered in frame
- ✅ **Good**: Character facing right (or we'll flip it in code)

### Cropping/Trimming
**IMPORTANT**: If your PNG has a lot of transparent space around the character:
1. **Crop the image** to remove excess transparent padding
2. The character should fill most of the 32x32 frame
3. Leave just a small margin (2-4 pixels) around the edges
4. If you can't crop it, the code will automatically scale it up by 30% to reduce the transparent padding effect

**How to crop:**
- Use an image editor (Photoshop, GIMP, online tools like Photopea)
- Use "Trim" or "Auto-crop" feature to remove transparent edges
- Resize to 32x32 if needed
- Ensure character is centered

### File Location
Place your PNG file in the `public` folder:
```
/public/errl.png
```

Or if you want to use Vite's asset handling:
```
/assets/errl.png
```

## Current Player Size
- Width: 32 pixels
- Height: 32 pixels
- The image will be scaled to fit this size

## Optional: Animation Spritesheet
If you want animations later, you can create a spritesheet:
- Horizontal strip: 4 frames (idle, walk1, walk2, walk3)
- Each frame: 32x32 pixels
- Total: 128x32 pixels
- We can add animation support later

## Testing
Once the image is in place, the game will automatically load and use it. If the image fails to load, it will fall back to the current blue square rendering.

