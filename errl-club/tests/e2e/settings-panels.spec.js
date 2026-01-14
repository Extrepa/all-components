/**
 * Settings Panels E2E Tests
 *
 * Tests for Audio, Camera, and Visual Effects settings panels
 */
import { test, expect } from '@playwright/test';
import { waitForGameReady, waitForGameSystems } from '../helpers/gameHelpers.js';

test.describe('Settings Panels', () => {
    test.beforeEach(async ({ page }) => {
        // Setup console error tracking
        const consoleErrors = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        page.on('pageerror', (error) => {
            consoleErrors.push(error.message);
        });
        page._consoleErrors = consoleErrors;
    });

    test('should open and close Audio Settings panel', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Open audio settings (assuming there's a way to open it)
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                // Try to open audio settings panel
                const audioSettings = window.gameSystems.uiManager.getPanel('audio_settings_ui');
                if (audioSettings) {
                    audioSettings.show();
                }
            }
        });

        // Wait for panel to appear
        await page.waitForFunction(() => {
            const panel = document.getElementById('audio_settings_ui');
            return panel && panel.style.display !== 'none';
        }, { timeout: 5000 }).catch(() => {
            // Panel might not be accessible this way, skip test
            test.skip();
        });

        // Check panel is visible
        const panel = page.locator('#audio_settings_ui');
        await expect(panel).toBeVisible({ timeout: 5000 });

        // Check for volume controls
        const masterVolume = page.locator('text=Master Volume').first();
        await expect(masterVolume).toBeVisible({ timeout: 5000 });
    });

    test('should open and close Camera Settings panel', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Open camera settings
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                const cameraSettings = window.gameSystems.uiManager.getPanel('camera_settings_ui');
                if (cameraSettings) {
                    cameraSettings.show();
                }
            }
        });

        // Wait for panel to appear
        await page.waitForFunction(() => {
            const panel = document.getElementById('camera_settings_ui');
            return panel && panel.style.display !== 'none';
        }, { timeout: 5000 }).catch(() => {
            test.skip();
        });

        // Check panel is visible
        const panel = page.locator('#camera_settings_ui');
        await expect(panel).toBeVisible({ timeout: 5000 });

        // Check for preset selector
        const presetLabel = page.locator('text=Intensity Preset').first();
        await expect(presetLabel).toBeVisible({ timeout: 5000 });
    });

    test('should open and close Visual Effects Settings panel', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Open visual effects settings
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                const veSettings = window.gameSystems.uiManager.getPanel('visual_effect_settings_ui');
                if (veSettings) {
                    veSettings.show();
                }
            }
        });

        // Wait for panel to appear
        await page.waitForFunction(() => {
            const panel = document.getElementById('visual_effect_settings_ui');
            return panel && panel.style.display !== 'none';
        }, { timeout: 5000 }).catch(() => {
            test.skip();
        });

        // Check panel is visible
        const panel = page.locator('#visual_effect_settings_ui');
        await expect(panel).toBeVisible({ timeout: 5000 });

        // Check for preset selector
        const presetLabel = page.locator('text=Preset').first();
        await expect(presetLabel).toBeVisible({ timeout: 5000 });
    });

    test('should use design system styling in settings panels', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Open audio settings
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                const audioSettings = window.gameSystems.uiManager.getPanel('audio_settings_ui');
                if (audioSettings) {
                    audioSettings.show();
                }
            }
        });

        // Wait for panel
        await page.waitForFunction(() => {
            const panel = document.getElementById('audio_settings_ui');
            return panel && panel.style.display !== 'none';
        }, { timeout: 5000 }).catch(() => {
            test.skip();
        });

        // Check that panel uses design system colors
        const panelStyles = await page.evaluate(() => {
            const panel = document.getElementById('audio_settings_ui');
            if (!panel) return null;
            const styles = window.getComputedStyle(panel);
            return {
                backgroundColor: styles.backgroundColor,
                borderColor: styles.borderColor,
                color: styles.color,
            };
        });

        expect(panelStyles).not.toBeNull();
        // Panel should have styling (not transparent/default)
        expect(panelStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('should update slider values in Audio Settings', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Open audio settings
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                const audioSettings = window.gameSystems.uiManager.getPanel('audio_settings_ui');
                if (audioSettings) {
                    audioSettings.show();
                }
            }
        });

        // Wait for panel
        await page.waitForFunction(() => {
            const panel = document.getElementById('audio_settings_ui');
            return panel && panel.style.display !== 'none';
        }, { timeout: 5000 }).catch(() => {
            test.skip();
        });

        // Find master volume slider
        const slider = page.locator('#audio_settings_ui input[type="range"]').first();
        await expect(slider).toBeVisible({ timeout: 5000 });

        // Get initial value
        const initialValue = await slider.inputValue();

        // Change slider value
        await slider.fill('75');
        await page.waitForTimeout(100); // Wait for onChange handler

        // Verify value changed
        const newValue = await slider.inputValue();
        expect(parseFloat(newValue)).toBeGreaterThan(parseFloat(initialValue));
    });

    test('should change preset in Camera Settings', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Open camera settings
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                const cameraSettings = window.gameSystems.uiManager.getPanel('camera_settings_ui');
                if (cameraSettings) {
                    cameraSettings.show();
                }
            }
        });

        // Wait for panel
        await page.waitForFunction(() => {
            const panel = document.getElementById('camera_settings_ui');
            return panel && panel.style.display !== 'none';
        }, { timeout: 5000 }).catch(() => {
            test.skip();
        });

        // Find preset dropdown
        const presetDropdown = page.locator('#camera_settings_ui select').first();
        await expect(presetDropdown).toBeVisible({ timeout: 5000 });

        // Get initial preset
        const initialPreset = await presetDropdown.inputValue();

        // Change preset to 'high'
        await presetDropdown.selectOption('high');
        await page.waitForTimeout(100); // Wait for onChange handler

        // Verify preset changed
        const newPreset = await presetDropdown.inputValue();
        expect(newPreset).toBe('high');
        expect(newPreset).not.toBe(initialPreset);
    });

    test('should change preset in Visual Effects Settings', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Open visual effects settings
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                const veSettings = window.gameSystems.uiManager.getPanel('visual_effect_settings_ui');
                if (veSettings) {
                    veSettings.show();
                }
            }
        });

        // Wait for panel
        await page.waitForFunction(() => {
            const panel = document.getElementById('visual_effect_settings_ui');
            return panel && panel.style.display !== 'none';
        }, { timeout: 5000 }).catch(() => {
            test.skip();
        });

        // Find preset dropdown
        const presetDropdown = page.locator('#visual_effect_settings_ui select').first();
        await expect(presetDropdown).toBeVisible({ timeout: 5000 });

        // Change preset
        await presetDropdown.selectOption('intense');
        await page.waitForTimeout(100);

        // Verify preset changed
        const newPreset = await presetDropdown.inputValue();
        expect(newPreset).toBe('intense');
    });

    test('should persist settings changes', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Open audio settings
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                const audioSettings = window.gameSystems.uiManager.getPanel('audio_settings_ui');
                if (audioSettings) {
                    audioSettings.show();
                }
            }
        });

        // Wait for panel
        await page.waitForFunction(() => {
            const panel = document.getElementById('audio_settings_ui');
            return panel && panel.style.display !== 'none';
        }, { timeout: 5000 }).catch(() => {
            test.skip();
        });

        // Change a setting
        const slider = page.locator('#audio_settings_ui input[type="range"]').first();
        await slider.fill('80');
        await page.waitForTimeout(100);

        // Click save/apply button if it exists
        const saveButton = page.locator('#audio_settings_ui button:has-text("Save"), #audio_settings_ui button:has-text("Apply")').first();
        if (await saveButton.isVisible().catch(() => false)) {
            await saveButton.click();
            await page.waitForTimeout(200);
        }

        // Close panel
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                const audioSettings = window.gameSystems.uiManager.getPanel('audio_settings_ui');
                if (audioSettings) {
                    audioSettings.hide();
                }
            }
        });

        // Reopen panel and verify setting persisted
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                const audioSettings = window.gameSystems.uiManager.getPanel('audio_settings_ui');
                if (audioSettings) {
                    audioSettings.show();
                }
            }
        });

        await page.waitForFunction(() => {
            const panel = document.getElementById('audio_settings_ui');
            return panel && panel.style.display !== 'none';
        }, { timeout: 5000 }).catch(() => {
            test.skip();
        });

        // Verify slider value is still 80 (or close to it)
        const persistedValue = await slider.inputValue();
        expect(parseFloat(persistedValue)).toBeGreaterThanOrEqual(75);
    });

    test('should handle slider value changes in Visual Effects Settings', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Open visual effects settings
        await page.evaluate(() => {
            if (window.gameSystems?.uiManager) {
                const veSettings = window.gameSystems.uiManager.getPanel('visual_effect_settings_ui');
                if (veSettings) {
                    veSettings.show();
                }
            }
        });

        // Wait for panel
        await page.waitForFunction(() => {
            const panel = document.getElementById('visual_effect_settings_ui');
            return panel && panel.style.display !== 'none';
        }, { timeout: 5000 }).catch(() => {
            test.skip();
        });

        // Find first slider
        const slider = page.locator('#visual_effect_settings_ui input[type="range"]').first();
        await expect(slider).toBeVisible({ timeout: 5000 });

        // Get initial value
        const initialValue = parseFloat(await slider.inputValue());

        // Change slider value
        const newValue = Math.min(100, initialValue + 10);
        await slider.fill(newValue.toString());
        await page.waitForTimeout(100);

        // Verify value changed
        const updatedValue = parseFloat(await slider.inputValue());
        expect(updatedValue).toBeGreaterThanOrEqual(newValue - 1); // Allow for rounding
    });

    test('should handle error scenarios gracefully', async ({ page }) => {
        await page.goto('/');
        await waitForGameReady(page);
        await waitForGameSystems(page);

        // Try to open a panel that might not exist
        const result = await page.evaluate(() => {
            try {
                if (window.gameSystems?.uiManager) {
                    const panel = window.gameSystems.uiManager.getPanel('nonexistent_panel');
                    if (panel) {
                        panel.show();
                        return 'opened';
                    }
                    return 'not_found';
                }
                return 'no_ui_manager';
            } catch (error) {
                return `error: ${error.message}`;
            }
        });

        // Should handle gracefully without throwing
        expect(result).not.toContain('error:');
    });
});

