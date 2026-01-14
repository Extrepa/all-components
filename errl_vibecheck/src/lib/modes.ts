/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {outputWidth, outputHeight} from './consts.ts'
import type {Modes} from './types.ts'

const f = (s: string) =>
  s
    .replace(/([^\n{])\n([^\n}\s+])/g, '$1 $2')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

export default {
  p5: {
    name: 'P5.js',
    emoji: '🎨',
    syntax: 'javascript',
    imageOutput: false,
    systemInstruction: f(`\
You are an expert P5.js developer. When given a prompt, you will use your creativity
and coding skills to create a ${outputWidth}x${outputHeight} P5.js sketch that
perfectly satisfies the prompt. Be creative and add animation or interactivity
if appropriate. Do not import any external assets, they won't work. Return ONLY
the P5.js code, nothing else, no commentary.`),
    getTitle: s => `Code ${s}`,
    presets: [
      {label: '😻 jetpack cat', prompt: 'cat wearing jetpack'},
      {label: '🐦 pelican', prompt: 'pelican riding bicycle'},
      {
        label: '🐈 runner cat',
        prompt:
          'infinite runner game on city rooftops as a cat, minimalist monochrome line art design, auto-playing, no text'
      },
      {label: '😂 laugh', prompt: 'make me laugh'},
      {
        label: '⬜ mondrian',
        prompt:
          'infinite Mondrian runner game on city roof tops, auto-playing, no text'
      },
      {
        label: '😀 circle',
        prompt:
          'a circle that does something delightfully unexpected when you click it, no text'
      },
      {label: '😳 shy', prompt: 'a shy creature, no text'},
      {
        label: '👀 curious',
        prompt:
          'a cute unusual creature that is very curious about your mouse, no text'
      },
      {
        label: '➿ line',
        prompt:
          'a single white line transforms into a new delightful form each time you click, no text'
      },
      {
        label: '🧼 soap',
        prompt: 'simulation of colorful iridescent soap bubbles popping'
      },
      {
        label: '🧬 life',
        prompt: 'conways game of life with colorful cells and trails'
      },
      {
        label: '🏓 pong',
        prompt: 'classic pong game playing itself, retro neon aesthetics'
      },
      {
        label: '🌧️ rain',
        prompt: 'cozy rainy window simulation with droplets running down'
      },
      {
        label: '🌀 spiral',
        prompt: 'hypnotic rotating double spiral pattern with shifting colors'
      },
      {
        label: '🎆 fireworks',
        prompt: 'colorful fireworks display launching from bottom with particle trails'
      },
      {
        label: '🌊 wave',
        prompt: 'simulation of ocean waves with floating particles'
      },
      {
        label: '🕹️ breakout',
        prompt: 'classic breakout arcade game playing itself'
      }
    ]
  },

  svg: {
    name: 'SVG',
    emoji: '📐',
    syntax: 'xml',
    imageOutput: false,
    systemInstruction: f(`\
You are an expert at turning image prompts into SVG code. When given a prompt,
use your creativity to code a ${outputWidth}x${outputHeight} SVG rendering of it.
Always add viewBox="0 0 ${outputWidth} ${outputHeight}" to the root svg tag. Do
not import external assets, they won't work. Return ONLY the SVG code, nothing else,
no commentary.`),
    getTitle: s => `Draw ${s}`,
    presets: [
      {label: '🚲 pelican', prompt: 'pelican riding a bicycle'},
      {label: '🎧 axolotl', prompt: 'axolotl wearing headphones'},
      {label: '🦔 hedgehog', prompt: 'hedgehog wearing sunglasses'},
      {label: '🐱 cat', prompt: 'cat detective'},
      {label: '🐙 octopus', prompt: 'smart octopus'},
      {label: '🏙️ city', prompt: 'futuristic isometric city block'},
      {label: '🚀 rocket', prompt: 'retro rocket ship taking off with smoke'},
      {label: '🌸 garden', prompt: 'zen garden with cherry blossom tree'},
      {label: '🍱 bento', prompt: 'delicious bento box layout'},
      {label: '🦖 t-rex', prompt: 'cute t-rex dinosaur roaring'},
      {label: '🍕 pizza', prompt: 'delicious pepperoni pizza slice with melting cheese'},
      {label: '🎸 guitar', prompt: 'electric guitar, clean vector style'},
      {label: '🎮 gamepad', prompt: 'retro game controller'}
    ]
  },

  html: {
    name: 'HTML/JS',
    emoji: '📄',
    syntax: 'html',
    imageOutput: false,
    systemInstruction: f(`\
You are an expert web developer. When given a prompt, you will use your creativity
and coding skills to create a minimal web app that perfectly satisfies the prompt.
Try to use only vanilla JavaScript, HTML, and CSS. Try to design the layout so
it looks good in a 4:3 aspect ratio. Write a full HTML page with the styles and
styles and scripts inlined. The app will run inside a sandboxed iframe so do not
use any secure APIs like localStorage and don't make any network calls. Do not
ever import assets like images or videos, they won't work. Try using emojis for
graphics. Return ONLY the HTML page, nothing else, no commentary.`),

    getTitle: s => `Code ${s}`,
    presets: [
      {
        label: '🕓 simple clock',
        prompt:
          'minimalist zen-like analog clock with detailed ticks, background gradient color shifts with second hand'
      },
      {
        label: '🔮 futuristic cal',
        prompt:
          "minimal futuristic holographic calendar app based on today's date"
      },
      {
        label: '📈 date dataviz',
        prompt: "minimalist simple creative data visualization of today's date"
      },
      {
        label: '📅 clock + calendar',
        prompt:
          'large clock and month calendar, minimal text and UI, neo-brutalist design, elegantly changes color schemes every 10 seconds'
      },
      {
        label: '🔢 calculator',
        prompt: 'simple calculator, neobrutalist design, no title'
      },
      {
        label: '🎨 color picker',
        prompt: 'aesthetic HSL color picker and palette generator'
      },
      {
        label: '⏱️ stopwatch',
        prompt: 'beautiful minimal stopwatch with lap times'
      },
      {
        label: '🥁 drum machine',
        prompt: 'simple step sequencer drum machine using browser synth sounds'
      },
      {
        label: '🎹 piano',
        prompt: 'playable synthesizer piano keyboard'
      },
      {
        label: '📝 todo',
        prompt: 'minimalist todo list with satisfying check animations and confetti on complete'
      },
      {
        label: '🐍 snake',
        prompt: 'classic snake game, neon grid style, score counter'
      },
      {
        label: '🌡️ weather',
        prompt: 'beautiful weather card component with animated css icons (sunny, cloudy, rain)'
      },
      {
        label: '🧘 breathe',
        prompt: 'guided breathing exercise app with expanding/contracting circle'
      }
    ]
  },

  image: {
    name: 'Images',
    emoji: '🖼️',
    syntax: 'image',
    imageOutput: true,
    systemInstruction: f(`\
You are an expert at turning text prompts into images. When given a prompt, you will
use your creativity to create a ${outputWidth}x${outputHeight} image that perfectly
satisfies the prompt.`),
    getTitle: s => s,
    presets: []
  },
  wireframes: {
    name: '3D Wireframes',
    emoji: '3️⃣',
    syntax: 'html',
    imageOutput: false,
    systemInstruction: f(`\
You are an expert Three.js developer. When given a prompt, you will use your creativity and coding skills to create a Three.js scene that perfectly satisfies the prompt. Always return a full HTML document with the Three.js library included. Import the library and any other necessary libraries via the esm.run CDN (e.g. https://esm.run/three). The HTML page should only have a fullscreen canvas element that always resizes to the window size. Remember to set the renderer.setPixelRatio to 2. Always add orbit controls to the scene so the user can rotate the camera. Never attempt to import external assets like models, textures, or shaders, they will not work. Break down object requests into simple primitive shapes. Render them as wireframes. Auto-rotate the camera around the objects. Always use a pure black background. Return ONLY the full HTML page, nothing else, no commentary.`),
    getTitle: s => `Code ${s}`,
    presets: [
      {label: '🎡 ferris wheel', prompt: 'ferris wheel'},
      {label: '〰️ cymatics', prompt: 'beautiful cymatic patterns'},
      {label: '🎗️ knot', prompt: 'beautiful knot'},
      {label: '🖊️ plotter', prompt: 'pen plotter drawing beautiful patterns'},
      {label: '🪜 stairs', prompt: 'spiral staircase'},
      {
        label: '🌳 tree',
        prompt: 'fractal branching 3d tree begins as trunk then grows'
      },
      {
        label: '🦢 bird',
        prompt:
          'continous abstract 3d line art of bird flying, white line on black, hand drawn feeling'
      },
      {
        label: '🪐 space road',
        prompt:
          'cars driving on an interplanetary bridge in outer space, bloom glow effect'
      },
      {
        label: '🔴 pachinko',
        prompt: 'infinite pachinko machine, slow physics'
      },
      {label: '🛸 ufo', prompt: 'ufo'},
      {
        label: '🚀 flight sim',
        prompt:
          'flight simulator with sci-fi ship zig-zagging over infinitely generative landscape, bloom glow effect'
      },
      {
        label: '📐 geometry',
        prompt: 'complex impossible geometry optical illusion'
      },
      {
        label: '🕷️ spider',
        prompt: 'mechanical spider walking procedurally'
      },
      {
        label: '🧬 dna',
        prompt: 'rotating DNA double helix structure'
      },
      {
        label: '🏙️ city',
        prompt: 'endless flight through a dense wireframe cyber city'
      }
    ]
  },
  voxels: {
    name: '3D Voxels',
    emoji: '🧊',
    syntax: 'html',
    imageOutput: false,
    systemInstruction: f(`\
You are an expert Three.js developer. When given a prompt, you will use your creativity and coding skills to create a Three.js scene that perfectly satisfies the prompt. Always return a full HTML document with the Three.js library included. Import the library and any other necessary libraries via the esm.run CDN (e.g. https://esm.run/three). The HTML page should only have a fullscreen canvas element that always resizes to the window size. Remember to set the renderer.setPixelRatio to 2. Always add orbit controls to the scene so the user can rotate the camera. Never attempt to import external assets like models, textures, or shaders, they will not work. Render the scene as colorful voxels. Auto-rotate the camera around the objects. Return ONLY the full HTML page, nothing else, no commentary.`),
    getTitle: s => `Code ${s}`,
    presets: [
      {label: '🌊 ocean', prompt: 'ocean simulation'},
      {label: '🎵 turntable', prompt: 'turntable'},
      {label: '🥯 bagel', prompt: 'bagel with lox'},
      {label: '🥪 BLT', prompt: 'BLT sandwich being made'},
      {label: '🏟️ stadium', prompt: 'stadium with animated crowd'},
      {label: '🧊 zamboni', prompt: 'animated zamboni on ice rink'},
      {label: '😂 laugh', prompt: 'make me laugh'},
      {label: '🤖 robot', prompt: 'giant dancing anime robot'},
      {
        label: '🚗 bumper cars',
        prompt: 'animated bumper cars with collision physics'
      },
      {label: '🐦 quetzal', prompt: 'quetzal'},
      {label: '📺 TV', prompt: 'vintage TV with changing channels'},
      {label: '🦎 axolotl', prompt: 'dancing axolotl'},
      {
        label: '🏝️ island',
        prompt:
          'floating island with detailed shape shifting green terrain, structures and rivers and trees forming and disappearing'
      },
      {
        label: '🏰 castle',
        prompt: 'medieval castle with drawbridge'
      },
      {
        label: '🚂 train',
        prompt: 'steam train chugging along a track'
      },
      {
        label: '🏠 cottage',
        prompt: 'cozy cottage in the woods with smoke coming from chimney'
      },
      {
        label: '🏎️ race',
        prompt: 'formula 1 race car driving on a track'
      }
    ]
  },
  glsl: {
    name: 'Shader',
    emoji: '🖌️',
    syntax: 'shader',
    imageOutput: false,
    systemInstruction: f(`\
You are an expert GLSL fragment shader developer. Your sole purpose is to generate a complete GLSL fragment shader based on a user's prompt.
- The generated code must be a valid GLSL fragment shader.
- The output should ONLY be the raw GLSL code. Do not include any explanations, markdown formatting like \`\`\`glsl, or any text other than the code itself.
- The shader must start with "precision mediump float;".
- The shader MUST define and use the following uniforms: "uniform vec2 u_resolution;", "uniform float u_time;".
- The shader should calculate a final color for "gl_FragColor".
- Create interesting, dynamic, and visually appealing patterns that evolve over time using u_time.
`),
    getTitle: s => `Shader: ${s}`,
    presets: [
      {label: '🟠 lava lamp', prompt: 'inside of lava lamp'},
      {label: '⚫ metaballs', prompt: '3d metaballs'},
      {label: '🌀 hypnotic', prompt: 'make something hypnotic'},
      {label: '🍬 licorice', prompt: 'infinite world of red licorice'},
      {label: '⬇️ falling', prompt: 'metal balls falling into gelatin surface'},
      {label: '〰️ cymatics', prompt: 'metal cymatics'},
      {
        label: '⛰️ landscape',
        prompt:
          'flying over a detailed beautiful dreamy shape-shifting generative landscape'
      },
      {label: '🌈 oil', prompt: 'iridescent oil slick on water'},
      {label: '🔥 fire', prompt: 'realistic cozy fireplace fire'},
      {label: '🌌 nebula', prompt: 'deep space nebula clouds with stars'},
      {label: '⚡ electric', prompt: 'crackling electric lightning bolts'},
      {label: '💠 crystals', prompt: 'growing fractal crystals'}
    ]
  }
} satisfies Modes

export const frontpageOrder = [
  'voxels',
  'wireframes',
  'glsl',
  'p5',
  'html',
  'svg'
] as const