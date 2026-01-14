
export class Input {
  private target: Window | HTMLElement;
  private canvas: HTMLCanvasElement | null;
  private keysDown: Set<string>;
  private keysPressed: Set<string>;
  private keysReleased: Set<string>;
  private consumedKeys: Set<string>; // New: Track keys handled by UI
  
  // Mouse State
  public mouseX: number = 0;
  public mouseY: number = 0;
  public isMouseDown: boolean = false;
  public wasMousePressed: boolean = false; // Valid for one frame
  public wasMouseReleased: boolean = false; // Valid for one frame
  
  // Touch State
  private touches: Map<number, { x: number; y: number }> = new Map();
  public touchX: number = 0;
  public touchY: number = 0;
  
  // Virtual button states (from touch controls)
  public virtualLeft: boolean = false;
  public virtualRight: boolean = false;
  public virtualJump: boolean = false;
  public virtualAttack: boolean = false;
  public virtualMagic: boolean = false;
  
  private virtualLeftPressed: boolean = false;
  private virtualRightPressed: boolean = false;
  private virtualJumpPressed: boolean = false;
  private virtualAttackPressed: boolean = false;
  private virtualMagicPressed: boolean = false;

  private _boundOnKeyDown: (e: KeyboardEvent) => void;
  private _boundOnKeyUp: (e: KeyboardEvent) => void;
  private _boundOnMouseMove: (e: MouseEvent) => void;
  private _boundOnMouseDown: (e: MouseEvent) => void;
  private _boundOnMouseUp: (e: MouseEvent) => void;
  private _boundOnTouchStart: (e: TouchEvent) => void;
  private _boundOnTouchMove: (e: TouchEvent) => void;
  private _boundOnTouchEnd: (e: TouchEvent) => void;

  constructor(target: Window | HTMLElement = window, canvas?: HTMLCanvasElement) {
    this.target = target;
    this.canvas = canvas || null;
    this.keysDown = new Set();
    this.keysPressed = new Set();
    this.keysReleased = new Set();
    this.consumedKeys = new Set();

    this._boundOnKeyDown = this._onKeyDown.bind(this);
    this._boundOnKeyUp = this._onKeyUp.bind(this);
    this._boundOnMouseMove = this._onMouseMove.bind(this);
    this._boundOnMouseDown = this._onMouseDown.bind(this);
    this._boundOnMouseUp = this._onMouseUp.bind(this);
    this._boundOnTouchStart = this._onTouchStart.bind(this);
    this._boundOnTouchMove = this._onTouchMove.bind(this);
    this._boundOnTouchEnd = this._onTouchEnd.bind(this);

    // Keyboard (Global)
    window.addEventListener("keydown", this._boundOnKeyDown as EventListener);
    window.addEventListener("keyup", this._boundOnKeyUp as EventListener);

    // Mouse (Canvas specific if possible, else window)
    const mouseTarget = this.canvas || window;
    mouseTarget.addEventListener("mousemove", this._boundOnMouseMove as EventListener);
    mouseTarget.addEventListener("mousedown", this._boundOnMouseDown as EventListener);
    mouseTarget.addEventListener("mouseup", this._boundOnMouseUp as EventListener);
    
    // Touch (Canvas specific)
    if (this.canvas) {
      this.canvas.addEventListener("touchstart", this._boundOnTouchStart as EventListener, { passive: false });
      this.canvas.addEventListener("touchmove", this._boundOnTouchMove as EventListener, { passive: false });
      this.canvas.addEventListener("touchend", this._boundOnTouchEnd as EventListener, { passive: false });
      this.canvas.addEventListener("touchcancel", this._boundOnTouchEnd as EventListener, { passive: false });
    }
  }

  private _onKeyDown(e: KeyboardEvent): void {
    const key = e.key;
    const code = e.code; // Physical key code (e.g., "Backquote")
    
    if (!this.keysDown.has(key)) {
      this.keysDown.add(key);
      this.keysPressed.add(key);
    }
    
    // Also register by code for keys that vary by layout (like ~)
    if (code === "Backquote" && key !== "`" && key !== "~") {
      // Register both the key and the code
      if (!this.keysDown.has("Backquote")) {
        this.keysDown.add("Backquote");
        this.keysPressed.add("Backquote");
      }
    }
  }

  private _onKeyUp(e: KeyboardEvent): void {
    const key = e.key;
    if (this.keysDown.has(key)) {
      this.keysDown.delete(key);
      this.keysReleased.add(key);
    }
  }

  private _onMouseMove(e: MouseEvent): void {
      if (!this.canvas) {
          this.mouseX = e.clientX;
          this.mouseY = e.clientY;
          return;
      }

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.mouseY = (e.clientY - rect.top) * scaleY;
  }

  private _onMouseDown(e: MouseEvent): void {
      this.isMouseDown = true;
      this.wasMousePressed = true;
  }

  private _onMouseUp(e: MouseEvent): void {
      this.isMouseDown = false;
      this.wasMouseReleased = true;
  }
  
  private _onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (!this.canvas) continue;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      
      this.touches.set(touch.identifier, {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      });
    }
  }
  
  private _onTouchMove(e: TouchEvent): void {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (!this.canvas) continue;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      
      this.touches.set(touch.identifier, {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      });
    }
  }
  
  private _onTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      this.touches.delete(touch.identifier);
    }
  }
  
  public getTouchPositions(): Array<{ x: number; y: number }> {
    return Array.from(this.touches.values());
  }

  public update(): void {
    // Called once per frame by Game.handleInput()
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.consumedKeys.clear();
    this.wasMousePressed = false;
    this.wasMouseReleased = false;
    
    // Clear virtual button press flags
    this.virtualLeftPressed = false;
    this.virtualRightPressed = false;
    this.virtualJumpPressed = false;
    this.virtualAttackPressed = false;
    this.virtualMagicPressed = false;
  }
  
  public setVirtualButton(button: string, pressed: boolean, wasPressed: boolean = false): void {
    switch(button) {
      case 'left':
        this.virtualLeft = pressed;
        if (wasPressed) this.virtualLeftPressed = true;
        break;
      case 'right':
        this.virtualRight = pressed;
        if (wasPressed) this.virtualRightPressed = true;
        break;
      case 'jump':
        this.virtualJump = pressed;
        if (wasPressed) this.virtualJumpPressed = true;
        break;
      case 'attack':
        this.virtualAttack = pressed;
        if (wasPressed) this.virtualAttackPressed = true;
        break;
      case 'magic':
        this.virtualMagic = pressed;
        if (wasPressed) this.virtualMagicPressed = true;
        break;
    }
  }

  // Allow a system to "eat" a key press so others don't respond to it
  public consume(key: string): void {
    this.consumedKeys.add(key);
  }

  public isDown(key: string): boolean {
    // Check keyboard first
    if (this.keysDown.has(key) && !this.consumedKeys.has(key)) return true;
    
    // Check virtual buttons (mobile)
    const lower = key.toLowerCase();
    if (lower === "arrowleft" || lower === "a") return this.virtualLeft;
    if (lower === "arrowright" || lower === "d") return this.virtualRight;
    if (lower === " " || lower === "arrowup" || lower === "w") return this.virtualJump;
    if (lower === "z" || lower === "k") return this.virtualAttack;
    if (lower === "x" || lower === "l") return this.virtualMagic;
    
    return false;
  }

  public wasPressed(key: string): boolean {
    // Check keyboard first
    if (this.keysPressed.has(key) && !this.consumedKeys.has(key)) return true;
    
    // Check virtual buttons (mobile)
    const lower = key.toLowerCase();
    if (lower === "arrowleft" || lower === "a") return this.virtualLeftPressed;
    if (lower === "arrowright" || lower === "d") return this.virtualRightPressed;
    if (lower === " " || lower === "arrowup" || lower === "w") return this.virtualJumpPressed;
    if (lower === "z" || lower === "k") return this.virtualAttackPressed;
    if (lower === "x" || lower === "l") return this.virtualMagicPressed;
    
    return false;
  }

  public wasReleased(key: string): boolean {
    return this.keysReleased.has(key);
  }

  public destroy(): void {
    window.removeEventListener("keydown", this._boundOnKeyDown as EventListener);
    window.removeEventListener("keyup", this._boundOnKeyUp as EventListener);
    
    const mouseTarget = this.canvas || window;
    mouseTarget.removeEventListener("mousemove", this._boundOnMouseMove as EventListener);
    mouseTarget.removeEventListener("mousedown", this._boundOnMouseDown as EventListener);
    mouseTarget.removeEventListener("mouseup", this._boundOnMouseUp as EventListener);
    
    if (this.canvas) {
      this.canvas.removeEventListener("touchstart", this._boundOnTouchStart as EventListener);
      this.canvas.removeEventListener("touchmove", this._boundOnTouchMove as EventListener);
      this.canvas.removeEventListener("touchend", this._boundOnTouchEnd as EventListener);
      this.canvas.removeEventListener("touchcancel", this._boundOnTouchEnd as EventListener);
    }
  }
}