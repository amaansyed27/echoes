import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [
        VitePWA({
          registerType: 'autoUpdate',
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'gemini-api-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 // 24 hours
                  }
                }
              }
            ]
          },
          includeAssets: ['icon.svg', 'icon-192.png', 'android-chrome-512x512.png'],
          manifest: {
            name: 'Echoes - AI Travel Guide',
            short_name: 'Echoes',
            description: 'Discover cities through interactive AI-powered quests and stories. Your adventure begins now!',
            theme_color: '#F59E0B',
            background_color: '#111827',
            display: 'standalone',
            orientation: 'portrait-primary',
            scope: '/',
            start_url: '/',
            categories: ['travel', 'games', 'education'],
            icons: [
              {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any'
              },
              {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: '/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              }
            ]
          }
        })
      ]
    };
});
