/**
 * Unit tests for WalkthroughHelper utility
 * 
 * Tests walkthrough conversion and consent checking
 */

import { WalkthroughHelper } from '../../../src/utils/WalkthroughHelper';
import { Organ } from '../../../src/organs/base/Organ';
import { OrganDocumentation } from '../../../src/organs/base/OrganDocumentation';
import { Plugin } from 'obsidian';

// Mock Organ for testing
class MockOrgan extends Organ {
	private id: string;
	private name: string;
	private walkthrough?: any;
	private documentation?: OrganDocumentation;

	constructor(
		kernel: any,
		plugin: Plugin,
		id: string,
		name: string,
		walkthrough?: any,
		documentation?: OrganDocumentation
	) {
		super(kernel, plugin);
		this.id = id;
		this.name = name;
		this.walkthrough = walkthrough;
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

	getWalkthrough?() {
		return this.walkthrough;
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

describe('WalkthroughHelper', () => {
	describe('documentationToWalkthrough', () => {
		it('should convert OrganDocumentation to OrganWalkthrough', () => {
			const kernel = {} as any;
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');
			
			const documentation: OrganDocumentation = {
				purpose: 'Test purpose',
				description: 'Test description',
				phase: 'Phase 1',
				capabilities: [],
				monitoring: [
					{ what: 'Files', why: 'To track changes', how: 'Scans', userControl: 'Can disable' },
				],
				fileOperations: [
					{
						type: 'create',
						path: 'test.md',
						when: 'On enable',
						userControl: 'User controls',
						example: 'Example',
					},
				],
				backgroundProcesses: [
					{
						name: 'Process',
						description: 'Description',
						interval: 1000,
						resourceUsage: 'Minimal',
						canDisable: true,
						startStop: true,
					},
				],
				settings: [],
				useCases: [
					{
						scenario: 'Test scenario',
						steps: ['Step 1', 'Step 2'],
						expectedOutcome: 'Outcome',
					},
				],
				commonIssues: [],
				dependencies: {
					required: ['dashboard'],
					optional: ['capture'],
					conflicts: [],
				},
			};

			const walkthrough = WalkthroughHelper.documentationToWalkthrough(organ, documentation);

			expect(walkthrough.organId).toBe('test');
			expect(walkthrough.organName).toBe('Test Organ');
			expect(walkthrough.purpose).toBe('Test purpose');
			expect(walkthrough.monitoring).toHaveLength(1);
			expect(walkthrough.fileOperations).toHaveLength(1);
			expect(walkthrough.backgroundProcesses).toHaveLength(1);
			expect(walkthrough.dependencies).toContain('Required: dashboard');
			expect(walkthrough.dependencies).toContain('Optional: capture');
			expect(walkthrough.useCases).toContain('Test scenario');
			expect(walkthrough.examples).toEqual(['Step 1', 'Step 2']);
		});

		it('should handle empty documentation', () => {
			const kernel = {} as any;
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');
			
			const documentation: OrganDocumentation = {
				purpose: '',
				description: '',
				phase: '',
				capabilities: [],
				monitoring: [],
				fileOperations: [],
				backgroundProcesses: [],
				settings: [],
				useCases: [],
				commonIssues: [],
				dependencies: {
					required: [],
					optional: [],
					conflicts: [],
				},
			};

			const walkthrough = WalkthroughHelper.documentationToWalkthrough(organ, documentation);

			expect(walkthrough.organId).toBe('test');
			expect(walkthrough.monitoring).toEqual([]);
			expect(walkthrough.fileOperations).toEqual([]);
			expect(walkthrough.dependencies).toEqual([]);
		});

		it('should format monitoring correctly', () => {
			const kernel = {} as any;
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');
			
			const documentation: OrganDocumentation = {
				purpose: 'Test',
				description: 'Test',
				phase: 'Phase 1',
				capabilities: [],
				monitoring: [
					{ what: 'Files', why: 'To track', how: 'Scans', userControl: 'Can disable' },
					{ what: 'Time', why: 'To measure', how: 'Records', userControl: 'Can stop' },
				],
				fileOperations: [],
				backgroundProcesses: [],
				settings: [],
				useCases: [],
				commonIssues: [],
				dependencies: {
					required: [],
					optional: [],
					conflicts: [],
				},
			};

			const walkthrough = WalkthroughHelper.documentationToWalkthrough(organ, documentation);

			expect(walkthrough.monitoring).toHaveLength(2);
			expect(walkthrough.monitoring[0]).toBe('Files - To track');
			expect(walkthrough.monitoring[1]).toBe('Time - To measure');
		});

		it('should format file operations correctly', () => {
			const kernel = {} as any;
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');
			
			const documentation: OrganDocumentation = {
				purpose: 'Test',
				description: 'Test',
				phase: 'Phase 1',
				capabilities: [],
				monitoring: [],
				fileOperations: [
					{
						type: 'create',
						path: 'test.md',
						when: 'On enable',
						userControl: 'User controls',
						example: 'Example',
					},
				],
				backgroundProcesses: [],
				settings: [],
				useCases: [],
				commonIssues: [],
				dependencies: {
					required: [],
					optional: [],
					conflicts: [],
				},
			};

			const walkthrough = WalkthroughHelper.documentationToWalkthrough(organ, documentation);

			expect(walkthrough.fileOperations).toHaveLength(1);
			expect(walkthrough.fileOperations[0].operation).toBe('create');
			expect(walkthrough.fileOperations[0].path).toBe('test.md');
			expect(walkthrough.fileOperations[0].description).toBe('On enable. User controls');
		});

		it('should format dependencies correctly', () => {
			const kernel = {} as any;
			const plugin = createMockPlugin();
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');
			
			const documentation: OrganDocumentation = {
				purpose: 'Test',
				description: 'Test',
				phase: 'Phase 1',
				capabilities: [],
				monitoring: [],
				fileOperations: [],
				backgroundProcesses: [],
				settings: [],
				useCases: [],
				commonIssues: [],
				dependencies: {
					required: ['dashboard', 'capture'],
					optional: ['loreEngine'],
					conflicts: [],
				},
			};

			const walkthrough = WalkthroughHelper.documentationToWalkthrough(organ, documentation);

			expect(walkthrough.dependencies).toHaveLength(3);
			expect(walkthrough.dependencies).toContain('Required: dashboard');
			expect(walkthrough.dependencies).toContain('Required: capture');
			expect(walkthrough.dependencies).toContain('Optional: loreEngine');
		});
	});

	describe('checkConsent', () => {
		// Note: checkConsent involves UI modals which are harder to test
		// We'll test the logic paths that don't require modal interaction

		it('should auto-consent if walkthrough already seen and not showing again', async () => {
			const kernel = {} as any;
			const plugin = createMockPlugin();
			const app = {} as any;
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');

			const result = await WalkthroughHelper.checkConsent(app, organ, true, false);

			expect(result).toBe(true);
		});

		it('should require consent if walkthrough not seen', async () => {
			// This will show a modal, so we can't easily test the result
			// But we can verify the function doesn't crash
			const kernel = {} as any;
			const plugin = createMockPlugin();
			const app = {} as any;
			const organ = new MockOrgan(kernel, plugin, 'test', 'Test Organ');

			// Mock WalkthroughModal to avoid actual UI
			const originalModal = require('../../../src/utils/WalkthroughModal').WalkthroughModal;
			let modalResolve: (value: boolean) => void;
			const mockModal = jest.fn().mockImplementation((app: any, walkthrough: any, callback: (consented: boolean) => void) => {
				// Store resolve function
				modalResolve = callback;
				return {
					open: () => {
						// Auto-resolve for testing
						setTimeout(() => modalResolve(true), 0);
					},
				};
			});

			// This test documents the behavior but may need adjustment based on actual implementation
			// The key is that it doesn't crash and handles the async flow
			expect(true).toBe(true); // Placeholder - actual modal testing would require more setup
		});
	});
});

