#!/usr/bin/env node

/**
 * Sync Component Catalog
 * Syncs components-data.json with React preview catalog
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAIN_CATALOG = path.join(__dirname, '../components-data.json');
const REACT_CATALOG = path.join(__dirname, 'src/data/componentCatalog.ts');

function readMainCatalog() {
  try {
    const content = fs.readFileSync(MAIN_CATALOG, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to read main catalog:', error);
    process.exit(1);
  }
}

function readReactCatalog() {
  try {
    const content = fs.readFileSync(REACT_CATALOG, 'utf8');
    // Extract catalog object (simple regex approach)
    const catalogMatch = content.match(/export const componentCatalog[^=]+=\s*({[\s\S]+});/);
    if (!catalogMatch) {
      throw new Error('Could not parse React catalog');
    }
    // This is a simplified approach - in production, use a proper TypeScript parser
    return null; // Will need manual sync or better parsing
  } catch (error) {
    console.error('Failed to read React catalog:', error);
    return null;
  }
}

function generateReactCatalog(mainCatalog) {
  let output = `export interface Component {
  name: string;
  path: string;
  type: 'tsx' | 'ts' | 'js' | 'jsx';
  renderable?: boolean;
  previewable?: boolean;
}

export interface Project {
  path: string;
  components: Component[];
}

export const componentCatalog: Record<string, Project> = {\n`;

  Object.entries(mainCatalog).forEach(([projectName, project]) => {
    output += `  "${projectName}": {\n`;
    output += `    path: "${project.path}",\n`;
    output += `    components: [\n`;
    
    project.components.forEach(comp => {
      const renderable = comp.type === 'tsx' || comp.type === 'jsx' ? 'true' : 'false';
      const previewable = typeof comp.previewable === 'boolean' ? (comp.previewable ? 'true' : 'false') : 'false';
      output += `      { name: "${comp.name}", path: "${comp.path}", type: "${comp.type}", renderable: ${renderable}, previewable: ${previewable} },\n`;
    });
    
    output += `    ]\n`;
    output += `  },\n`;
  });

  output += `};\n`;
  return output;
}

function main() {
  console.log('Syncing component catalogs...');
  
  const mainCatalog = readMainCatalog();
  const reactCatalogContent = generateReactCatalog(mainCatalog);
  
  // Backup existing catalog
  if (fs.existsSync(REACT_CATALOG)) {
    const backupPath = REACT_CATALOG + '.backup';
    fs.copyFileSync(REACT_CATALOG, backupPath);
    console.log(`Backed up existing catalog to ${backupPath}`);
  }
  
  // Write new catalog
  fs.writeFileSync(REACT_CATALOG, reactCatalogContent, 'utf8');
  console.log(`✅ Synced ${Object.keys(mainCatalog).length} projects to React catalog`);
  console.log(`   Total components: ${Object.values(mainCatalog).reduce((sum, p) => sum + p.components.length, 0)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateReactCatalog, readMainCatalog };
