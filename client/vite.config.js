import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'SonicPulse',
        short_name: 'SonicPulse',
        description: 'Music Streaming Platform',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // 👈 Укажи порт, на котором запущен твой бэкенд (5000 или 3000)
        changeOrigin: true,
        secure: false,
      },
    },
  },
});