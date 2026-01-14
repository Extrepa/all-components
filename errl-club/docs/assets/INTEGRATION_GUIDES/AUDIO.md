# Audio Integration Guide

**Last Updated**: December 10, 2025  
**Asset Type**: Audio Files (MP3, OGG, WAV)

## Overview

This guide provides instructions for integrating audio files into the Errl Club Simulator project.

## Supported Formats

- **OGG Vorbis** (recommended) - Best compression, WebGL support
- **MP3** - Widely supported, licensing restrictions
- **WAV** - Uncompressed, high quality

## Size Guidelines

- **Music Tracks**: OGG, 128-192kbps, < 5MB per minute
- **SFX**: OGG or WAV, < 500KB per sound
- **Ambient Loops**: OGG, < 2MB per loop

## Integration Steps

1. Place audio in `/public/audio/{category}/{name}.ogg`
2. Validate using `AssetValidator`
3. Register in `AssetRegistry`
4. Load using `AudioSystem.loadFile()` for music
5. Use `FootstepSystem` or custom manager for SFX
6. Configure volume, loop, 3D positioning
7. Update asset catalog

## Code Example

```javascript
// Music
await audioSystem.loadFile('/audio/music/track.ogg');

// SFX
const sound = await footstepSystem.createPlaceholderSound(position);
```

## Best Practices

- Use OGG for best compression
- Compress audio files before integration
- Use 3D positioning for spatial audio
- Configure volume and loop settings
- Test audio playback

