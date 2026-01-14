
export interface GameAsset {
  id: string;
  name: string;
  type: 'monster' | 'item' | 'npc' | 'platform' | 'background';
  originalPrompt: string;
  remixPrompt: string;
  imageUrl?: string;
  sourceImageUrl?: string; // The original MapleStory asset URL
  metadata: AssetMetadata;
  status: 'idle' | 'generating' | 'complete' | 'error';
}

export interface AssetMetadata {
  hp: number;
  exp: number;
  speed: number;
  behavior: string;
  description: string;
  hitbox: {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  };
  animations: string[];
}

export interface Preset {
  id: string;
  name: string;
  type: GameAsset['type'];
  basePrompt: string;
  imageUrl?: string;
}

export type MapleCategory = 'mob' | 'npc' | 'pet' | 'map' | 'item' | 'equip' | 'hair' | 'face';

export type MapleVersion = '210' | '62';

export interface MapleData {
  id: number;
  name: string;
  category: MapleCategory;
  imgUrl: string; // Icon or Stand sprite
}

export enum GenerationMode {
  PRESET = 'PRESET',
  REMIX = 'REMIX',
  CUSTOM = 'CUSTOM'
}
