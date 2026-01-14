
export interface GameAsset {
  id: string;
  name: string;
  type: 'monster' | 'item' | 'npc' | 'platform' | 'background';
  originalPrompt: string;
  remixPrompt: string;
  imageUrl?: string; // Large generated image
  resizedImageUrl?: string; // Automatically resized to match source dimensions
  sourceImageUrl?: string; // The original MapleStory asset URL
  presetId?: string; // ID of the preset used (if generated from base model)
  metadata: AssetMetadata;
  status: 'idle' | 'generating' | 'complete' | 'error';
  error?: AppError; // Error information when status is 'error'
  progress?: {
    imageProgress?: number; // 0-100
    metadataProgress?: number; // 0-100
    currentStep?: string; // e.g., "Generating image...", "Generating metadata..."
  };
  timestamp?: number; // Creation/update timestamp
  version?: number; // Version number for history tracking
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

export type MapleCategory = 'mob' | 'npc' | 'pet' | 'map' | 'item' | 'equip' | 'weapon' | 'armor' | 'shield' | 'glasses' | 'earrings' | 'hat' | 'cape' | 'gloves' | 'shoes' | 'ring' | 'pendant' | 'character' | 'face' | 'skin' | 'pose' | 'hair' | 'top' | 'bottom' | 'overall';

export type MapleVersion = '210' | '177' | '95' | '83' | '62';

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

/**
 * Batch generation job
 */
export interface BatchJob {
  id: string;
  name: string;
  items: BatchJobItem[];
  status: 'pending' | 'running' | 'paused' | 'completed' | 'error';
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  createdAt: number;
  completedAt?: number;
}

export interface BatchJobItem {
  id: string;
  name: string;
  prompt: string;
  type: GameAsset['type'];
  sourceImageUrl?: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  result?: GameAsset;
  error?: AppError;
}

/**
 * Animation sequence for sprite sheets
 */
export interface AnimationSequence {
  id: string;
  name: string;
  animationKey: string; // e.g., 'idle', 'walk', 'attack'
  frames: AnimationFrame[];
  frameCount: number;
  createdAt: number;
}

export interface AnimationFrame {
  id: string;
  frameNumber: number;
  imageUrl: string;
  prompt: string;
}

/**
 * Error categories for better error handling
 */
export type ErrorCategory = 
  | 'api_error'      // API returned an error response
  | 'network_error'  // Network/connection issues
  | 'timeout_error'  // Request timed out
  | 'rate_limit'     // Rate limit exceeded
  | 'auth_error'     // Authentication/API key issues
  | 'generation_error' // Image/metadata generation failed
  | 'provider_error'  // Provider-specific error
  | 'unknown_error';   // Unknown error

/**
 * Structured error information
 */
export interface AppError {
  category: ErrorCategory;
  message: string;
  userMessage: string; // User-friendly message
  provider?: string;   // Which AI provider (if applicable)
  operation?: string;   // Which operation failed (image/metadata)
  retryable: boolean;   // Whether the operation can be retried
  retryAfter?: number;  // Seconds to wait before retry (for rate limits)
  originalError?: Error; // Original error object
}

/**
 * Error context for service methods
 */
export interface ErrorContext {
  provider?: string;
  operation: string;
  additionalInfo?: Record<string, any>;
}
