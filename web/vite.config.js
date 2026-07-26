import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      // MPA: one bundle, two localized HTML entry points (/ and /ru/)
      input: {
        en: resolve(import.meta.dirname, 'index.html'),
        ru: resolve(import.meta.dirname, 'ru/index.html'),
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // react-dom + scheduler must stay with react — split breaks the dispatcher
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'lib-react'
          }
        },
      },
    },
  },
  server: {
    port: 3000
  }
})