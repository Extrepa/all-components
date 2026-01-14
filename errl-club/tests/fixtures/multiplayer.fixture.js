import { test as base } from '@playwright/test';
import { createMultiplayerContexts, createPagesFromContexts, cleanupMultiplayerContexts } from '../helpers/multiplayerHelpers.js';
import { waitForGameReady } from '../helpers/gameHelpers.js';

/**
 * Multiplayer test fixture
 * Provides multiple browser contexts for testing multiplayer scenarios
 */
export const test = base.extend({
  // Multiplayer contexts fixture
  multiplayerContexts: async ({ browser }, use) => {
    const contexts = await createMultiplayerContexts(browser, 2);
    await use(contexts);
    await cleanupMultiplayerContexts(contexts);
  },
  
  // Multiplayer pages fixture
  multiplayerPages: async ({ multiplayerContexts }, use) => {
    const pages = await createPagesFromContexts(multiplayerContexts);
    
    // Navigate all pages to game
    await Promise.all(pages.map(page => page.goto('/')));
    
    // Wait for all pages to be ready
    await Promise.all(pages.map(page => waitForGameReady(page)));
    
    await use(pages);
  },
  
  // Three player pages fixture
  threePlayerPages: async ({ browser }, use) => {
    const contexts = await createMultiplayerContexts(browser, 3);
    const pages = await createPagesFromContexts(contexts);
    
    await Promise.all(pages.map(page => page.goto('/')));
    await Promise.all(pages.map(page => waitForGameReady(page)));
    
    await use(pages);
    
    await cleanupMultiplayerContexts(contexts);
  },
});

export { expect } from '@playwright/test';



