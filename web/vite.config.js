import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://your-vercel-app.vercel.app'
          : 'http://localhost:8000',
        changeOrigin: true,
        rewrite: process.env.NODE_ENV === 'production'
          ? undefined
          : (path) => path.replace(/^\/api/, '')
      }
    }
  }
})