# AI Models

VibeCheck supports multiple Google Gemini models, each with different capabilities and performance characteristics.

## Available Models

### 1. Flash-Lite 2.5
**Key**: `lite`  
**Full Name**: Flash-Lite  
**Version**: 2.5  
**Model String**: `gemini-2.5-flash-lite`  
**Short Name**: Lite

**Capabilities**:
- ✅ Fastest generation
- ❌ No thinking mode
- ❌ No image output
- ✅ Lightweight

**Use Cases**:
- Quick iterations
- Simple prompts
- Batch generation
- When speed is priority

**Order**: 1

---

### 2. Flash 2.5 (Thinking Off)
**Key**: `flash`  
**Full Name**: Flash (thinking off)  
**Version**: 2.5  
**Model String**: `gemini-2.5-flash`  
**Short Name**: Flash

**Capabilities**:
- ✅ Fast generation
- ✅ Thinking capable (but disabled)
- ❌ No image output
- ✅ Good balance of speed and quality

**Use Cases**:
- General purpose generation
- Fast comparisons
- Default batch mode model
- Versus mode comparisons

**Order**: 2  
**Default**: Yes (for batch mode)

---

### 3. Flash 2.5 (Thinking On)
**Key**: `flashThinking`  
**Full Name**: Flash  
**Version**: 2.5  
**Model String**: `gemini-2.5-flash`  
**Short Name**: Flash

**Capabilities**:
- ✅ Fast generation
- ✅ Thinking mode enabled
- ❌ No image output
- ✅ Better reasoning for complex prompts

**Use Cases**:
- Complex prompts requiring reasoning
- When quality matters more than speed
- Detailed code generation

**Order**: 3

---

### 4. Pro 2.5
**Key**: `pro`  
**Full Name**: Pro  
**Version**: 2.5  
**Model String**: `gemini-2.5-pro`  
**Short Name**: Pro

**Capabilities**:
- ✅ Highest quality
- ✅ Thinking mode enabled
- ❌ No image output
- ⚠️ Slower than Flash

**Use Cases**:
- Complex code generation
- High-quality outputs
- Versus mode comparisons
- When quality is priority

**Order**: 4

---

### 5. Pro 3 (Preview)
**Key**: `threePro`  
**Full Name**: Pro  
**Version**: 3  
**Model String**: `gemini-3-pro-preview`  
**Short Name**: Pro

**Capabilities**:
- ✅ Latest model version
- ✅ Thinking mode enabled
- ❌ No image output
- ✅ Advanced capabilities
- ⚠️ Preview/experimental

**Use Cases**:
- Cutting-edge generation
- Testing new capabilities
- Versus mode comparisons
- Experimental features

**Order**: 7  
**Default**: Yes (for versus mode)

---

## Model Comparison

| Model | Speed | Quality | Thinking | Image Output | Use Case |
|-------|-------|---------|----------|--------------|----------|
| Flash-Lite 2.5 | ⚡⚡⚡ | ⭐⭐ | ❌ | ❌ | Quick iterations |
| Flash 2.5 (off) | ⚡⚡ | ⭐⭐⭐ | ❌ | ❌ | General purpose |
| Flash 2.5 (on) | ⚡⚡ | ⭐⭐⭐⭐ | ✅ | ❌ | Complex prompts |
| Pro 2.5 | ⚡ | ⭐⭐⭐⭐⭐ | ✅ | ❌ | High quality |
| Pro 3 | ⚡ | ⭐⭐⭐⭐⭐ | ✅ | ❌ | Latest features |

## Model Configuration

### Active Models
Only these models are currently active:
- `lite`
- `flash`
- `flashThinking`
- `pro`
- `threePro`

### Model Properties
Each model has:
- **name**: Display name
- **version**: Model version
- **modelString**: API model identifier
- **shortName**: Short display name
- **thinkingCapable**: Can enable thinking mode
- **thinking**: Thinking mode enabled
- **imageOutput**: Supports image generation
- **order**: Display/sort order

## Default Settings

### Batch Mode
- **Default Model**: `flash` (Flash 2.5, thinking off)
- **Default Size**: 3 outputs

### Versus Mode
- **Default Models**: 
  - `flash`: ✅ enabled
  - `threePro`: ✅ enabled
- All other models: ❌ disabled

## Thinking Mode

### What is Thinking Mode?
Thinking mode allows the model to show its reasoning process before generating the final output. This can improve quality for complex prompts.

### Models with Thinking
- Flash 2.5 (when enabled)
- Pro 2.5
- Pro 3

### When to Use
- Complex code generation
- Multi-step reasoning required
- Higher quality needed
- When speed is less critical

## Image Generation

### Current Status
Image generation models are commented out in the codebase but infrastructure exists:
- `flashImage` model (commented)
- Model string: `gemini-2.0-flash-preview-image-generation`
- Image output mode exists in modes.ts

### Future Support
The codebase is prepared for image generation when models become available.

## API Integration

### Safety Settings
All models use the same safety settings:
- **HATE_SPEECH**: BLOCK_NONE
- **SEXUALLY_EXPLICIT**: BLOCK_NONE
- **DANGEROUS_CONTENT**: BLOCK_NONE
- **HARASSMENT**: BLOCK_NONE

### Request Configuration
- **Timeout**: 193 seconds
- **Max Retries**: 5 attempts
- **Base Delay**: 1233ms
- **Concurrency**: 1 request at a time (rate limiting)

### Multi-Modal Support
- Text input: ✅ Supported
- Image input: ✅ Supported (via base64)
- Image output: ⚠️ Infrastructure ready, models commented

## Performance Metrics

Each output tracks:
- **startTime**: Request start timestamp
- **totalTime**: Total generation time in milliseconds
- Displayed in UI as seconds (e.g., "2.3s")

## Model Selection UI

Users can:
- Select batch model from dropdown
- Toggle models in versus mode
- See model version and name in output display
- Compare outputs from different models

