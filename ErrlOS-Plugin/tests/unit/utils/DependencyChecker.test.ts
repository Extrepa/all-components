/**
 * Unit tests for DependencyChecker utility
 * 
 * Tests dependency validation, conflict detection, and user-friendly messages
 */

import { DependencyChecker, DependencyCheckResult } from '../../../src/utils/DependencyChecker';
import { Organ } from '../../../src/organs/base/Organ';
import { ErrlKernel } from '../../../src/kernel/ErrlKernel';
import { ModuleRegistry } from '../../../src/kernel/ModuleRegistry';
import { Plugin } from 'obsidian';

// Mock Organ for testing
class MockOrgan extends Organ {
	private id: string;
	private name: string;
	private documentation?: any;
	private dependencies?: string[];

	constructor(
		kernel: ErrlKernel,
		plugin: Plugin,
		id: string,
		name: string,
		documentation?: any,
		dependencies?: string[]
	) {
		super(kernel, plugin);
		this.id = id;
		this.name = name;
		this.documentation = documentation;
		this.dependencies = dependencies;
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

	getDependencies?(): string[] | undefined {
		return this.dependencies;
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
	const registry = new ModuleRegistry();
	const plugin = createMockPlugin();
	
	// Create mock organs
	const organs: Organ[] = [
		new MockOrgan({} as ErrlKernel, plugin, 'dashboard', 'Dashboard'),
		new MockOrgan({} as ErrlKernel, plugin, 'capture', 'Capture'),
		new MockOrgan({} as ErrlKernel, plugin, 'loreEngine', 'Lore Engine'),
	];
	
	// Register organs
	organs.forEach(organ => {
		registry.register(organ);
	});
	
	// Enable specified organs
	enabledOrgans.forEach(id => {
		const organ = registry.get(id);
		if (organ) {
			registry.enable(id);
		}
	});
	
	const kernel = {
		getRegistry: () => registry,
		isOrganEnabled: (id: string) => {
			const organ = registry.get(id);
			return organ ? registry.isEnabled(id) : false;
		},
	} as any as ErrlKernel;
	
	return kernel;
};

describe('DependencyChecker', () => {
	describe('checkDependencies', () => {
		it('should return canEnable=true for organ with no dependencies', () => {
			const kernel = createMockKernel();
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');
			
			const result = DependencyChecker.checkDependencies(kernel, organ);
			
			expect(result.canEnable).toBe(true);
			expect(result.missingRequired).toEqual([]);
			expect(result.missingOptional).toEqual([]);
			expect(result.conflicts).toEqual([]);
		});

		it('should detect missing required dependencies', () => {
			const kernel = createMockKernel();
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ', {
				dependencies: {
					required: ['dashboard'],
					optional: [],
					conflicts: [],
				},
			});
			
			const result = DependencyChecker.checkDependencies(kernel, organ);
			
			expect(result.canEnable).toBe(false);
			expect(result.missingRequired).toContain('dashboard');
		});

		it('should allow enabling when required dependencies are enabled', () => {
			const kernel = createMockKernel(['dashboard']);
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ', {
				dependencies: {
					required: ['dashboard'],
					optional: [],
					conflicts: [],
				},
			});
			
			const result = DependencyChecker.checkDependencies(kernel, organ);
			
			expect(result.canEnable).toBe(true);
			expect(result.missingRequired).toEqual([]);
		});

		it('should detect missing optional dependencies', () => {
			const kernel = createMockKernel();
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ', {
				dependencies: {
					required: [],
					optional: ['loreEngine'],
					conflicts: [],
				},
			});
			
			const result = DependencyChecker.checkDependencies(kernel, organ);
			
			expect(result.canEnable).toBe(true); // Optional deps don't block
			expect(result.missingOptional).toContain('loreEngine');
			expect(result.warnings.length).toBeGreaterThan(0);
		});

		it('should detect conflicts', () => {
			const kernel = createMockKernel(['dashboard']);
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ', {
				dependencies: {
					required: [],
					optional: [],
					conflicts: ['dashboard'],
				},
			});
			
			const result = DependencyChecker.checkDependencies(kernel, organ);
			
			expect(result.canEnable).toBe(false);
			expect(result.conflicts).toContain('dashboard');
		});

		it('should allow enabling when conflicts are not enabled', () => {
			const kernel = createMockKernel();
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ', {
				dependencies: {
					required: [],
					optional: [],
					conflicts: ['dashboard'],
				},
			});
			
			const result = DependencyChecker.checkDependencies(kernel, organ);
			
			expect(result.canEnable).toBe(true);
			expect(result.conflicts).toEqual([]);
		});

		it('should handle multiple required dependencies', () => {
			const kernel = createMockKernel(['dashboard']);
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ', {
				dependencies: {
					required: ['dashboard', 'capture'],
					optional: [],
					conflicts: [],
				},
			});
			
			const result = DependencyChecker.checkDependencies(kernel, organ);
			
			expect(result.canEnable).toBe(false);
			expect(result.missingRequired).toContain('capture');
		});

		it('should handle legacy getDependencies method', () => {
			const kernel = createMockKernel();
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ', undefined, ['dashboard']);
			
			const result = DependencyChecker.checkDependencies(kernel, organ);
			
			expect(result.canEnable).toBe(false);
			expect(result.missingRequired).toContain('dashboard');
		});

		it('should prefer documentation dependencies over legacy method', () => {
			const kernel = createMockKernel();
			const plugin = createMockPlugin();
			const organ = new MockOrgan(
				kernel,
				plugin,
				'test',
				'Test Organ',
				{
					dependencies: {
						required: ['capture'],
						optional: [],
						conflicts: [],
					},
				},
				['dashboard'] // Legacy - should be ignored
			);
			
			const result = DependencyChecker.checkDependencies(kernel, organ);
			
			expect(result.canEnable).toBe(false);
			expect(result.missingRequired).toContain('capture');
			expect(result.missingRequired).not.toContain('dashboard');
		});

		it('should handle non-existent dependency IDs', () => {
			const kernel = createMockKernel();
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ', {
				dependencies: {
					required: ['nonexistent'],
					optional: [],
					conflicts: [],
				},
			});
			
			const result = DependencyChecker.checkDependencies(kernel, organ);
			
			expect(result.canEnable).toBe(false);
			expect(result.missingRequired).toContain('nonexistent');
		});
	});

	describe('getDependencyMessage', () => {
		it('should return success message when no issues', () => {
			const result: DependencyCheckResult = {
				canEnable: true,
				missingRequired: [],
				missingOptional: [],
				conflicts: [],
				warnings: [],
			};
			
			const message = DependencyChecker.getDependencyMessage(result, 'Test Organ');
			
			expect(message).toContain('can be enabled');
		});

		it('should include missing required dependencies', () => {
			const result: DependencyCheckResult = {
				canEnable: false,
				missingRequired: ['dashboard', 'capture'],
				missingOptional: [],
				conflicts: [],
				warnings: [],
			};
			
			const message = DependencyChecker.getDependencyMessage(result, 'Test Organ');
			
			expect(message).toContain('cannot be enabled');
			expect(message).toContain('dashboard');
			expect(message).toContain('capture');
		});

		it('should include conflicts', () => {
			const result: DependencyCheckResult = {
				canEnable: false,
				missingRequired: [],
				missingOptional: [],
				conflicts: ['dashboard'],
				warnings: [],
			};
			
			const message = DependencyChecker.getDependencyMessage(result, 'Test Organ');
			
			expect(message).toContain('cannot be enabled');
			expect(message).toContain('Conflicting');
			expect(message).toContain('dashboard');
		});

		it('should include optional dependencies', () => {
			const result: DependencyCheckResult = {
				canEnable: true,
				missingRequired: [],
				missingOptional: ['loreEngine'],
				conflicts: [],
				warnings: [],
			};
			
			const message = DependencyChecker.getDependencyMessage(result, 'Test Organ');
			
			expect(message).toContain('Optional dependencies');
			expect(message).toContain('loreEngine');
		});

		it('should handle multiple issues', () => {
			const result: DependencyCheckResult = {
				canEnable: false,
				missingRequired: ['dashboard'],
				missingOptional: ['loreEngine'],
				conflicts: ['capture'],
				warnings: [],
			};
			
			const message = DependencyChecker.getDependencyMessage(result, 'Test Organ');
			
			expect(message).toContain('cannot be enabled');
			expect(message).toContain('dashboard');
			expect(message).toContain('capture');
			expect(message).toContain('loreEngine');
		});
	});

	describe('validateAllDependencies', () => {
		it('should validate all enabled organs', () => {
			const kernel = createMockKernel(['dashboard', 'capture']);
			const results = DependencyChecker.validateAllDependencies(kernel);
			
			expect(results.length).toBe(2);
			expect(results.some(r => r.organId === 'dashboard')).toBe(true);
			expect(results.some(r => r.organId === 'capture')).toBe(true);
		});

		it('should not validate disabled organs', () => {
			const kernel = createMockKernel(['dashboard']);
			const results = DependencyChecker.validateAllDependencies(kernel);
			
			expect(results.length).toBe(1);
			expect(results[0].organId).toBe('dashboard');
		});

		it('should return empty array when no organs enabled', () => {
			const kernel = createMockKernel([]);
			const results = DependencyChecker.validateAllDependencies(kernel);
			
			expect(results.length).toBe(0);
		});
	});
});

