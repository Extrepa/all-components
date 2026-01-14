/**
 * Integration tests for dependency checking workflows
 * 
 * Tests dependency validation, conflict detection, and organ enable/disable with dependencies
 */

/// <reference path="../../jest.d.ts" />

import { ErrlKernel } from '../../../src/kernel/ErrlKernel';
import { DashboardOrgan } from '../../../src/organs/dashboard/DashboardOrgan';
import { DependencyChecker, DependencyCheckResult } from '../../../src/utils/DependencyChecker';
import { Organ } from '../../../src/organs/base/Organ';
import { Plugin } from 'obsidian';
import { MockApp, TestUtils } from '../../setup';

// Mock organ with dependencies for testing
class MockOrganWithDeps extends Organ {
	private id: string;
	private name: string;
	private documentation: any;

	constructor(
		kernel: ErrlKernel,
		plugin: Plugin,
		id: string,
		name: string,
		dependencies: { required?: string[]; optional?: string[]; conflicts?: string[] }
	) {
		super(kernel, plugin);
		this.id = id;
		this.name = name;
		this.documentation = {
			purpose: `Test ${name}`,
			description: `Test ${name} organ`,
			phase: 'Phase 1',
			capabilities: [],
			monitoring: [],
			fileOperations: [],
			backgroundProcesses: [],
			settings: [],
			useCases: [],
			commonIssues: [],
			dependencies: {
				required: dependencies.required || [],
				optional: dependencies.optional || [],
				conflicts: dependencies.conflicts || [],
			},
		};
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

	getDocumentation() {
		return this.documentation;
	}
}

describe('Dependency Checking Workflow', () => {
	let kernel: ErrlKernel;
	let app: MockApp;
	let plugin: any;

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

	describe('Required Dependencies', () => {
		it('should prevent enabling organ with missing required dependency', async () => {
			const dashboard = new DashboardOrgan(kernel, plugin as any);
			const dependent = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'dependent',
				'Dependent Organ',
				{ required: ['dashboard'] }
			);

			kernel.registerOrgan(dashboard);
			kernel.registerOrgan(dependent);

			// Try to enable dependent without enabling dashboard
			await expect(kernel.enableOrgan('dependent', true)).rejects.toThrow();
		});

		it('should allow enabling organ when required dependency is enabled', async () => {
			const dashboard = new DashboardOrgan(kernel, plugin as any);
			const dependent = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'dependent',
				'Dependent Organ',
				{ required: ['dashboard'] }
			);

			kernel.registerOrgan(dashboard);
			kernel.registerOrgan(dependent);

			// Enable dashboard first
			await kernel.enableOrgan('dashboard', true);

			// Now enable dependent should work
			await kernel.enableOrgan('dependent', true);
			expect(kernel.isOrganEnabled('dependent')).toBe(true);
		});

		it('should check multiple required dependencies', async () => {
			const dashboard = new DashboardOrgan(kernel, plugin as any);
			const capture = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'capture',
				'Capture Organ',
				{}
			);
			const dependent = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'dependent',
				'Dependent Organ',
				{ required: ['dashboard', 'capture'] }
			);

			kernel.registerOrgan(dashboard);
			kernel.registerOrgan(capture);
			kernel.registerOrgan(dependent);

			// Enable only one dependency
			await kernel.enableOrgan('dashboard', true);

			// Should still fail
			await expect(kernel.enableOrgan('dependent', true)).rejects.toThrow();
		});
	});

	describe('Optional Dependencies', () => {
		it('should allow enabling organ with missing optional dependency', async () => {
			const dependent = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'dependent',
				'Dependent Organ',
				{ optional: ['dashboard'] }
			);

			kernel.registerOrgan(dependent);

			// Should enable even without optional dependency
			await kernel.enableOrgan('dependent', true);
			expect(kernel.isOrganEnabled('dependent')).toBe(true);
		});

		it('should warn about missing optional dependencies', async () => {
			const dependent = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'dependent',
				'Dependent Organ',
				{ optional: ['dashboard'] }
			);

			kernel.registerOrgan(dependent);

			const check = DependencyChecker.checkDependencies(kernel, dependent);
			expect(check.canEnable).toBe(true);
			expect(check.missingOptional).toContain('dashboard');
			expect(check.warnings.length).toBeGreaterThan(0);
		});
	});

	describe('Conflicts', () => {
		it('should prevent enabling organ with conflicting organ enabled', async () => {
			const dashboard = new DashboardOrgan(kernel, plugin as any);
			const conflicting = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'conflicting',
				'Conflicting Organ',
				{ conflicts: ['dashboard'] }
			);

			kernel.registerOrgan(dashboard);
			kernel.registerOrgan(conflicting);

			// Enable dashboard
			await kernel.enableOrgan('dashboard', true);

			// Try to enable conflicting organ
			await expect(kernel.enableOrgan('conflicting', true)).rejects.toThrow();
		});

		it('should allow enabling organ when conflict is not enabled', async () => {
			const dashboard = new DashboardOrgan(kernel, plugin as any);
			const conflicting = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'conflicting',
				'Conflicting Organ',
				{ conflicts: ['dashboard'] }
			);

			kernel.registerOrgan(dashboard);
			kernel.registerOrgan(conflicting);

			// Don't enable dashboard, so conflicting should be able to enable
			await kernel.enableOrgan('conflicting', true);
			expect(kernel.isOrganEnabled('conflicting')).toBe(true);
		});
	});

	describe('Dependency Check Results', () => {
		it('should return correct dependency check result', () => {
			const dashboard = new DashboardOrgan(kernel, plugin as any);
			const dependent = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'dependent',
				'Dependent Organ',
				{ required: ['dashboard'], optional: ['capture'] }
			);

			kernel.registerOrgan(dashboard);
			kernel.registerOrgan(dependent);

			const result = DependencyChecker.checkDependencies(kernel, dependent);
			expect(result.canEnable).toBe(false);
			expect(result.missingRequired).toContain('dashboard');
		});

		it('should provide user-friendly dependency messages', () => {
			const dashboard = new DashboardOrgan(kernel, plugin as any);
			const dependent = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'dependent',
				'Dependent Organ',
				{ required: ['dashboard'] }
			);

			kernel.registerOrgan(dashboard);
			kernel.registerOrgan(dependent);

			const result = DependencyChecker.checkDependencies(kernel, dependent);
			const message = DependencyChecker.getDependencyMessage(result, 'Dependent Organ');
			
			expect(message).toContain('cannot be enabled');
			expect(message).toContain('dashboard');
		});
	});

	describe('Complex Dependency Scenarios', () => {
		it('should handle organ with both required and optional dependencies', async () => {
			const dashboard = new DashboardOrgan(kernel, plugin as any);
			const dependent = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'dependent',
				'Dependent Organ',
				{ required: ['dashboard'], optional: ['nonexistent'] }
			);

			kernel.registerOrgan(dashboard);
			kernel.registerOrgan(dependent);

			// Enable dashboard
			await kernel.enableOrgan('dashboard', true);

			// Should be able to enable even with missing optional dependency
			await kernel.enableOrgan('dependent', true);
			expect(kernel.isOrganEnabled('dependent')).toBe(true);
		});

		it('should handle dependency chain', async () => {
			const dashboard = new DashboardOrgan(kernel, plugin as any);
			const middle = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'middle',
				'Middle Organ',
				{ required: ['dashboard'] }
			);
			const top = new MockOrganWithDeps(
				kernel,
				plugin as any,
				'top',
				'Top Organ',
				{ required: ['middle'] }
			);

			kernel.registerOrgan(dashboard);
			kernel.registerOrgan(middle);
			kernel.registerOrgan(top);

			// Enable in order: dashboard -> middle -> top
			await kernel.enableOrgan('dashboard', true);
			await kernel.enableOrgan('middle', true);
			await kernel.enableOrgan('top', true);

			expect(kernel.isOrganEnabled('top')).toBe(true);
		});
	});
});

