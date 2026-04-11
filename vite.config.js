import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Weather App (React)',
        short_name: 'Weather',
        theme_color: '#0f172a',
        background_color: '#071029',
        display: 'standalone'
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api.open-meteo.com/,
            handler: 'NetworkFirst',
            options: { cacheName: 'open-meteo-api', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 } }
          },
          {
            urlPattern: /^https:\/\/geocoding-api.open-meteo.com/,
            handler: 'NetworkFirst',
            options: { cacheName: 'open-meteo-geocode', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 } }
          }
        ]
      }
    })
  ],
  // Uncomment and set proxy if you want Vite to forward /api to backend
  // server: { proxy: { '/api': 'http://localhost:5000' } }
})
