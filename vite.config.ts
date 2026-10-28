import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Percorsi relativi: il sito funziona sia in locale sia su GitHub Pages (/jazz-chord-trainer/).
  base: './',
  server: { host: 'localhost', port: 5173, open: true },
  build: { chunkSizeWarningLimit: 2000 },
});
