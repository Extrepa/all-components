/**
 * Test setup and utilities for Errl OS Plugin tests
 * 
 * This file provides test setup, mocks, and utilities for testing
 */

// Create global TFolder and TFile classes for instanceof checks
// This allows pathDetector's instanceof checks to work in tests
// These must be defined BEFORE MockFile and MockFolder
// Also make them available on globalThis for module imports
const GlobalTFolder = class TFolder {
	type: 'folder' = 'folder';
	name: string;
	path: string;
	children: any[] = [];
	
	constructor(name: string, path: string) {
		this.name = name;
		this.path = path;
	}
};

const GlobalTFile = class TFile {
	type: 'file' = 'file';
	name: string;
	path: string;
	content?: string;
	
	constructor(name: string, path: string, content?: string) {
		this.name = name;
		this.path = path;
		this.content = content;
	}
};

// Make available globally for instanceof checks
(global as any).TFolder = GlobalTFolder;
(global as any).TFile = GlobalTFile;
(globalThis as any).TFolder = GlobalTFolder;
(globalThis as any).TFile = GlobalTFile;

// Mock classes that extend the global types for instanceof compatibility
export class MockFile extends (global as any).TFile {
	constructor(name: string, path: string, content?: string) {
		super(name, path, content);
	}
}

export class MockFolder extends (global as any).TFolder {
	constructor(name: string, path: string) {
		super(name, path);
	}
}

/**
 * Mock Obsidian Vault
 */
export class MockVault {
	private files: Map<string, MockFile | MockFolder> = new Map();
	
	constructor() {
		// Initialize with root folder
		this.files.set('', new MockFolder('', ''));
	}
	
	getAbstractFileByPath(path: string): MockFile | MockFolder | null {
		return this.files.get(path) || null;
	}
	
	createFolder(path: string): Promise<void> {
		const folderName = path.split('/').pop() || path;
		const folder = new MockFolder(folderName, path);
		this.files.set(path, folder);
		return Promise.resolve();
	}
	
	create(path: string, data: string): Promise<MockFile> {
		const fileName = path.split('/').pop() || path;
		const file = new MockFile(fileName, path, data);
		this.files.set(path, file);
		return Promise.resolve(file);
	}
	
	read(file: MockFile): Promise<string> {
		return Promise.resolve(file.content || '');
	}
	
	modify(file: MockFile, data: string): Promise<void> {
		file.content = data;
		return Promise.resolve();
	}
	
	getRoot(): MockFolder {
		const root = this.files.get('');
		if (!root || root instanceof MockFile) {
			// Create root if it doesn't exist
			const newRoot = new MockFolder('', '');
			this.files.set('', newRoot);
			return newRoot;
		}
		return root as MockFolder;
	}
}

/**
 * Mock Obsidian App
 */
export class MockApp {
	vault: MockVault;
	
	constructor() {
		this.vault = new MockVault();
	}
}

/**
 * Test utilities
 */
export class TestUtils {
	/**
	 * Create a mock vault with test structure
	 */
	static createTestVault(): MockVault {
		const vault = new MockVault();
		
		// Create common test folders
		vault.createFolder('Projects/');
		vault.createFolder('03-Creative/Lore Hub/');
		vault.createFolder('ErrlOS/');
		
		return vault;
	}
	
	/**
	 * Create a mock app instance
	 */
	static createTestApp(): MockApp {
		return new MockApp();
	}
	
	/**
	 * Wait for async operations
	 */
	static async wait(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

/**
 * Jest/Vitest setup
 */
export function setupTests() {
	// Global test setup
	// Configure mocks, set up test environment, etc.
}
