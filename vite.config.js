import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset URLs (./assets/...) instead of absolute (/assets/...).
  // Absolute paths only resolve when dist/ is served from the domain root;
  // under any sub-path (shared hosting, GitHub Pages project pages, etc.)
  // every JS/CSS file 404s and the site renders blank. './' works at the
  // root AND under a sub-directory, so the built site always opens.
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
