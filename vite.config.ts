import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Deployed to GitHub Pages from a custom domain at the root, same as the Vue
  // app, so the base path stays '/'.
  base: '/',
  server: {
    // ffmpegd only accepts websocket upgrades and /files requests from a fixed
    // list of origins, and the dev server's own port is not on it. Proxy both
    // through Vite and present the daemon's own origin, which is. changeOrigin
    // only rewrites Host; the Origin header is forwarded as-is, and that is the
    // one ffmpegd checks, so set it explicitly.
    proxy: {
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
        headers: { origin: 'http://localhost:8080' },
      },
      '/files': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        headers: { origin: 'http://localhost:8080' },
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    setupFiles: ['src/test-setup.ts'],
  },
})
