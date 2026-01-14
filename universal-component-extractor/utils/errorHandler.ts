/**
 * Error Handling Utilities
 * Provides consistent error handling and retry mechanisms
 */

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry,
    shouldRetry = () => true,
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if we've exhausted attempts or shouldn't retry
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1);
      }
      
      // Exponential backoff: delay * 2^attempt
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  // Check for common error patterns
  const errorString = JSON.stringify(error).toLowerCase();
  
  if (errorString.includes('429') || errorString.includes('rate limit')) {
    return '⚠️ Rate Limit Exceeded. The AI is currently busy. Please wait a moment and try again.';
  }
  
  if (errorString.includes('network') || errorString.includes('fetch')) {
    return '🌐 Network Error. Please check your internet connection and try again.';
  }
  
  if (errorString.includes('api key') || errorString.includes('authentication')) {
    return '🔑 Authentication Error. Please check your API key in settings.';
  }
  
  if (errorString.includes('safety') || errorString.includes('blocked')) {
    return '🚫 Content was flagged by safety filters and could not be processed.';
  }
  
  if (errorString.includes('ollama') || errorString.includes('localhost')) {
    return '🖥️ Ollama Error. Make sure Ollama is running and the model is installed.';
  }
  
  return '❌ An unexpected error occurred. Please try again or check the console for details.';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const errorString = JSON.stringify(error).toLowerCase();
  
  // Retry on network errors
  if (errorString.includes('network') || errorString.includes('fetch') || errorString.includes('timeout')) {
    return true;
  }
  
  // Retry on rate limits (with delay)
  if (errorString.includes('429') || errorString.includes('rate limit')) {
    return true;
  }
  
  // Retry on server errors (5xx)
  if (errorString.includes('500') || errorString.includes('502') || errorString.includes('503')) {
    return true;
  }
  
  // Don't retry on client errors (4xx except 429)
  if (errorString.includes('400') || errorString.includes('401') || errorString.includes('403') || errorString.includes('404')) {
    return false;
  }
  
  // Don't retry on safety/content errors
  if (errorString.includes('safety') || errorString.includes('blocked')) {
    return false;
  }
  
  return false;
}

/**
 * Create a user-friendly error with context
 */
export function createUserError(message: string, originalError?: any): Error {
  const error = new Error(message);
  if (originalError) {
    (error as any).originalError = originalError;
    (error as any).stack = originalError.stack || error.stack;
  }
  return error;
}

