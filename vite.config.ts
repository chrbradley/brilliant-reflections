import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          babylon: ['babylonjs', '@babylonjs/inspector'],
        },
      },
    },
  },
});