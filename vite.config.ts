/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/icon.svg', 'offline.html'],
      manifest: {
        name: 'ChooseSwim',
        short_name: 'ChooseSwim',
        description: 'Natacion privada, gamificada y profesional para entrenar, competir y progresar.',
        start_url: '/dashboard',
        scope: '/',
        display: 'standalone',
        background_color: '#03151f',
        theme_color: '#03151f',
        orientation: 'portrait-primary',
        categories: ['fitness', 'sports', 'productivity'],
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Registrar entreno',
            short_name: 'Entreno',
            url: '/sessions/new',
            icons: [{ src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
          },
          {
            name: 'IA Coach',
            short_name: 'Coach',
            url: '/ai-coach',
            icons: [{ src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
          }
        ]
      },
      workbox: {
        navigateFallback: '/offline.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'chooseswim-pages',
              networkTimeoutSeconds: 3
            }
          },
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && /\.(?:js|css|svg|png|ico)$/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'chooseswim-assets'
            }
          }
        ]
      }
    })
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'firebase';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) return 'react';
          if (id.includes('/@tanstack/')) return 'query';
          if (id.includes('/recharts/') || id.includes('/d3-')) return 'charts';
          return undefined;
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  test: {
    // functions/test usa el test runner de Node (npm test dentro de functions).
    include: ['src/**/*.test.{ts,tsx}']
  }
});
