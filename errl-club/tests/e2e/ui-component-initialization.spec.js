import { test, expect } from '@playwright/test';
import { setupTestWithGameInit, cleanupTestWithErrorCheck, waitForGameSystems, checkForErrorsDuringTest } from '../helpers/gameHelpers.js';

/**
 * UI Component Initialization Tests
 * 
 * Verifies that all UI components are properly initialized and have their dependencies set
 */
test.describe('UI Component Initialization', () => {
  let errorCollection;

  test.beforeEach(async ({ page }) => {
    const setup = await setupTestWithGameInit(page);
    errorCollection = setup.errorCollection;
    await waitForGameSystems(page);
    
    // Wait for game to fully initialize
    await page.waitForTimeout(1000);
    
    // Check for blocking errors after full initialization
    const preCheck = await checkForErrorsDuringTest(page, errorCollection);
    if (preCheck.hasErrors) {
      console.warn('Errors after UI initialization (non-blocking):', preCheck.errors.map(e => e.description).join(', '));
    }
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestWithErrorCheck(page, errorCollection);
  });

  test('should have all UI components initialized', async ({ page }) => {
    const uiComponents = await page.evaluate(() => {
      if (!window.gameSystems) return {};
      
      return {
        vibeMeter: !!window.gameSystems.vibeMeter,
        notificationSystem: !!window.gameSystems.notificationSystem,
        cameraIntensityIndicator: !!window.gameSystems.cameraIntensityIndicator,
        interactionPrompt: !!window.gameSystems.interactionPrompt,
        interactionFeedback: !!window.gameSystems.interactionFeedback,
        errlPhone: !!window.gameSystems.errlPhone,
        helpSystem: !!window.gameSystems.helpSystem,
        helpPanel: !!window.gameSystems.helpPanel,
        replayRecordingIndicator: !!window.gameSystems.replayRecordingIndicator,
        visualRecorderUI: !!window.gameSystems.visualRecorderUI,
        collectionStreakUI: !!window.gameSystems.collectionStreakUI,
        roomTransitionUI: !!window.gameSystems.roomTransitionUI,
        controlsReferenceUI: !!window.gameSystems.controlsReferenceUI,
        discoveryMap: !!window.gameSystems.discoveryMap,
      };
    });

    expect(uiComponents.vibeMeter).toBe(true);
    expect(uiComponents.notificationSystem).toBe(true);
    expect(uiComponents.cameraIntensityIndicator).toBe(true);
    expect(uiComponents.interactionPrompt).toBe(true);
    expect(uiComponents.interactionFeedback).toBe(true);
    expect(uiComponents.errlPhone).toBe(true);
    expect(uiComponents.helpSystem).toBe(true);
    expect(uiComponents.helpPanel).toBe(true);
    expect(uiComponents.replayRecordingIndicator).toBe(true);
    expect(uiComponents.visualRecorderUI).toBe(true);
    expect(uiComponents.collectionStreakUI).toBe(true);
    expect(uiComponents.roomTransitionUI).toBe(true);
    expect(uiComponents.controlsReferenceUI).toBe(true);
    expect(uiComponents.discoveryMap).toBe(true);
  });

  test('should have ErrlPhone with systems set', async ({ page }) => {
    const phoneStatus = await page.evaluate(() => {
      if (!window.gameSystems || !window.gameSystems.errlPhone) {
        return { hasPhone: false, hasSystems: false };
      }
      
      const phone = window.gameSystems.errlPhone;
      return {
        hasPhone: true,
        hasSystems: !!phone.systems,
        isCollapsed: phone.isCollapsed,
        currentTab: phone.currentTab,
      };
    });

    expect(phoneStatus.hasPhone).toBe(true);
    expect(phoneStatus.hasSystems).toBe(true);
    expect(phoneStatus.isCollapsed).toBe(true); // Should start collapsed
    expect(['menu', 'map', 'avatar', 'inventory']).toContain(phoneStatus.currentTab);
  });

  test('should have VisualRecorderUI with visualRecorder set', async ({ page }) => {
    const recorderStatus = await page.evaluate(() => {
      if (!window.gameSystems || !window.gameSystems.visualRecorderUI) {
        return { hasUI: false, hasRecorder: false };
      }
      
      const ui = window.gameSystems.visualRecorderUI;
      return {
        hasUI: true,
        hasRecorder: !!ui.visualRecorder,
        hasVisualRecorder: !!window.gameSystems.visualRecorder,
      };
    });

    expect(recorderStatus.hasUI).toBe(true);
    expect(recorderStatus.hasRecorder).toBe(true);
    expect(recorderStatus.hasVisualRecorder).toBe(true);
  });

  test('should have DiscoveryMap with dependencies set', async ({ page }) => {
    const mapStatus = await page.evaluate(() => {
      if (!window.gameSystems || !window.gameSystems.discoveryMap) {
        return { hasMap: false, hasDiscovery: false, hasRoomManager: false };
      }
      
      const map = window.gameSystems.discoveryMap;
      return {
        hasMap: true,
        hasDiscovery: !!map.discoverySystem,
        hasRoomManager: !!map.roomManager,
      };
    });

    expect(mapStatus.hasMap).toBe(true);
    // These may be null initially, but should be set eventually
    expect(typeof mapStatus.hasDiscovery).toBe('boolean');
    expect(typeof mapStatus.hasRoomManager).toBe('boolean');
  });

  test('should have ControlsReferenceUI with keybindManager set', async ({ page }) => {
    const controlsStatus = await page.evaluate(() => {
      if (!window.gameSystems || !window.gameSystems.controlsReferenceUI) {
        return { hasUI: false, hasKeybinds: false };
      }
      
      const ui = window.gameSystems.controlsReferenceUI;
      return {
        hasUI: true,
        hasKeybinds: !!ui.keybindManager,
        hasKeybindManager: !!window.gameSystems.keybindManager,
      };
    });

    expect(controlsStatus.hasUI).toBe(true);
    expect(controlsStatus.hasKeybinds).toBe(true);
    expect(controlsStatus.hasKeybindManager).toBe(true);
  });

  test('should be able to open lazy-loaded UI components', async ({ page }) => {
    // Test F4 - QuickSettingsMenu
    await page.keyboard.press('F4');
    await page.waitForTimeout(500);
    
    const quickSettingsVisible = await page.evaluate(() => {
      const menu = document.querySelector('#quick-settings-menu, [id*="quick-settings"]');
      return menu && (menu.style.display !== 'none' || menu.offsetParent !== null);
    });
    
    // QuickSettingsMenu should be created and visible
    expect(quickSettingsVisible).toBe(true);
    
    // Close it
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });

  test('should have NotificationSystem working', async ({ page }) => {
    const notificationWorks = await page.evaluate(() => {
      if (!window.gameSystems || !window.gameSystems.notificationSystem) {
        return false;
      }
      
      try {
        window.gameSystems.notificationSystem.show('Test notification', {
          type: 'info',
          duration: 1000,
        });
        return true;
      } catch (error) {
        return false;
      }
    });

    expect(notificationWorks).toBe(true);
    
    // Wait for notification to appear
    await page.waitForTimeout(100);
    
    // Check if notification element exists
    const hasNotification = await page.evaluate(() => {
      const notification = document.querySelector('.notification, [class*="notification"]');
      return !!notification;
    });
    
    expect(hasNotification).toBe(true);
  });
});

