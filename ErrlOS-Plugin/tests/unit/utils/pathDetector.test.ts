/**
 * Unit tests for PathDetector utility
 * 
 * Tests vault structure detection and path suggestions
 */

import { PathDetector, DetectedPaths } from '../../../src/utils/pathDetector';
import { MockVault, TestUtils, MockFile, MockFolder } from '../../setup';

describe('PathDetector', () => {
	let vault: MockVault;

	beforeEach(() => {
		vault = TestUtils.createTestVault();
	});

	describe('detectVaultStructure', () => {
		it('should detect project folders', () => {
			// Create a Projects folder
			vault.createFolder('Projects/');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.projects).toBeDefined();
			expect(detected.projects?.length).toBeGreaterThan(0);
			expect(detected.projects).toContain('Projects/');
		});

		it('should detect lore folders', () => {
			// Create a lore folder
			vault.createFolder('03-Creative/Lore Hub/');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.lore).toBeDefined();
			expect(detected.lore?.length).toBeGreaterThan(0);
			expect(detected.lore).toContain('03-Creative/Lore Hub/');
		});

		it('should detect capture file', async () => {
			// Create a capture file
			await vault.create('ErrlOS/Capture.md', '# Capture');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.capture).toBe('ErrlOS/Capture.md');
		});

		it('should detect time machine log path', () => {
			// Create a logs folder
			vault.createFolder('ErrlOS/Logs/');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.timeMachine).toBe('ErrlOS/Logs/');
		});

		it('should detect promotion project path', () => {
			// Create a Projects folder
			vault.createFolder('Projects/');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.promotionProject).toBe('Projects/');
		});

		it('should detect promotion lore path', () => {
			// Create a lore folder
			vault.createFolder('Lore/');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			// Should detect Lore/ (or 03-Creative/Lore Hub/ if it exists from beforeEach)
			expect(detected.promotionLore).toBeDefined();
			expect(detected.promotionLore).toMatch(/Lore/);
		});

		it('should return empty results when nothing detected', () => {
			// Empty vault
			const emptyVault = new MockVault();
			
			const detected = PathDetector.detectVaultStructure(emptyVault as any);
			
			expect(detected.projects).toEqual([]);
			expect(detected.lore).toEqual([]);
			expect(detected.capture).toBeUndefined();
			expect(detected.timeMachine).toBeUndefined();
		});

		it('should detect multiple project folders', () => {
			vault.createFolder('Projects/');
			vault.createFolder('project/');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.projects?.length).toBeGreaterThanOrEqual(2);
		});

		it('should detect multiple lore folders', () => {
			vault.createFolder('Lore/');
			vault.createFolder('Creative/');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.lore?.length).toBeGreaterThanOrEqual(2);
		});

		it('should prefer common patterns over root-level folders', () => {
			// Create both a common pattern and a root-level folder
			vault.createFolder('Projects/');
			// Note: MockVault doesn't fully simulate root children, but we test the pattern matching
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.projects).toContain('Projects/');
		});
	});

	describe('getDetectionSummary', () => {
		it('should return summary with detected paths', () => {
			const detected: DetectedPaths = {
				projects: ['Projects/'],
				lore: ['Lore/'],
				capture: 'Capture.md',
				timeMachine: 'Logs/',
			};
			
			const summary = PathDetector.getDetectionSummary(detected);
			
			expect(summary).toContain('project folder');
			expect(summary).toContain('lore folder');
			expect(summary).toContain('Capture file');
			expect(summary).toContain('Time Machine');
		});

		it('should handle empty detection results', () => {
			const detected: DetectedPaths = {};
			
			const summary = PathDetector.getDetectionSummary(detected);
			
			expect(summary).toBe('No common vault structure detected');
		});

		it('should handle partial detection', () => {
			const detected: DetectedPaths = {
				projects: ['Projects/'],
			};
			
			const summary = PathDetector.getDetectionSummary(detected);
			
			expect(summary).toContain('project folder');
			expect(summary).not.toContain('lore folder');
		});

		it('should handle multiple detected items', () => {
			const detected: DetectedPaths = {
				projects: ['Projects/', 'project/'],
				lore: ['Lore/', 'Creative/'],
			};
			
			const summary = PathDetector.getDetectionSummary(detected);
			
			expect(summary).toContain('2 project folder(s)');
			expect(summary).toContain('2 lore folder(s)');
		});
	});

	describe('case sensitivity', () => {
		it('should detect lowercase project folders', () => {
			vault.createFolder('projects/');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.projects).toContain('projects/');
		});

		it('should detect lowercase lore folders', () => {
			vault.createFolder('lore/');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.lore).toContain('lore/');
		});

		it('should detect lowercase capture files', async () => {
			await vault.create('capture.md', '# Capture');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.capture).toBe('capture.md');
		});
	});

	describe('edge cases', () => {
		it('should handle vault with only root folder', () => {
			const emptyVault = new MockVault();
			
			const detected = PathDetector.detectVaultStructure(emptyVault as any);
			
			expect(detected.projects).toEqual([]);
			expect(detected.lore).toEqual([]);
		});

		it('should not detect files as folders', async () => {
			// Create a file named "Projects.md" (should not be detected as a folder)
			await vault.create('Projects.md', '# Projects');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			// Should not detect Projects.md as a project folder
			expect(detected.projects).not.toContain('Projects.md');
		});

		it('should handle nested paths correctly', () => {
			vault.createFolder('02-Projects/');
			
			const detected = PathDetector.detectVaultStructure(vault as any);
			
			expect(detected.projects).toContain('02-Projects/');
		});
	});
});

