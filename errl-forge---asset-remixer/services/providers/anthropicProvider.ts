import { AIProvider, ProviderConfig } from '../aiProvider';
import { AssetMetadata } from '../../types';
import { getApiKey } from '../../utils/apiKeys';

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic';
  private apiKey: string;
  private textModel: string;
  private imageModel: string;

  constructor(config: ProviderConfig) {
    // Priority: config.apiKey > localStorage > process.env
    const apiKey = config.apiKey || getApiKey('anthropic');
    if (!apiKey) {
      throw new Error('Anthropic API key is required. Please set it in Settings or .env.local file.');
    }
    this.apiKey = apiKey;
    this.textModel = config.model || 'claude-3-5-sonnet-20241022';
    // Note: Anthropic doesn't have native image generation, so we'll use a workaround
    this.imageModel = config.imageModel || 'claude-3-5-sonnet-20241022';
  }

  async generateImage(prompt: string, inputImageBase64?: string): Promise<string> {
    // Anthropic doesn't have native image generation
    // This is a placeholder - you might want to use a different service or throw an error
    throw new Error('Anthropic does not support image generation. Please use Gemini or OpenAI for image generation.');
  }

  async generateMetadata(name: string, visualDescription: string): Promise<AssetMetadata> {
    try {
      const prompt = `Create game metadata for a MapleStory-style 2D side-scroller game asset.
Asset Name: ${name}
Visuals: ${visualDescription}

Generate stats, behavior logic, and hitbox data suitable for a Phaser 3 game.
Return ONLY valid JSON with no markdown formatting.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.textModel,
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text;
      
      if (!content) {
        throw new Error("No content returned from Anthropic");
      }

      // Try to extract JSON from response
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '').replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonStr);
      
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
      console.error("Anthropic Text Gen Error:", error);
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

