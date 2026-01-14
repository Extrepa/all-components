import { AssetMetadata } from '../types';

/**
 * AI Provider Interface
 * All AI providers must implement this interface
 */
export interface AIProvider {
  name: string;
  generateImage(prompt: string, inputImageBase64?: string): Promise<string>;
  generateMetadata(name: string, visualDescription: string): Promise<AssetMetadata>;
}

/**
 * Supported AI Providers
 */
export type AIProviderType = 'gemini' | 'openai' | 'anthropic' | 'replicate';

/**
 * Provider Configuration
 */
export interface ProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  model?: string;
  imageModel?: string;
}

