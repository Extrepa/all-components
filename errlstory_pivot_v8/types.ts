
export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'equip' | 'misc' | 'cosmetic';
  count: number;
  // Optional stats for equipment
  stats?: {
    attack?: number;
    defense?: number;
  };
  // Equipment/Cosmetic slot
  slot?: 'weapon' | 'armor' | 'hat' | 'aura' | 'trail' | 'bodyColor';
}

export interface QuestProgress {
  id: string;
  progress: number;
  isReadyToTurnIn: boolean;
}

export interface DailyChallengeState {
  date: string; // YYYY-MM-DD
  id: string;   // Unique ID for the specific challenge instance
  type: 'KILL' | 'COLLECT' | 'BOSS';
  description: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  rewardClaimed: boolean;
  // Timed challenge support
  timeLimit?: number; 
  timer?: number; 
}

export interface GameState {
  player: {
    level: number;
    xp: number;
    xpToNext: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    gooBits: number;
    inventory: Item[];
    equipment: {
      weapon: string | null; // Item ID
      armor: string | null;  // Item ID
    };
    cosmetics: {
        hat: string | null;
        aura: string | null;
        trail: string | null;
        bodyColor: string | null;
    };
  };
  questLog: {
    active: QuestProgress[];
    completed: string[]; // List of Quest IDs
  };
  daily: DailyChallengeState;
  // Hotkeys: Key (e.g. 'H') -> ItemID
  quickSlots: Record<string, string | null>;
  // Deprecated
  flags: {
    hasCompletedIntroQuest: boolean;
  };
}

export interface Scene {
  onEnter?: (data?: any) => void;
  update?: (dt: number) => void;
  render?: (ctx: CanvasRenderingContext2D) => void;
  onExit?: () => void;
}

export type SceneConstructor = new (game: any) => Scene;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}