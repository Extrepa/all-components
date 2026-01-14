module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/tests'],
	testMatch: ['**/*.test.ts'],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.d.ts',
		'!src/main.ts',
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'html'],
	moduleNameMapper: {
		'^obsidian$': '<rootDir>/tests/obsidian-mock.js',
	},
	setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
	transform: {
		'^.+\\.ts$': ['ts-jest', {
			useESM: false,
		}],
	},
};

