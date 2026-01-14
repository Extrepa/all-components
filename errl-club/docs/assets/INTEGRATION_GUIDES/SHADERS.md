# Shader Integration Guide

**Last Updated**: December 10, 2025  
**Asset Type**: Shaders (GLSL)

## Overview

This guide provides instructions for integrating custom shaders into the Errl Club Simulator project.

## Integration Steps

1. Place shader in `/src/shaders/{name}.js`
2. Export shader material class
3. Register with `PostProcessingManager` if post-process
4. Document uniforms and parameters
5. Update asset catalog

## Code Example

```javascript
// Shader file: src/shaders/MyShader.js
export class MyShaderMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: { /* ... */ },
            vertexShader: `/* ... */`,
            fragmentShader: `/* ... */`,
        });
    }
}
```

## Best Practices

- Document all uniforms
- Provide default values
- Test shader performance
- Register with PostProcessingManager if post-process

