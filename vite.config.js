// Import Vite configuration utilities and plugins
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  // Configure Vite plugins
  plugins: [react(), vue()],
  
  // Set base URL for production builds
  base: '/',
  
  // Configure module resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': 'react',
      'react-dom': 'react-dom'
    },
  },
  
  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    open: false,
    headers: {
      'Content-Type': 'text/javascript',
    },
  },
  
  // Production build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'vuex'],
        },
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
});
