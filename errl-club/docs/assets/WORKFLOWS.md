# Asset Integration Workflows

**Last Updated**: December 10, 2025  
**Status**: Active Documentation

This document provides step-by-step workflows for integrating different asset types into the Errl Club Simulator project.

## Overview

Each asset type has a standardized integration workflow to ensure consistency, reduce errors, and maintain quality. Follow these workflows for all asset integrations.

## General Integration Process

### Standard Steps (All Asset Types)

1. **Acquisition**: Obtain asset (download, create, commission)
2. **Validation**: Validate format, size, license using `AssetValidator`
3. **Optimization**: Optimize asset if needed using `AssetOptimizer`
4. **Placement**: Place asset in appropriate directory
5. **Registration**: Register asset in `AssetRegistry`
6. **Integration**: Add integration code
7. **Testing**: Test asset loading and usage
8. **Documentation**: Update asset catalog
9. **Deployment**: Verify asset works in production build

## Asset Type Workflows

### 3D Models

**Workflow**:
1. Place model in `/public/models/{category}/{name}.glb`
2. Validate using `AssetValidator.validate()`
3. Register in `AssetRegistry` with metadata
4. Create integration method in `CodexAssetIntegration.js`:
   ```javascript
   async load{AssetName}() {
       try {
           const model = await this.assetLoader.loadModel('/models/{category}/{name}.glb');
           this.autoScaleModel(model, { desiredHeight: X, maxScale: Y });
           model.position.set(x, y, z);
           // Apply material preset
           const preset = getPreset('preset-name');
           if (preset) {
               applyPresetToAsset(model, preset);
           }
           // Precompute bounding sphere
           const box = new THREE.Box3().setFromObject(model);
           model.userData.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
           model.userData.proximityThreshold = distance;
           // Tag asset
           this.tagAsset(model, 'Asset Name', 'License Info');
           this.scene.add(model);
           this.loadedAssets.set('assetId', model);
           // Register with LOD
           if (this.lodSystem) {
               this.lodSystem.registerAsset('assetId', model);
           }
           return model;
       } catch (error) {
           console.error('Failed to load asset:', error);
           return null;
       }
   }
   ```
5. Call integration method in initialization
6. Add audio-reactive properties if applicable
7. Test proximity visibility
8. Update asset catalog

**Checklist**:
- [ ] Model file placed in correct directory
- [ ] Model validated (format, size)
- [ ] Model registered in AssetRegistry
- [ ] Integration method created
- [ ] Scaling configured
- [ ] Position set
- [ ] Material preset applied
- [ ] Bounding sphere precomputed
- [ ] Proximity threshold set
- [ ] Asset tagged with metadata
- [ ] LOD registered
- [ ] Audio-reactive properties set (if applicable)
- [ ] Visual inspection passed
- [ ] Performance tested
- [ ] Documentation updated

### Textures

**Workflow**:
1. Place texture in `/public/textures/{category}/{name}.{ext}`
2. Validate using `AssetValidator.validate()`
3. Register in `AssetRegistry` with metadata
4. Load using `TextureManager.loadTexture()`:
   ```javascript
   const texture = await textureManager.loadTexture('/textures/{category}/{name}.{ext}', {
       wrapS: THREE.RepeatWrapping,
       wrapT: THREE.RepeatWrapping,
       minFilter: THREE.LinearMipmapLinearFilter,
       magFilter: THREE.LinearFilter,
   });
   ```
5. Apply to material
6. Update asset catalog

**Checklist**:
- [ ] Texture file placed in correct directory
- [ ] Texture validated (format, size)
- [ ] Texture registered in AssetRegistry
- [ ] Texture loaded using TextureManager
- [ ] Wrap modes configured
- [ ] Filtering configured
- [ ] Applied to material
- [ ] Visual inspection passed
- [ ] Documentation updated

### Audio Files

**Workflow**:
1. Place audio in `/public/audio/{category}/{name}.ogg`
2. Validate using `AssetValidator.validate()`
3. Register in `AssetRegistry` with metadata
4. Load using `AudioSystem.loadFile()` for music:
   ```javascript
   await audioSystem.loadFile('/audio/music/{name}.ogg');
   ```
5. Or use `FootstepSystem` or custom manager for SFX
6. Configure volume, loop, 3D positioning
7. Update asset catalog

**Checklist**:
- [ ] Audio file placed in correct directory
- [ ] Audio validated (format, size)
- [ ] Audio registered in AssetRegistry
- [ ] Audio loaded using appropriate system
- [ ] Volume configured
- [ ] Loop configured (if applicable)
- [ ] 3D positioning configured (if applicable)
- [ ] Audio tested
- [ ] Documentation updated

### Animations

**Workflow**:
1. Include animation in GLTF/GLB model file
2. Extract using `GLTFLoader`:
   ```javascript
   const animations = gltf.animations;
   const mixer = new THREE.AnimationMixer(model);
   animations.forEach((clip) => {
       const action = mixer.clipAction(clip);
       action.play();
   });
   ```
3. Register with animation system
4. Add controls to UI if user-controllable
5. Update asset catalog

**Checklist**:
- [ ] Animation included in model file
- [ ] Animation extracted from GLTF
- [ ] AnimationMixer created
- [ ] Animation actions configured
- [ ] Animation registered with system
- [ ] UI controls added (if applicable)
- [ ] Animation tested
- [ ] Documentation updated

### Shaders

**Workflow**:
1. Place shader in `/src/shaders/{name}.js`
2. Export shader material class
3. Register with `PostProcessingManager` if post-process
4. Document uniforms and parameters
5. Update asset catalog

**Checklist**:
- [ ] Shader file created
- [ ] Shader material class exported
- [ ] Uniforms documented
- [ ] Parameters documented
- [ ] Registered with PostProcessingManager (if applicable)
- [ ] Shader tested
- [ ] Documentation updated

### UI Assets

**Workflow**:
1. Place asset in `/public/ui/{category}/{name}.{ext}`
2. Use SVG for scalable icons
3. Create sprite sheets for multiple icons
4. Load via CSS or JavaScript
5. Update asset catalog

**Checklist**:
- [ ] UI asset placed in correct directory
- [ ] Format appropriate (SVG preferred for icons)
- [ ] Sprite sheet created (if multiple icons)
- [ ] Asset loaded via CSS or JavaScript
- [ ] Visual inspection passed
- [ ] Documentation updated

## Common Pitfalls and Solutions

### Pitfall: Asset Not Loading
**Solution**: Check file path, verify file exists, check browser console for errors, verify format is supported

### Pitfall: Asset Too Large
**Solution**: Use AssetOptimizer to compress, reduce texture resolution, simplify geometry

### Pitfall: Missing License Information
**Solution**: Always include license when registering asset, use AssetValidator to check

### Pitfall: Asset Not Visible
**Solution**: Check position, scale, material, proximity visibility settings, LOD settings

### Pitfall: Performance Issues
**Solution**: Enable LOD, reduce polygon count, compress textures, use instancing for repeated objects

## Best Practices

1. **Always validate** before integration
2. **Always register** in AssetRegistry
3. **Always document** in asset catalog
4. **Always test** after integration
5. **Always check** license compliance
6. **Always optimize** large assets
7. **Always use** appropriate formats
8. **Always set** proximity thresholds for 3D models
9. **Always register** with LOD system for 3D models
10. **Always track** usage locations

## Automation

Many steps can be automated:
- Asset validation: `AssetValidator.validate()`
- Asset registration: `AssetRegistry.register()`
- Catalog updates: `AssetCatalog.addAsset()`
- Attribution reports: `AssetCatalog.generateAttributionReport()`

Use these tools to reduce manual work and ensure consistency.

## Next Steps

After completing integration:
1. Test in development environment
2. Test in production build
3. Monitor performance
4. Update documentation
5. Add to integration test suite

