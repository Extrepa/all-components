/**
 * Integration tests for DashboardOrgan
 * 
 * Tests dashboard organ integration with kernel and other organs
 */

/// <reference path="../../jest.d.ts" />

import { ErrlKernel } from '../../../src/kernel/ErrlKernel';
import { DashboardOrgan } from '../../../src/organs/dashboard/DashboardOrgan';
import { MockApp, TestUtils } from '../../setup';

describe('DashboardOrgan Integration', () => {
	let kernel: ErrlKernel;
	let organ: DashboardOrgan;
	let app: MockApp;
	let plugin: any;
	
	beforeEach(async () => {
		app = TestUtils.createTestApp();
		// Create a minimal mock plugin
		plugin = {
			loadData: async () => ({}),
			saveData: async () => {},
			app: app
		};
		kernel = new ErrlKernel(plugin as any, app as any);
		organ = new DashboardOrgan(kernel, plugin as any);
	});
	
	it('should register with kernel', () => {
		kernel.registerOrgan(organ);
		const registered = kernel.getRegistry().get('dashboard');
		expect(registered).toBeDefined();
		expect(registered?.getId()).toBe('dashboard');
	});
	
	it('should load settings correctly', async () => {
		await kernel.initialize();
		const settings = kernel.getSettings();
		expect(settings.dashboardPath).toBeDefined();
	});
	
	it('should generate dashboard content', async () => {
		await kernel.initialize();
		kernel.registerOrgan(organ);
		await organ.onEnable();
		
		// Test that dashboard content generation doesn't throw
		const content = await (organ as any).generateDashboardContent();
		expect(content).toBeDefined();
		expect(typeof content).toBe('string');
		expect(content.length).toBeGreaterThan(0);
	});
});

