import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // SW updates in the background
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '81-Card Guandan',
        short_name: 'Guandan',
        start_url: '.',
        display: 'standalone',
        theme_color: '#111111',
        background_color: '#111111',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
