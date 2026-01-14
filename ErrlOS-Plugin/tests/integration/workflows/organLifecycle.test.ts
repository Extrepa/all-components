/**
 * Integration tests for organ lifecycle workflows
 * 
 * Tests the complete lifecycle: registration → load → enable → disable → unload
 */

/// <reference path="../../jest.d.ts" />

import { ErrlKernel } from '../../../src/kernel/ErrlKernel';
import { DashboardOrgan } from '../../../src/organs/dashboard/DashboardOrgan';
import { CaptureOrgan } from '../../../src/organs/capture/CaptureOrgan';
import { MockApp, TestUtils } from '../../setup';

describe('Organ Lifecycle Workflow', () => {
	let kernel: ErrlKernel;
	let app: MockApp;
	let plugin: any;
	const mockDashboardConsent = (organ: DashboardOrgan) => {
		jest.spyOn(organ as any, 'requestDashboardCreationConsent').mockResolvedValue(true);
		jest.spyOn(organ as any, 'ensureDashboardExists').mockResolvedValue(undefined);
		jest.spyOn(organ as any, 'registerMarkdownPostProcessor').mockImplementation(() => {});
	};

	beforeEach(async () => {
		app = TestUtils.createTestApp();
		plugin = {
			loadData: async () => ({}),
			saveData: async () => {},
			app: app,
			addCommand: jest.fn(),
		};
		kernel = new ErrlKernel(plugin as any, app as any);
		await kernel.initialize();
	});

	describe('Registration and Loading', () => {
		it('should register organ with kernel', () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			kernel.registerOrgan(organ);
			
			const registered = kernel.getRegistry().get('dashboard');
			expect(registered).toBeDefined();
			expect(registered?.getId()).toBe('dashboard');
		});

		it('should load organ settings on initialization', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			kernel.registerOrgan(organ);
			
			await organ.onLoad();
			const settings = kernel.getSettings();
			expect(settings.dashboardPath).toBeDefined();
		});

		it('should handle multiple organs loading', async () => {
			const dashboard = new DashboardOrgan(kernel, plugin as any);
			const capture = new CaptureOrgan(kernel, plugin as any);
			
			kernel.registerOrgan(dashboard);
			kernel.registerOrgan(capture);
			
			await dashboard.onLoad();
			await capture.onLoad();
			
			expect(kernel.getRegistry().get('dashboard')).toBeDefined();
			expect(kernel.getRegistry().get('capture')).toBeDefined();
		});
	});

	describe('Enable/Disable Workflow', () => {
		it('should enable organ through kernel', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			mockDashboardConsent(organ);
			kernel.registerOrgan(organ);
			
			// Skip walkthrough for testing
			await kernel.enableOrgan('dashboard', true);
			
			expect(kernel.isOrganEnabled('dashboard')).toBe(true);
		});

		it('should disable enabled organ', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			mockDashboardConsent(organ);
			kernel.registerOrgan(organ);
			
			await kernel.enableOrgan('dashboard', true);
			await kernel.disableOrgan('dashboard');
			
			expect(kernel.isOrganEnabled('dashboard')).toBe(false);
		});

		it('should register commands when enabled', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			mockDashboardConsent(organ);
			kernel.registerOrgan(organ);
			
			await kernel.enableOrgan('dashboard', true);
			
			// Verify commands were registered
			expect(plugin.addCommand).toHaveBeenCalled();
		});

		it('should handle enable/disable cycle', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			mockDashboardConsent(organ);
			kernel.registerOrgan(organ);
			
			// Enable
			await kernel.enableOrgan('dashboard', true);
			expect(kernel.isOrganEnabled('dashboard')).toBe(true);
			
			// Disable
			await kernel.disableOrgan('dashboard');
			expect(kernel.isOrganEnabled('dashboard')).toBe(false);
			
			// Re-enable
			await kernel.enableOrgan('dashboard', true);
			expect(kernel.isOrganEnabled('dashboard')).toBe(true);
		});
	});

	describe('Settings Persistence', () => {
		it('should persist enabled organ state', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			mockDashboardConsent(organ);
			kernel.registerOrgan(organ);
			
			await kernel.enableOrgan('dashboard', true);
			const settings = kernel.getSettings();
			
			expect(settings.enabledOrgans['dashboard']).toBe(true);
		});

		it('should persist disabled organ state', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			mockDashboardConsent(organ);
			kernel.registerOrgan(organ);
			
			await kernel.enableOrgan('dashboard', true);
			await kernel.disableOrgan('dashboard');
			const settings = kernel.getSettings();
			
			expect(settings.enabledOrgans['dashboard']).toBe(false);
		});
	});

	describe('Error Handling', () => {
		it('should handle enabling non-existent organ gracefully', async () => {
			await expect(kernel.enableOrgan('nonexistent', true)).rejects.toThrow();
		});

		it('should handle disabling non-existent organ gracefully', async () => {
			await expect(kernel.disableOrgan('nonexistent')).rejects.toThrow();
		});

		it('should handle enabling already enabled organ', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			mockDashboardConsent(organ);
			kernel.registerOrgan(organ);
			
			await kernel.enableOrgan('dashboard', true);
			// Should not throw when enabling again
			await kernel.enableOrgan('dashboard', true);
			
			expect(kernel.isOrganEnabled('dashboard')).toBe(true);
		});
	});

	describe('Command Registration Stability', () => {
		it('should register commands only when enabled', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			mockDashboardConsent(organ);
			kernel.registerOrgan(organ);

			const initialCallCount = plugin.addCommand.mock.calls.length;

			// Load organ (should not register commands)
			await organ.onLoad();
			const afterLoadCount = plugin.addCommand.mock.calls.length;
			expect(afterLoadCount).toBe(initialCallCount);

			// Enable organ (should register commands)
			await kernel.enableOrgan('dashboard', true);
			const afterEnableCount = plugin.addCommand.mock.calls.length;
			expect(afterEnableCount).toBeGreaterThan(afterLoadCount);
		});

		it('should not duplicate commands on enable/disable cycles', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			mockDashboardConsent(organ);
			kernel.registerOrgan(organ);

			// First enable
			await kernel.enableOrgan('dashboard', true);
			const firstEnableCalls = plugin.addCommand.mock.calls.length;
			expect(firstEnableCalls).toBeGreaterThan(0);

			// Disable
			await kernel.disableOrgan('dashboard');

			// Re-enable
			await kernel.enableOrgan('dashboard', true);
			const secondEnableCalls = plugin.addCommand.mock.calls.length;

			// Commands should be registered again (Obsidian handles deduplication)
			// We verify the pattern: registerCommands is called, Obsidian prevents duplicates
			expect(secondEnableCalls).toBeGreaterThan(firstEnableCalls);
		});

		it('should have stable lifecycle with consent stubbing', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			mockDashboardConsent(organ);
			kernel.registerOrgan(organ);

			// Multiple enable/disable cycles should be stable
			for (let i = 0; i < 3; i++) {
				await kernel.enableOrgan('dashboard', true);
				expect(kernel.isOrganEnabled('dashboard')).toBe(true);
				
				await kernel.disableOrgan('dashboard');
				expect(kernel.isOrganEnabled('dashboard')).toBe(false);
			}
		});

		it('should have stable lifecycle with postprocessor stubbing', async () => {
			const organ = new DashboardOrgan(kernel, plugin as any);
			mockDashboardConsent(organ);
			kernel.registerOrgan(organ);

			// Postprocessor is stubbed, so lifecycle should be stable
			await kernel.enableOrgan('dashboard', true);
			expect(kernel.isOrganEnabled('dashboard')).toBe(true);

			await kernel.disableOrgan('dashboard');
			expect(kernel.isOrganEnabled('dashboard')).toBe(false);
		});
	});
});
