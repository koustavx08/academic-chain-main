// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import nodePolyfills from 'rollup-plugin-polyfill-node'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['node_modules/**/*.js', 'node:*']
    })
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      stream: 'stream-browserify',
      buffer: 'buffer',
      util: 'util',
      process: 'process/browser',
      zlib: 'browserify-zlib',
      http: 'stream-http',
      https: 'https-browserify',
      events: 'events',
      'node-fetch': 'isomorphic-fetch'
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    open: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      plugins: [
        nodePolyfills()
      ],
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-router-dom'],
        },
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'isomorphic-fetch'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: []
    },
  },
})
