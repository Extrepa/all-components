import { AnimationSequence, AnimationFrame, GameAsset } from '../types';

type AssetType = GameAsset['type'];
import { generateAssetImage } from './aiService';
import { imageUrlToBase64 } from '../utils';

/**
 * Animation generation service
 */
class AnimationService {
  /**
   * Generate animation frames
   */
  async generateAnimationFrames(
    name: string,
    animationKey: string,
    basePrompt: string,
    frameCount: number,
    assetType: AssetType,
    sourceImageUrl?: string,
    onProgress?: (frameNumber: number, total: number) => void,
    onFrameComplete?: (frame: AnimationFrame, sequenceId: string) => void,
    sequenceId?: string
  ): Promise<AnimationSequence> {
    const frames: AnimationFrame[] = [];
    const finalSequenceId = sequenceId || `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare base prompt with animation context and background
    const animationContext = this.getAnimationContext(animationKey, assetType);
    let enhancedPrompt = `${basePrompt}, ${animationContext}`;
    // Ensure background instruction is included
    if (!enhancedPrompt.toLowerCase().includes('background') && !enhancedPrompt.toLowerCase().includes('transparent')) {
      enhancedPrompt = `${enhancedPrompt}, white or transparent background`;
    }

    // Prepare input image if provided
    let inputImageBase64: string | undefined = undefined;
    if (sourceImageUrl) {
      if (sourceImageUrl.startsWith('data:')) {
        inputImageBase64 = sourceImageUrl.split(',')[1];
      } else {
        const base64 = await imageUrlToBase64(sourceImageUrl);
        if (base64) {
          inputImageBase64 = base64;
        }
      }
    }

    // Generate each frame
    for (let i = 0; i < frameCount; i++) {
      onProgress?.(i + 1, frameCount);
      
      // Add frame-specific prompt variation
      const framePrompt = this.addFrameVariation(enhancedPrompt, i, frameCount, animationKey);
      
      try {
        const imageUrl = await generateAssetImage(framePrompt, inputImageBase64);
        
        if (!imageUrl || imageUrl.trim() === '') {
          throw new Error('Generated image URL is empty');
        }
        
        const frame: AnimationFrame = {
          id: `frame-${i}`,
          frameNumber: i,
          imageUrl,
          prompt: framePrompt
        };
        
        frames.push(frame);
        
        // Notify that frame is complete
        onFrameComplete?.(frame, finalSequenceId);
      } catch (error: any) {
        console.error(`Failed to generate frame ${i}:`, error);
        const errorMessage = error?.message || error?.userMessage || String(error);
        // Re-throw if it's a critical error (API key, quota, etc.)
        if (errorMessage.includes('API key') || 
            errorMessage.includes('quota') || 
            errorMessage.includes('rate limit') ||
            errorMessage.includes('authentication')) {
          throw error; // Re-throw critical errors immediately
        }
        // Add placeholder frame to maintain sequence integrity for non-critical errors
        const errorFrame: AnimationFrame = {
          id: `frame-${i}-error`,
          frameNumber: i,
          imageUrl: '', // Empty indicates failure
          prompt: framePrompt
        };
        frames.push(errorFrame);
      }
    }
    
    // Filter out failed frames if any exist
    const validFrames = frames.filter(f => f.imageUrl);
    if (validFrames.length === 0) {
      throw new Error(`Failed to generate any frames for ${animationKey} animation`);
    }

    const sequence: AnimationSequence = {
      id: finalSequenceId,
      name,
      animationKey,
      frames: validFrames,
      frameCount: validFrames.length,
      createdAt: Date.now()
    };

    return sequence;
  }

  /**
   * Get animation context based on animation key
   */
  private getAnimationContext(animationKey: string, assetType: GameAsset['type']): string {
    const contexts: Record<string, string> = {
      idle: 'idle animation, subtle breathing or swaying motion, static pose',
      walk: 'walking animation, side-scrolling movement, leg motion',
      run: 'running animation, fast movement, dynamic pose',
      jump: 'jumping animation, upward motion, mid-air pose',
      attack: 'attack animation, action pose, weapon or attack motion',
      hurt: 'hurt animation, damage reaction, flinching pose',
      die: 'death animation, falling or collapsing pose',
      special: 'special ability animation, magical or unique action'
    };

    return contexts[animationKey.toLowerCase()] || 'animation frame';
  }

  /**
   * Add frame-specific variation to prompt
   */
  private addFrameVariation(
    basePrompt: string,
    frameNumber: number,
    totalFrames: number,
    animationKey: string
  ): string {
    // Calculate animation progress (0 to 1)
    const progress = frameNumber / totalFrames;
    
    // Add frame-specific descriptors
    let variation = '';
    
    if (animationKey === 'walk' || animationKey === 'run') {
      // Walking/running cycle
      const cyclePosition = (frameNumber % 8) / 8; // 8-frame cycle
      if (cyclePosition < 0.25) variation = 'left leg forward, right leg back';
      else if (cyclePosition < 0.5) variation = 'both legs mid-stride';
      else if (cyclePosition < 0.75) variation = 'right leg forward, left leg back';
      else variation = 'both legs mid-stride';
    } else if (animationKey === 'jump') {
      if (progress < 0.3) variation = 'preparing to jump, crouching';
      else if (progress < 0.6) variation = 'mid-jump, ascending';
      else variation = 'landing, descending';
    } else if (animationKey === 'attack') {
      if (progress < 0.3) variation = 'wind-up, preparing attack';
      else if (progress < 0.7) variation = 'attack motion, mid-swing';
      else variation = 'follow-through, recovery';
    } else if (animationKey === 'idle') {
      // Subtle variation for idle
      const cycle = Math.sin(progress * Math.PI * 2) * 0.1;
      variation = `idle frame ${frameNumber + 1}, subtle animation`;
    }

    return variation ? `${basePrompt}, ${variation}` : basePrompt;
  }

  /**
   * Generate multiple animation sequences
   */
  async generateMultipleAnimations(
    name: string,
    animationKeys: string[],
    basePrompt: string,
    frameCount: number,
    assetType: AssetType,
    sourceImageUrl?: string,
    onProgress?: (animationKey: string, frameNumber: number, total: number) => void,
    onFrameComplete?: (frame: AnimationFrame, sequenceId: string, animationKey: string) => void
  ): Promise<AnimationSequence[]> {
    const sequences: AnimationSequence[] = [];

    for (const key of animationKeys) {
      const sequenceId = `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const sequence = await this.generateAnimationFrames(
        `${name} - ${key}`,
        key,
        basePrompt,
        frameCount,
        assetType,
        sourceImageUrl,
        (frameNum, total) => onProgress?.(key, frameNum, total),
        (frame, seqId) => onFrameComplete?.(frame, seqId, key),
        sequenceId
      );
      sequences.push(sequence);
    }

    return sequences;
  }
}

// Export singleton
export const animationService = new AnimationService();

