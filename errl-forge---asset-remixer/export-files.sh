#!/bin/bash
# Script to export all source files for Gemini to rebuild the project

OUTPUT_DIR="gemini-build-files"
mkdir -p "$OUTPUT_DIR"

echo "Exporting all source files for Gemini build..."

# Configuration files
echo "Exporting configuration files..."
cp package.json "$OUTPUT_DIR/"
cp tsconfig.json "$OUTPUT_DIR/"
cp vite.config.ts "$OUTPUT_DIR/"
cp .gitignore "$OUTPUT_DIR/"
cp index.html "$OUTPUT_DIR/"

# Core source files
echo "Exporting core source files..."
cp types.ts "$OUTPUT_DIR/"
cp constants.ts "$OUTPUT_DIR/"
cp utils.ts "$OUTPUT_DIR/"
cp index.css "$OUTPUT_DIR/"

# Services
echo "Exporting service files..."
mkdir -p "$OUTPUT_DIR/services/providers"
cp services/aiProvider.ts "$OUTPUT_DIR/services/"
cp services/aiService.ts "$OUTPUT_DIR/services/"
cp services/mapleStoryService.ts "$OUTPUT_DIR/services/"
cp services/providers/geminiProvider.ts "$OUTPUT_DIR/services/providers/"
cp services/providers/openaiProvider.ts "$OUTPUT_DIR/services/providers/"
cp services/providers/anthropicProvider.ts "$OUTPUT_DIR/services/providers/"

# Components
echo "Exporting component files..."
mkdir -p "$OUTPUT_DIR/components"
cp components/AssetLibrary.tsx "$OUTPUT_DIR/components/"
cp components/AssetEditor.tsx "$OUTPUT_DIR/components/"

# App files
echo "Exporting app files..."
cp App.tsx "$OUTPUT_DIR/"
cp index.tsx "$OUTPUT_DIR/"

# Build instructions
echo "Exporting build instructions..."
cp BUILD_INSTRUCTIONS.md "$OUTPUT_DIR/"
cp PROJECT_FILES.md "$OUTPUT_DIR/"
cp GEMINI_BUILD_PACKAGE.md "$OUTPUT_DIR/"
cp FILE_CHECKLIST.md "$OUTPUT_DIR/"
cp README_FOR_GEMINI.md "$OUTPUT_DIR/"

# Create .env.example
echo "Creating .env.example..."
cat > "$OUTPUT_DIR/.env.example" << 'EOF'
# AI Provider Configuration
# Set at least one API key for the provider you want to use

# Gemini (Google) - Recommended for image generation
# Get your key from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI (DALL-E 3) - Alternative image generation
# Get your key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Anthropic (Claude) - Metadata generation only
# Get your key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Default provider (optional, defaults to 'gemini')
# Options: gemini, openai, anthropic
AI_PROVIDER=gemini
EOF

# Create file list
echo "Creating file list..."
cat > "$OUTPUT_DIR/FILE_LIST.txt" << 'EOF'
Complete File List for Errl Forge Asset Remixer

Configuration Files:
- package.json
- tsconfig.json
- vite.config.ts
- .gitignore
- .env.example
- index.html

Core Source Files:
- types.ts
- constants.ts
- utils.ts
- index.css

Services:
- services/aiProvider.ts
- services/aiService.ts
- services/mapleStoryService.ts
- services/providers/geminiProvider.ts
- services/providers/openaiProvider.ts
- services/providers/anthropicProvider.ts

Components:
- components/AssetLibrary.tsx
- components/AssetEditor.tsx

Application:
- App.tsx
- index.tsx

Build Instructions:
- BUILD_INSTRUCTIONS.md
- PROJECT_FILES.md
- GEMINI_BUILD_PACKAGE.md
- FILE_CHECKLIST.md
- README_FOR_GEMINI.md
EOF

echo ""
echo "✅ All files exported to: $OUTPUT_DIR/"
echo ""
echo "Files ready for Gemini to rebuild the project!"
echo "Total files: $(find "$OUTPUT_DIR" -type f | wc -l | tr -d ' ')"
echo ""
echo "Next steps:"
echo "1. Review README_FOR_GEMINI.md in the output directory"
echo "2. Follow BUILD_INSTRUCTIONS.md"
echo "3. Use FILE_CHECKLIST.md to verify all files are created"

