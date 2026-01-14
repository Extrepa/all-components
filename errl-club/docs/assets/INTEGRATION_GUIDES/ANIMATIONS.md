# Animation Integration Guide

**Last Updated**: December 10, 2025  
**Asset Type**: Animations (GLTF Animations, Skeletal)

## Overview

This guide provides instructions for integrating animations into the Errl Club Simulator project.

## Size Guidelines

- **Simple Animations**: < 100KB per animation
- **Complex Skeletal**: < 500KB per animation set
- **Facial/Blend Shapes**: < 200KB

## Integration Steps

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

## Best Practices

- Include animations in GLB files
- Use AnimationMixer for playback
- Update mixer in animation loop
- Register with animation system

