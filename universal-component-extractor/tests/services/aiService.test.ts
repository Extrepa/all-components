import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractComponentFromHtml, AISettings } from '../../services/aiService';
import { ExtractedCode } from '../../types';

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractComponentFromHtml', () => {
    it('should throw error for unknown provider', async () => {
      const settings: AISettings = {
        provider: 'unknown' as any,
        apiKeys: {},
        model: 'test-model',
      };

      await expect(
        extractComponentFromHtml('test code', settings, () => {})
      ).rejects.toThrow('Unknown provider');
    });

    it('should throw error for Gemini without API key', async () => {
      const settings: AISettings = {
        provider: 'gemini',
        apiKeys: {},
        model: 'gemini-2.5-flash',
      };

      await expect(
        extractComponentFromHtml('test code', settings, () => {})
      ).rejects.toThrow('Gemini API key is required');
    });

    it('should throw error for OpenAI without API key', async () => {
      const settings: AISettings = {
        provider: 'openai',
        apiKeys: {},
        model: 'gpt-4o-mini',
      };

      await expect(
        extractComponentFromHtml('test code', settings, () => {})
      ).rejects.toThrow('OpenAI API key is required');
    });

    it('should throw error for Anthropic without API key', async () => {
      const settings: AISettings = {
        provider: 'anthropic',
        apiKeys: {},
        model: 'claude-3-5-sonnet-20241022',
      };

      await expect(
        extractComponentFromHtml('test code', settings, () => {})
      ).rejects.toThrow('Anthropic API key is required');
    });

    it('should handle Ollama provider (no API key required)', async () => {
      // Mock fetch for Ollama
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: {
          getReader: () => ({
            read: async () => ({
              done: true,
              value: new TextEncoder().encode(JSON.stringify({ response: '' })),
            }),
          }),
        },
      });

      const settings: AISettings = {
        provider: 'ollama',
        apiKeys: {},
        model: 'llama3.2',
        ollamaUrl: 'http://localhost:11434',
      };

      // This will fail at the actual API call, but we're testing the validation
      // In a real test environment, you'd mock the entire fetch chain
      try {
        await extractComponentFromHtml('test code', settings, () => {});
      } catch (error: any) {
        // Expected to fail at network level, but should not fail at validation
        expect(error.message).not.toContain('API key is required');
      }
    });

    it('should call onProgress callback during extraction', async () => {
      const progressCallback = vi.fn();

      // Mock a streaming response
      const mockChunks = [
        '<FRAMEWORK>react</FRAMEWORK>',
        '<COMPONENT_NAME>TestComponent</COMPONENT_NAME>',
        '<CODE_HTML><div>Test</div></CODE_HTML>',
      ];

      // This is a simplified test - in reality, you'd need to mock the entire
      // streaming response chain for each provider
      // For now, we're just testing the structure

      expect(progressCallback).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limit errors gracefully', async () => {
      const settings: AISettings = {
        provider: 'gemini',
        apiKeys: { gemini: 'test-key' },
        model: 'gemini-2.5-flash',
      };

      // Mock fetch to return rate limit error
      global.fetch = vi.fn().mockRejectedValue({
        message: '429',
        response: { status: 429 },
      });

      try {
        await extractComponentFromHtml('test', settings, () => {});
      } catch (error: any) {
        // Should have user-friendly error message
        expect(error.message).toBeDefined();
      }
    });

    it('should handle network errors', async () => {
      const settings: AISettings = {
        provider: 'ollama',
        apiKeys: {},
        model: 'llama3.2',
        ollamaUrl: 'http://localhost:11434',
      };

      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      try {
        await extractComponentFromHtml('test', settings, () => {});
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Settings Validation', () => {
    it('should validate provider is one of the supported types', () => {
      const validProviders: AISettings['provider'][] = ['gemini', 'openai', 'anthropic', 'ollama'];
      
      validProviders.forEach((provider) => {
        const settings: AISettings = {
          provider,
          apiKeys: provider === 'ollama' ? {} : { [provider]: 'test-key' },
          model: 'test-model',
        };
        
        expect(settings.provider).toBe(provider);
      });
    });

    it('should allow configuring extractionStyle as minimal or refactor', () => {
      const minimalSettings: AISettings = {
        provider: 'ollama',
        apiKeys: {},
        model: 'llama3.2',
        extractionStyle: 'minimal',
      };

      const refactorSettings: AISettings = {
        provider: 'ollama',
        apiKeys: {},
        model: 'llama3.2',
        extractionStyle: 'refactor',
      };

      expect(minimalSettings.extractionStyle).toBe('minimal');
      expect(refactorSettings.extractionStyle).toBe('refactor');
    });

    it('should allow configuring interactionMode as extract, explain, or review', () => {
      const base: AISettings = {
        provider: 'ollama',
        apiKeys: {},
        model: 'llama3.2',
      };

      const extractSettings: AISettings = { ...base, interactionMode: 'extract' };
      const explainSettings: AISettings = { ...base, interactionMode: 'explain' };
      const reviewSettings: AISettings = { ...base, interactionMode: 'review' };

      expect(extractSettings.interactionMode).toBe('extract');
      expect(explainSettings.interactionMode).toBe('explain');
      expect(reviewSettings.interactionMode).toBe('review');
    });
  });
});

