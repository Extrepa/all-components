/**
 * Unit tests for LayeredControlHelper utility
 * 
 * Tests layered control UI generation
 */

import { LayeredControlHelper, ControlLevel } from '../../../src/utils/LayeredControlHelper';
import { Organ } from '../../../src/organs/base/Organ';
import { ErrlKernel } from '../../../src/kernel/ErrlKernel';
import { OrganDocumentation } from '../../../src/organs/base/OrganDocumentation';
import { Plugin } from 'obsidian';

// Mock Organ for testing
class MockOrgan extends Organ {
	private id: string;
	private name: string;
	private documentation?: OrganDocumentation;

	constructor(
		kernel: ErrlKernel,
		plugin: Plugin,
		id: string,
		name: string,
		documentation?: OrganDocumentation
	) {
		super(kernel, plugin);
		this.id = id;
		this.name = name;
		this.documentation = documentation;
	}

	getId(): string {
		return this.id;
	}

	getName(): string {
		return this.name;
	}

	async onLoad(): Promise<void> {
		// Mock implementation
	}

	getDocumentation?() {
		return this.documentation;
	}
}

// Mock Plugin
const createMockPlugin = (): Plugin => {
	return {
		app: {} as any,
		manifest: {} as any,
	} as Plugin;
};

// Mock Kernel
const createMockKernel = (enabledOrgans: string[] = []): ErrlKernel => {
	const settings = {
		autoOpenDashboard: false,
		enabledOrgans: enabledOrgans.reduce((acc, id) => {
			acc[id] = true;
			return acc;
		}, {} as Record<string, boolean>),
	};

	return {
		getSettings: () => settings as any,
		isOrganEnabled: (id: string) => enabledOrgans.includes(id),
	} as any as ErrlKernel;
};

describe('LayeredControlHelper', () => {
	describe('getGlobalControls', () => {
		it('should return global controls category', () => {
			const kernel = createMockKernel();
			const category = LayeredControlHelper.getGlobalControls(kernel);

			expect(category.id).toBe('global');
			expect(category.name).toBe('Global Controls');
			expect(category.level).toBe(ControlLevel.Global);
			expect(category.controls).toBeDefined();
		});

		it('should include autoOpenDashboard control', () => {
			const kernel = createMockKernel();
			const category = LayeredControlHelper.getGlobalControls(kernel);

			const dashboardControl = category.controls.find(c => c.id === 'autoOpenDashboard');
			expect(dashboardControl).toBeDefined();
			expect(dashboardControl?.type).toBe('toggle');
			expect(dashboardControl?.level).toBe(ControlLevel.Global);
		});

		it('should have correct control structure', () => {
			const kernel = createMockKernel();
			const category = LayeredControlHelper.getGlobalControls(kernel);

			expect(category.controls.length).toBeGreaterThan(0);
			category.controls.forEach(control => {
				expect(control.id).toBeDefined();
				expect(control.name).toBeDefined();
				expect(control.description).toBeDefined();
				expect(control.type).toBeDefined();
				expect(control.level).toBe(ControlLevel.Global);
			});
		});
	});

	describe('getFeatureControls', () => {
		it('should return feature controls for organ', async () => {
			const kernel = createMockKernel();
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');

			const category = await LayeredControlHelper.getFeatureControls(kernel, organ);

			expect(category).not.toBeNull();
			expect(category?.id).toBe('test-feature');
			expect(category?.level).toBe(ControlLevel.Feature);
		});

		it('should include enable/disable toggle', async () => {
			const kernel = createMockKernel();
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');

			const category = await LayeredControlHelper.getFeatureControls(kernel, organ);

			const enableControl = category?.controls.find(c => c.id === 'test-enable');
			expect(enableControl).toBeDefined();
			expect(enableControl?.type).toBe('toggle');
			expect(enableControl?.organId).toBe('test');
		});

		it('should include settings from documentation', async () => {
			const kernel = createMockKernel();
			const plugin = createMockPlugin();
			const documentation: OrganDocumentation = {
				purpose: 'Test',
				description: 'Test',
				phase: 'Phase 1',
				capabilities: [],
				monitoring: [],
				fileOperations: [],
				backgroundProcesses: [],
				settings: [
					{
						key: 'testSetting',
						name: 'Test Setting',
						description: 'A test setting',
						default: 'default',
						affects: [],
					},
				],
				useCases: [],
				commonIssues: [],
				dependencies: {
					required: [],
					optional: [],
					conflicts: [],
				},
			};
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ', documentation);

			const category = await LayeredControlHelper.getFeatureControls(kernel, organ);

			const settingControl = category?.controls.find(c => c.settingKey === 'testSetting');
			expect(settingControl).toBeDefined();
			expect(settingControl?.name).toBe('Test Setting');
		});

		it('should handle organ without documentation', async () => {
			const kernel = createMockKernel();
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');

			const category = await LayeredControlHelper.getFeatureControls(kernel, organ);

			expect(category).not.toBeNull();
			// Should still have enable toggle
			const enableControl = category?.controls.find(c => c.id === 'test-enable');
			expect(enableControl).toBeDefined();
		});
	});

	describe('getFineGrainedControls', () => {
		it('should return fine-grained controls for organ', async () => {
			const kernel = createMockKernel(['test']);
			const plugin = createMockPlugin();
			const documentation: OrganDocumentation = {
				purpose: 'Test',
				description: 'Test',
				phase: 'Phase 1',
				capabilities: [],
				monitoring: [],
				fileOperations: [],
				backgroundProcesses: [],
				settings: [
					{
						key: 'advancedSetting',
						name: 'Advanced Setting',
						description: 'An advanced setting',
						default: 'default',
						affects: [],
					},
				],
				useCases: [],
				commonIssues: [],
				dependencies: {
					required: [],
					optional: [],
					conflicts: [],
				},
			};
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ', documentation);

			const category = await LayeredControlHelper.getFineGrainedControls(kernel, organ, 'test');

			expect(category).not.toBeNull();
			expect(category?.level).toBe(ControlLevel.FineGrained);
		});

		it('should only include fine-grained settings', async () => {
			const kernel = createMockKernel(['test']);
			const plugin = createMockPlugin();
			const documentation: OrganDocumentation = {
				purpose: 'Test',
				description: 'Test',
				phase: 'Phase 1',
				capabilities: [],
				monitoring: [],
				fileOperations: [],
				backgroundProcesses: [],
				settings: [
					{
						key: 'basicSetting',
						name: 'Basic Setting',
						description: 'A basic setting',
						default: 'default',
						affects: [],
					},
					{
						key: 'advancedSetting',
						name: 'Advanced Setting',
						description: 'An advanced setting',
						default: 'default',
						affects: [],
					},
				],
				useCases: [],
				commonIssues: [],
				dependencies: {
					required: [],
					optional: [],
					conflicts: [],
				},
			};
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ', documentation);

			const category = await LayeredControlHelper.getFineGrainedControls(kernel, organ, 'test');

			// Fine-grained controls should include all settings
			expect(category?.controls.length).toBeGreaterThan(0);
		});

		it('should return null if organ not enabled', async () => {
			const kernel = createMockKernel(); // No organs enabled
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');

			const category = await LayeredControlHelper.getFineGrainedControls(kernel, organ, 'test');

			expect(category).toBeNull();
		});
	});
});

