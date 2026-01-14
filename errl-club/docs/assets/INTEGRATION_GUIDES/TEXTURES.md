# Texture Integration Guide

**Last Updated**: December 10, 2025  
**Asset Type**: Textures (PNG, JPG, HDR, EXR)

## Overview

This guide provides detailed instructions for integrating textures into the Errl Club Simulator project.

## Supported Formats

- **PNG** (recommended for transparency) - Lossless, supports transparency
- **JPG** - Compressed, no transparency
- **WebP** - Modern format, good compression
- **HDR** - High dynamic range for environment maps
- **EXR** - Extended range format

## Size Guidelines

- **UI Textures**: 512x512 max, < 200KB
- **Material Textures**: 1024x1024 max, < 1MB
- **Environment Maps**: 2048x2048 max, < 4MB
- **HDR/EXR**: 1024x512 max, < 2MB

## Format Recommendations

- **Diffuse/Albedo**: PNG (lossless) or JPG (compressed)
- **Normal Maps**: PNG (preserve precision)
- **Roughness/Metallic**: PNG or single-channel JPG
- **HDR/Environment**: EXR or HDR format
- **UI Elements**: PNG with transparency

## Integration Steps

### 1. Prepare Texture

- Export in appropriate format
- Optimize size (use compression tools)
- Ensure correct dimensions
- Test texture loads correctly

### 2. Place Texture

Place texture in appropriate directory:
```
public/textures/
├── materials/      # Material textures (diffuse, normal, etc.)
├── ui/            # UI textures
└── environment/    # Environment maps (HDR, EXR)
```

Example: `/public/textures/materials/my_texture.png`

### 3. Validate Texture

```javascript
import { AssetValidator } from './assets/AssetValidator.js';

const validator = new AssetValidator();
const result = validator.validate({
    type: 'texture',
    path: '/textures/materials/my_texture.png',
    size: fileSizeInBytes,
    format: 'png',
    license: 'CC BY 4.0',
    category: 'materials',
});

if (!result.valid) {
    console.error('Validation errors:', result.errors);
    return;
}
```

### 4. Register Texture

```javascript
import { AssetRegistry } from './assets/AssetRegistry.js';

const registry = new AssetRegistry();
registry.register('myTexture', {
    type: 'texture',
    path: '/textures/materials/my_texture.png',
    category: 'materials',
    size: fileSizeInBytes,
    format: 'png',
    license: 'CC BY 4.0',
    source: 'Source Name',
    description: 'Diffuse texture for material',
    tags: ['diffuse', 'material'],
});
```

### 5. Load Texture

Use `TextureManager` for loading:

```javascript
import { TextureManager } from './assets/TextureManager.js';

const textureManager = new TextureManager();

// Load texture with options
const texture = await textureManager.loadTexture('/textures/materials/my_texture.png', {
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.RepeatWrapping,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
});
```

### 6. Apply to Material

```javascript
// Apply to material
material.map = texture;
material.needsUpdate = true;

// Or create new material with texture
const material = new THREE.MeshStandardMaterial({
    map: texture,
    // ... other properties
});
```

### 7. Configure Texture Properties

```javascript
// Wrap modes
texture.wrapS = THREE.RepeatWrapping; // or ClampToEdgeWrapping
texture.wrapT = THREE.RepeatWrapping;

// Filtering
texture.minFilter = THREE.LinearMipmapLinearFilter; // For minification
texture.magFilter = THREE.LinearFilter; // For magnification

// Mipmaps
texture.generateMipmaps = true;

// Format
texture.format = THREE.RGBAFormat; // or RGBFormat, etc.

// Update
texture.needsUpdate = true;
```

### 8. Texture Atlas (Optional)

For multiple small textures, consider using texture atlas:

```javascript
// Load atlas texture
const atlasTexture = await textureManager.loadTexture('/textures/atlas.png');

// Define UV coordinates for each texture in atlas
const uvMapping = {
    texture1: { u: 0, v: 0, width: 0.5, height: 0.5 },
    texture2: { u: 0.5, v: 0, width: 0.5, height: 0.5 },
    // ... more mappings
};

// Apply UV mapping to geometry
geometry.attributes.uv = /* update UVs based on mapping */;
```

### 9. Environment Maps (HDR/EXR)

For environment maps:

```javascript
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const loader = new RGBELoader();
const envMap = await loader.loadAsync('/textures/environment/my_env.hdr');

// Apply to scene
scene.environment = envMap;

// Or apply to material
material.envMap = envMap;
material.envMapIntensity = 1.0;
```

### 10. Test Integration

- Visual inspection: Verify texture appears correctly
- Quality check: Verify texture quality is acceptable
- Performance check: Verify no performance issues
- Memory check: Verify texture memory usage is reasonable

### 11. Update Documentation

- Add texture to `docs/assets/ASSET_CATALOG.md`
- Document texture type and usage
- Update integration checklist

## Texture Types

### Diffuse/Albedo
- Base color texture
- Usually RGB or RGBA
- Applied to `material.map`

### Normal Maps
- Surface detail texture
- RGB format
- Applied to `material.normalMap`

### Roughness/Metallic
- PBR material properties
- Single channel or combined
- Applied to `material.roughnessMap` and `material.metalnessMap`

### Emissive
- Glow/emission texture
- RGB format
- Applied to `material.emissiveMap`

### Environment Maps
- Reflection/environment
- HDR or EXR format
- Applied to `scene.environment` or `material.envMap`

## Best Practices

1. **Use appropriate format**: PNG for transparency, JPG for compression
2. **Optimize size**: Compress textures to reduce file size
3. **Use power-of-2 dimensions**: 256, 512, 1024, 2048, etc.
4. **Configure wrap modes**: Repeat for tiling, ClampToEdge for non-tiling
5. **Enable mipmaps**: Improves quality at distance
6. **Use texture atlas**: For multiple small textures
7. **Cache textures**: Use TextureManager for caching
8. **Dispose when done**: Free memory when texture no longer needed

## Error Handling

Use `AssetErrorHandler` for graceful error handling:

```javascript
import { AssetErrorHandler } from './assets/AssetErrorHandler.js';

const errorHandler = new AssetErrorHandler();
try {
    const texture = await textureManager.loadTexture(path);
} catch (error) {
    const fallback = await errorHandler.handleError(path, error, {
        assetType: 'texture',
        loader: (path) => textureManager.loadTexture(path),
    });
    // Use fallback or handle error
}
```

## Troubleshooting

### Texture Not Loading
- Check file path is correct
- Verify file exists in public directory
- Check browser console for errors
- Verify format is supported
- Check CORS settings if loading from external source

### Texture Quality Issues
- Verify texture dimensions are appropriate
- Check filtering settings
- Enable mipmaps
- Verify texture format

### Performance Issues
- Reduce texture size
- Use compressed formats
- Use texture atlas
- Enable texture compression (BC7/ETC2)

### Memory Issues
- Reduce texture size
- Use texture pooling
- Dispose unused textures
- Monitor texture memory usage

## Next Steps

After integration:
1. Test in development
2. Test in production build
3. Monitor performance
4. Update asset catalog
5. Add to test suite

