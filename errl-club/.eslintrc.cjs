/**
 * ESLint configuration for Errl Club Simulator
 * 
 * Integrates with Prettier and includes rules for Three.js development
 */
module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        // Error prevention
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-debugger': 'warn',
        'no-unused-vars': ['warn', { 
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        }],
        'no-undef': 'error',
        
        // Code quality
        'prefer-const': 'warn',
        'no-var': 'error',
        'prefer-arrow-callback': 'warn',
        'arrow-body-style': ['warn', 'as-needed'],
        
        // Best practices
        'eqeqeq': ['error', 'always', { null: 'ignore' }],
        'curly': ['error', 'all'],
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-return-await': 'error',
        'require-await': 'warn',
        
        // Style (handled by Prettier, but some rules for consistency)
        'semi': ['error', 'always'],
        'quotes': ['error', 'single', { avoidEscape: true }],
        'comma-dangle': ['error', 'always-multiline'],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        
        // Three.js specific
        // Allow THREE global (Three.js is imported but also available globally)
        'no-restricted-globals': ['error', {
            name: 'THREE',
            message: 'Use import { ... } from "three" instead of global THREE',
        }],
    },
    globals: {
        // Three.js is available globally in some contexts
        // But we prefer imports, so this is commented out
        // THREE: 'readonly',
    },
    overrides: [
        {
            // Configuration for test files
            files: ['tests/**/*.js', '**/*.test.js'],
            env: {
                jest: false, // Using Playwright, not Jest
                node: true,
            },
            rules: {
                'no-console': 'off', // Allow console in tests
            },
        },
        {
            // Configuration for template files (examples, not actual code)
            files: ['**/integration-templates/**/*.js', '**/*-template.js'],
            rules: {
                'no-undef': 'off', // Templates may reference undefined variables
                'no-unused-vars': 'off', // Templates may have unused variables
            },
        },
    ],
    ignorePatterns: [
        '**/integration-templates/**', // Ignore template files
    ],
};

