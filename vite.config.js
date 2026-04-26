import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*'],
      manifest: {
        name: 'SlotIQ - Smart Urban Parking',
        short_name: 'Slot-IQ',
        description: 'Predictive urban parking and utility platform for Bengaluru',
        theme_color: '#F5620F',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icons/icon-192-v1.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512-v1.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512-v1.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    open: true,
  },
})
