import { AppError, ErrorCategory, ErrorContext } from './types';

export async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    // Try direct fetch first (works for same-origin or CORS-enabled images)
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;
    
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip any data URI prefix (handles png, jpeg, jpg, gif, webp, etc.)
        const base64 = result.replace(/^data:image\/[^;]+;base64,/, '');
        resolve(base64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    // CORS or other fetch errors - return null instead of throwing
    // The caller can handle this gracefully
    return null;
  }
}

/**
 * Get image dimensions from base64 or image URL
 * Works even with CORS restrictions (can read dimensions, just not pixel data)
 */
export async function getImageDimensions(source: string): Promise<{ width: number; height: number } | null> {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => resolve(null), 5000); // 5s timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };
      
      if (source.startsWith('data:')) {
        img.src = source;
      } else {
        // Try with crossOrigin, but dimensions should work even if CORS fails
        img.crossOrigin = 'anonymous';
        img.src = source;
      }
    });
  } catch (error) {
    return null;
  }
}

/**
 * Resize an image to target dimensions
 */
export async function resizeImage(imageUrl: string, targetWidth: number, targetHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to get canvas context for resizing'));
      }
      // Use high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };
    img.src = imageUrl;
  });
}

/**
 * Creates a structured error from various error sources
 */
export function createAppError(
  error: unknown,
  context: ErrorContext
): AppError {
  const originalError = error instanceof Error ? error : new Error(String(error));
  const errorMessage = originalError.message || 'An unknown error occurred';
  
  let category: ErrorCategory = 'unknown_error';
  let userMessage = 'Something went wrong. Please try again.';
  let retryable = false;
  let retryAfter: number | undefined;

  // Network errors
  if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
    category = 'network_error';
    userMessage = 'Network connection failed. Please check your internet connection and try again.';
    retryable = true;
  }
  // Timeout errors
  else if (errorMessage.includes('timeout') || errorMessage.includes('timed out') || errorMessage.includes('AbortError')) {
    category = 'timeout_error';
    userMessage = 'Request timed out. The server may be slow. Please try again.';
    retryable = true;
  }
  // Rate limit errors
  else if (errorMessage.includes('rate limit') || errorMessage.includes('429') || errorMessage.includes('quota')) {
    category = 'rate_limit';
    userMessage = 'Rate limit exceeded. Please wait a moment and try again.';
    retryable = true;
    retryAfter = 30; // Default 30 seconds
  }
  // Auth errors
  else if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Unauthorized')) {
    category = 'auth_error';
    userMessage = `API key issue with ${context.provider || 'provider'}. Please check your API key configuration.`;
    retryable = false;
  }
  // API errors (5xx)
  else if (errorMessage.includes('503') || errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('504')) {
    category = 'api_error';
    userMessage = 'Service temporarily unavailable. Please try again in a moment.';
    retryable = true;
    retryAfter = 10;
  }
  // Provider-specific errors
  else if (errorMessage.includes('does not support')) {
    category = 'provider_error';
    userMessage = errorMessage; // Use the original message as it's usually user-friendly
    retryable = false;
  }
  // Generation errors
  else if (errorMessage.includes('No image') || errorMessage.includes('No content') || errorMessage.includes('generation')) {
    category = 'generation_error';
    userMessage = 'Failed to generate asset. Please try with a different prompt or provider.';
    retryable = true;
  }
  // API errors (4xx)
  else if (errorMessage.includes('400') || errorMessage.includes('404') || errorMessage.includes('API error')) {
    category = 'api_error';
    userMessage = 'Invalid request. Please check your input and try again.';
    retryable = false;
  }

  // Add provider-specific guidance
  if (context.provider === 'Anthropic' && context.operation === 'image') {
    userMessage = 'Anthropic does not support image generation. Please use Gemini or OpenAI for image generation.';
    category = 'provider_error';
    retryable = false;
  }

  return {
    category,
    message: errorMessage,
    userMessage,
    provider: context.provider,
    operation: context.operation,
    retryable,
    retryAfter,
    originalError
  };
}
