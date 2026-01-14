// Script to convert MeshStandardMaterial to MeshBasicMaterial
// Run with: node scripts/convert-materials.js

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

// Properties to remove (not supported by MeshBasicMaterial)
const propsToRemove = [
    'metalness',
    'roughness', 
    'emissive',
    'emissiveIntensity',
    'envMap',
    'envMapIntensity',
    'normalMap',
    'normalScale',
    'displacementMap',
    'displacementScale',
    'displacementBias',
    'roughnessMap',
    'metalnessMap',
    'aoMap',
    'aoMapIntensity',
    'lightMap',
    'lightMapIntensity',
    'bumpMap',
    'bumpScale',
    'clearcoat',
    'clearcoatRoughness',
    'ior',
    'reflectivity',
    'sheen',
    'sheenRoughness',
    'sheenColor',
    'specularIntensity',
    'specularColor',
    'transmission',
    'thickness',
    'attenuationDistance',
    'attenuationColor',
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Replace MeshStandardMaterial with MeshBasicMaterial
    content = content.replace(/new THREE\.MeshStandardMaterial/g, 'new THREE.MeshBasicMaterial');
    content = content.replace(/new THREE\.MeshPhysicalMaterial/g, 'new THREE.MeshBasicMaterial');
    
    // Remove incompatible properties from material creation objects
    for (const prop of propsToRemove) {
        // Match property: value patterns in object literals
        // This regex handles: propName: value, or propName: value (at end without comma)
        const regex = new RegExp(`\\s*${prop}:\\s*[^,}]+,?`, 'g');
        content = content.replace(regex, (match) => {
            // If it ends with comma, we need to be careful about trailing commas
            return '';
        });
    }
    
    // Clean up any double commas or trailing commas before }
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/,(\s*})/g, '$1');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated: ${filePath}`);
        return true;
    }
    return false;
}

function walkDir(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            count += walkDir(filePath);
        } else if (file.endsWith('.js') && !file.includes('MaterialSimplifier')) {
            if (processFile(filePath)) {
                count++;
            }
        }
    }
    
    return count;
}

const updatedCount = walkDir(srcDir);
console.log(`\nTotal files updated: ${updatedCount}`);
