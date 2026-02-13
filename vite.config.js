import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import ViteFonts from 'unplugin-fonts/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      port: 8080,
      proxy: {
        '/api': {
          target: env.VITE_NOTES_BACKEND_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          cookieDomainRewrite: 'localhost',
          cookiePathRewrite: '/',
          onProxyReq: (proxyReq, req) => {
            // Forward cookies from browser to backend
            if (req.headers.cookie) {
              console.log('Forwarding cookies to backend:', req.headers.cookie)
              proxyReq.setHeader('Cookie', req.headers.cookie)
            }
          },
          onProxyRes: (proxyRes) => {
            // Forward cookies from backend to browser
            if (proxyRes.headers['set-cookie']) {
              console.log('Forwarding cookies to browser:', proxyRes.headers['set-cookie'])
              const cookies = proxyRes.headers['set-cookie'].map(cookie => {
                // Rewrite domain and path for localhost
                return cookie.replace(/Domain=[^;]+/i, 'Domain=localhost')
                           .replace(/Path=[^;]+/i, 'Path=/')
              })
              proxyRes.headers['set-cookie'] = cookies
            }
          }
        },
      },
    },
    plugins: [
      vue(),
      vueDevTools(),
      ViteFonts({
        fontsource: {
          families: [
            {
              name: 'Roboto',
              weights: [100, 300, 400, 500, 700, 900],
              styles: ['normal', 'italic'],
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
      },
    },
  }
})
