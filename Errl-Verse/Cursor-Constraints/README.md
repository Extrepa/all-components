# Cursor Constraints

These files define rules and constraints for Cursor AI when working on this project.

## Files

- **[CURSOR_PROJECT_CONTRACT.md](CURSOR_PROJECT_CONTRACT.md)** - Non-negotiable project rules
- **[CANONICAL_PATHS.md](CANONICAL_PATHS.md)** - Fixed paths that must not be renamed
- **[ALLOWED_ACTIONS.md](ALLOWED_ACTIONS.md)** - What Cursor can and cannot do
- **[DECISIONS.md](DECISIONS.md)** - Architectural decisions and rationale
- **[DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md)** - Completion criteria
- **[BORING_IS_GOOD.md](BORING_IS_GOOD.md)** - Philosophy document

## Usage

When working with Cursor, reference these files to ensure it follows the project's architectural rules and constraints.

### Example Prompt

```
Before making changes, check:
1. CURSOR_PROJECT_CONTRACT.md - Are you following the rules?
2. CANONICAL_PATHS.md - Are you using the correct paths?
3. DECISIONS.md - Does this align with architectural decisions?
```

## Key Constraints

- Storage path: `/srv` (not `/storage`)
- Remote access: Cloudflare Tunnel only (no port forwarding)
- Containers: One service per container
- Philosophy: Boring beats clever

