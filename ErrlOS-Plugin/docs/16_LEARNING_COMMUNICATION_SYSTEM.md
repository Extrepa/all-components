# Learning the Communication System

**For:** Developers new to the inter-module communication system  
**Goal:** Master all the "tools and guns" (Event Bus, Capabilities, Services)  
**Approach:** Hands-on, practical examples

---

## Overview: What You're Learning

The communication system has three main "tools":

1. **Event Bus** - The "radio" for broadcasting and listening
2. **Capability Registry** - The "phone book" for finding what others can do
3. **Service Router** - The "request system" for asking others to do work

Think of it like a prison network (staying with your metaphor):
- **Events** = Shouting across the yard (everyone can hear)
- **Capabilities** = Knowing who has what skills (the phone book)
- **Services** = Asking someone to do something for you (direct request)

---

## Part 1: Event Bus (The Radio)

### What It Does
Lets modules broadcast messages and listen to messages from others.

### Basic Operations

#### 1.1 Publishing Events (Shouting)

```typescript
// In your organ, when something interesting happens:
this.publish("myOrgan:something-happened", {
    importantData: "value",
    timestamp: new Date().toISOString(),
});
```

**When to Use:**
- Something happened that others might care about
- You want to notify without knowing who's listening
- You don't need a response

**Real Example:**
```typescript
// In CaptureOrgan - when a thought is captured
this.publish("capture:thought-captured", {
    text: "New idea",
    tag: "project",
    filePath: "ErrlOS/Capture.md",
    timestamp: new Date().toISOString(),
});
```

#### 1.2 Subscribing to Events (Listening)

```typescript
// In your organ's onEnable() or subscribeToEvents() method:
this.subscribe("otherOrgan:event-name", (data) => {
    console.log("I heard:", data);
    // Do something with the data
});
```

**When to Use:**
- You want to react to something another module does
- You want to stay updated on changes
- You want to coordinate with other modules

**Real Example:**
```typescript
// In ProjectPulseOrgan - listening for captures
this.subscribe("capture:thought-captured", (data) => {
    console.log("New thought captured:", data.text);
    // Could update project activity tracking
});
```

#### 1.3 Wildcard Subscriptions (Listening to Everything)

```typescript
// Listen to ALL events (useful for debugging)
this.subscribe("*", (data) => {
    console.log(`Event: ${data.event}`, data.data);
});
```

**When to Use:**
- Debugging (see all events)
- Monitoring/logging
- Development

#### 1.4 One-Time Subscriptions

```typescript
// Subscribe once, automatically unsubscribe after first event
this.once("otherOrgan:event", (data) => {
    console.log("Got it once:", data);
    // Automatically unsubscribes after this runs
});
```

**When to Use:**
- You only care about the first occurrence
- One-time initialization
- Waiting for a specific event once

#### 1.5 Unsubscribing

```typescript
// Store subscription ID
const subId = this.subscribe("event", handler);

// Later, unsubscribe
this.unsubscribe(subId);
```

**Note:** Usually you don't need to manually unsubscribe - cleanup happens automatically in `onUnload()`.

### Event Naming Rules

**Format:** `organId:action`

**Good Examples:**
- `capture:thought-captured`
- `project:status-changed`
- `project:abandoned`
- `promotion:content-created`
- `energy:level-changed`

**Bad Examples:**
- `thoughtCaptured` (no namespace)
- `projectStatus` (not an action)
- `changed` (too generic)

### Practice Exercise 1: Event Bus

**Task:** Add event publishing to an organ

1. Pick an organ (or create a simple test organ)
2. Find something interesting that happens
3. Publish an event when it happens
4. Subscribe to that event from another organ
5. Verify it works in console

**Example:**
```typescript
// In your organ
async onEnable(): Promise<void> {
    await super.onEnable();
    // Subscribe to your own event for testing
    this.subscribe("myOrgan:test-event", (data) => {
        console.log("Received my own event:", data);
    });
}

// Later, when something happens:
this.publish("myOrgan:test-event", { message: "Hello!" });
```

---

## Part 2: Capability Registry (The Phone Book)

### What It Does
Lets modules advertise what they can do and discover what others can do.

### Basic Operations

#### 2.1 Registering a Capability (Adding Yourself to the Phone Book)

```typescript
// In your organ's onEnable(), after super.onEnable():
this.registerCapability({
    id: "myOrgan:do-something",
    name: "Do Something",
    description: "Does something useful",
    category: "transformation", // or "formatting", "analysis", "query", etc.
    organId: this.getId(),
    metadata: {
        parameters: {
            input: "string - The input to process",
            options: "object (optional) - Processing options",
        },
    },
});
```

**When to Use:**
- You want others to know what you can do
- You want to provide a service
- You want to be discoverable

**Real Example:**
```typescript
// In CaptureOrgan
this.registerCapability({
    id: "capture:format-text",
    name: "Format Captured Text",
    description: "Formats captured text with timestamp and optional tag",
    category: "formatting",
    organId: this.getId(),
    metadata: {
        parameters: {
            text: "string - The text to format",
            tag: "string (optional) - Tag to add to the entry",
        },
    },
});
```

#### 2.2 Discovering Capabilities (Looking Up in the Phone Book)

```typescript
// Find all formatting capabilities
const formattingCaps = this.findCapabilities("formatting");

// Search by keyword
const textCaps = this.findCapabilities(undefined, "text");

// Find by category AND keyword
const specificCaps = this.findCapabilities("formatting", "text");

// Get all capabilities
const allCaps = this.findCapabilities();
```

**When to Use:**
- You need to find a module that can do something
- You want to see what's available
- You want to dynamically discover functionality

**Real Example:**
```typescript
// Find formatting capabilities
const formatters = this.findCapabilities("formatting");
if (formatters.length > 0) {
    console.log("Available formatters:", formatters);
    // Use the first one
    const response = await this.requestService(formatters[0].id, params);
}
```

#### 2.3 Querying a Specific Capability

```typescript
// Get a specific capability by ID
const cap = this.queryCapability("capture:format-text");
if (cap) {
    console.log("Found capability:", cap.name);
    console.log("Description:", cap.description);
    console.log("Parameters:", cap.metadata?.parameters);
}
```

**When to Use:**
- You know the exact capability ID
- You want to check if it exists
- You want to see its details

### Capability Categories

Use consistent categories:
- `formatting` - Text/content formatting
- `analysis` - Data analysis and insights
- `query` - Finding/searching data
- `transformation` - Converting data formats
- `data` - Data operations
- `ui` - User interface operations

### Practice Exercise 2: Capability Registry

**Task:** Register and discover capabilities

1. Register a capability in your organ
2. From another organ, discover it by category
3. Discover it by keyword search
4. Query it by ID
5. Verify it's registered correctly

**Example:**
```typescript
// In Organ A
this.registerCapability({
    id: "organA:process",
    name: "Process Data",
    description: "Processes data in a special way",
    category: "transformation",
    organId: this.getId(),
});

// In Organ B
const caps = this.findCapabilities("transformation");
console.log("Found:", caps); // Should include organA:process
```

---

## Part 3: Service Router (The Request System)

### What It Does
Lets modules request work from other modules and get results back.

### Basic Operations

#### 3.1 Registering a Service Handler (Saying "I Can Do That")

```typescript
// Register a service handler for your capability
this.registerService("myOrgan:do-something", async (params) => {
    // Validate parameters
    const { input, options } = params;
    if (!input || typeof input !== "string") {
        throw new Error("input parameter is required and must be a string");
    }
    
    // Do the work
    const result = processInput(input, options);
    
    // Return the result
    return result;
});
```

**When to Use:**
- You registered a capability and want to handle requests
- You want to provide functionality to other modules
- You want to expose a service

**Real Example:**
```typescript
// In CaptureOrgan
this.registerService("capture:format-text", async (params) => {
    const { text, tag } = params;
    if (!text || typeof text !== "string") {
        throw new Error("Text parameter is required and must be a string");
    }
    
    const timestamp = new Date().toISOString();
    const tagLine = tag ? ` #${tag}` : "";
    return `---\n**${timestamp}**${tagLine}\n${text}\n`;
});
```

#### 3.2 Requesting a Service (Asking Someone to Do Work)

```typescript
// Request a service
const response = await this.requestService("otherOrgan:do-something", {
    input: "my data",
    options: { mode: "fast" },
});

// Always check for success
if (response.success) {
    console.log("Result:", response.data);
    // Use the result
} else {
    console.error("Error:", response.error);
    // Handle the error
}
```

**When to Use:**
- You need another module to do work for you
- You discovered a capability and want to use it
- You need a result back

**Real Example:**
```typescript
// In PromotionOrgan
const response = await this.requestService("loreEngine:find-related", {
    text: content,
});

if (response.success && response.data) {
    console.log(`Found ${response.data.length} related entities`);
    // Use the related entities
} else {
    console.error("Could not find related entities:", response.error);
}
```

#### 3.3 Custom Timeout

```typescript
// Request with custom timeout (default is 5000ms)
const response = await this.requestService(
    "otherOrgan:slow-process",
    { data: myData },
    10000 // 10 second timeout
);
```

**When to Use:**
- Service might take longer than 5 seconds
- You want to allow more time
- You want to fail faster for quick operations

### Service Request Flow

1. **Module A** registers capability and service handler
2. **Module B** discovers the capability
3. **Module B** requests the service with parameters
4. **Service Router** validates and routes to Module A's handler
5. **Module A** processes and returns result
6. **Module B** receives response

### Practice Exercise 3: Service Router

**Task:** Create a service and use it

1. Register a capability
2. Register a service handler for it
3. From another organ, request the service
4. Verify it works
5. Test error handling (invalid parameters)

**Example:**
```typescript
// In Organ A - Register service
this.registerCapability({
    id: "organA:add-numbers",
    name: "Add Numbers",
    description: "Adds two numbers together",
    category: "data",
    organId: this.getId(),
});

this.registerService("organA:add-numbers", async (params) => {
    const { a, b } = params;
    if (typeof a !== "number" || typeof b !== "number") {
        throw new Error("Both a and b must be numbers");
    }
    return a + b;
});

// In Organ B - Use service
const response = await this.requestService("organA:add-numbers", {
    a: 5,
    b: 3,
});

if (response.success) {
    console.log("Sum:", response.data); // Should be 8
}
```

---

## Part 4: Complete Integration Pattern

### The Full Pattern

Here's how to integrate communication into a new organ:

```typescript
export class MyOrgan extends Organ {
    async onEnable(): Promise<void> {
        await super.onEnable();
        await this.registerCommands();
        await this.registerCapabilities(); // Register what you can do
        this.subscribeToEvents(); // Listen to others
    }

    /**
     * Register capabilities that this organ provides
     */
    private async registerCapabilities(): Promise<void> {
        // Register capability
        this.registerCapability({
            id: "myOrgan:process",
            name: "Process Data",
            description: "Processes data",
            category: "transformation",
            organId: this.getId(),
        });

        // Register service handler
        this.registerService("myOrgan:process", async (params) => {
            // Validate
            if (!params.data) {
                throw new Error("data parameter required");
            }
            // Process
            return processData(params.data);
        });
    }

    /**
     * Subscribe to events from other modules
     */
    private subscribeToEvents(): void {
        // Listen for events
        this.subscribe("otherOrgan:event", (data) => {
            // React to event
            this.handleEvent(data);
        });
    }

    /**
     * Do something that publishes an event
     */
    private async doSomething(): Promise<void> {
        // Do work
        const result = await this.work();
        
        // Publish event
        this.publish("myOrgan:work-done", {
            result,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Use a service from another module
     */
    private async useOtherService(): Promise<void> {
        // Discover capability
        const caps = this.findCapabilities("formatting");
        if (caps.length === 0) {
            console.log("No formatters available");
            return;
        }

        // Request service
        const response = await this.requestService(caps[0].id, {
            text: "Hello",
        });

        if (response.success) {
            console.log("Formatted:", response.data);
        } else {
            console.error("Error:", response.error);
        }
    }
}
```

---

## Part 5: Common Patterns

### Pattern 1: Event-Driven Updates

**Scenario:** Module A does something, Module B reacts

```typescript
// Module A
this.publish("data:updated", { id: "123", data: newData });

// Module B
this.subscribe("data:updated", async (data) => {
    await this.refreshDisplay(data.id);
});
```

### Pattern 2: Service Discovery

**Scenario:** Find a capability, then use it

```typescript
// Find formatting capabilities
const formatters = this.findCapabilities("formatting");
if (formatters.length > 0) {
    const response = await this.requestService(formatters[0].id, {
        text: myText,
    });
    if (response.success) {
        useFormattedText(response.data);
    }
}
```

### Pattern 3: Capability Advertisement

**Scenario:** Advertise what you can do when enabled

```typescript
async onEnable(): Promise<void> {
    await super.onEnable();
    await this.registerCapabilities(); // Advertise
}

private async registerCapabilities(): Promise<void> {
    this.registerCapability({ /* ... */ });
    this.registerService("myOrgan:capability", async (params) => {
        // Handle request
    });
}
```

### Pattern 4: Event Subscription on Enable

**Scenario:** Start listening when enabled

```typescript
async onEnable(): Promise<void> {
    await super.onEnable();
    this.subscribeToEvents(); // Start listening
}

private subscribeToEvents(): void {
    this.subscribe("otherOrgan:event", (data) => {
        // Handle event
    });
}
```

---

## Part 6: Debugging & Troubleshooting

### Debugging Events

```typescript
// Subscribe to all events to see what's happening
this.subscribe("*", (data) => {
    console.log(`[DEBUG] Event: ${data.event}`, data.data);
});
```

### Debugging Capabilities

```typescript
// See all registered capabilities
const allCaps = this.findCapabilities();
console.log("All capabilities:", allCaps);

// See capabilities by category
const formattingCaps = this.findCapabilities("formatting");
console.log("Formatting capabilities:", formattingCaps);
```

### Debugging Services

```typescript
// Check if capability exists
const cap = this.queryCapability("organ:capability");
console.log("Capability:", cap);

// Request service and log response
const response = await this.requestService("organ:capability", params);
console.log("Service response:", response);
```

### Common Issues

**Issue:** Service request fails
- Check if capability is registered
- Check if service handler is registered
- Check if organ is enabled
- Check parameters

**Issue:** Event not received
- Check event name matches exactly
- Check subscription is active
- Check publishing organ is enabled
- Use wildcard subscription to debug

**Issue:** Capability not found
- Check capability ID format
- Check organ is enabled
- Check capability is registered in onEnable()

---

## Part 7: Best Practices

### 1. Register Early, Cleanup Automatically

```typescript
async onEnable(): Promise<void> {
    await super.onEnable(); // Always call first
    await this.registerCapabilities(); // Register here
    this.subscribeToEvents(); // Subscribe here
}
// Cleanup happens automatically in onUnload()
```

### 2. Use Namespaced Events

```typescript
// Good
this.publish("myOrgan:action", data);

// Bad
this.publish("action", data);
```

### 3. Always Check Service Response

```typescript
const response = await this.requestService("capability", params);
if (!response.success) {
    console.error("Service failed:", response.error);
    return;
}
// Use response.data
```

### 4. Validate Service Parameters

```typescript
this.registerService("myOrgan:process", async (params) => {
    if (!params.data) {
        throw new Error("data parameter is required");
    }
    // Process
});
```

### 5. Document Capabilities Well

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

---

## Part 8: Hands-On Exercises

### Exercise 1: Basic Event Flow
1. Create a simple organ that publishes an event
2. Create another organ that subscribes to it
3. Verify the event is received
4. Check console for messages

### Exercise 2: Capability Discovery
1. Register a capability in one organ
2. Discover it from another organ
3. Search for it by category
4. Search for it by keyword

### Exercise 3: Service Request
1. Register a capability and service handler
2. Request the service from another organ
3. Verify the response
4. Test error handling

### Exercise 4: Complete Integration
1. Create an organ that:
   - Publishes events
   - Registers capabilities
   - Provides services
   - Subscribes to events
   - Uses services from others
2. Test all functionality
3. Verify cleanup works

---

## Part 9: Real-World Examples

### Example 1: Capture Organ

**What it does:**
- Publishes `capture:thought-captured` when a thought is captured
- Registers `capture:format-text` capability
- Provides formatting service

**Key Code:**
```typescript
// Publish event
this.publish("capture:thought-captured", {
    text, tag, filePath, timestamp
});

// Register capability and service
this.registerCapability({ id: "capture:format-text", ... });
this.registerService("capture:format-text", async (params) => {
    // Format text
});
```

### Example 2: Project Pulse Organ

**What it does:**
- Subscribes to `capture:thought-captured`
- Publishes `project:status-changed` and `project:abandoned`
- Registers `projectPulse:analyze-status` and `projectPulse:find-abandoned`
- Provides analysis services

**Key Code:**
```typescript
// Subscribe
this.subscribe("capture:thought-captured", (data) => {
    // React to capture
});

// Publish
this.publish("project:abandoned", { name, path, daysAgo });

// Register services
this.registerService("projectPulse:analyze-status", async (params) => {
    // Analyze project
});
```

### Example 3: Promotion Organ

**What it does:**
- Uses `loreEngine:find-related` service
- Publishes `promotion:content-created`
- Subscribes to `project:status-changed` and `project:abandoned`

**Key Code:**
```typescript
// Use service
const response = await this.requestService("loreEngine:find-related", {
    text: content,
});

// Publish
this.publish("promotion:content-created", { type, name, ... });

// Subscribe
this.subscribe("project:abandoned", (data) => {
    // React to abandoned project
});
```

---

## Part 10: Advanced Topics

### 10.1 Event Filtering

You can filter events in your handler:

```typescript
this.subscribe("project:status-changed", (data) => {
    if (data.status === "abandoned") {
        // Only react to abandoned projects
        this.handleAbandonedProject(data);
    }
});
```

### 10.2 Service Chaining

You can chain service requests:

```typescript
// Request service A
const responseA = await this.requestService("organA:process", params);
if (responseA.success) {
    // Use result to request service B
    const responseB = await this.requestService("organB:format", {
        data: responseA.data,
    });
}
```

### 10.3 Conditional Service Registration

Only register services if dependencies exist:

```typescript
private async registerCapabilities(): Promise<void> {
    // Only register if dependency exists
    if (this.kernel.isOrganEnabled("dependency")) {
        this.registerCapability({ /* ... */ });
        this.registerService("myOrgan:service", async (params) => {
            // Use dependency
        });
    }
}
```

---

## Quick Reference

### Event Bus
```typescript
// Publish
this.publish("organ:action", data);

// Subscribe
this.subscribe("organ:action", (data) => { /* ... */ });

// Once
this.once("organ:action", (data) => { /* ... */ });

// Unsubscribe
this.unsubscribe(subscriptionId);
```

### Capability Registry
```typescript
// Register
this.registerCapability({ id, name, description, category, organId });

// Find by category
this.findCapabilities("category");

// Search
this.findCapabilities(undefined, "keyword");

// Query
this.queryCapability("organ:capability");
```

### Service Router
```typescript
// Register
this.registerService("organ:capability", async (params) => {
    return result;
});

// Request
const response = await this.requestService("organ:capability", params);
if (response.success) {
    useResult(response.data);
}
```

---

## Learning Path

### Week 1: Basics
- Day 1-2: Learn Event Bus (publish/subscribe)
- Day 3-4: Learn Capability Registry (register/discover)
- Day 5: Learn Service Router (register/request)

### Week 2: Integration
- Day 1-2: Integrate into an existing organ
- Day 3-4: Create a new organ with communication
- Day 5: Test and debug

### Week 3: Advanced
- Day 1-2: Complex patterns (chaining, filtering)
- Day 3-4: Performance optimization
- Day 5: Best practices and review

---

## Resources

- **Developer Guide:** `DEVELOPER_GUIDE.md` - Complete API reference
- **Communication Guide:** `docs/15_INTER_MODULE_COMMUNICATION.md` - Deep dive
- **Examples:** See `src/organs/capture/`, `src/organs/projectPulse/`, etc.
- **Validation Report:** `logs/COMMUNICATION_SYSTEM_VALIDATION_2025-12-15.md`

---

## Getting Help

### Debugging Checklist:
1. Is the organ enabled?
2. Is the capability registered?
3. Is the service handler registered?
4. Are event names correct?
5. Are parameters valid?
6. Check console for errors

### Common Mistakes:
- Forgetting to call `super.onEnable()`
- Registering capabilities before organ is enabled
- Not checking `response.success` before using data
- Using wrong event/capability names
- Not validating service parameters

---

**Remember:** Start simple, test often, use the examples as guides. The system is designed to be easy to use - you'll get the hang of it quickly!

---

**Learning Guide Created:** 2025-12-15  
**Next:** Start with Part 1 (Event Bus) and work through the exercises

