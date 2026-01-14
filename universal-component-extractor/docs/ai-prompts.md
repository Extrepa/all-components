# AI Prompt System Documentation

## Overview

The Universal Component Extractor uses provider-specific AI prompts optimized for each model's behavior and capabilities. All prompts share a common base structure but include provider-specific customizations.

## Prompt Architecture

### Base Prompt Template

All providers use a shared base prompt (`getBasePrompt()`) that includes:
- Core objectives and instructions
- Framework detection guidelines
- HTML/CSS/JS extraction rules
- Code modernization requirements
- Analysis section requirements
- Output format specification

### Provider-Specific Customizations

Each provider has a custom prompt function that extends the base prompt:

#### Gemini (`getGeminiPrompt()`)
- Uses base prompt as-is
- Optimized for Gemini's natural language understanding
- Proven effective in AI Studio environment

#### OpenAI (`getOpenAIPrompt()`)
- Base prompt + OpenAI-specific guidance
- Emphasis on precise XML tag structure
- Instructions for complete, functional code blocks

#### Anthropic (`getAnthropicPrompt()`)
- Base prompt + Claude-specific guidance
- Focus on thorough analysis sections
- Emphasis on production-ready code formatting

#### Ollama (`getOllamaPrompt()`)
- Base prompt + Ollama-specific guidance
- Instructions for ordered XML tag output
- Emphasis on clear, well-commented code
- Focus on generating complete, working code

## Key Instructions

### Library References

**Important**: All prompts instruct AI to use **local library paths**, NOT CDNs:

- **Three.js**: `/libs/three/three.min.js`
- **OrbitControls**: `/libs/three/controls/OrbitControls.js`
- **React/ReactDOM**: Automatically loaded by preview system (no script tags needed)

### Output Format

All prompts require XML-style tag output:
- `<FRAMEWORK>...</FRAMEWORK>`
- `<COMPONENT_NAME>...</COMPONENT_NAME>`
- `<CODE_HTML>...</CODE_HTML>`
- `<CODE_CSS>...</CODE_CSS>`
- `<CODE_SCSS>...</CODE_SCSS>`
- `<CODE_TSX>...</CODE_TSX>`
- `<CODE_VANILLA>...</CODE_VANILLA>`
- `<EXPLANATION>...</EXPLANATION>`
- `<BUILD_APPROACH>...</BUILD_APPROACH>`
- `<CODE_SIMPLIFICATION>...</CODE_SIMPLIFICATION>`
- `<ACTIVE_CODE>...</ACTIVE_CODE>`
- `<HOW_IT_WORKS>...</HOW_IT_WORKS>`
- `<EDITABLE_SECTIONS>...</EDITABLE_SECTIONS>`

## Prompt Evolution

### Version 2.0.1 Changes
- Removed all CDN references
- Added local library path examples
- Implemented provider-specific customizations
- Simplified instruction structure
- Enhanced analysis section guidance

### Best Practices

1. **Consistency**: All providers receive the same core instructions
2. **Clarity**: Instructions are direct and unambiguous
3. **Examples**: Specific examples provided for library paths
4. **Format**: Strict XML tag format requirements
5. **Completeness**: All analysis sections must be generated

## Testing Prompts

When updating prompts:
1. Test with each provider
2. Verify XML tag extraction works
3. Check that local library paths are used
4. Ensure analysis sections are generated
5. Validate code quality and completeness

## Customization Guidelines

### Adding New Providers

1. Create `get[Provider]Prompt()` function
2. Use `getBasePrompt()` as foundation
3. Add provider-specific guidance
4. Update `extractWith[Provider]()` to use new prompt
5. Test thoroughly

### Modifying Base Prompt

1. Update `getBasePrompt()` function
2. Test with all providers
3. Verify backward compatibility
4. Update documentation

---

For technical details, see [./DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)  
For user instructions, see [./USER_GUIDE.md](./USER_GUIDE.md)  
For complete documentation index, see [README.md](./README.md)
