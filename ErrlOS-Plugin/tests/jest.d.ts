/**
 * Jest type definitions for test files
 * This provides type definitions for Jest globals until @types/jest is installed
 * Also provides Obsidian API mocks
 */

declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void | Promise<void>): void;
declare function beforeEach(fn: () => void | Promise<void>): void;
declare function afterEach(fn: () => void | Promise<void>): void;
declare function beforeAll(fn: () => void | Promise<void>): void;
declare function afterAll(fn: () => void | Promise<void>): void;

// Obsidian API mocks
declare class TFolder {
	type: 'folder';
	name: string;
	path: string;
	children: any[];
	constructor(name: string, path: string);
}

declare class TFile {
	type: 'file';
	name: string;
	path: string;
	content?: string;
	constructor(name: string, path: string, content?: string);
}

interface ExpectMatchers {
	toBe(expected: any): void;
	toEqual(expected: any): void;
	toContain(expected: any): void;
	toBeGreaterThan(expected: number): void;
	toBeLessThan(expected: number): void;
	toBeLessThanOrEqual(expected: number): void;
	toBeGreaterThanOrEqual(expected: number): void;
	toBeTruthy(): void;
	toBeFalsy(): void;
	toBeDefined(): void;
	toBeUndefined(): void;
	toBeNull(): void;
	toMatch(regexp: RegExp | string): void;
	toHaveLength(length: number): void;
	toHaveProperty<E = any>(propertyPath: string | readonly any[], value?: E): void;
	toThrow(error?: any): void;
	toHaveBeenCalled(): void;
	toHaveBeenCalledWith(...args: any[]): void;
	toHaveBeenCalledTimes(times: number): void;
	not: ExpectMatchers;
}

interface PromiseMatchers extends ExpectMatchers {
	resolves: ExpectMatchers;
	rejects: ExpectMatchers;
}

interface Expect {
	<T = any>(value: T): T extends Promise<any> ? PromiseMatchers : ExpectMatchers;
}

declare const expect: Expect;

