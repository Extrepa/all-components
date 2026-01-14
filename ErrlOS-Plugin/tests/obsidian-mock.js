// Mock Obsidian module for Jest tests
// This provides TFolder and TFile classes that work with instanceof

// Import the global classes from setup
// Note: This file is loaded after setup.ts, so globals should be available

// Get TFolder and TFile from global scope (set in setup.ts)
const TFolder = global.TFolder || class TFolder {
	constructor(name, path) {
		this.type = 'folder';
		this.name = name;
		this.path = path;
		this.children = [];
	}
};

const TFile = global.TFile || class TFile {
	constructor(name, path, content) {
		this.type = 'file';
		this.name = name;
		this.path = path;
		this.content = content;
	}
};

// Export Obsidian API
module.exports = {
	TFolder,
	TFile,
	Vault: class Vault {
		getAbstractFileByPath() { return null; }
		getRoot() { return null; }
	},
	Plugin: class Plugin {
		app = {};
		manifest = {};
	},
	App: class App {
		vault = {};
	},
	Notice: class Notice {
		constructor(message) { this.message = message; }
	},
	MarkdownView: class MarkdownView {},
	TAbstractFile: class TAbstractFile {},
	Modal: class Modal {
		constructor(app) { this.app = app; }
		open() {}
		close() {}
	},
	Setting: class Setting {
		setName() { return this; }
		setDesc() { return this; }
		addText() { return this; }
		addToggle() { return this; }
	},
};

