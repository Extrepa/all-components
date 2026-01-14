# Contributing to Errl Club Simulator

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Node.js v25.2.1 (use `.nvmrc` if you have nvm)
- npm v10.0.0 or higher
- Git

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/errl-club.git
   cd errl-club
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Verify setup**
   ```bash
   npm run check  # Should pass without errors
   npm run dev    # Should start dev server
   ```

## Code Style

### JavaScript

- Use ES modules (`import`/`export`)
- Follow ESLint rules (run `npm run lint` to check)
- Use Prettier for formatting (run `npm run format` to format)
- Use camelCase for variables and functions
- Use PascalCase for classes
- Use descriptive names

### CSS

- Follow Prettier formatting
- Use consistent spacing (4 spaces)
- Use CSS variables from design system when possible

### File Organization

- Place files in appropriate domain folders (`src/avatar/`, `src/ui/`, etc.)
- Keep related functionality together
- Follow existing project structure

## Git Workflow

### Branch Naming

- `feat/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

Examples:
- `feat/add-new-collectible`
- `fix/camera-zoom-issue`
- `chore/update-dependencies`

### Commit Messages

Follow the conventional commit format:

```
type: short description

Optional longer description explaining what and why.
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add new emote wheel animation
fix: resolve camera clipping through walls
docs: update setup instructions in README
```

### Pull Request Process

1. **Create a branch** from `main` or `develop`
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Follow code style guidelines
   - Add tests if applicable

3. **Run quality checks**
   ```bash
   npm run check    # Lint and format check
   npm test         # Run tests
   npm run build    # Verify build works
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your commit message"
   ```
   Pre-commit hooks will automatically run linting and formatting.

5. **Push and create PR**
   ```bash
   git push origin feat/your-feature-name
   ```
   Then create a pull request on GitHub.

6. **PR Requirements**
   - All CI checks must pass
   - Code must be reviewed
   - Description should explain what and why

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:e2e      # End-to-end tests
npm run test:unit     # Unit tests
npm run test:headed   # Run with visible browser
```

### Writing Tests

- Place tests in `tests/` directory
- Use Playwright for E2E tests
- Test critical user flows
- Document test scenarios in `docs/testing/`

## Code Quality

### Before Committing

Always run:
```bash
npm run check  # Lint and format check
```

### ESLint Rules

- No console.log (use console.warn or console.error)
- No unused variables
- Prefer const over let
- Use arrow functions where appropriate
- Follow Three.js best practices

### Prettier

Code is automatically formatted with Prettier. Configuration is in `.prettierrc.js`.

## Documentation

### Code Documentation

- Document complex functions with JSDoc comments
- Explain "why" not just "what"
- Keep comments up to date

### Project Documentation

- Update README.md for user-facing changes
- Update CONTRIBUTING.md for workflow changes
- Add to `docs/` for technical documentation
- Update design system docs for UI changes

## Project Structure

```
src/
├── avatar/        # Avatar system
├── audio/         # Audio system
├── camera/        # Camera controls
├── config/        # Configuration
├── core/          # Core game systems
├── effects/       # Visual effects
├── ui/            # UI components
└── ...

docs/
├── design-system/ # Design system documentation
├── testing/       # Testing documentation
└── ...
```

## Getting Help

- Check existing documentation in `docs/`
- Review similar code in the codebase
- Ask questions in PR comments
- Check GitHub issues for known problems

## Code Review Guidelines

### For Authors

- Keep PRs focused and reasonably sized
- Respond to review comments promptly
- Be open to feedback and suggestions

### For Reviewers

- Be constructive and respectful
- Focus on code quality and correctness
- Approve when ready, request changes when needed

## Release Process

Releases are managed by maintainers. When your PR is merged:
- It will be included in the next release
- Version numbers follow semantic versioning
- Changelog is updated automatically

## Questions?

If you have questions about contributing:
1. Check this document first
2. Review existing code and documentation
3. Open a GitHub issue for discussion

Thank you for contributing! 🎉

