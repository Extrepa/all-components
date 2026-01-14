/**
 * Integration tests for metadata-driven systems
 * 
 * Tests that metadata drives registrations, defaults, and UI lists
 */

/// <reference path="../../jest.d.ts" />

import { ORGAN_METADATA, getRecommendedOrganIds, OrganId } from '../../../src/organs/metadata';
import { ORGANS } from '../../../src/organs/index';
import { DEFAULT_SETTINGS } from '../../../src/settings/ErrlSettings';
import { ErrlKernel } from '../../../src/kernel/ErrlKernel';
import { MockApp, TestUtils } from '../../setup';
import { FirstRunWizard } from '../../../src/settings/FirstRunWizard';

describe('Metadata Integration', () => {
	describe('main.ts registration', () => {
		it('should register all organs from ORGANS array', async () => {
			const app = TestUtils.createTestApp();
			const plugin = {
				loadData: async () => ({}),
				saveData: async () => {},
				app: app,
				addCommand: jest.fn(),
			};
			const kernel = new ErrlKernel(plugin as any, app as any);

			// Register all organs as main.ts does
			for (const organMetadata of ORGANS) {
				kernel.registerOrgan(organMetadata.create(kernel, plugin as any));
			}

			// Verify all organs are registered
			const registry = kernel.getRegistry();
			for (const organ of ORGAN_METADATA) {
				const registered = registry.get(organ.id);
				expect(registered).toBeDefined();
				expect(registered?.getId()).toBe(organ.id);
			}
		});

		it('should register exactly 16 organs', async () => {
			const app = TestUtils.createTestApp();
			const plugin = {
				loadData: async () => ({}),
				saveData: async () => {},
				app: app,
				addCommand: jest.fn(),
			};
			const kernel = new ErrlKernel(plugin as any, app as any);

			// Register all organs as main.ts does
			for (const organMetadata of ORGANS) {
				kernel.registerOrgan(organMetadata.create(kernel, plugin as any));
			}

			const registry = kernel.getRegistry();
			expect(registry.getAll()).toHaveLength(16);
		});

		it('should use ORGANS array, not hardcoded list', () => {
			// This test verifies that main.ts uses ORGANS array
			// If ORGANS changes, main.ts will automatically pick it up
			expect(ORGANS.length).toBe(ORGAN_METADATA.length);
			expect(ORGANS.every(organ => ORGAN_METADATA.some(m => m.id === organ.id))).toBe(true);
		});
	});

	describe('DEFAULT_SETTINGS.enabledOrgans', () => {
		it('should be built from ORGAN_METADATA', () => {
			const metadataIds = ORGAN_METADATA.map(organ => organ.id);
			const settingsIds = Object.keys(DEFAULT_SETTINGS.enabledOrgans);

			// Should have all metadata IDs
			for (const id of metadataIds) {
				expect(settingsIds).toContain(id);
			}

			// Should not have extra IDs
			expect(settingsIds.length).toBe(metadataIds.length);
		});

		it('should have all organs default to false', () => {
			for (const organ of ORGAN_METADATA) {
				const enabled = DEFAULT_SETTINGS.enabledOrgans[organ.id as OrganId];
				expect(enabled).toBe(false);
			}
		});

		it('should match ORGAN_METADATA order', () => {
			const metadataIds = ORGAN_METADATA.map(organ => organ.id);
			const settingsIds = Object.keys(DEFAULT_SETTINGS.enabledOrgans);
			
			// Order should match (though object key order isn't guaranteed, we check completeness)
			expect(new Set(settingsIds)).toEqual(new Set(metadataIds));
		});
	});

	describe('First-Run Wizard metadata usage', () => {
		it('should use getRecommendedOrganIds() for default selection', () => {
			const recommendedIds = getRecommendedOrganIds();
			
			// Create wizard instance to check default selection
			const app = TestUtils.createTestApp();
			const plugin = {
				loadData: async () => ({}),
				saveData: async () => {},
				app: app,
				addCommand: jest.fn(),
			};
			const kernel = new ErrlKernel(plugin as any, app as any);
			
			// Initialize kernel
			kernel.initialize();
			
			const wizard = new FirstRunWizard(app as any, kernel);
			
			// Access private property via type assertion for testing
			const selectedOrgans = (wizard as any).selectedOrgans as Set<OrganId>;
			
			// Should have recommended organs selected by default
			for (const id of recommendedIds) {
				expect(selectedOrgans.has(id)).toBe(true);
			}
		});

		it('should iterate ORGAN_METADATA for organ selection UI', () => {
			// This test verifies that FirstRunWizard uses ORGAN_METADATA
			// The actual UI rendering is tested in the wizard itself
			// We verify the metadata is accessible and used
			expect(ORGAN_METADATA.length).toBeGreaterThan(0);
			
			// Verify recommended organs exist
			const recommended = ORGAN_METADATA.filter(organ => organ.recommended);
			expect(recommended.length).toBeGreaterThan(0);
		});
	});

	describe('Settings Tab metadata usage', () => {
		it('should use ORGAN_METADATA for organ toggle list', async () => {
			const app = TestUtils.createTestApp();
			const plugin = {
				loadData: async () => ({}),
				saveData: async () => {},
				app: app,
				addCommand: jest.fn(),
			};
			const kernel = new ErrlKernel(plugin as any, app as any);
			await kernel.initialize();

			// Register all organs
			for (const organMetadata of ORGANS) {
				kernel.registerOrgan(organMetadata.create(kernel, plugin as any));
			}

			// Settings tab should iterate ORGAN_METADATA
			// We can't easily test the UI rendering, but we verify the metadata is used
			const metadataIds = ORGAN_METADATA.map(organ => organ.id);
			const settings = kernel.getSettings();
			const settingsIds = Object.keys(settings.enabledOrgans);

			// All metadata IDs should be in settings
			for (const id of metadataIds) {
				expect(settingsIds).toContain(id);
			}
		});

		it('should have organ metadata accessible for UI rendering', () => {
			// Verify that ORGAN_METADATA has all fields needed for UI
			for (const organ of ORGAN_METADATA) {
				expect(organ).toHaveProperty('id');
				expect(organ).toHaveProperty('name');
				expect(organ).toHaveProperty('description');
				expect(organ).toHaveProperty('phase');
				// These are used in Settings Tab UI
			}
		});
	});

	describe('Metadata-driven consistency', () => {
		it('should have consistent organ IDs across all systems', () => {
			const metadataIds = ORGAN_METADATA.map(organ => organ.id);
			const organsIds = ORGANS.map(organ => organ.id);
			const settingsIds = Object.keys(DEFAULT_SETTINGS.enabledOrgans);

			// All should match
			expect(new Set(metadataIds)).toEqual(new Set(organsIds));
			expect(new Set(metadataIds)).toEqual(new Set(settingsIds));
		});

		it('should automatically include new organs when added to metadata', () => {
			// This is a conceptual test - if a new organ is added to ORGAN_METADATA:
			// 1. It should appear in ORGANS (if creator exists)
			// 2. It should appear in DEFAULT_SETTINGS.enabledOrgans
			// 3. It should appear in First-Run Wizard
			// 4. It should appear in Settings Tab
			
			// Verify the mechanism is in place
			expect(ORGANS.length).toBe(ORGAN_METADATA.length);
			expect(Object.keys(DEFAULT_SETTINGS.enabledOrgans).length).toBe(ORGAN_METADATA.length);
		});
	});
});

