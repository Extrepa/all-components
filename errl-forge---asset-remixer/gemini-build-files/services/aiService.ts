import { AIProvider, AIProviderType, ProviderConfig } from './aiProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { OpenAIProvider } from './providers/openaiProvider';
import { AnthropicProvider } from './providers/anthropicProvider';
import { AssetMetadata } from '../types';

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
  async generateAssetImage(prompt: string, inputImageBase64?: string): Promise<string> {
    return this.provider.generateImage(prompt, inputImageBase64);
  }

  /**
   * Generate asset metadata
   */
  async generateAssetMetadata(name: string, visualDescription: string): Promise<AssetMetadata> {
    return this.provider.generateMetadata(name, visualDescription);
  }
}

// Export singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(config?: ProviderConfig): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService(config);
  } else if (config) {
    aiServiceInstance.setProvider(config);
  }
  return aiServiceInstance;
}

// Export for convenience
export const generateAssetImage = async (prompt: string, inputImageBase64?: string): Promise<string> => {
  return getAIService().generateAssetImage(prompt, inputImageBase64);
};

export const generateAssetMetadata = async (name: string, visualDescription: string): Promise<AssetMetadata> => {
  return getAIService().generateAssetMetadata(name, visualDescription);
};

