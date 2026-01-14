# Errl OS Plugin - Developer Guide

## Architecture Overview

Errl OS uses an **organ-based architecture** where each feature is an independent, optional module called an "organ". Organs register with a central kernel that manages their lifecycle and provides shared services.

## Core Components

### Kernel System

**ErrlKernel** (`src/kernel/ErrlKernel.ts`)
- Central orchestrator
- Manages organ registration and lifecycle
- Provides settings management
- Exposes shared APIs

**ModuleRegistry** (`src/kernel/ModuleRegistry.ts`)
- Tracks all registered organs
- Handles loading, enabling, disabling
- Manages organ state

**SharedAPIs** (`src/kernel/SharedAPIs.ts`)
- Common services for all organs
- Capture, logging, file scanning
- Centralized Obsidian API interactions

### Base Organ Class

**Organ** (`src/organs/base/Organ.ts`)
- Abstract base class for all organs
- Defines lifecycle methods
- Provides common functionality

## Testing

### Running Tests

The plugin uses Jest for automated testing. See [TESTING_GUIDE.md](TESTING_GUIDE.md) for complete testing documentation.

**Quick Start:**
```bash
# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Test Structure:**
- Unit tests: `tests/unit/` - Test individual components
- Integration tests: `tests/integration/` - Test organ interactions

**Note:** If npm install fails, see [NPM_INSTALL_FIX.md](NPM_INSTALL_FIX.md) for solutions.

## Creating a New Organ

### Step 1: Create Organ File

Create a new file: `src/organs/yourOrgan/YourOrgan.ts`

```typescript
import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin } from "obsidian";

export class YourOrgan extends Organ {
    constructor(kernel: ErrlKernel, plugin: Plugin) {
        super(kernel, plugin);
    }

    getId(): string {
        return "yourOrgan";
    }

    getName(): string {
        return "Your Organ";
    }

    async onLoad(): Promise<void> {
        // Load settings, initialize resources
    }

    async onUnload(): Promise<void> {
        // Cleanup resources
    }

    async onEnable(): Promise<void> {
        await super.onEnable();
        await this.registerCommands();
    }

    async registerCommands(): Promise<void> {
        this.plugin.addCommand({
            id: "your-organ-command",
            name: "Your Organ Command",
            callback: () => {
                // Command implementation
            },
        });
    }
}
```

### Step 2: Register Organ

In `src/main.ts`:

```typescript
import { YourOrgan } from "./organs/yourOrgan/YourOrgan";

// In onload():
this.kernel.registerOrgan(new YourOrgan(this.kernel, this));
```

### Step 3: Add Settings

In `src/settings/ErrlSettings.ts`:

```typescript
export interface ErrlSettings {
    // ... existing settings
    yourOrganPath: string;
    enabledOrgans: {
        // ... existing organs
        yourOrgan: boolean;
    };
}

export const DEFAULT_SETTINGS: ErrlSettings = {
    // ... existing defaults
    yourOrganPath: "ErrlOS/YourOrgan/",
    enabledOrgans: {
        // ... existing organs
        yourOrgan: false,
    },
};
```

### Step 4: Add Settings UI

In `src/settings/ErrlSettingsTab.ts`:

```typescript
// In display() method:
new Setting(containerEl)
    .setName("Your Organ Path")
    .setDesc("Path for your organ files")
    .addText((text) => {
        text
            .setPlaceholder("ErrlOS/YourOrgan/")
            .setValue(settings.yourOrganPath)
            .onChange(async (value) => {
                await this.kernel.updateSettings({
                    yourOrganPath: value,
                });
            });
    });

// In organ toggles array:
{ id: "yourOrgan", name: "Your Organ", desc: "Description" }
```

## Organ Lifecycle

1. **Registration**: Organ is registered with kernel in `main.ts`
2. **Loading**: `onLoad()` called during kernel initialization
3. **Enabling**: `onEnable()` called if organ is enabled in settings
4. **Command Registration**: `registerCommands()` called after enabling
5. **Disabling**: `onDisable()` called when organ is disabled
6. **Unloading**: `onUnload()` called when plugin unloads

## Using Shared APIs

Access shared APIs through the kernel:

```typescript
// In your organ:
const sharedAPIs = this.kernel.getSharedAPIs();

// Capture text
await sharedAPIs.capture("Text to capture", "path/to/file.md", "tag");

// Log message
await sharedAPIs.log("Log message", "path/to/log.md");

// Get files modified recently
const recentFiles = sharedAPIs.getFilesModifiedSince(7); // last 7 days

// Get files in directory
const files = sharedAPIs.getFilesInDirectory("Projects/");
```

## Accessing Settings

```typescript
// Get settings
const settings = this.kernel.getSettings();

// Update settings
await this.kernel.updateSettings({
    yourSetting: "new value",
});
```

## Dashboard Integration

To add content to the dashboard:

1. Get your organ from registry in `DashboardOrgan.ts`:

```typescript
const yourOrgan = this.kernel.getRegistry().get("yourOrgan") as YourOrgan | undefined;
if (yourOrgan && this.kernel.isOrganEnabled("yourOrgan")) {
    // Get data from your organ
    const data = await yourOrgan.getData();
    // Add to dashboard content
}
```

2. Use interactive buttons:

```html
<button data-errl-cmd="errl-os:your-command" class="errl-btn">
    Your Button
</button>

<span data-errl-open="path/to/file.md" style="cursor: pointer;">
    Clickable Link
</span>
```

## Error Handling

Always wrap async operations in try-catch:

```typescript
try {
    await someAsyncOperation();
} catch (error) {
    console.error("[Errl OS] Error in YourOrgan:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    new Notice(`Failed: ${errorMessage}`);
}
```

Use consistent console logging:
- `[Errl OS]` prefix for all logs
- Include organ name in error messages
- Log errors before showing notices

## Inter-Module Communication

Errl OS provides three mechanisms for modules to communicate and collaborate:

### 1. Event Bus (Pub/Sub)

Modules can publish and subscribe to events for decoupled communication:

```typescript
// In onEnable() or when needed:
this.subscribe("capture:thought-captured", (data) => {
    console.log("A thought was captured:", data);
});

// Publish an event
this.publish("project:status-changed", {
    name: "My Project",
    status: "active",
});
```

**Event Naming Convention**: Use namespaced events like `organ:action` (e.g., `capture:thought-captured`, `project:abandoned`)

**Wildcard Subscriptions**: Subscribe to all events with `"*"`:
```typescript
this.subscribe("*", (data) => {
    console.log("Any event:", data.event, data.data);
});
```

### 2. Capability Registry

Modules can register what they can do and discover capabilities from other modules:

```typescript
// Register a capability
this.registerCapability({
    id: "myOrgan:format-text",
    name: "Format Text",
    description: "Formats text with special styling",
    category: "formatting",
    organId: this.getId(),
    metadata: {
        parameters: {
            text: "string - Text to format",
        },
    },
});

// Find capabilities
const formattingCaps = this.findCapabilities("formatting");
const searchResults = this.findCapabilities(undefined, "text");

// Query a specific capability
const cap = this.queryCapability("myOrgan:format-text");
```

### 3. Service Requests

Modules can request services from other modules:

```typescript
// Register a service handler
this.registerService("myOrgan:format-text", async (params) => {
    const { text } = params;
    return `**${text}**`; // Format the text
});

// Request a service
const response = await this.requestService("myOrgan:format-text", {
    text: "Hello",
});

if (response.success) {
    console.log("Formatted:", response.data);
} else {
    console.error("Error:", response.error);
}
```

**Service Request Flow**:
1. Module A registers a capability and service handler
2. Module B discovers the capability via registry
3. Module B requests the service with parameters
4. Service Router routes the request to Module A's handler
5. Module B receives the response

### Example: Complete Communication Flow

```typescript
export class MyOrgan extends Organ {
    async onEnable(): Promise<void> {
        await super.onEnable();
        await this.registerCommands();
        await this.registerCapabilities();
        this.subscribeToEvents();
    }

    private async registerCapabilities(): Promise<void> {
        // Register what we can do
        this.registerCapability({
            id: "myOrgan:process-data",
            name: "Process Data",
            description: "Processes data with special logic",
            category: "transformation",
            organId: this.getId(),
        });

        // Register service handler
        this.registerService("myOrgan:process-data", async (params) => {
            const { data } = params;
            // Process the data
            return { processed: data.toUpperCase() };
        });
    }

    private subscribeToEvents(): void {
        // Listen for events from other modules
        this.subscribe("capture:thought-captured", async (data) => {
            // Use a service from another module
            const response = await this.requestService("otherOrgan:analyze", {
                text: data.text,
            });

            if (response.success) {
                this.publish("myOrgan:analysis-complete", {
                    original: data.text,
                    analysis: response.data,
                });
            }
        });
    }
}
```

### Best Practices for Communication

1. **Use Events for Notifications**: When something happens that others might care about
2. **Use Services for Actions**: When you need to request work from another module
3. **Register Capabilities Early**: In `onEnable()` after calling `super.onEnable()`
4. **Handle Service Errors**: Always check `response.success` before using `response.data`
5. **Use Namespaced Events**: Follow `organ:action` pattern for clarity
6. **Cleanup Automatically**: Subscriptions, capabilities, and services are cleaned up on unload

## Best Practices

1. **Keep Organs Independent**: Don't depend on other organs (use communication instead)
2. **Use Shared APIs**: Don't duplicate functionality
3. **Handle Errors Gracefully**: Always catch errors and provide user feedback
4. **Respect Settings**: Check if organ is enabled before operations
5. **Document Public Methods**: Add JSDoc comments
6. **Follow Naming Conventions**: Use consistent naming patterns
7. **Use Communication Patterns**: Prefer events/services over direct dependencies

## File Structure

```
src/
├── kernel/              # Core system
│   ├── ErrlKernel.ts
│   ├── ModuleRegistry.ts
│   └── SharedAPIs.ts
├── organs/
│   ├── base/
│   │   └── Organ.ts     # Base class
│   ├── dashboard/
│   ├── capture/
│   ├── projectPulse/
│   └── timeMachine/
├── settings/
│   ├── ErrlSettings.ts
│   └── ErrlSettingsTab.ts
├── utils/
│   └── fileUtils.ts
└── main.ts
```

## Testing Your Organ

1. Enable your organ in settings
2. Test all commands
3. Verify settings persistence
4. Test enable/disable
5. Check error handling
6. Verify dashboard integration (if applicable)

## Example: Simple Organ

Here's a minimal example:

```typescript
import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin, Notice } from "obsidian";

export class ExampleOrgan extends Organ {
    constructor(kernel: ErrlKernel, plugin: Plugin) {
        super(kernel, plugin);
    }

    getId(): string { return "example"; }
    getName(): string { return "Example"; }

    async onLoad(): Promise<void> {
        // Load settings if needed
    }

    async onUnload(): Promise<void> {
        // Cleanup
    }

    async onEnable(): Promise<void> {
        await super.onEnable();
        await this.registerCommands();
    }

    async registerCommands(): Promise<void> {
        this.plugin.addCommand({
            id: "example-command",
            name: "Example Command",
            callback: () => {
                new Notice("Example organ works!");
            },
        });
    }
}
```

## API Reference

### ErrlKernel

- `getSettings()`: Get current settings
- `updateSettings(updates)`: Update settings
- `getRegistry()`: Get module registry
- `getSharedAPIs()`: Get shared APIs
- `getEventBus()`: Get event bus for pub/sub
- `getCapabilityRegistry()`: Get capability registry
- `getServiceRouter()`: Get service router
- `enableOrgan(id)`: Enable an organ
- `disableOrgan(id)`: Disable an organ
- `isOrganEnabled(id)`: Check if organ is enabled

### SharedAPIs

- `capture(text, filePath, tag?)`: Append text to capture file
- `log(message, logPath)`: Write to log file
- `getFilesModifiedSince(days)`: Get recently modified files
- `getFilesInDirectory(dirPath)`: Get files in directory (recursive)

### Organ Base Class

- `getId()`: Return organ ID
- `getName()`: Return organ name
- `onLoad()`: Called during initialization
- `onUnload()`: Called during cleanup
- `onEnable()`: Called when organ is enabled
- `onDisable()`: Called when organ is disabled
- `registerCommands()`: Register organ commands
- `isEnabled()`: Check if organ is enabled

**Communication Methods**:
- `publish(event, data?)`: Publish an event
- `subscribe(event, handler)`: Subscribe to an event
- `once(event, handler)`: Subscribe to an event once
- `unsubscribe(subscriptionId)`: Unsubscribe from an event
- `registerCapability(capability)`: Register a capability
- `unregisterCapability(capabilityId)`: Unregister a capability
- `findCapabilities(category?, keyword?)`: Find capabilities
- `queryCapability(capabilityId)`: Get a capability by ID
- `registerService(capabilityId, handler)`: Register a service handler
- `unregisterService(capabilityId)`: Unregister a service handler
- `requestService(capabilityId, params, timeout?)`: Request a service

## Contributing

When adding new organs:

1. Follow the organ-based architecture
2. Keep organs independent and optional
3. Use shared APIs for common functionality
4. Add proper error handling
5. Document public methods
6. Test thoroughly
7. Update settings and UI
8. Consider dashboard integration

## Organ Development Guide

### Step-by-Step Organ Creation

#### Step 1: Create Organ File

Create a new file: `src/organs/yourOrgan/YourOrgan.ts`

```typescript
import { Organ } from "../base/Organ";
import { ErrlKernel } from "../../kernel/ErrlKernel";
import { Plugin } from "obsidian";

export class YourOrgan extends Organ {
    constructor(kernel: ErrlKernel, plugin: Plugin) {
        super(kernel, plugin);
    }

    getId(): string {
        return "yourOrgan";
    }

    getName(): string {
        return "Your Organ";
    }

    async onLoad(): Promise<void> {
        // Load settings, initialize data
    }

    async onEnable(): Promise<void> {
        await super.onEnable();
        await this.registerCommands();
        // Register capabilities, subscribe to events
    }

    async registerCommands(): Promise<void> {
        this.plugin.addCommand({
            id: "your-command",
            name: "Your Command",
            callback: () => {
                // Command implementation
            },
        });
    }
}
```

#### Step 2: Register in main.ts

Add to `src/main.ts`:

```typescript
import { YourOrgan } from "./organs/yourOrgan/YourOrgan";

// In onload():
this.kernel.registerOrgan(new YourOrgan(this.kernel, this));
```

#### Step 3: Add Settings

Add settings to `src/settings/ErrlSettings.ts`:

```typescript
export interface ErrlSettings {
    // ... existing settings
    yourOrganPath: string;
    yourOrganEnabled: boolean;
}

export const DEFAULT_SETTINGS: ErrlSettings = {
    // ... existing defaults
    yourOrganPath: "",
    yourOrganEnabled: false,
};
```

#### Step 4: Add Settings UI

Add to `src/settings/ErrlSettingsTab.ts`:

```typescript
// In display():
new Setting(containerEl)
    .setName("Your Organ Path")
    .setDesc("Path for your organ")
    .addText((text) => {
        text
            .setPlaceholder("YourPath/")
            .setValue(settings.yourOrganPath)
            .onChange(async (value) => {
                await this.kernel.updateSettings({
                    yourOrganPath: value,
                });
            });
    });

// In organ toggles:
{ id: "yourOrgan", name: "Your Organ", desc: "Description" }
```

#### Step 5: Add Dashboard Integration (Optional)

Add to `src/organs/dashboard/DashboardOrgan.ts` in `generateDashboardContent()`:

```typescript
if (!this.isCardHidden("yourOrgan")) {
    content += `<div class="errl-card">
  <div class="errl-card-title">Your Organ</div>
  <button data-errl-cmd="errl-os:your-command" class="errl-btn">Action</button>
</div>\n\n`;
}
```

### Best Practices

1. **Error Handling**
   - Always wrap file operations in try-catch
   - Show user-friendly notices for errors
   - Log errors to console for debugging

2. **Settings Management**
   - Load settings in `onLoad()`
   - Validate paths before using
   - Provide helpful error messages

3. **User Feedback**
   - Use `Notice` for important messages
   - Show progress for long operations
   - Provide clear error messages

4. **Performance**
   - Cache expensive operations
   - Use async/await properly
   - Avoid blocking the main thread

5. **Integration**
   - Use SharedAPIs for common operations
   - Publish events for other organs
   - Subscribe to relevant events

### Common Patterns

#### Pattern 1: File Scanning

```typescript
async scanFiles(path: string): Promise<TFile[]> {
    const folder = this.plugin.app.vault.getAbstractFileByPath(path);
    if (!folder || !(folder instanceof TFolder)) {
        return [];
    }
    
    const files: TFile[] = [];
    for (const child of folder.children) {
        if (child instanceof TFile) {
            files.push(child);
        } else if (child instanceof TFolder) {
            files.push(...await this.scanFiles(child.path));
        }
    }
    return files;
}
```

#### Pattern 2: Settings Validation

```typescript
private validatePath(path: string): boolean {
    if (!path || path.trim() === "") {
        return false;
    }
    
    const file = this.plugin.app.vault.getAbstractFileByPath(path);
    return file instanceof TFolder;
}
```

#### Pattern 3: Command with User Feedback

```typescript
this.plugin.addCommand({
    id: "your-command",
    name: "Your Command",
    callback: async () => {
        try {
            // Do work
            new Notice("Success!");
        } catch (error) {
            console.error("[Your Organ] Error:", error);
            new Notice("Error: " + (error instanceof Error ? error.message : String(error)));
        }
    },
});
```

## API Reference

### ErrlKernel Methods

- `getSettings(): ErrlSettings` - Get current settings
- `updateSettings(updates: Partial<ErrlSettings>): Promise<void>` - Update settings
- `registerOrgan(organ: Organ): void` - Register an organ
- `getRegistry(): ModuleRegistry` - Get module registry
- `getSharedAPIs(): SharedAPIs` - Get shared APIs
- `enableOrgan(id: string): Promise<void>` - Enable an organ
- `disableOrgan(id: string): Promise<void>` - Disable an organ
- `isOrganEnabled(id: string): boolean` - Check if organ is enabled

### SharedAPIs Methods

- `async captureThought(text: string, tags?: string[]): Promise<void>` - Capture a thought
- `async logEntry(path: string, content: string): Promise<void>` - Log an entry
- `async scanFiles(path: string, extensions?: string[]): Promise<TFile[]>` - Scan for files

### Organ Base Class Methods

- `getId(): string` - Get organ ID
- `getName(): string` - Get organ name
- `async onLoad(): Promise<void>` - Called when organ loads
- `async onEnable(): Promise<void>` - Called when organ enables
- `async onDisable(): Promise<void>` - Called when organ disables
- `async onUnload(): Promise<void>` - Called when organ unloads
- `registerCapability(capability: Capability): void` - Register a capability
- `registerService(capabilityId: string, handler: ServiceHandler): void` - Register a service
- `publish(event: string, data: any): void` - Publish an event
- `subscribe(event: string, handler: EventHandler): void` - Subscribe to events

### Utility Functions

#### BaseManager

The `BaseManager` utility provides methods for creating and managing Obsidian Base files. Bases are JSON-formatted files that define database-like views over notes.

**Location:** `src/utils/BaseManager.ts`

**Key Methods:**

```typescript
import { BaseManager, BaseConfig } from '../../utils/BaseManager';

// Ensure a Base file exists (create if missing)
const baseFile = await BaseManager.ensureBaseExists(
    app,
    'ErrlOS/Capture.base',
    {
        filters: 'note.type = "capture"',
        properties: {
            capturedAt: { displayName: 'Captured' },
            tags: { displayName: 'Tags' },
        },
        views: [
            {
                type: 'table',
                name: 'Captures',
                order: ['note.capturedAt', 'note.tags', 'file.name'],
            },
        ],
    }
);

// Open a Base file in Obsidian
await BaseManager.openBase(app, 'ErrlOS/Capture.base');

// Update Base filter
await BaseManager.updateBaseFilter(
    app,
    'ErrlOS/Capture.base',
    'note.type = "capture" AND note.tags = "important"'
);

// Add a view to Base
await BaseManager.addView(app, 'ErrlOS/Capture.base', {
    type: 'table',
    name: 'Grouped by Tags',
    groupBy: 'note.tags',
    order: ['note.capturedAt'],
});
```

**Base Configuration:**

```typescript
interface BaseConfig {
    filters: string;  // Required: Filter expression
    properties?: Record<string, { displayName: string }>;
    views?: BaseView[];
    formulas?: Record<string, string>;
}
```

**Adding Base Support to an Organ:**

1. Add Base path to settings in `ErrlSettings.ts`:
```typescript
yourOrganBasePath: string;
```

2. Add Base path to `DEFAULT_SETTINGS`:
```typescript
yourOrganBasePath: "ErrlOS/YourOrgan.base",
```

3. Create Base in your organ:
```typescript
private async ensureBaseExists() {
    const settings = this.kernel.getSettings();
    const basePath = settings.yourOrganBasePath || "ErrlOS/YourOrgan.base";
    
    const baseConfig: BaseConfig = {
        filters: 'note.type = "yourType"',
        properties: {
            // Define properties
        },
        views: [
            {
                type: 'table',
                name: 'Your View',
                order: ['note.property'],
            },
        ],
    };
    
    return await BaseManager.ensureBaseExists(this.plugin.app, basePath, baseConfig);
}
```

4. Add command to open Base:
```typescript
this.plugin.addCommand({
    id: "your-organ-open-base",
    name: "Open Your Organ Base",
    callback: async () => {
        const baseFile = await this.ensureBaseExists();
        if (baseFile) {
            await this.plugin.app.workspace.getLeaf(true).openFile(baseFile);
        }
    },
});
```

5. Add Base button to dashboard (in `DashboardOrgan.ts`):
```typescript
<button data-errl-open="${settings.yourOrganBasePath}" class="errl-btn errl-btn-ghost">
    Open Your Organ Base
</button>
```

**See Also:**
- Base format specification: `docs/BASES_FORMAT.md`
- Example implementation: `src/organs/capture/CaptureOrgan.ts`

#### FileUtils

- `static async ensureDirectoryExists(app: App, dirPath: string): Promise<void>` - Ensure directory exists
- `static async ensureParentDirectoryExists(app: App, filePath: string): Promise<void>` - Ensure parent directory exists
- `static async getOrCreateFile(app: App, filePath: string, defaultContent?: string): Promise<TFile>` - Get or create file
- `static sanitizeFileName(name: string): string` - Sanitize file name

#### PathValidator

- `static validatePath(vault: Vault, path: string, mustExist?: boolean): ValidationResult` - Validate path
- `static suggestCommonPaths(vault: Vault): string[]` - Suggest common project paths
- `static suggestLorePaths(vault: Vault): string[]` - Suggest common lore paths

#### PathDetector

- `static detectVaultStructure(vault: Vault): DetectedPaths` - Detect vault structure
- `static getDetectionSummary(detected: DetectedPaths): string` - Get detection summary

## Testing Your Organ

### Unit Testing

Create test file: `tests/unit/organs/yourOrgan.test.ts`

```typescript
import { YourOrgan } from '../../../src/organs/yourOrgan/YourOrgan';
import { MockApp, TestUtils } from '../../setup';

describe('YourOrgan', () => {
    let organ: YourOrgan;
    let app: MockApp;
    
    beforeEach(() => {
        app = TestUtils.createTestApp();
        // Initialize organ
    });
    
    it('should register correctly', () => {
        // Test registration
    });
});
```

### Integration Testing

Test organ interactions with kernel and other organs:

```typescript
describe('YourOrgan Integration', () => {
    it('should work with kernel', () => {
        // Test kernel integration
    });
    
    it('should handle events', () => {
        // Test event handling
    });
});
```

### Manual Testing Checklist

- [ ] Organ loads without errors
- [ ] Settings load correctly
- [ ] Commands appear in command palette
- [ ] Commands execute correctly
- [ ] Error handling works
- [ ] User notices appear
- [ ] Settings persist after reload
- [ ] Dashboard integration works (if applicable)

## Questions?

- Review existing organs for examples
- Check the base Organ class for available methods
- Look at SharedAPIs for common functionality
- Review ErrlKernel for system integration

