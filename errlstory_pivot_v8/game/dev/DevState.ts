
/**
 * DevState - Singleton manager for debug flags and dev room settings
 * Persists across scene changes
 */
export class DevState {
  private static instance: DevState | null = null;

  // Master Dev Mode Toggle
  public devModeActive: boolean = false;

  // Core Debug Toggles
  public godMode: boolean = false;
  public infiniteMP: boolean = false;
  public freezeAI: boolean = false;
  public stunAllMobs: boolean = false;

  // Physics Modifiers
  public gravityMultiplier: number = 1.0;
  public timeScale: number = 1.0;

  // Visual Debug
  public showHitboxes: boolean = false;
  public showAIState: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): DevState {
    if (!DevState.instance) {
      DevState.instance = new DevState();
    }
    return DevState.instance;
  }

  public reset(): void {
    this.devModeActive = false;
    this.godMode = false;
    this.infiniteMP = false;
    this.freezeAI = false;
    this.stunAllMobs = false;
    this.gravityMultiplier = 1.0;
    this.timeScale = 1.0;
    this.showHitboxes = false;
    this.showAIState = false;
  }
}

