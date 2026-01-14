import { AIProvider, ProviderConfig } from '../aiProvider';
import { AssetMetadata } from '../../types';
import { getApiKey } from '../../utils/apiKeys';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private apiKey: string;
  private imageModel: string;
  private textModel: string;

  constructor(config: ProviderConfig) {
    // Priority: config.apiKey > localStorage > process.env
    const apiKey = config.apiKey || getApiKey('openai');
    if (!apiKey) {
      throw new Error('OpenAI API key is required. Please set it in Settings or .env.local file.');
    }
    this.apiKey = apiKey;
    this.imageModel = config.imageModel || 'dall-e-3';
    this.textModel = config.model || 'gpt-4o-mini';
  }

  async generateImage(prompt: string, inputImageBase64?: string): Promise<string> {
    try {
      // OpenAI DALL-E 3 doesn't support image input, so we'll use the prompt with image description
      // The prompt should already include dimension preservation instructions from aiService
      const enhancedPrompt = prompt;

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.imageModel,
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const imageData = data.data[0]?.b64_json;
      
      if (!imageData) {
        throw new Error("No image data found in response");
      }

      return `data:image/png;base64,${imageData}`;
    } catch (error) {
      console.error("OpenAI Image Gen Error:", error);
      throw error;
    }
  }

  async generateMetadata(name: string, visualDescription: string): Promise<AssetMetadata> {
    try {
      const prompt = `Create game metadata for a MapleStory-style 2D side-scroller game asset.
Asset Name: ${name}
Visuals: ${visualDescription}

Generate stats, behavior logic, and hitbox data suitable for a Phaser 3 game.
Return ONLY valid JSON with no markdown formatting.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.textModel,
          messages: [
            {
              role: 'system',
              content: 'You are a game asset metadata generator. Always return valid JSON only, no markdown, no code blocks.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content returned from OpenAI");
      }

      const parsed = JSON.parse(content);
      
      // Ensure all required fields exist
      return {
        hp: parsed.hp ?? 10,
        exp: parsed.exp ?? 5,
        speed: parsed.speed ?? 100,
        behavior: parsed.behavior || "Patrols back and forth",
        description: parsed.description || "A mysterious entity.",
        hitbox: parsed.hitbox || { width: 32, height: 32, offsetX: 0, offsetY: 0 },
        animations: parsed.animations || ["idle", "move"]
      };
    } catch (error) {
      console.error("OpenAI Text Gen Error:", error);
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

