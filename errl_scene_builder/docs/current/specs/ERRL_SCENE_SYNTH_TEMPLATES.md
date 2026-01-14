<!-- File: ERRL_SCENE_SYNTH_TEMPLATES.md -->

# Errl Scene Synth – Templates (v1)

This document defines starter scene templates for onboarding and “guided chaos.” Each template is a valid `ErrlScene` JSON with `isTemplate: true` and lives under `/templates/`.

## Template Categories

- LAB_INTRO – simple lab with one Errl head.
- GRANDMA_TV – cozy room with a TV prop.
- FESTIVAL_STAGE – outdoor stage with flags and riser.
- VOID_ORBS – abstract void with orbs/sparkles.
- SHRINE_ALTAR – altar pedestal and halo.

## Files

- `/templates/LAB_INTRO.json`
- `/templates/GRANDMA_TV.json`
- `/templates/FESTIVAL_STAGE.json`
- `/templates/VOID_ORBS.json`
- `/templates/SHRINE_ALTAR.json`

## Template Fields

- `isTemplate: true`
- `id`: stable template id (e.g., `template_lab_intro`)
- `name`: human label
- `description`: short guidance
- Background planes set to the relevant BG assets
- Minimal entities to illustrate usage
- Optional motion presets on the main Errl

## Usage

- Landing screen shows template grid (name + description).
- Selecting a template loads the JSON into the editor (clone `id` when saving user scenes).
- Templates can be stored locally or fetched; schema remains identical to `ErrlScene`.
