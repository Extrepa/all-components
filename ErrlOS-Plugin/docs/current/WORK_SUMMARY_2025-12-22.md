# Errl OS Notes (2025-12-22)

## Summary
- Centralized organ metadata in `src/organs/metadata.ts` and drive registrations, defaults, and UI lists from the same source.
- Hardened settings persistence with deep-merge behavior in `src/kernel/ErrlKernel.ts` and updated layered controls to respect existing values.
- Removed redundant command registration on startup and stabilized dashboard lifecycle tests by stubbing consent/postprocessor side effects.

## Key Changes
- Organ registry: `src/organs/metadata.ts`, `src/organs/index.ts`, `src/main.ts`, `src/settings/ErrlSettings.ts`, `src/settings/FirstRunWizard.ts`, `src/settings/ErrlSettingsTab.ts`.
- Settings merge: `src/kernel/ErrlKernel.ts`, `src/settings/ErrlSettingsTab.ts`, tests in `tests/unit/kernel/ErrlKernel.settings.test.ts`.
- Lifecycle tests: `tests/integration/workflows/organLifecycle.test.ts`.

## Tests Run
- `npm run test -- tests/unit/kernel/ErrlKernel.settings.test.ts`
- `npm run test -- tests/integration/workflows/organLifecycle.test.ts`
- Combined: `npm run test -- tests/unit/kernel/ErrlKernel.settings.test.ts tests/integration/workflows/organLifecycle.test.ts`

## Open Notes
- Integration test suite still logs expected console output (dashboard command logs, nonexistent organ error case).
- Capability/service layer remains largely unused (only Promotion -> Lore Engine uses requestService).

## Suggested Next Steps
1. Decide whether to remove or slim down the capability/service layer; refactor Promotion -> Lore Engine accordingly.
2. Split `src/organs/dashboard/DashboardOrgan.ts` and `src/settings/ErrlSettingsTab.ts` into smaller modules.
3. Add a unit test that asserts every `ORGAN_METADATA` entry has a creator and appears in defaults to prevent drift.
