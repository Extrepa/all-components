import { AIProvider, AIProviderType, ProviderConfig } from './aiProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { OpenAIProvider } from './providers/openaiProvider';
import { AnthropicProvider } from './providers/anthropicProvider';
import { AssetMetadata, AppError } from '../types';
import { createAppError } from '../utils';

/**
 * Factory function to create AI providers
 */
function createProvider(config: ProviderConfig): AIProvider {
  switch (config.type) {
    case 'gemini':
      return new GeminiProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    default:
      throw new Error(`Unsupported provider type: ${config.type}`);
  }
}

/**
 * AI Service - Main interface for AI operations
 */
class AIService {
  private provider: AIProvider;
  private currentConfig: ProviderConfig;

  constructor(config?: ProviderConfig) {
    const defaultConfig: ProviderConfig = {
      type: (process.env.AI_PROVIDER as AIProviderType) || 'gemini',
      apiKey: undefined,
      model: undefined,
      imageModel: undefined
    };

    this.currentConfig = config || defaultConfig;
    this.provider = createProvider(this.currentConfig);
  }

  /**
   * Switch to a different provider
   */
  setProvider(config: ProviderConfig): void {
    this.currentConfig = config;
    // Always create a new provider instance to pick up any API key changes
    this.provider = createProvider(config);
  }

  /**
   * Get current provider name
   */
  getProviderName(): string {
    return this.provider.name;
  }

  /**
   * Get current provider type
   */
  getProviderType(): AIProviderType {
    return this.currentConfig.type;
  }

  /**
   * Generate an asset image
   */
  async generateAssetImage(prompt: string, inputImageBase64?: string, inputImageUrl?: string): Promise<string> {
    try {
      // Enhance prompt with background and dimension preservation instructions
      let enhancedPrompt = prompt;
      
      // Always add background instruction
      if (!enhancedPrompt.toLowerCase().includes('background') && !enhancedPrompt.toLowerCase().includes('transparent')) {
        enhancedPrompt = `${enhancedPrompt}, white or transparent background`;
      }
      if (inputImageBase64 || inputImageUrl) {
        const { getImageDimensions } = await import('../utils');
        const source = inputImageUrl || (inputImageBase64 ? `data:image/png;base64,${inputImageBase64}` : null);
        if (source) {
          try {
            const dimensions = await getImageDimensions(source);
            const dimensionText = dimensions && dimensions.width > 0 && dimensions.height > 0
              ? `exact original image dimensions (${dimensions.width}x${dimensions.height} pixels)`
              : 'exact original image dimensions, aspect ratio, and canvas size';
            
            enhancedPrompt = `${prompt}. CRITICAL REMIXING INSTRUCTIONS: 
1. The output must look very similar to the input image - same subject, same pose, same composition, same structure
2. Keep the main character/object in the exact same position and pose
3. Apply Errl aesthetic to the ENTIRE asset: transform colors, style effects, textures, and surfaces of both the main subject AND surroundings
4. Preserve the ${dimensionText}
5. Maintain the same overall layout, positioning, and recognizable shape
6. The remix should be clearly the same subject with Errl aesthetic applied throughout - neon colors, dripping effects, psychedelic softness on all elements
7. Do not change the core shape, proportions, or arrangement, but DO transform the visual style of everything
8. Use white or transparent background`;
          } catch (dimError) {
            // If dimension detection fails, still add preservation instruction
            console.warn('Could not detect image dimensions, using generic preservation instruction:', dimError);
            enhancedPrompt = `${prompt}. CRITICAL REMIXING INSTRUCTIONS: 
1. The output must look very similar to the input image - same subject, same pose, same composition, same structure
2. Keep the main character/object in the exact same position and pose
3. Apply Errl aesthetic to the ENTIRE asset: transform colors, style effects, textures, and surfaces of both the main subject AND surroundings
4. Preserve the exact original image dimensions, aspect ratio, and canvas size
5. Maintain the same overall layout, positioning, and recognizable shape
6. The remix should be clearly the same subject with Errl aesthetic applied throughout - neon colors, dripping effects, psychedelic softness on all elements
7. Do not change the core shape, proportions, or arrangement, but DO transform the visual style of everything
8. Use white or transparent background`;
          }
        }
      }
      return await this.provider.generateImage(enhancedPrompt, inputImageBase64);
    } catch (error) {
      const appError = createAppError(error, {
        provider: this.provider.name,
        operation: 'image'
      });
      throw appError;
    }
  }

  /**
   * Generate asset metadata
   */
  async generateAssetMetadata(name: string, visualDescription: string): Promise<AssetMetadata> {
    try {
      return await this.provider.generateMetadata(name, visualDescription);
    } catch (error) {
      const appError = createAppError(error, {
        provider: this.provider.name,
        operation: 'metadata'
      });
      throw appError;
    }
  }
}

// Export singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(config?: ProviderConfig): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService(config);
  } else if (config) {
    // Always recreate provider to pick up any API key changes from localStorage
    aiServiceInstance.setProvider(config);
  }
  return aiServiceInstance;
}

/**
 * Force reload the current provider (useful when API keys are updated)
 */
export function reloadAIService(): void {
  if (aiServiceInstance) {
    const currentType = aiServiceInstance.getProviderType();
    aiServiceInstance.setProvider({ type: currentType });
  }
}

// Export for convenience
export const generateAssetImage = async (prompt: string, inputImageBase64?: string, inputImageUrl?: string): Promise<string> => {
  return getAIService().generateAssetImage(prompt, inputImageBase64, inputImageUrl);
};

export const generateAssetMetadata = async (name: string, visualDescription: string): Promise<AssetMetadata> => {
  return getAIService().generateAssetMetadata(name, visualDescription);
};

