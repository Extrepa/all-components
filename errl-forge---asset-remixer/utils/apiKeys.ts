/**
 * Utility functions for managing API keys
 * Checks localStorage first, then falls back to environment variables
 */

const STORAGE_KEYS = {
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY'
};

/**
 * Get API key from localStorage or environment variable
 */
export function getApiKey(provider: 'gemini' | 'openai' | 'anthropic'): string | undefined {
  // Check localStorage first (user input)
  const stored = localStorage.getItem(STORAGE_KEYS[provider]);
  if (stored) {
    return stored;
  }
  
  // Fall back to environment variable
  const envKey = provider === 'gemini' 
    ? (process.env.GEMINI_API_KEY || process.env.API_KEY)
    : process.env[`${provider.toUpperCase()}_API_KEY` as keyof typeof process.env];
  
  return envKey;
}

/**
 * Check if an API key is configured for a provider
 */
export function hasApiKey(provider: 'gemini' | 'openai' | 'anthropic'): boolean {
  return !!getApiKey(provider);
}

