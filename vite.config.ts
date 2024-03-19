import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  plugins: [vue(), vueJsx(), VueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 9000,
    proxy: {
      '/lyc8503': {
        target: 'https://cdn.jsdelivr.net/gh/lyc8503',
        "secure": false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lyc8503/, '')
      }
    }
  }
})
