import { GoogleGenAI, Type } from "@google/genai";
import { AIProvider, ProviderConfig } from '../aiProvider';
import { AssetMetadata } from '../../types';
import { getApiKey } from '../../utils/apiKeys';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  private ai: GoogleGenAI;
  private imageModel: string;
  private textModel: string;

  constructor(config: ProviderConfig) {
    // Priority: config.apiKey > localStorage > process.env
    const apiKey = config.apiKey || getApiKey('gemini');
    if (!apiKey) {
      throw new Error('Gemini API key is required. Please set it in Settings or .env.local file.');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.imageModel = config.imageModel || 'gemini-2.5-flash-image';
    this.textModel = config.model || 'gemini-2.5-flash';
  }

  async generateImage(prompt: string, inputImageBase64?: string): Promise<string> {
    try {
      const parts: any[] = [];
      
      if (inputImageBase64) {
        // Strip data URI prefix if present (e.g., "data:image/png;base64," or "data:image/gif;base64,")
        let cleanBase64 = inputImageBase64;
        if (cleanBase64.includes(',')) {
          cleanBase64 = cleanBase64.split(',')[1];
        }
        // Also handle case where it might have the prefix but no comma (shouldn't happen, but be safe)
        if (cleanBase64.startsWith('data:')) {
          cleanBase64 = cleanBase64.replace(/^data:image\/[^;]+;base64,/, '');
        }
        
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: cleanBase64
          }
        });
      }

      parts.push({ text: prompt });

      // Only force 1:1 aspect ratio if there's no input image (new generation)
      // When remixing, preserve the original aspect ratio
      const config: any = {};
      if (!inputImageBase64) {
        config.imageConfig = {
          aspectRatio: "1:1",
        };
      }
      // If remixing, let the model preserve the original dimensions from the prompt instructions

      const response = await this.ai.models.generateContent({
        model: this.imageModel,
        contents: [{ parts }],
        config
      });

      // Check response structure
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No candidates in response");
      }

      const content = candidates[0]?.content;
      if (!content) {
        throw new Error("No content in response");
      }

      const responseParts = content.parts || [];
      for (const part of responseParts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      throw new Error("No image data found in response");
    } catch (error: any) {
      console.error("Gemini Image Gen Error:", error);
      // Provide more detailed error information
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        throw new Error('Invalid or missing API key. Please check your GEMINI_API_KEY configuration.');
      }
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        throw new Error('API quota exceeded or rate limit reached. Please try again later.');
      }
      throw new Error(`Image generation failed: ${errorMessage}`);
    }
  }

  async generateMetadata(name: string, visualDescription: string): Promise<AssetMetadata> {
    try {
      const prompt = `
        Create game metadata for a MapleStory-style 2D side-scroller game asset.
        Asset Name: ${name}
        Visuals: ${visualDescription}
        
        Generate stats, behavior logic, and hitbox data suitable for a Phaser 3 game.
        The output must be pure JSON.
      `;

      const response = await this.ai.models.generateContent({
        model: this.textModel,
        contents: [{ text: prompt }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hp: { type: Type.INTEGER },
              exp: { type: Type.INTEGER },
              speed: { type: Type.INTEGER },
              behavior: { type: Type.STRING, description: "Description of AI movement pattern (e.g. 'jumps when player is close')" },
              description: { type: Type.STRING, description: "Flavor text for the monster/item" },
              hitbox: {
                type: Type.OBJECT,
                properties: {
                  width: { type: Type.INTEGER },
                  height: { type: Type.INTEGER },
                  offsetX: { type: Type.INTEGER },
                  offsetY: { type: Type.INTEGER }
                }
              },
              animations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of animation keys needed (e.g. 'idle', 'walk', 'die')"
              }
            }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("No text returned from Gemini");
      
      return JSON.parse(text) as AssetMetadata;
    } catch (error) {
      console.error("Gemini Text Gen Error:", error);
      return this.getFallbackMetadata();
    }
  }

  private getFallbackMetadata(): AssetMetadata {
    return {
      hp: 10,
      exp: 5,
      speed: 100,
      behavior: "Patrols back and forth",
      description: "A mysterious entity.",
      hitbox: { width: 32, height: 32, offsetX: 0, offsetY: 0 },
      animations: ["idle", "move"]
    };
  }
}

