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
    // ffmpegd refuses a websocket upgrade unless the Origin matches its own
    // host:port -- it accepts http://localhost:8080 and nothing else, not even
    // the production site. A dev server on another port therefore cannot reach
    // it directly. Proxying with changeOrigin rewrites the Origin to the target,
    // so the browser talks to Vite and Vite talks to the daemon.
    // changeOrigin only rewrites Host; the Origin header is forwarded as-is,
    // which is the one ffmpegd actually checks. Set it explicitly.
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
