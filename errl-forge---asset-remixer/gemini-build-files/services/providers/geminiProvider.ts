import { GoogleGenAI, Type } from "@google/genai";
import { AIProvider, ProviderConfig } from '../aiProvider';
import { AssetMetadata } from '../../types';

export class GeminiProvider implements AIProvider {
  name = 'Gemini';
  private ai: GoogleGenAI;
  private imageModel: string;
  private textModel: string;

  constructor(config: ProviderConfig) {
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is required. Set GEMINI_API_KEY in your .env.local file.');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.imageModel = config.imageModel || 'gemini-2.5-flash-image';
    this.textModel = config.model || 'gemini-2.5-flash';
  }

  async generateImage(prompt: string, inputImageBase64?: string): Promise<string> {
    try {
      const parts: any[] = [];
      
      if (inputImageBase64) {
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: inputImageBase64
          }
        });
      }

      parts.push({ text: prompt });

      const response = await this.ai.models.generateContent({
        model: this.imageModel,
        contents: {
          parts: parts
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data found in response");
    } catch (error) {
      console.error("Gemini Image Gen Error:", error);
      throw error;
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
        contents: prompt,
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

