import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const terminalLoggerPlugin = () => ({
  name: 'terminal-logger',
  configureServer(server) {
    server.middlewares.use('/__terminal_log', (req, res) => {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => {
        try {
          const payload = JSON.parse(body)
          console.log('\n--------------------------------------------------')
          console.log(`📡 [API RESPONSE LOG] ${payload.method} ${payload.url} (${payload.timestamp})`)
          console.log(JSON.stringify(payload.data, null, 2))
          console.log('--------------------------------------------------\n')
        } catch (err) {
          console.log('📡 [API LOG]:', body)
        }
        res.setHeader('Content-Type', 'text/plain')
        res.end('OK')
      })
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    terminalLoggerPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        // service worker is a hand-written ES module (`type: 'module'` below),
        // so let esbuild bundle its imports (workbox-precaching) at build time
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png'
      ],
      manifest: {
        name: 'Driveast Partner',
        short_name: 'Driveast',
        description: 'Premium driver partner app for location tracking, ride requests, and active trip management.',
        theme_color: '#0a0f1d',
        background_color: '#0a0f1d',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})

