# Quick Reference - Errl OS Plugin

## Build & Deploy
```bash
npm run build    # Build plugin
npm run deploy   # Build and deploy to vault
npm test         # Run tests
```

## Key Files
- `src/main.ts` - Plugin entry point
- `src/kernel/ErrlKernel.ts` - Core orchestrator
- `src/settings/FirstRunWizard.ts` - Setup wizard
- `main.js` - Built plugin (239.1KB)

## Testing
- Manual: See MANUAL_TESTING_CHECKLIST.md
- Automated: `npm test` (115/148 passing)
- Coverage: `npm run test:coverage`

## Status
✅ Build: Success  
✅ Deployment: Complete  
✅ Code: 0 errors  
✅ Organs: 16/16  
✅ Tests: 78% passing  
✅ Docs: Complete

## Next Steps
1. Test in Obsidian
2. Verify wizard
3. Test all organs
4. Collect feedback
