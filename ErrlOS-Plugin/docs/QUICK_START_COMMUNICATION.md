# Quick Start: Communication System

**For:** Quick reference and getting started  
**Time:** 15 minutes to get started

---

## The Three Tools

### 1. Event Bus (The Radio)
**What:** Broadcast and listen to messages

```typescript
// Broadcast
this.publish("myOrgan:something-happened", { data: "value" });

// Listen
this.subscribe("otherOrgan:event", (data) => {
    console.log("Heard:", data);
});
```

### 2. Capability Registry (The Phone Book)
**What:** Advertise and discover what modules can do

```typescript
// Advertise
this.registerCapability({
    id: "myOrgan:do-thing",
    name: "Do Thing",
    description: "Does a thing",
    category: "transformation",
    organId: this.getId(),
});

// Discover
const caps = this.findCapabilities("transformation");
```

### 3. Service Router (The Request System)
**What:** Request work from other modules

```typescript
// Offer service
this.registerService("myOrgan:do-thing", async (params) => {
    return processData(params.input);
});

// Request service
const response = await this.requestService("myOrgan:do-thing", {
    input: "data",
});
if (response.success) {
    useResult(response.data);
}
```

---

## 5-Minute Integration

Add to any organ:

```typescript
async onEnable(): Promise<void> {
    await super.onEnable();
    await this.registerCapabilities();
    this.subscribeToEvents();
}

private async registerCapabilities(): Promise<void> {
    this.registerCapability({
        id: "myOrgan:capability",
        name: "My Capability",
        description: "What it does",
        category: "category",
        organId: this.getId(),
    });
    
    this.registerService("myOrgan:capability", async (params) => {
        // Do work
        return result;
    });
}

private subscribeToEvents(): void {
    this.subscribe("otherOrgan:event", (data) => {
        // React
    });
}
```

---

## See It In Action

**Real Examples:**
- `src/organs/capture/CaptureOrgan.ts` - Events + Capabilities
- `src/organs/projectPulse/ProjectPulseOrgan.ts` - Events + Services
- `src/organs/loreEngine/LoreEngineOrgan.ts` - Capabilities + Services
- `src/organs/promotion/PromotionOrgan.ts` - Using Services

---

## Full Learning Guide

See `docs/16_LEARNING_COMMUNICATION_SYSTEM.md` for complete tutorial.

---

**Quick Start Created:** 2025-12-15

