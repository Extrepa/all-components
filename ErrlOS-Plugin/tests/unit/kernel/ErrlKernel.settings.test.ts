import { ErrlKernel } from '../../../src/kernel/ErrlKernel';
import { DEFAULT_SETTINGS, ErrlSettings } from '../../../src/settings/ErrlSettings';
import { MockApp, TestUtils } from '../../setup';

describe('ErrlKernel settings merging', () => {
	let kernel: ErrlKernel;
	let app: MockApp;
	let plugin: any;

	beforeEach(async () => {
		app = TestUtils.createTestApp();
		plugin = {
			loadData: async () => ({}),
			saveData: jest.fn(async () => {}),
			app,
			addCommand: jest.fn(),
		};

		kernel = new ErrlKernel(plugin as any, app as any);
		await kernel.initialize();
	});

	it('preserves sibling values when updating nested objects', async () => {
		await kernel.updateSettings({
			pulseThresholds: {
				active: 7,
			} as Partial<ErrlSettings['pulseThresholds']>,
		} as Partial<ErrlSettings>);

		const settings = kernel.getSettings();
		expect(settings.pulseThresholds).toEqual({
			...DEFAULT_SETTINGS.pulseThresholds,
			active: 7,
		});
	});

	it('merges nested updates over time instead of clobbering earlier keys', async () => {
		await kernel.updateSettings({
			organWalkthroughsShown: {
				dashboard: true,
			} as Partial<ErrlSettings['organWalkthroughsShown']>,
		} as Partial<ErrlSettings>);

		await kernel.updateSettings({
			organWalkthroughsShown: {
				capture: true,
			} as Partial<ErrlSettings['organWalkthroughsShown']>,
		} as Partial<ErrlSettings>);

		expect(kernel.getSettings().organWalkthroughsShown).toEqual({
			dashboard: true,
			capture: true,
		});
	});

	it('does not mutate DEFAULT_SETTINGS when settings change', async () => {
		await kernel.updateSettings({
			enabledOrgans: {
				dashboard: true,
			} as Partial<ErrlSettings['enabledOrgans']>,
		} as Partial<ErrlSettings>);

		expect(DEFAULT_SETTINGS.enabledOrgans.dashboard).toBe(false);
		expect(DEFAULT_SETTINGS.enabledOrgans.capture).toBe(false);
	});

	it('preserves all nested object siblings when updating one field', async () => {
		// Update only active threshold
		await kernel.updateSettings({
			pulseThresholds: {
				active: 5,
			} as Partial<ErrlSettings['pulseThresholds']>,
		} as Partial<ErrlSettings>);

		const settings = kernel.getSettings();
		expect(settings.pulseThresholds.active).toBe(5);
		expect(settings.pulseThresholds.warm).toBe(DEFAULT_SETTINGS.pulseThresholds.warm);
		expect(settings.pulseThresholds.dormant).toBe(DEFAULT_SETTINGS.pulseThresholds.dormant);
	});

	it('replaces arrays instead of merging them', async () => {
		// Set initial array value
		await kernel.updateSettings({
			loreEnginePaths: ['path1', 'path2'],
		});

		// Update with new array
		await kernel.updateSettings({
			loreEnginePaths: ['path3', 'path4'],
		});

		const settings = kernel.getSettings();
		expect(settings.loreEnginePaths).toEqual(['path3', 'path4']);
		expect(settings.loreEnginePaths).not.toContain('path1');
		expect(settings.loreEnginePaths).not.toContain('path2');
	});

	it('replaces plain values', async () => {
		await kernel.updateSettings({
			dashboardPath: 'Custom/Dashboard.md',
		});

		const settings = kernel.getSettings();
		expect(settings.dashboardPath).toBe('Custom/Dashboard.md');
		expect(settings.dashboardPath).not.toBe(DEFAULT_SETTINGS.dashboardPath);
	});

	it('skips undefined values during merge', async () => {
		const initialSettings = kernel.getSettings();
		const initialDashboardPath = initialSettings.dashboardPath;

		await kernel.updateSettings({
			dashboardPath: undefined as any,
			captureFilePath: 'Custom/Capture.md',
		} as Partial<ErrlSettings>);

		const settings = kernel.getSettings();
		expect(settings.dashboardPath).toBe(initialDashboardPath); // Should be unchanged
		expect(settings.captureFilePath).toBe('Custom/Capture.md'); // Should be updated
	});

	it('preserves all previous values in multiple sequential updates', async () => {
		// First update
		await kernel.updateSettings({
			pulseThresholds: {
				active: 5,
			} as Partial<ErrlSettings['pulseThresholds']>,
		} as Partial<ErrlSettings>);

		// Second update
		await kernel.updateSettings({
			pulseThresholds: {
				warm: 20,
			} as Partial<ErrlSettings['pulseThresholds']>,
		} as Partial<ErrlSettings>);

		// Third update
		await kernel.updateSettings({
			dashboardPath: 'Custom/Dashboard.md',
		});

		const settings = kernel.getSettings();
		expect(settings.pulseThresholds.active).toBe(5); // From first update
		expect(settings.pulseThresholds.warm).toBe(20); // From second update
		expect(settings.pulseThresholds.dormant).toBe(DEFAULT_SETTINGS.pulseThresholds.dormant); // Unchanged
		expect(settings.dashboardPath).toBe('Custom/Dashboard.md'); // From third update
	});

	it('merges partial settings correctly with defaults on load', async () => {
		// Simulate loading partial settings
		plugin.loadData = async () => ({
			dashboardPath: 'Loaded/Dashboard.md',
			pulseThresholds: {
				active: 10,
			},
		});

		const newKernel = new ErrlKernel(plugin as any, app as any);
		await newKernel.loadSettings();

		const settings = newKernel.getSettings();
		expect(settings.dashboardPath).toBe('Loaded/Dashboard.md');
		expect(settings.pulseThresholds.active).toBe(10);
		expect(settings.pulseThresholds.warm).toBe(DEFAULT_SETTINGS.pulseThresholds.warm);
		expect(settings.pulseThresholds.dormant).toBe(DEFAULT_SETTINGS.pulseThresholds.dormant);
		expect(settings.captureFilePath).toBe(DEFAULT_SETTINGS.captureFilePath);
	});

	it('falls back to defaults when loading invalid data', async () => {
		// Simulate loading invalid data
		plugin.loadData = async () => ({
			invalidField: 'should be ignored',
			dashboardPath: null, // Invalid value
		});

		const newKernel = new ErrlKernel(plugin as any, app as any);
		await newKernel.loadSettings();

		const settings = newKernel.getSettings();
		// Should use defaults for invalid/null values
		expect(settings.dashboardPath).toBe(DEFAULT_SETTINGS.dashboardPath);
		expect(settings.captureFilePath).toBe(DEFAULT_SETTINGS.captureFilePath);
	});

	it('handles deeply nested objects correctly', async () => {
		await kernel.updateSettings({
			thoughtRecyclerThresholds: {
				recent: 20,
			} as Partial<ErrlSettings['thoughtRecyclerThresholds']>,
		} as Partial<ErrlSettings>);

		const settings = kernel.getSettings();
		expect(settings.thoughtRecyclerThresholds.recent).toBe(20);
		expect(settings.thoughtRecyclerThresholds.forgotten).toBe(DEFAULT_SETTINGS.thoughtRecyclerThresholds.forgotten);
		expect(settings.thoughtRecyclerThresholds.ancient).toBe(DEFAULT_SETTINGS.thoughtRecyclerThresholds.ancient);
	});

	it('does not mutate DEFAULT_SETTINGS even after multiple updates', async () => {
		const originalPulseThresholds = { ...DEFAULT_SETTINGS.pulseThresholds };
		const originalDashboardPath = DEFAULT_SETTINGS.dashboardPath;

		await kernel.updateSettings({
			pulseThresholds: {
				active: 99,
				warm: 99,
				dormant: 99,
			},
			dashboardPath: 'Test/Dashboard.md',
		});

		// DEFAULT_SETTINGS should be unchanged
		expect(DEFAULT_SETTINGS.pulseThresholds).toEqual(originalPulseThresholds);
		expect(DEFAULT_SETTINGS.dashboardPath).toBe(originalDashboardPath);
	});
});
