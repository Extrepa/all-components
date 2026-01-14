# Scene Templates Extraction Plan

**Date:** 2026-01-09  
**Status:** Planning Document  
**Source:** errl_scene_builder (deprecated)

## Available Templates

errl_scene_builder has 5 scene templates that could be useful for multi-tool-app:

1. **LAB_INTRO** - Simple lab with one Errl head
   - File: `errl_scene_builder/templates/LAB_INTRO.json`
   - Use Case: Starter lab scene

2. **GRANDMA_TV** - Cozy room with a TV prop
   - File: `errl_scene_builder/templates/GRANDMA_TV.json`
   - Use Case: Cozy room scene

3. **FESTIVAL_STAGE** - Outdoor stage with flags and riser
   - File: `errl_scene_builder/templates/FESTIVAL_STAGE.json`
   - Use Case: Outdoor stage scene

4. **VOID_ORBS** - Abstract void with orbs/sparkles
   - File: `errl_scene_builder/templates/VOID_ORBS.json`
   - Use Case: Abstract void scene

5. **SHRINE_ALTAR** - Altar pedestal and halo
   - File: `errl_scene_builder/templates/SHRINE_ALTAR.json`
   - Use Case: Ceremonial altar scene

## Template Structure

Each template is a valid `ErrlScene` JSON with:
- `isTemplate: true`
- `id`: stable template id (e.g., `template_lab_intro`)
- `name`: human label
- `description`: short guidance
- Background planes set to relevant BG assets
- Minimal entities to illustrate usage
- Optional motion presets on main Errl

## Extraction Options

### Option 1: Copy to multi-tool-app
- Copy templates to `multi-tool-app/templates/` or `multi-tool-app/src/templates/`
- Adapt to multi-tool-app scene schema if needed
- **Benefit:** Templates available in multi-tool-app
- **Effort:** Medium (may need schema adaptation)

### Option 2: Create Shared Templates
- Create `shared/templates/scenes/` directory
- Copy templates there for reuse
- **Benefit:** Reusable across projects
- **Effort:** Low

### Option 3: Document for Future
- Document templates in extraction plan
- Extract when needed
- **Benefit:** No immediate work
- **Effort:** Low

## Recommended Approach

**Option 2: Create Shared Templates** - Create `shared/templates/scenes/` and copy templates there. This makes them available for:
- multi-tool-app (can import/use)
- Future projects
- Reference documentation

## Template Files Location

- Source: `errl_scene_builder/templates/`
- Destination (recommended): `shared/templates/scenes/`
- Documentation: `errl_scene_builder/docs/current/specs/ERRL_SCENE_SYNTH_TEMPLATES.md`

## Status

- ✅ Templates identified
- ✅ Template structure documented
- ⏳ Extraction pending (can be done when needed)

## Notes

- Templates use ErrlScene JSON schema
- May need adaptation for multi-tool-app scene schema
- Templates are starter scenes for onboarding
- Can be used as reference for creating new templates
