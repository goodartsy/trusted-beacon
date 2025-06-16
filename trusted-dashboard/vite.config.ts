// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';    // React-Plugin importieren
import path from 'path';

export default defineConfig({
  plugins: [
    react(),                                 // React-Plugin aktivieren
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),   // Optional: @ → src
    },
  },
});
