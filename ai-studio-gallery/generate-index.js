const fs = require('fs');
const path = require('path');

const root = __dirname;
const files = [
  'analog-liquid-light-projector.html',
  'bioluminescent-deep.html',
  'cosmic-tapestry.html',
  'deep-bioluminescence.html',
  'deep-liquid-drops.html',
  'design-system-switcher-fixed.html',
  'design-system-switcher.html',
  'flash-ui-bioluminescent-mineral-drip.html',
  'flash-ui-chromatic-resin-sedimentation.html',
  'flash-ui-entering-the-void-molten-dichroic.html',
  'flash-ui-errl-prismatic-gateway.html',
  'flash-ui-prism-threshold-interface.html',
  'flash-ui-prismatic-mercury-spec-sheet.html',
  'flash-ui-recursive-prismatic-diffraction.html',
  'full-screen-lava-lamp.html',
  'lava-lamp-projector.html',
  'liquid-light-projector.html',
  'living-liquid-gentle-flow.html',
  'neon-void-tarot.html',
  'oil-and-water-projector.html',
  'organic-light-drops.html',
  'quad-core-fluid-simulation.html',
  'recursive-fractal-orchard.html',
  'sentient-shard-swarm.html',
  'vaporwave-hyperspace-voxel-tunnel.html',
  'walking-errl-loader.html'
];

function labelFor(file) {
  if (file.startsWith('flash-ui-')) return 'flash ui';
  if (file.includes('design-system')) return 'ui';
  if (file.includes('lava')) return 'lava';
  if (file.includes('liquid') || file.includes('bioluminescence') || file.includes('bioluminescent') || file.includes('oil-and-water')) return 'liquid';
  if (file.includes('voxel') || file.includes('vaporwave')) return 'three.js';
  if (file.includes('loader')) return 'loader';
  if (file.includes('simulation')) return 'simulation';
  return 'visual';
}

function titleFor(file) {
  return file
    .replace(/\.html$/, '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const cards = files.map((file) => {
  const name = titleFor(file);
  const label = labelFor(file);
  const thumb = `thumbnails/${file.replace(/\.html$/, '')}.png`;
  return `    <a class="card" href="${file}" target="_blank" rel="noopener">
      <img src="${thumb}" alt="${name} thumbnail" loading="lazy" />
      <div class="label">${label}</div>
      <div class="name">${name}</div>
    </a>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Studio Exports Index</title>
  <style>
    :root {
      --bg: #0a0b10;
      --panel: rgba(255, 255, 255, 0.06);
      --panel-hover: rgba(255, 255, 255, 0.12);
      --border: rgba(255, 255, 255, 0.12);
      --text: #f5f6ff;
      --muted: rgba(245, 246, 255, 0.6);
      --accent: #22d3ee;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Space Grotesk", "Segoe UI", Tahoma, sans-serif;
      color: var(--text);
      background:
        radial-gradient(1200px 600px at 15% 10%, rgba(34, 211, 238, 0.15), transparent 60%),
        radial-gradient(900px 500px at 85% 20%, rgba(255, 0, 204, 0.12), transparent 60%),
        radial-gradient(900px 500px at 70% 85%, rgba(255, 200, 0, 0.08), transparent 60%),
        var(--bg);
      padding: 32px;
    }

    header {
      max-width: 1100px;
      margin: 0 auto 24px auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    h1 {
      font-size: 28px;
      margin: 0;
      letter-spacing: 0.5px;
    }

    p {
      margin: 0;
      color: var(--muted);
    }

    .grid {
      max-width: 1100px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
    }

    a.card {
      display: block;
      padding: 16px;
      border-radius: 14px;
      background: var(--panel);
      border: 1px solid var(--border);
      color: var(--text);
      text-decoration: none;
      transition: transform 120ms ease, background 120ms ease, border 120ms ease;
    }

    a.card:hover {
      transform: translateY(-2px);
      background: var(--panel-hover);
      border-color: rgba(34, 211, 238, 0.5);
    }

    a.card img {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 10px;
      margin-bottom: 12px;
      border: 1px solid var(--border);
      background: #0e1016;
    }

    .label {
      font-size: 12px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 6px;
    }

    .name {
      font-size: 16px;
      line-height: 1.2;
    }
  </style>
</head>
<body>
  <header>
    <h1>AI Studio Exports</h1>
    <p>Quick index of single-file HTML demos staged in this folder.</p>
  </header>

  <section class="grid">
${cards}
  </section>
</body>
</html>`;

fs.writeFileSync(path.join(root, 'index.html'), html);
