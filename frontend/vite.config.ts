import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'iFood',
        short_name: 'iFood',
        theme_color: '#EA1D2C',
        background_color: '#FFF6EE',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/v1\/(restaurants|menu)/,
            handler: 'NetworkFirst',
          },
        ],
      },
    }),
  ],
})
