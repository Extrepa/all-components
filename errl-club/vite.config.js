import { defineConfig } from 'vite';

/**
 * Vite configuration for Errl Club Simulator
 * 
 * Optimized for Three.js with large 3D assets and WebGL rendering
 */
export default defineConfig({
  // Base public path when served in production
  base: '/',
  
  // Development server configuration
  server: {
    port: 5173,
    host: true, // Listen on all addresses
    open: false, // Don't auto-open browser
    cors: true,
    // Increase timeout for large asset loading
    hmr: {
      overlay: true,
    },
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
    open: false,
  },
  
  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate source maps for production debugging
    sourcemap: false, // Set to true for production debugging if needed
    
    // Minification
    minify: 'esbuild', // Fast and efficient
    
    // Chunk size warning limit (in kbs)
    chunkSizeWarningLimit: 1000,
    
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Separate Three.js into its own chunk
          'three': ['three'],
          // Separate Supabase client
          'supabase': ['@supabase/supabase-js'],
          // Vendor chunk for other dependencies
          'vendor': [],
        },
        // Naming pattern for chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/glb|gltf/i.test(ext)) {
            return `assets/models/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    
    // Optimize dependencies
    commonjsOptions: {
      include: [],
    },
    
    // Target modern browsers with WebGL support
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'three',
      '@supabase/supabase-js',
    ],
    exclude: [],
  },
  
  // Public directory for static assets
  publicDir: 'public',
  
  // Resolve configuration
  resolve: {
    alias: {
      // Add any path aliases here if needed
      // '@': path.resolve(__dirname, './src'),
    },
  },
  
  // Define global constants
  define: {
    // Replace __APP_VERSION__ with actual version at build time
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.1.0'),
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
  },
  
  // Log level
  logLevel: 'info',
  
  // Clear screen on restart
  clearScreen: false,
});

