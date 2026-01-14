# Errl OS Kernel

## Purpose
The kernel provides:
- module registry
- shared settings
- dashboard boot logic
- command routing

## Kernel Responsibilities
- Load enabled modules
- Open dashboard on startup
- Provide shared APIs (capture, logging, scanning)

## Files
- main.ts (plugin entry)
- manifest.json
- styles.css

This kernel never does heavy logic.
It delegates.