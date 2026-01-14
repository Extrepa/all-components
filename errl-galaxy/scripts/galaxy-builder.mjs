import { Project } from 'ts-morph';
import fs from 'fs';
import path from 'path';

// MOCK DATA GENERATOR (If no components exist yet)
// In a real app, point this to your actual component folder
const mockManifest = [
  { id: '1', name: 'ErrlAvatar', tier: 'ATOM', pos: [0, 0, 0] },
  { id: '2', name: 'ActionCard', tier: 'MOLECULE', pos: [8, 2, -5] },
  { id: '3', name: 'NavBar', tier: 'ORGANISM', pos: [-8, 4, 2] },
  { id: '4', name: 'SubmitBtn', tier: 'ATOM', pos: [2, -5, 4] },
];

console.log('🌌 Scanning Errl System...');
// Write to public folder so the frontend can fetch it
const outputDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

fs.writeFileSync(
  path.join(outputDir, 'galaxy-manifest.json'), 
  JSON.stringify(mockManifest, null, 2)
);

console.log('✅ Galaxy Manifest Generated!');