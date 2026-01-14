/**
 * Deployment script for Errl Club Simulator
 * 
 * Handles deployment to various platforms
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const deploymentTargets = {
    'netlify': deployToNetlify,
    'vercel': deployToVercel,
    'github-pages': deployToGitHubPages
};

async function deploy(target = 'netlify') {
    console.log(`Deploying to ${target}...`);
    
    const deployFunction = deploymentTargets[target];
    if (!deployFunction) {
        console.error(`Unknown deployment target: ${target}`);
        process.exit(1);
    }
    
    try {
        await deployFunction();
        console.log(`Deployment to ${target} completed successfully!`);
    } catch (error) {
        console.error(`Deployment to ${target} failed:`, error);
        process.exit(1);
    }
}

async function deployToNetlify() {
    console.log('Deploying to Netlify...');
    
    // Check if netlify CLI is installed
    try {
        execSync('netlify --version', { stdio: 'ignore' });
    } catch (error) {
        console.error('Netlify CLI not found. Install with: npm install -g netlify-cli');
        throw error;
    }
    
    // Deploy
    execSync('netlify deploy --prod', { stdio: 'inherit' });
}

async function deployToVercel() {
    console.log('Deploying to Vercel...');
    
    // Check if vercel CLI is installed
    try {
        execSync('vercel --version', { stdio: 'ignore' });
    } catch (error) {
        console.error('Vercel CLI not found. Install with: npm install -g vercel');
        throw error;
    }
    
    // Deploy
    execSync('vercel --prod', { stdio: 'inherit' });
}

async function deployToGitHubPages() {
    console.log('Deploying to GitHub Pages...');
    
    // Build first
    console.log('Building for production...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Create .nojekyll file
    const nojekyllPath = resolve(__dirname, '../dist/.nojekyll');
    writeFileSync(nojekyllPath, '');
    
    // Deploy using gh-pages
    try {
        execSync('npx gh-pages -d dist', { stdio: 'inherit' });
    } catch (error) {
        console.error('gh-pages not found. Install with: npm install -g gh-pages');
        throw error;
    }
}

// Get target from command line args
const target = process.argv[2] || 'netlify';
deploy(target);

