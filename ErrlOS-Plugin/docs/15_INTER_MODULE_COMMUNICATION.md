# Inter-Module Communication

**Last Updated:** 2025-12-15

## Philosophy

Errl OS modules are designed to be independent "organs" that can function on their own, but they become more powerful when they can communicate and collaborate. The inter-module communication system enables modules to:

1. **Discover capabilities** - Find out what other modules can do
2. **Share knowledge** - Publish events about what's happening
3. **Request services** - Ask other modules to perform work
4. **Stay decoupled** - Modules don't need direct dependencies

This transforms isolated modules into a connected network where each module can leverage the "skills" of others.

---

## Three Communication Mechanisms

### 1. Event Bus (Pub/Sub)

**Purpose**: Decoupled notifications when something happens

**Use When**:
- Something interesting happened that others might care about
- You want to notify without knowing who's listening
- You want to react to events from other modules

**Example**:
```typescript
// Module A publishes
this.publish("capture:thought-captured", {
    text: "New idea",
    tag: "project",
});

// Module B subscribes
this.subscribe("capture:thought-captured", (data) => {
    console.log("New thought:", data.text);
});
```

### 2. Capability Registry

**Purpose**: Discover what modules can do

**Use When**:
- You want to find modules that can help with a task
- You want to advertise what your module can do
- You want to query capabilities dynamically

**Example**:
```typescript
// Module A registers
this.registerCapability({
    id: "myOrgan:format-text",
    name: "Format Text",
    description: "Formats text with special styling",
    category: "formatting",
    organId: "myOrgan",
});

// Module B discovers
const formattingCaps = this.findCapabilities("formatting");
```

### 3. Service Requests

**Purpose**: Request work from other modules

**Use When**:
- You need another module to perform a specific task
- You want to use a capability you discovered
- You need a synchronous response

**Example**:
```typescript
// Module A registers service
this.registerService("myOrgan:format-text", async (params) => {
    return `**${params.text}**`;
});

// Module B requests service
const response = await this.requestService("myOrgan:format-text", {
    text: "Hello",
});
```

---

## Event Patterns

### Event Naming Convention

Use namespaced events: `organ:action`

**Good Examples**:
- `capture:thought-captured`
- `project:status-changed`
- `project:abandoned`
- `promotion:content-created`
- `energy:level-changed`

**Bad Examples**:
- `thoughtCaptured` (no namespace)
- `projectStatus` (not an action)
- `changed` (too generic)

### Common Event Types

**Lifecycle Events**:
- `organ:enabled` - Organ was enabled
- `organ:disabled` - Organ was disabled
- `organ:loaded` - Organ finished loading

**Data Events**:
- `data:created` - New data created
- `data:updated` - Data was updated
- `data:deleted` - Data was deleted

**State Events**:
- `state:changed` - State changed
- `status:updated` - Status updated

### Wildcard Subscriptions

Subscribe to all events for debugging or monitoring:

```typescript
this.subscribe("*", (data) => {
    console.log(`Event: ${data.event}`, data.data);
});
```

---

## Capability Patterns

### Capability Categories

Use consistent categories for grouping:

- `formatting` - Text/content formatting
- `analysis` - Data analysis and insights
- `query` - Finding/searching data
- `transformation` - Converting data formats
- `data` - Data operations
- `ui` - User interface operations

### Capability IDs

Format: `organId:capabilityName`

**Examples**:
- `capture:format-text`
- `projectPulse:analyze-status`
- `loreEngine:find-related`
- `loreEngine:analyze-connections`

### Capability Metadata

Include helpful metadata:

```typescript
this.registerCapability({
    id: "myOrgan:process",
    name: "Process Data",
    description: "Processes data with special logic",
    category: "transformation",
    organId: "myOrgan",
    metadata: {
        parameters: {
            data: "any - Data to process",
            options: "object (optional) - Processing options",
        },
        examples: [
            { data: "text", options: {} },
        ],
    },
});
```

---

## Service Request Patterns

### Service Handler Pattern

Always validate parameters and handle errors:

```typescript
this.registerService("myOrgan:process", async (params) => {
    const { data } = params;
    
    if (!data) {
        throw new Error("data parameter is required");
    }
    
    try {
        // Process data
        return { processed: processData(data) };
    } catch (error) {
        throw new Error(`Processing failed: ${error.message}`);
    }
});
```

### Service Request Pattern

Always check for success:

```typescript
const response = await this.requestService("myOrgan:process", {
    data: myData,
});

if (response.success) {
    // Use response.data
    console.log("Result:", response.data);
} else {
    // Handle error
    console.error("Error:", response.error);
}
```

### Timeout Handling

Services have a default timeout of 5000ms. Specify custom timeout:

```typescript
const response = await this.requestService(
    "myOrgan:slow-process",
    { data: myData },
    10000 // 10 second timeout
);
```

---

## Common Patterns

### Pattern 1: Event-Driven Updates

Module A publishes events, Module B reacts:

```typescript
// Module A
this.publish("data:updated", { id: "123", data: newData });

// Module B
this.subscribe("data:updated", async (data) => {
    await this.refreshDisplay(data.id);
});
```

### Pattern 2: Service Discovery

Module A discovers capabilities, then requests services:

```typescript
// Module A
const formattingCaps = this.findCapabilities("formatting");
if (formattingCaps.length > 0) {
    const response = await this.requestService(
        formattingCaps[0].id,
        { text: myText }
    );
}
```

### Pattern 3: Capability Advertisement

Module A registers capabilities when enabled:

```typescript
async onEnable(): Promise<void> {
    await super.onEnable();
    await this.registerCapabilities();
}

private async registerCapabilities(): Promise<void> {
    this.registerCapability({ /* ... */ });
    this.registerService("myOrgan:capability", async (params) => {
        // Handler
    });
}
```

### Pattern 4: Event Subscription on Enable

Module A subscribes to events when enabled:

```typescript
async onEnable(): Promise<void> {
    await super.onEnable();
    this.subscribeToEvents();
}

private subscribeToEvents(): void {
    this.subscribe("otherOrgan:event", (data) => {
        // Handle event
    });
}
```

---

## Best Practices

### 1. Register Early, Cleanup Automatically

Register capabilities and services in `onEnable()`, after `super.onEnable()`:

```typescript
async onEnable(): Promise<void> {
    await super.onEnable();
    await this.registerCapabilities(); // Register here
    this.subscribeToEvents(); // Subscribe here
}
```

Cleanup happens automatically in `onUnload()` via the base class.

### 2. Use Namespaced Events

Always use `organ:action` format:

```typescript
// Good
this.publish("capture:thought-captured", data);

// Bad
this.publish("thoughtCaptured", data);
```

### 3. Handle Service Errors

Always check `response.success`:

```typescript
const response = await this.requestService("capability", params);
if (!response.success) {
    console.error("Service failed:", response.error);
    return;
}
// Use response.data
```

### 4. Validate Service Parameters

Validate parameters in service handlers:

```typescript
this.registerService("myOrgan:process", async (params) => {
    if (!params.data) {
        throw new Error("data parameter is required");
    }
    // Process
});
```

### 5. Document Capabilities

Include helpful descriptions and metadata:

```typescript
this.registerCapability({
    id: "myOrgan:capability",
    name: "Clear Name",
    description: "What it does and when to use it",
    category: "appropriate-category",
    organId: this.getId(),
    metadata: {
        parameters: {
            param1: "type - description",
        },
    },
});
```

### 6. Don't Create Circular Dependencies

Avoid modules that depend on each other:

```typescript
// Bad: Module A requests service from B, B requests from A
// This can cause deadlocks or infinite loops
```

### 7. Use Events for Fire-and-Forget

Use events when you don't need a response:

```typescript
// Good: Just notify
this.publish("data:updated", data);

// Bad: Using service when you don't need response
await this.requestService("organ:notify", data);
```

### 8. Use Services for Work Requests

Use services when you need a result:

```typescript
// Good: Need the formatted result
const response = await this.requestService("organ:format", { text });
if (response.success) {
    useFormattedText(response.data);
}
```

---

## Migration Guide

### From Direct Dependencies to Communication

**Before** (Direct dependency):
```typescript
const loreEngine = this.kernel.getRegistry().get("loreEngine");
if (loreEngine) {
    const entities = loreEngine.findEntities(text);
}
```

**After** (Service request):
```typescript
const response = await this.requestService("loreEngine:find-related", {
    text: text,
});
if (response.success) {
    const entities = response.data;
}
```

**Benefits**:
- No direct dependency on Lore Engine
- Works even if Lore Engine is disabled
- More flexible and testable

---

## Examples

### Example 1: Capture Organ

**Publishes events** when thoughts are captured:
```typescript
this.publish("capture:thought-captured", {
    text,
    tag,
    filePath,
    timestamp: new Date().toISOString(),
});
```

**Registers capability** for formatting:
```typescript
this.registerCapability({
    id: "capture:format-text",
    name: "Format Captured Text",
    description: "Formats captured text with timestamp and optional tag",
    category: "formatting",
    organId: this.getId(),
});
```

### Example 2: Project Pulse Organ

**Subscribes to events** from Capture:
```typescript
this.subscribe("capture:thought-captured", (data) => {
    // Could track project activity
});
```

**Publishes events** when projects change:
```typescript
this.publish("project:abandoned", {
    name: project.name,
    path: project.path,
    daysAgo: project.daysAgo,
});
```

**Registers services** for analysis:
```typescript
this.registerService("projectPulse:analyze-status", async (params) => {
    const { projectPath } = params;
    return await this.scanProject(projectPath);
});
```

### Example 3: Promotion Organ

**Uses services** from Lore Engine:
```typescript
const response = await this.requestService("loreEngine:find-related", {
    text: content,
});
```

**Publishes events** when content is promoted:
```typescript
this.publish("promotion:content-created", {
    type,
    name,
    sourcePath,
    targetPath,
    timestamp: new Date().toISOString(),
});
```

**Subscribes to events** from Project Pulse:
```typescript
this.subscribe("project:abandoned", (data) => {
    // Could suggest promoting abandoned projects
});
```

---

## Troubleshooting

### Service Request Fails

**Check**:
1. Is the capability registered?
2. Is the service handler registered?
3. Is the providing organ enabled?
4. Are parameters correct?

**Debug**:
```typescript
const cap = this.queryCapability("organ:capability");
console.log("Capability:", cap);

const response = await this.requestService("organ:capability", params);
console.log("Response:", response);
```

### Events Not Received

**Check**:
1. Is the subscription active?
2. Is the event name correct?
3. Is the publishing organ enabled?

**Debug**:
```typescript
// Subscribe to all events to see what's happening
this.subscribe("*", (data) => {
    console.log("All events:", data);
});
```

### Capabilities Not Found

**Check**:
1. Is the capability registered?
2. Is the providing organ enabled?
3. Is the category/keyword correct?

**Debug**:
```typescript
const allCaps = this.findCapabilities();
console.log("All capabilities:", allCaps);

const categoryCaps = this.findCapabilities("formatting");
console.log("Formatting capabilities:", categoryCaps);
```

---

## Summary

The inter-module communication system enables:

1. **Events** - Decoupled notifications
2. **Capabilities** - Discovery of what modules can do
3. **Services** - Request work from other modules

This creates a network where modules can collaborate without tight coupling, making the system more flexible, testable, and maintainable.

---

**See Also**:
- [Developer Guide](../DEVELOPER_GUIDE.md) - Complete developer documentation
- [Module Dependencies](../MODULE_DEPENDENCIES.md) - Dependency patterns

