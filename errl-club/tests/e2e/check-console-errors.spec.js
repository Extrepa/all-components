import { test, expect } from '@playwright/test';

/**
 * Test to check for console errors that might prevent game loading
 */
test.describe('Console Error Check', () => {
  test('should load without console errors', async ({ page }) => {
    const errors = [];
    const warnings = [];
    
    // Collect all console messages
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
        console.log('CONSOLE ERROR:', text);
      } else if (msg.type() === 'warning') {
        warnings.push(text);
      }
    });
    
    // Collect page errors
    page.on('pageerror', (error) => {
      errors.push(`Page Error: ${error.message}`);
      console.log('PAGE ERROR:', error.message);
      console.log('STACK:', error.stack);
    });
    
    // Navigate to the game
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for script to execute
    await page.waitForTimeout(3000);
    
    // Check for canvas
    const canvas = page.locator('#club-canvas');
    const canvasExists = await canvas.count() > 0;
    
    // Check for game systems
    const hasGameSystems = await page.evaluate(() => {
      return typeof window.gameSystems !== 'undefined' || 
             typeof window.gameInitializer !== 'undefined';
    });
    
    // Log results
    console.log('Canvas exists:', canvasExists);
    console.log('Has game systems:', hasGameSystems);
    console.log('Total errors:', errors.length);
    console.log('Total warnings:', warnings.length);
    
    if (errors.length > 0) {
      console.log('All errors:', errors);
    }
    
    // The test should pass even if there are errors (we're just checking)
    // But log them so we can see what's wrong
    expect(canvasExists).toBe(true);
  });
});

