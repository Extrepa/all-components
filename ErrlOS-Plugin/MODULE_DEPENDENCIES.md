# Errl OS Module Dependencies

**Last Updated:** 2025-12-15

This document describes the relationships and dependencies between Errl OS modules (organs). All dependencies are **optional** - modules will function without their dependencies, but may have reduced functionality.

---

## Dependency Overview

Errl OS uses a **graceful degradation** approach to module dependencies:
- Modules check for dependencies using `this.kernel.isOrganEnabled(id)`
- If a dependency is not enabled, the module continues to work with reduced functionality
- No hard failures occur when dependencies are missing
- All dependency checks include null/undefined checks for safety

---

## Module Dependency Map

### Idea DNA Splicer
**Depends on:**
- **Entropy Dial** (optional) - Uses entropy level to determine creativity mode (chaotic vs structured)

**What happens without dependency:**
- Still functions, but uses default structured mode
- Cannot adapt to entropy level for more creative combinations

**Code Location:** `src/organs/ideaDnaSplicer/IdeaDnaSplicerOrgan.ts:167`

---

### Friction Scanner
**Depends on:**
- **Project Pulse** (optional) - Scans for abandoned projects as friction points
- **Session Ghost** (optional) - Detects stalled notes as friction points

**What happens without dependencies:**
- Still functions, but cannot detect:
  - Abandoned projects (if Project Pulse disabled)
  - Stalled notes (if Session Ghost disabled)
- Other friction detection (missing links, orphaned content) still works

**Code Locations:**
- Project Pulse: `src/organs/friction/FrictionScannerOrgan.ts:93`
- Session Ghost: `src/organs/friction/FrictionScannerOrgan.ts:179`

---

### Thought Recycler
**Depends on:**
- **Project Pulse** (optional) - Includes abandoned projects in forgotten ideas
- **Entropy Dial** (optional) - Applies entropy to shuffle/limit suggestions
- **Energy** (optional) - Respects low-energy mode to show fewer suggestions

**What happens without dependencies:**
- Still functions, but:
  - Cannot include abandoned projects in forgotten ideas (if Project Pulse disabled)
  - Cannot apply entropy shuffling (if Entropy Dial disabled)
  - Cannot respect low-energy mode limits (if Energy disabled)

**Code Locations:**
- Project Pulse: `src/organs/thoughtRecycler/ThoughtRecyclerOrgan.ts:116`
- Entropy Dial: `src/organs/thoughtRecycler/ThoughtRecyclerOrgan.ts:139`
- Energy: `src/organs/thoughtRecycler/ThoughtRecyclerOrgan.ts:162`

---

### Ritual Engine
**Depends on:**
- **Energy** (optional) - Uses energy level to suggest appropriate rituals

**What happens without dependency:**
- Still functions, but cannot adapt ritual suggestions based on energy level
- All rituals remain available regardless of energy

**Code Location:** `src/organs/ritual/RitualOrgan.ts:156`

---

### Energy System
**Depends on:**
- **Dashboard** (required for UI) - Applies low-energy mode CSS classes to dashboard

**What happens without dependency:**
- Low-energy mode UI changes may not apply correctly
- Dashboard may not reflect energy state visually

**Code Location:** `src/organs/energy/EnergyOrgan.ts:144`

**Note:** Dashboard is always enabled by default, so this dependency is effectively always satisfied.

---

### Promotion Flows
**Depends on:**
- **Lore Engine** (optional) - For "project-to-lore" and "capture-to-lore" promotion types

**What happens without dependency:**
- Still functions for "capture-to-project" promotions
- Cannot promote to lore (if Lore Engine disabled)
- Lore promotion options are hidden/disabled

**Code Location:** `src/organs/promotion/PromotionOrgan.ts:183`

---

### Dream Buffer
**Depends on:**
- **Capture** (optional) - Can integrate with capture system for structured capture

**What happens without dependency:**
- Still functions as standalone dream capture
- Cannot integrate with capture file system
- Works independently for unstructured creative input

**Code Location:** `src/organs/dreamBuffer/DreamBufferOrgan.ts:176`

---

## Independent Modules

These modules have no dependencies on other Errl OS modules:

- **Dashboard** - Core module, no dependencies
- **Capture** - Standalone capture system
- **Project Pulse** - Independent project tracking
- **Time Machine** - Independent session logging
- **Lore Engine** - Independent lore management
- **Reality Map** - Independent spatial mapping
- **Entropy Dial** - Independent entropy management
- **Session Ghost** - Independent note tracking
- **Asset Brain** - Independent asset tracking
- **Prompt Forge** - Independent prompt generation

---

## Dependency Patterns

### Pattern 1: Feature Enhancement
Modules that enhance functionality when dependencies are available:
- **Idea DNA Splicer** → Entropy Dial (creativity mode)
- **Thought Recycler** → Entropy Dial (shuffling)
- **Ritual** → Energy (energy-appropriate suggestions)

### Pattern 2: Data Integration
Modules that integrate data from other modules:
- **Friction Scanner** → Project Pulse, Session Ghost (friction detection)
- **Thought Recycler** → Project Pulse (abandoned projects)
- **Promotion** → Lore Engine (lore promotion)

### Pattern 3: UI Integration
Modules that affect UI of other modules:
- **Energy** → Dashboard (low-energy mode styling)
- **Thought Recycler** → Energy (low-energy mode limits)

### Pattern 4: Communication-Based Dependencies (NEW)

With the inter-module communication system, modules can now depend on each other through **events**, **capabilities**, and **services** instead of direct code dependencies. This creates looser coupling and more flexible relationships.

#### Event-Based Dependencies

Modules subscribe to events from other modules:

- **Project Pulse** → subscribes to `capture:thought-captured` events
- **Lore Engine** → subscribes to `promotion:content-created` events
- **Promotion** → subscribes to `project:status-changed` and `project:abandoned` events

**Benefits**:
- No direct code dependency
- Works even if publishing module is disabled
- Multiple modules can subscribe to same event

**Example**:
```typescript
// Project Pulse subscribes to Capture events
this.subscribe("capture:thought-captured", (data) => {
    // React to capture events
});
```

#### Service-Based Dependencies

Modules request services from other modules:

- **Promotion** → requests `loreEngine:find-related` service
- Any module → can request `projectPulse:analyze-status` service
- Any module → can request `capture:format-text` service

**Benefits**:
- Discover capabilities dynamically
- No compile-time dependency
- Graceful failure if service not available

**Example**:
```typescript
// Promotion requests Lore Engine service
const response = await this.requestService("loreEngine:find-related", {
    text: content,
});
if (response.success) {
    // Use the related entities
}
```

#### Capability Discovery

Modules discover what other modules can do:

- Any module → can discover formatting capabilities
- Any module → can discover analysis capabilities
- Any module → can discover query capabilities

**Benefits**:
- Dynamic discovery of functionality
- No hard-coded dependencies
- Modules can adapt to available capabilities

**Example**:
```typescript
// Discover formatting capabilities
const formattingCaps = this.findCapabilities("formatting");
if (formattingCaps.length > 0) {
    // Use the first available formatter
    const response = await this.requestService(formattingCaps[0].id, params);
}
```

#### Migration from Direct to Communication-Based

**Old Pattern** (Direct dependency):
```typescript
if (this.kernel.isOrganEnabled("loreEngine")) {
    const loreEngine = this.kernel.getRegistry().get("loreEngine") as LoreEngineOrgan;
    if (loreEngine) {
        const entities = loreEngine.findEntities(text);
    }
}
```

**New Pattern** (Service request):
```typescript
const response = await this.requestService("loreEngine:find-related", {
    text: text,
});
if (response.success) {
    const entities = response.data;
}
```

**Benefits of Migration**:
- ✅ No import dependency on LoreEngineOrgan
- ✅ Works even if Lore Engine is disabled (returns error response)
- ✅ More testable (can mock service responses)
- ✅ More flexible (can swap implementations)

---

## Best Practices

### Enabling Related Modules

**For Creative Workflows:**
- Enable **Entropy Dial** with **Idea DNA Splicer** for adaptive creativity
- Enable **Dream Buffer** with **Capture** for dual capture modes

**For Project Management:**
- Enable **Project Pulse** with **Friction Scanner** for comprehensive project health
- Enable **Project Pulse** with **Thought Recycler** to resurface abandoned projects

**For Energy Management:**
- Enable **Energy** with **Ritual** for energy-appropriate rituals
- Enable **Energy** with **Thought Recycler** for energy-aware suggestions

**For Lore Workflows:**
- Enable **Lore Engine** with **Promotion** for capture/project → lore flows

**For Comprehensive Tracking:**
- Enable **Session Ghost** with **Friction Scanner** for complete friction detection

---

## Implementation Details

### How Dependencies Are Checked

All modules use the same pattern:

```typescript
if (this.kernel.isOrganEnabled("dependencyId")) {
    const dependency = this.kernel.getRegistry().get("dependencyId") as DependencyType | undefined;
    if (dependency) {
        // Use dependency functionality
    }
}
// Continue with reduced functionality if dependency not available
```

### Safety Features

1. **Null Checks:** All registry access includes `| undefined` type and null checks
2. **Graceful Degradation:** Modules never fail when dependencies are missing
3. **Optional Features:** Dependent features are clearly marked as optional
4. **Error Handling:** Try-catch blocks around dependency usage where appropriate

---

## Testing Dependencies

To test module behavior with/without dependencies:

1. **Enable all modules** - Test full functionality
2. **Disable a dependency** - Verify module still works with reduced features
3. **Re-enable dependency** - Verify enhanced features return
4. **Check console** - No errors should appear when dependencies are missing

---

## Future Considerations

### Potential Hard Dependencies

Currently, all dependencies are optional. Future modules might require:
- **Hard dependencies** - Module cannot function without dependency
- **Dependency chains** - Module A → Module B → Module C
- **Circular dependency prevention** - Ensure no circular references

### Dependency Validation

Consider adding:
- Startup validation to warn about missing recommended dependencies
- Settings UI indicators showing dependency relationships
- Automatic enabling of dependencies when enabling a module (with user confirmation)

---

## Communication-Based Relationships

### Current Communication Dependencies

**Capture Organ**:
- Publishes: `capture:thought-captured`
- Provides: `capture:format-text` (capability + service)

**Project Pulse Organ**:
- Subscribes: `capture:thought-captured`
- Publishes: `project:status-changed`, `project:abandoned`
- Provides: `projectPulse:analyze-status`, `projectPulse:find-abandoned` (capabilities + services)

**Lore Engine Organ**:
- Subscribes: `promotion:content-created`
- Provides: `loreEngine:find-related`, `loreEngine:analyze-connections` (capabilities + services)

**Promotion Organ**:
- Subscribes: `project:status-changed`, `project:abandoned`
- Publishes: `promotion:content-created`
- Uses: `loreEngine:find-related` (service request)

### Communication vs Direct Dependencies

**Communication-Based** (Recommended):
- ✅ Loose coupling
- ✅ Works across module boundaries
- ✅ Dynamic discovery
- ✅ Graceful degradation
- ✅ More testable

**Direct Dependencies** (Legacy):
- ⚠️ Tight coupling
- ⚠️ Requires imports
- ⚠️ Compile-time dependencies
- ⚠️ Harder to test

**Recommendation**: Prefer communication-based dependencies (events/services) over direct dependencies when possible.

---

## Summary

✅ **All dependencies are optional** - No module requires another to function  
✅ **Graceful degradation** - Modules work with reduced features when dependencies are disabled  
✅ **Safe implementation** - All dependency checks include null/undefined handling  
✅ **Well-documented** - Dependencies are clearly documented in code with comments  
✅ **Communication-based** - New modules use events/services for loose coupling  

The Errl OS architecture is designed to be **modular and flexible** - users can enable only the modules they need without worrying about complex dependency chains. The communication system enables modules to collaborate without tight coupling.

---

**See Also:**
- [README.md](README.md) - Plugin overview
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Development documentation
- [docs/15_INTER_MODULE_COMMUNICATION.md](docs/15_INTER_MODULE_COMMUNICATION.md) - Communication system guide
- [src/kernel/ErrlKernel.ts](src/kernel/ErrlKernel.ts) - Kernel implementation

