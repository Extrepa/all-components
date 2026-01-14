/**
 * Global setup for Playwright tests
 * Suppresses excessive console logging during tests
 */

export default async function globalSetup() {
  // Set environment variable to indicate test mode
  process.env.TEST_MODE = 'true';
  
  // Suppress NO_COLOR warnings by unsetting FORCE_COLOR
  // This prevents the "NO_COLOR env is ignored due to FORCE_COLOR" warnings
  delete process.env.FORCE_COLOR;
  process.env.NO_COLOR = '1';
  
  // Suppress Node.js warnings about environment variables
  process.env.NODE_NO_WARNINGS = '1';
  
  console.log('Test mode enabled - excessive logging suppressed');
}

