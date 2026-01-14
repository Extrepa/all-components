/**
 * lint-staged configuration
 * 
 * Runs linters and formatters on git staged files
 */
module.exports = {
    // Lint and format JavaScript files
    '*.js': [
        'eslint --fix',
        'prettier --write',
    ],
    // Format CSS files
    '*.css': [
        'prettier --write',
    ],
    // Format JSON files
    '*.json': [
        'prettier --write',
    ],
    // Format Markdown files
    '*.md': [
        'prettier --write',
    ],
};

