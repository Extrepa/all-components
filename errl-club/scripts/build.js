/**
 * Build script for Errl Club Simulator
 * 
 * Custom build script with optimization
 */
import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildApp() {
    console.log('Building Errl Club Simulator...');
    
    try {
        // Build for production
        await build({
            configFile: resolve(__dirname, '../vite.config.js'),
            mode: 'production',
            build: {
                outDir: 'dist',
                assetsDir: 'assets',
                sourcemap: false,
                minify: 'terser',
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true
                    }
                },
                rollupOptions: {
                    output: {
                        manualChunks: {
                            'three': ['three'],
                            'vendor': ['three/examples/jsm']
                        }
                    }
                }
            }
        });
        
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

buildApp();

