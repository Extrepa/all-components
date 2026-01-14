# Pose Generation Tools

## generate_errl_poses.py

Generates pose variations from a rigged Errl SVG base file.

### Prerequisites

The base SVG file must be rigged with the following structure:

- `<g id="body" data-pivot="256,260">` - wraps main blob + face
- `<g id="arm_right" data-pivot="230,260">` - wraps right arm  
- `<g id="arm_left" data-pivot="282,260">` - wraps left arm
- `<g id="leg_right" data-pivot="240,340">` - wraps right leg
- `<g id="leg_left" data-pivot="272,340">` - wraps left leg

The `data-pivot` attributes specify the rotation/transformation pivot points for each limb.

### Usage

```bash
python3 tools/generate_errl_poses.py
```

This will:
1. Read the base SVG from `svgs/library/ERRL_CHAR_FULL_STANDING_LIMBS.svg`
2. Generate 10 waving pose variations
3. Output to `svgs/library/poses-waving/`
4. Create a `manifest.json` file for easy loading

### Next Steps

1. **Prepare the base SVG**: The current `ERRL_CHAR_FULL_STANDING_LIMBS.svg` needs to be rigged with the limb groups and data-pivot attributes described above.

2. **Run the generator**: Once the base SVG is rigged, run the script to generate poses.

3. **Load poses in registry**: After generation, update `src/assets/registry.ts` to import and load the manifest:
   ```typescript
   import wavingManifest from "../../svgs/library/poses-waving/manifest.json";
   posePackAssets.push(...createPoseAssetsFromManifest(
     wavingManifest,
     "/svgs/library/poses-waving"
   ));
   ```

4. **Create additional pose packs**: Change `POSE_PACK_NAME` and `WAVING_POSES` in the script to create new pose packs (e.g., "running", "pointing", "sitting").

