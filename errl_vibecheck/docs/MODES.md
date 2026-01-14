# Output Modes

VibeCheck supports multiple output modes, each optimized for different types of creative coding and visual generation.

## Available Modes

### 1. P5.js (🎨)
**Syntax**: JavaScript  
**Output**: Interactive canvas sketches

**Capabilities**:
- Creative coding sketches
- Animation and interactivity
- 800x600 canvas
- No external asset dependencies
- Full P5.js API access

**System Instructions**:
Expert P5.js developer creating creative, animated sketches that satisfy prompts. Code must be self-contained.

**Example Presets**:
- 😻 jetpack cat
- 🐦 pelican
- 🐈 runner cat
- 😂 laugh
- ⬜ mondrian
- 🧼 soap bubbles
- 🧬 Conway's Game of Life
- 🏓 pong
- 🌧️ rainy window
- 🎆 fireworks

### 2. SVG (📐)
**Syntax**: XML  
**Output**: Vector graphics

**Capabilities**:
- Scalable vector graphics
- ViewBox-based responsive design
- Complex shapes and paths
- No external assets

**System Instructions**:
Expert at turning image prompts into SVG code. Always includes viewBox. Self-contained code only.

**Example Presets**:
- 🚲 pelican on bicycle
- 🎧 axolotl with headphones
- 🦔 hedgehog with sunglasses
- 🐱 cat detective
- 🏙️ futuristic isometric city
- 🚀 retro rocket ship
- 🌸 zen garden
- 🍱 bento box

### 3. HTML/JS (📄)
**Syntax**: HTML  
**Output**: Complete web applications

**Capabilities**:
- Full HTML pages
- Inline CSS and JavaScript
- Interactive web components
- 4:3 aspect ratio optimized
- Sandboxed execution
- Emoji-based graphics

**System Instructions**:
Expert web developer creating minimal web apps. Vanilla JS/HTML/CSS only. No external assets or network calls.

**Example Presets**:
- 🕓 minimalist analog clock
- 🔮 futuristic calendar
- 📈 date data visualization
- 📅 clock + calendar
- 🔢 neobrutalist calculator
- 🎨 HSL color picker
- ⏱️ stopwatch
- 🥁 drum machine
- 🎹 synthesizer piano
- 📝 todo list
- 🐍 snake game
- 🌡️ weather card
- 🧘 breathing exercise

### 4. 3D Wireframes (3️⃣)
**Syntax**: HTML (Three.js)  
**Output**: 3D wireframe scenes

**Capabilities**:
- Three.js wireframe rendering
- Auto-rotating camera
- Orbit controls
- Procedural geometry
- Pure black background
- ESM.run CDN imports

**System Instructions**:
Expert Three.js developer. Wireframe rendering only. Auto-rotate camera. Black background. No external assets.

**Example Presets**:
- 🎡 ferris wheel
- 〰️ cymatic patterns
- 🎗️ knot
- 🖊️ pen plotter patterns
- 🪜 spiral staircase
- 🌳 fractal branching tree
- 🦢 bird line art
- 🪐 interplanetary bridge
- 🔴 pachinko machine
- 🛸 UFO
- 🚀 flight simulator
- 📐 impossible geometry
- 🕷️ mechanical spider
- 🧬 DNA helix
- 🏙️ cyber city

### 5. 3D Voxels (🧊)
**Syntax**: HTML (Three.js)  
**Output**: Voxel-based 3D scenes

**Capabilities**:
- Three.js voxel rendering
- Colorful block-based visuals
- Auto-rotating camera
- Orbit controls
- Animated scenes
- ESM.run CDN imports

**System Instructions**:
Expert Three.js developer. Voxel rendering. Auto-rotate camera. No external assets.

**Example Presets**:
- 🌊 ocean simulation
- 🎵 turntable
- 🥯 bagel with lox
- 🥪 BLT sandwich
- 🏟️ stadium with crowd
- 🧊 zamboni on ice
- 🤖 giant dancing robot
- 🚗 bumper cars
- 🐦 quetzal
- 📺 vintage TV
- 🦎 dancing axolotl
- 🏝️ floating island
- 🏰 medieval castle
- 🚂 steam train
- 🏠 cottage in woods
- 🏎️ formula 1 race car

### 6. Shader (🖌️)
**Syntax**: GLSL  
**Output**: Fragment shaders

**Capabilities**:
- GLSL fragment shaders
- Time-based animations
- Resolution-aware
- Three.js integration
- Procedural graphics

**System Instructions**:
Expert GLSL fragment shader developer. Must include precision, uniforms (u_resolution, u_time), and gl_FragColor. Raw GLSL code only.

**Example Presets**:
- 🟠 lava lamp interior
- ⚫ 3D metaballs
- 🌀 hypnotic patterns
- 🍬 infinite red licorice world
- ⬇️ metal balls in gelatin
- 〰️ metal cymatics
- ⛰️ flying over landscape
- 🌈 iridescent oil slick
- 🔥 cozy fireplace
- 🌌 deep space nebula
- ⚡ electric lightning
- 💠 growing fractal crystals

### 7. Images (🖼️)
**Syntax**: Image  
**Output**: Direct image generation

**Capabilities**:
- Direct image output from model
- Base64 encoded PNG
- 800x600 resolution
- When model supports image generation

**System Instructions**:
Expert at turning text prompts into images. Creates 800x600 images that satisfy prompts.

**Note**: Image generation mode is currently commented out in models.ts but infrastructure exists.

## Mode Configuration

Each mode has:
- **name**: Display name
- **emoji**: Visual identifier
- **syntax**: Code syntax type
- **imageOutput**: Boolean for image vs code
- **systemInstruction**: AI prompt instructions
- **getTitle**: Function to generate display title
- **presets**: Array of preset prompts

## Frontpage Order

Modes displayed on intro page in this order:
1. Voxels
2. Wireframes
3. GLSL (Shader)
4. P5.js
5. HTML
6. SVG

Images mode is excluded from frontpage display.

## Code Scaffolding

Each mode has a scaffold function that wraps generated code:
- **P5.js**: Full HTML with P5.js CDN and canvas setup
- **SVG**: CSS styling wrapper
- **HTML**: Direct pass-through
- **GLSL**: Three.js setup with shader material
- **Wireframes/Voxels**: Direct pass-through
- **Image**: Base64 data URL

## Rendering

All modes (except images) render in sandboxed iframes:
- Isolated execution
- No network access
- No localStorage
- Safe code execution

