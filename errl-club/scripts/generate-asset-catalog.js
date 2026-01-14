#!/usr/bin/env node

/**
 * Generate Asset Catalog
 *
 * Scans asset directories and generates comprehensive asset catalog
 */

import { readdirSync, statSync, existsSync, writeFileSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Scan directory for assets
 */
function scanDirectory(dirPath, assetType) {
    const assets = [];
    const extensions = {
        '3d-model': ['.glb', '.gltf', '.obj', '.fbx'],
        texture: ['.png', '.jpg', '.jpeg', '.webp', '.hdr', '.exr'],
        audio: ['.ogg', '.mp3', '.wav'],
        'ui-asset': ['.svg', '.png', '.woff2', '.woff', '.ttf'],
    };

    const allowedExts = extensions[assetType] || [];

    try {
        const files = readdirSync(dirPath, { withFileTypes: true });
        for (const file of files) {
            const fullPath = join(dirPath, file.name);
            if (file.isFile()) {
                const ext = extname(file.name).toLowerCase();
                if (allowedExts.includes(ext)) {
                    const stats = statSync(fullPath);
                    assets.push({
                        name: basename(file.name, ext),
                        path: fullPath.replace(projectRoot, ''),
                        size: stats.size,
                        format: ext.slice(1),
                        type: assetType,
                    });
                }
            } else if (file.isDirectory()) {
                // Recursively scan subdirectories
                assets.push(...scanDirectory(fullPath, assetType));
            }
        }
    } catch (error) {
        console.warn(`Warning: Could not scan ${dirPath}:`, error.message);
    }

    return assets;
}

/**
 * Generate catalog
 */
function generateCatalog() {
    console.log('Generating asset catalog...');

    const catalog = {
        generatedAt: new Date().toISOString(),
        assets: [],
    };

    // Scan asset directories
    const assetDirs = {
        '3d-model': join(projectRoot, 'public', 'models'),
        texture: join(projectRoot, 'public', 'textures'),
        audio: join(projectRoot, 'public', 'audio'),
        'ui-asset': join(projectRoot, 'public', 'ui'),
    };

    for (const [type, dirPath] of Object.entries(assetDirs)) {
        if (existsSync(dirPath)) {
            const assets = scanDirectory(dirPath, type);
            catalog.assets.push(...assets);
            console.log(`Found ${assets.length} ${type} assets`);
        }
    }

    // Write catalog
    const catalogPath = join(projectRoot, 'docs', 'assets', 'ASSET_CATALOG_AUTO.md');
    const catalogMarkdown = generateCatalogMarkdown(catalog);
    writeFileSync(catalogPath, catalogMarkdown, 'utf8');

    console.log(`✅ Catalog generated: ${catalogPath}`);
    console.log(`Total assets: ${catalog.assets.length}`);
}

/**
 * Generate markdown catalog
 */
function generateCatalogMarkdown(catalog) {
    let markdown = `# Auto-Generated Asset Catalog\n\n`;
    markdown += `**Generated**: ${new Date(catalog.generatedAt).toLocaleString()}\n`;
    markdown += `**Total Assets**: ${catalog.assets.length}\n\n`;

    // Group by type
    const byType = {};
    catalog.assets.forEach((asset) => {
        if (!byType[asset.type]) {
            byType[asset.type] = [];
        }
        byType[asset.type].push(asset);
    });

    // Write by type
    Object.entries(byType).forEach(([type, assets]) => {
        markdown += `## ${type}\n\n`;
        assets.forEach((asset) => {
            const sizeKB = (asset.size / 1024).toFixed(2);
            markdown += `- **${asset.name}** (${asset.format}, ${sizeKB}KB) - \`${asset.path}\`\n`;
        });
        markdown += `\n`;
    });

    return markdown;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateCatalog();
}

export { generateCatalog, scanDirectory };

