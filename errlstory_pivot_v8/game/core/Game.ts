
import { Input } from "./Input";
import { SceneManager } from "./SceneManager";
import { Camera } from "./Camera";
import { TitleScene } from "../scenes/TitleScene";
import { TownScene } from "../scenes/TownScene";
import { FieldScene } from "../scenes/FieldScene";
import { BossScene } from "../scenes/BossScene";
import { GameOverScene } from "../scenes/GameOverScene";
import { DevRoomScene } from "../scenes/DevRoomScene";
import { GameState, Item } from "../../types";
import { AudioSystem } from "./AudioSystem";
import { SaveSystem } from "./SaveSystem";
import { ParticleSystem } from "../effects/ParticleSystem";
import { QuestSystem } from "../systems/QuestSystem";
import { DailyChallengeSystem } from "../systems/DailyChallengeSystem";

// Global UIs
import { InventoryUI } from "../ui/InventoryUI";
import { QuestLogUI } from "../ui/QuestLogUI";
import { QuestTrackerUI } from "../ui/QuestTrackerUI";
import { DailyTrackerUI } from "../ui/DailyTrackerUI";
import { MainHUD } from "../ui/MainHUD";
import { TouchControls } from "../ui/TouchControls";
import { DeviceDetector } from "./DeviceDetector";

export class Game {
  public ctx: CanvasRenderingContext2D;
  public width: number;
  public height: number;
  public input: Input;
  public sceneManager: SceneManager;
  public camera: Camera;
  public state: GameState;
  
  public audio: AudioSystem;
  public saveSystem: SaveSystem;
  public particles: ParticleSystem;
  public questSystem: QuestSystem;
  public dailySystem: DailyChallengeSystem;
  
  // Hitstop system for Flash-game "crunchy" feel
  public hitstopFrames: number = 0;

  // Global UI Managers
  public inventoryUI: InventoryUI;
  public questLogUI: QuestLogUI;
  public questTrackerUI: QuestTrackerUI;
  public dailyTrackerUI: DailyTrackerUI;
  public mainHUD: MainHUD;
  public touchControls: TouchControls | null = null;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    // Pass canvas for mouse coordinates
    this.input = new Input(window, ctx.canvas);
    this.sceneManager = new SceneManager(this);
    this.audio = new AudioSystem();
    this.saveSystem = new SaveSystem();
    this.particles = new ParticleSystem();
    
    // Initialize Camera
    this.camera = new Camera(width, height, width, height);

    // Global state
    this.state = this.getNewGameState();
    
    // Init Systems
    this.questSystem = new QuestSystem(this);
    this.dailySystem = new DailyChallengeSystem(this);

    // Init Global UIs
    this.inventoryUI = new InventoryUI(this);
    this.questLogUI = new QuestLogUI(this);
    this.questTrackerUI = new QuestTrackerUI(this);
    this.dailyTrackerUI = new DailyTrackerUI(this);
    this.mainHUD = new MainHUD(this);
    
    // Init Touch Controls if mobile
    if (DeviceDetector.isMobile()) {
      this.touchControls = new TouchControls(this);
    }

    this._registerScenes();
    this.sceneManager.setScene("title");
  }

  public getNewGameState(): GameState {
    return {
      player: {
        level: 1,
        xp: 0,
        xpToNext: 50,
        hp: 50,
        maxHp: 50,
        mp: 20,
        maxMp: 20,
        gooBits: 0,
        inventory: [],
        equipment: {
            weapon: null,
            armor: null
        },
        cosmetics: {
            hat: null,
            aura: null,
            trail: null,
            bodyColor: null
        }
      },
      flags: {
        hasCompletedIntroQuest: false,
      },
      questLog: {
          active: [],
          completed: []
      },
      daily: {
          date: "",
          id: "",
          type: 'COLLECT',
          description: "",
          target: 1,
          progress: 0,
          isCompleted: false,
          rewardClaimed: false
      },
      quickSlots: {
          'H': 'potion',
          'J': 'ether',
          'K': null,
          'L': null
      }
    };
  }

  public loadState(saved: any): void {
    const fresh = this.getNewGameState();
    
    this.state = {
      ...fresh,
      ...saved,
      player: { 
          ...fresh.player, 
          ...saved.player,
          equipment: { ...fresh.player.equipment, ...(saved.player?.equipment || {}) },
          cosmetics: { ...fresh.player.cosmetics, ...(saved.player?.cosmetics || {}) }
      },
      questLog: saved.questLog || { active: [], completed: [] },
      daily: saved.daily || fresh.daily,
      quickSlots: { ...fresh.quickSlots, ...(saved.quickSlots || {}) }
    };

    if (saved.quests && saved.quests.intro) {
        if (saved.quests.intro === 'COMPLETED') {
            if (!this.state.questLog.completed.includes('q_slime_hunt')) {
                this.state.questLog.completed.push('q_slime_hunt');
            }
        } 
        else if (saved.quests.intro === 'ACTIVE') {
            if (!this.state.questLog.active.find((q: any) => q.id === 'q_slime_hunt') && 
                !this.state.questLog.completed.includes('q_slime_hunt')) {
                this.state.questLog.active.push({
                    id: 'q_slime_hunt',
                    progress: 0,
                    isReadyToTurnIn: false
                });
            }
        }
        delete (this.state as any).quests;
    }

    if (saved.player && saved.player.inventory) {
        this.state.player.inventory = saved.player.inventory;
    }
    
    this.dailySystem.checkDailyReset();
  }

  private _registerScenes(): void {
    this.sceneManager.add("title", new TitleScene(this));
    this.sceneManager.add("town", new TownScene(this));
    this.sceneManager.add("field", new FieldScene(this));
    this.sceneManager.add("boss", new BossScene(this));
    this.sceneManager.add("gameover", new GameOverScene(this));
    this.sceneManager.add("devroom", new DevRoomScene(this));
  }

  public handleInput(): void {
    this.input.update();
  }

  public update(dt: number): void {
    // Hitstop: skip updates but continue rendering for "crunchy" feel
    if (this.hitstopFrames > 0) {
      this.hitstopFrames--;
      return; // Skip this update frame
    }
    
    // 1. Update Global UIs
    this.inventoryUI.update(dt);
    this.questLogUI.update(dt);
    this.mainHUD.update(dt);
    this.questTrackerUI.update(dt); // Combined quest tracker now handles daily too
    
    // Update touch controls
    if (this.touchControls) {
      this.touchControls.update(dt);
    }

    // 2. Pause Game Loop if UIs are open
    // Note: ShopUI is local to Town, so TownScene handles that pause.
    if (this.inventoryUI.isActive || this.questLogUI.isActive) {
        return;
    }

    // 3. Update Scene
    this.sceneManager.update(dt);
  }
  
  public triggerHitstop(frames: number = 2): void {
    // Set hitstop frames (max to prevent stacking)
    this.hitstopFrames = Math.max(this.hitstopFrames, frames);
  }

  public render(): void {
    const ctx = this.ctx;
    ctx.save();

    ctx.fillStyle = "#000"; 
    ctx.fillRect(0, 0, this.width, this.height);

    // 1. Render Scene
    this.sceneManager.render(ctx);

    // 2. Render Global Overlays
    // HUD
    this.mainHUD.render(ctx);
    
    // Modals
    this.inventoryUI.render(ctx);
    this.questLogUI.render(ctx);
    
    // Touch Controls (on top, mobile only)
    if (this.touchControls) {
      this.touchControls.render(ctx);
    }

    // 3. Screen Vignette on Low HP (Flash drama mode)
    const hpPercent = this.state.player.hp / this.state.player.maxHp;
    if (hpPercent < 0.3 && hpPercent > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const radius = Math.max(this.width, this.height) * 0.8;
      const intensity = 1 - (hpPercent / 0.3); // 0 to 1 as HP drops
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      gradient.addColorStop(0, `rgba(255, 0, 0, ${0.3 * intensity})`);
      gradient.addColorStop(0.5, `rgba(200, 0, 0, ${0.2 * intensity})`);
      gradient.addColorStop(1, `rgba(150, 0, 0, ${0.1 * intensity})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }

    ctx.restore();
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.camera.width = width;
    this.camera.height = height;
  }

  public destroy(): void {
    this.input.destroy();
  }

  public gainXp(amount: number): boolean {
    const p = this.state.player;
    p.xp += amount;
    
    let leveledUp = false;

    while (p.xp >= p.xpToNext) {
      p.xp -= p.xpToNext;
      p.level++;
      leveledUp = true;
      p.xpToNext = Math.floor(p.xpToNext * 1.5);
      p.maxHp += 10;
      p.maxMp += 5;
      p.hp = p.maxHp;
      p.mp = p.maxMp;
    }
    
    if (leveledUp) {
      this.audio.playSfx('levelup');
    }
    
    return leveledUp;
  }

  public addItem(item: Partial<Item>): void {
    const inv = this.state.player.inventory;
    const existing = inv.find(i => i.id === item.id);
    
    if (existing) {
        existing.count += (item.count || 1);
    } else {
        const newItem: Item = {
            id: item.id!,
            name: item.name!,
            type: item.type || 'misc',
            count: item.count || 1,
            stats: item.stats,
            slot: item.slot
        };
        inv.push(newItem);
    }
  }

  public getItemCount(id: string): number {
      const item = this.state.player.inventory.find(i => i.id === id);
      return item ? item.count : 0;
  }

  public buyItem(item: Partial<Item>, cost: number): boolean {
      if (this.state.player.gooBits >= cost) {
          this.state.player.gooBits -= cost;
          this.addItem(item);
          return true;
      }
      return false;
  }

  public assignQuickSlot(key: string, itemId: string): void {
      this.state.quickSlots[key] = itemId;
      this.audio.playSfx('collect');
  }

  public useItem(id: string): boolean {
    const p = this.state.player;
    const inv = p.inventory;
    const item = inv.find(i => i.id === id);

    if (!item) return false;

    let used = false;

    if (item.type === 'consumable') {
        if (id === 'potion') {
            if (p.hp < p.maxHp) {
                p.hp = Math.min(p.hp + 20, p.maxHp);
                used = true;
            }
        } else if (id === 'ether') {
            if (p.mp < p.maxMp) {
                p.mp = Math.min(p.mp + 20, p.maxMp);
                used = true;
            }
        }
    } 
    else if (item.type === 'equip' || item.type === 'cosmetic') {
        this.toggleEquip(item);
        return true; 
    }

    if (used && item.type === 'consumable') {
        item.count--;
        if (item.count <= 0) {
            const idx = inv.indexOf(item);
            inv.splice(idx, 1);
        }
        return true;
    }

    return false;
  }

  public toggleEquip(item: Item): void {
      if (!item.slot) return;
      const p = this.state.player;
      
      let targetObj: any = p.equipment;
      if (['hat', 'aura', 'trail', 'bodyColor'].includes(item.slot)) {
          targetObj = p.cosmetics;
      }

      const currentId = targetObj[item.slot];

      if (currentId === item.id) {
          targetObj[item.slot] = null;
          this.audio.playSfx('step'); 
      } else {
          targetObj[item.slot] = item.id;
          this.audio.playSfx('collect'); 
      }
  }

  public getPlayerStats() {
      const p = this.state.player;
      // Base stats scale with level
      let attack = p.level * 2;
      let defense = p.level * 1;

      // Equipment bonuses
      if (p.equipment.weapon) {
          const w = p.inventory.find(i => i.id === p.equipment.weapon);
          if (w && w.stats?.attack) attack += w.stats.attack;
      }
      if (p.equipment.armor) {
          const a = p.inventory.find(i => i.id === p.equipment.armor);
          if (a && a.stats?.defense) defense += a.stats.defense;
      }

      return {
          ...p,
          attack,
          defense
      };
  }
}