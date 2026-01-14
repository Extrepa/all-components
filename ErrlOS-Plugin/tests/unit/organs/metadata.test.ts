/**
 * Unit tests for organ metadata
 * 
 * Tests the centralized metadata system that drives registrations, defaults, and UI lists
 */

/// <reference path="../../jest.d.ts" />

import { ORGAN_METADATA, getOrganIds, getRecommendedOrganIds, OrganId } from '../../../src/organs/metadata';
import { ORGAN_CREATORS, ORGANS } from '../../../src/organs/index';

describe('Organ Metadata', () => {
	describe('ORGAN_METADATA completeness', () => {
		it('should have exactly 16 organs', () => {
			expect(ORGAN_METADATA).toHaveLength(16);
		});

		it('should have all required fields for each organ', () => {
			const requiredFields = ['id', 'name', 'description', 'phase', 'order', 'recommended'];
			
			for (const organ of ORGAN_METADATA) {
				for (const field of requiredFields) {
					expect(organ).toHaveProperty(field);
					expect(organ[field as keyof typeof organ]).toBeDefined();
				}
			}
		});

		it('should have no duplicate IDs', () => {
			const ids = ORGAN_METADATA.map(organ => organ.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});

		it('should have unique order values', () => {
			const orders = ORGAN_METADATA.map(organ => organ.order);
			const uniqueOrders = new Set(orders);
			expect(uniqueOrders.size).toBe(orders.length);
		});

		it('should have valid phase values', () => {
			const validPhases = [
				'Phase 1: Foundation',
				'Phase 2: Stability',
				'Phase 3: Intelligence',
				'Phase 4: Adaptation',
				'Phase 5: Weird Power'
			];
			
			for (const organ of ORGAN_METADATA) {
				expect(validPhases).toContain(organ.phase);
			}
		});

		it('should have boolean recommended field', () => {
			for (const organ of ORGAN_METADATA) {
				expect(typeof organ.recommended).toBe('boolean');
			}
		});

		it('should have non-empty name and description', () => {
			for (const organ of ORGAN_METADATA) {
				expect(organ.name).toBeTruthy();
				expect(organ.description).toBeTruthy();
				expect(typeof organ.name).toBe('string');
				expect(typeof organ.description).toBe('string');
			}
		});
	});

	describe('getOrganIds()', () => {
		it('should return all 16 organ IDs', () => {
			const ids = getOrganIds();
			expect(ids).toHaveLength(16);
			expect(ids).toEqual(ORGAN_METADATA.map(organ => organ.id));
		});

		it('should return IDs in the same order as ORGAN_METADATA', () => {
			const ids = getOrganIds();
			const metadataIds = ORGAN_METADATA.map(organ => organ.id);
			expect(ids).toEqual(metadataIds);
		});
	});

	describe('getRecommendedOrganIds()', () => {
		it('should return only recommended organs', () => {
			const recommendedIds = getRecommendedOrganIds();
			const recommendedOrgans = ORGAN_METADATA.filter(organ => organ.recommended);
			
			expect(recommendedIds).toHaveLength(recommendedOrgans.length);
			expect(recommendedIds).toEqual(recommendedOrgans.map(organ => organ.id));
		});

		it('should return dashboard and capture as recommended', () => {
			const recommendedIds = getRecommendedOrganIds();
			expect(recommendedIds).toContain('dashboard');
			expect(recommendedIds).toContain('capture');
		});

		it('should not return non-recommended organs', () => {
			const recommendedIds = getRecommendedOrganIds();
			const nonRecommended = ORGAN_METADATA.filter(organ => !organ.recommended);
			
			for (const organ of nonRecommended) {
				expect(recommendedIds).not.toContain(organ.id);
			}
		});
	});

	describe('ORGAN_CREATORS mapping', () => {
		it('should have a creator for every organ in metadata', () => {
			for (const organ of ORGAN_METADATA) {
				expect(ORGAN_CREATORS).toHaveProperty(organ.id);
				expect(typeof ORGAN_CREATORS[organ.id as OrganId]).toBe('function');
			}
		});

		it('should not have creators for non-existent organs', () => {
			const metadataIds = new Set(ORGAN_METADATA.map(organ => organ.id));
			for (const creatorId of Object.keys(ORGAN_CREATORS)) {
				expect(metadataIds).toContain(creatorId);
			}
		});
	});

	describe('ORGANS array construction', () => {
		it('should have same length as ORGAN_METADATA', () => {
			expect(ORGANS).toHaveLength(ORGAN_METADATA.length);
		});

		it('should include all metadata fields plus create function', () => {
			for (const organ of ORGANS) {
				expect(organ).toHaveProperty('id');
				expect(organ).toHaveProperty('name');
				expect(organ).toHaveProperty('description');
				expect(organ).toHaveProperty('phase');
				expect(organ).toHaveProperty('order');
				expect(organ).toHaveProperty('recommended');
				expect(organ).toHaveProperty('create');
				expect(typeof organ.create).toBe('function');
			}
		});

		it('should match metadata IDs', () => {
			const organIds = ORGANS.map(organ => organ.id);
			const metadataIds = ORGAN_METADATA.map(organ => organ.id);
			expect(organIds.sort()).toEqual(metadataIds.sort());
		});

		it('should have create function that matches ORGAN_CREATORS', () => {
			for (const organ of ORGANS) {
				const creator = ORGAN_CREATORS[organ.id as OrganId];
				expect(organ.create).toBe(creator);
			}
		});
	});

	describe('Expected organ IDs', () => {
		const expectedOrgans = [
			'dashboard',
			'capture',
			'projectPulse',
			'timeMachine',
			'loreEngine',
			'realityMap',
			'promotion',
			'energy',
			'frictionScanner',
			'ritual',
			'entropyDial',
			'dreamBuffer',
			'thoughtRecycler',
			'sessionGhost',
			'assetBrain',
			'promptForge'
		];

		it('should contain all expected organ IDs', () => {
			const actualIds = ORGAN_METADATA.map(organ => organ.id);
			for (const expectedId of expectedOrgans) {
				expect(actualIds).toContain(expectedId);
			}
		});

		it('should not have unexpected organ IDs', () => {
			const actualIds = new Set(ORGAN_METADATA.map(organ => organ.id));
			expect(actualIds.size).toBe(expectedOrgans.length);
		});
	});
});

